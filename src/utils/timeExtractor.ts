interface TimeExtraction {
  originalText: string;
  extractedTime: Date | null;
  timeString: string;
  isRelative: boolean;
}

const TIME_PATTERNS = [
  // Absolute times
  /\b(?:at\s+)?(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)\b/g,
  /\b(?:at\s+)?(\d{1,2})\s*(am|pm|AM|PM)\b/g,
  
  // Relative times
  /\bin\s+(\d+)\s+(minutes?|hours?|days?)\b/gi,
  /\b(\d+)\s+(minutes?|hours?|days?)\s+from\s+now\b/gi,
  
  // Tomorrow/today with time
  /\b(tomorrow|today)\s+(?:at\s+)?(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?\b/gi,
  /\b(tomorrow|today)\s+(?:at\s+)?(\d{1,2})\s*(am|pm|AM|PM)\b/gi,
  
  // Next week/month
  /\bnext\s+(week|month)\b/gi,
  
  // Specific days
  /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+(?:at\s+)?(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?\b/gi,
  
  // Date formats
  /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\s+(?:at\s+)?(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?\b/gi,
];

const DAYS_OF_WEEK = {
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
  friday: 5, saturday: 6, sunday: 0
};

export const extractTimeFromText = (text: string): TimeExtraction[] => {
  const extractions: TimeExtraction[] = [];
  const lowerText = text.toLowerCase();

  TIME_PATTERNS.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern);
    
    while ((match = regex.exec(text)) !== null) {
      const extractedTime = parseTimeMatch(match, lowerText);
      if (extractedTime) {
        extractions.push({
          originalText: match[0],
          extractedTime: extractedTime.date,
          timeString: extractedTime.timeString,
          isRelative: extractedTime.isRelative
        });
      }
    }
  });

  return extractions;
};

const parseTimeMatch = (match: RegExpExecArray, lowerText: string): { date: Date; timeString: string; isRelative: boolean } | null => {
  const now = new Date();
  const matchText = match[0].toLowerCase();

  // Handle relative times (in X minutes/hours/days)
  if (matchText.includes('in ') || matchText.includes('from now')) {
    const amount = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    const futureDate = new Date(now);
    if (unit.startsWith('minute')) {
      futureDate.setMinutes(futureDate.getMinutes() + amount);
    } else if (unit.startsWith('hour')) {
      futureDate.setHours(futureDate.getHours() + amount);
    } else if (unit.startsWith('day')) {
      futureDate.setDate(futureDate.getDate() + amount);
    }
    
    return {
      date: futureDate,
      timeString: `in ${amount} ${unit}`,
      isRelative: true
    };
  }

  // Handle today/tomorrow with time
  if (matchText.includes('today') || matchText.includes('tomorrow')) {
    const isToday = matchText.includes('today');
    const targetDate = new Date(now);
    
    if (!isToday) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    
    // Extract time if present
    const timeMatch = matchText.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const isPM = timeMatch[3] === 'pm';
      
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
      
      targetDate.setHours(hours, minutes, 0, 0);
    }
    
    return {
      date: targetDate,
      timeString: isToday ? 'today' : 'tomorrow',
      isRelative: false
    };
  }

  // Handle specific days of the week
  const dayMatch = matchText.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
  if (dayMatch) {
    const targetDay = DAYS_OF_WEEK[dayMatch[1] as keyof typeof DAYS_OF_WEEK];
    const currentDay = now.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
    
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + daysUntilTarget);
    
    // Extract time if present
    const timeMatch = matchText.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const isPM = timeMatch[3] === 'pm';
      
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
      
      targetDate.setHours(hours, minutes, 0, 0);
    }
    
    return {
      date: targetDate,
      timeString: dayMatch[1],
      isRelative: false
    };
  }

  // Handle absolute times (just time, assume today if not past, tomorrow if past)
  const timeMatch = matchText.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const isPM = timeMatch[3] === 'pm';
    
    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    
    const targetDate = new Date(now);
    targetDate.setHours(hours, minutes, 0, 0);
    
    // If the time has already passed today, assume tomorrow
    if (targetDate <= now) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    
    return {
      date: targetDate,
      timeString: timeMatch[0],
      isRelative: false
    };
  }

  return null;
};

export const formatTimeForDisplay = (date: Date): string => {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
  
  const timeString = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  
  if (isToday) return `Today at ${timeString}`;
  if (isTomorrow) return `Tomorrow at ${timeString}`;
  
  return `${date.toLocaleDateString()} at ${timeString}`;
};