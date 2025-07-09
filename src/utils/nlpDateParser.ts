interface DateTimeParseResult {
  date: Date;
  confidence: number;
  originalText: string;
}

const TIME_PATTERNS = [
  // Absolute times with dates
  { 
    pattern: /\b(tomorrow|today)\s+(?:at\s+)?(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)\b/gi,
    handler: (match: RegExpMatchArray) => parseRelativeDateTime(match)
  },
  
  // Days of the week
  {
    pattern: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+(?:at\s+)?(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?\b/gi,
    handler: (match: RegExpMatchArray) => parseDayOfWeek(match)
  },
  
  // Relative times
  {
    pattern: /\bin\s+(\d+)\s+(minutes?|hours?|days?)\b/gi,
    handler: (match: RegExpMatchArray) => parseRelativeTime(match)
  },
  
  // Next week/month
  {
    pattern: /\bnext\s+(week|month)\b/gi,
    handler: (match: RegExpMatchArray) => parseNextPeriod(match)
  },
  
  // Date formats (MM/DD, MM/DD/YYYY)
  {
    pattern: /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\s+(?:at\s+)?(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?\b/gi,
    handler: (match: RegExpMatchArray) => parseDateFormat(match)
  },
  
  // Time only (assume today if not past, tomorrow if past)
  {
    pattern: /\b(?:at\s+)?(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)\b/gi,
    handler: (match: RegExpMatchArray) => parseTimeOnly(match)
  }
];

const DAYS_OF_WEEK = {
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
  friday: 5, saturday: 6, sunday: 0
};

export const parseNLPDateTime = (text: string): Date | null => {
  const lowerText = text.toLowerCase();
  
  for (const { pattern, handler } of TIME_PATTERNS) {
    const regex = new RegExp(pattern);
    const match = regex.exec(text);
    
    if (match) {
      try {
        const result = handler(match);
        if (result && result.getTime() > Date.now()) {
          return result;
        }
      } catch (error) {
        console.warn('Date parsing error:', error);
      }
    }
  }
  
  return null;
};

const parseRelativeDateTime = (match: RegExpMatchArray): Date | null => {
  const [, dayRef, hourStr, minuteStr, ampm] = match;
  const now = new Date();
  const targetDate = new Date(now);
  
  if (dayRef.toLowerCase() === 'tomorrow') {
    targetDate.setDate(targetDate.getDate() + 1);
  }
  
  if (hourStr) {
    let hours = parseInt(hourStr);
    const minutes = minuteStr ? parseInt(minuteStr) : 0;
    const isPM = ampm?.toLowerCase() === 'pm';
    
    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    
    targetDate.setHours(hours, minutes, 0, 0);
  }
  
  return targetDate;
};

const parseDayOfWeek = (match: RegExpMatchArray): Date | null => {
  const [, dayName, hourStr, minuteStr, ampm] = match;
  const targetDay = DAYS_OF_WEEK[dayName.toLowerCase() as keyof typeof DAYS_OF_WEEK];
  
  if (targetDay === undefined) return null;
  
  const now = new Date();
  const currentDay = now.getDay();
  const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
  
  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + daysUntilTarget);
  
  if (hourStr) {
    let hours = parseInt(hourStr);
    const minutes = minuteStr ? parseInt(minuteStr) : 0;
    const isPM = ampm?.toLowerCase() === 'pm';
    
    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    
    targetDate.setHours(hours, minutes, 0, 0);
  } else {
    // Default to 9 AM if no time specified
    targetDate.setHours(9, 0, 0, 0);
  }
  
  return targetDate;
};

const parseRelativeTime = (match: RegExpMatchArray): Date | null => {
  const [, amount, unit] = match;
  const now = new Date();
  const targetDate = new Date(now);
  const value = parseInt(amount);
  
  switch (unit.toLowerCase()) {
    case 'minute':
    case 'minutes':
      targetDate.setMinutes(targetDate.getMinutes() + value);
      break;
    case 'hour':
    case 'hours':
      targetDate.setHours(targetDate.getHours() + value);
      break;
    case 'day':
    case 'days':
      targetDate.setDate(targetDate.getDate() + value);
      break;
    default:
      return null;
  }
  
  return targetDate;
};

const parseNextPeriod = (match: RegExpMatchArray): Date | null => {
  const [, period] = match;
  const now = new Date();
  const targetDate = new Date(now);
  
  switch (period.toLowerCase()) {
    case 'week':
      targetDate.setDate(targetDate.getDate() + 7);
      targetDate.setHours(9, 0, 0, 0); // Default to 9 AM
      break;
    case 'month':
      targetDate.setMonth(targetDate.getMonth() + 1);
      targetDate.setDate(1);
      targetDate.setHours(9, 0, 0, 0); // Default to 9 AM
      break;
    default:
      return null;
  }
  
  return targetDate;
};

const parseDateFormat = (match: RegExpMatchArray): Date | null => {
  const [, monthStr, dayStr, yearStr, hourStr, minuteStr, ampm] = match;
  
  const month = parseInt(monthStr) - 1; // JavaScript months are 0-indexed
  const day = parseInt(dayStr);
  const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();
  
  // Handle 2-digit years
  const fullYear = year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year;
  
  const targetDate = new Date(fullYear, month, day);
  
  if (hourStr) {
    let hours = parseInt(hourStr);
    const minutes = minuteStr ? parseInt(minuteStr) : 0;
    const isPM = ampm?.toLowerCase() === 'pm';
    
    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    
    targetDate.setHours(hours, minutes, 0, 0);
  } else {
    // Default to 9 AM if no time specified
    targetDate.setHours(9, 0, 0, 0);
  }
  
  return targetDate;
};

const parseTimeOnly = (match: RegExpMatchArray): Date | null => {
  const [, hourStr, minuteStr, ampm] = match;
  
  let hours = parseInt(hourStr);
  const minutes = parseInt(minuteStr);
  const isPM = ampm?.toLowerCase() === 'pm';
  
  if (isPM && hours !== 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;
  
  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setHours(hours, minutes, 0, 0);
  
  // If the time has already passed today, assume tomorrow
  if (targetDate <= now) {
    targetDate.setDate(targetDate.getDate() + 1);
  }
  
  return targetDate;
};

// Helper function to format parsed date for display
export const formatParsedDateTime = (date: Date): string => {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
  
  const timeString = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  
  if (isToday) return `Today at ${timeString}`;
  if (isTomorrow) return `Tomorrow at ${timeString}`;
  
  return `${date.toLocaleDateString()} at ${timeString}`;
};

// Test function for development
export const testNLPParser = (text: string): void => {
  console.log(`Testing: "${text}"`);
  const result = parseNLPDateTime(text);
  if (result) {
    console.log(`Parsed: ${formatParsedDateTime(result)}`);
  } else {
    console.log('No date/time found');
  }
};