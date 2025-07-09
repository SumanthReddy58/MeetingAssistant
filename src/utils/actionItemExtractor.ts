import { ActionItem } from '../types';
import { extractTimeFromText } from './timeExtractor';
import { parseNLPDateTime } from './nlpDateParser';

const ACTION_KEYWORDS = [
  'follow up', 'follow-up', 'action item', 'todo', 'to do', 'task',
  'assign', 'responsible', 'due', 'deadline', 'complete', 'finish',
  'deliver', 'send', 'create', 'update', 'review', 'check', 'verify',
  'schedule', 'organize', 'prepare', 'research', 'contact', 'call',
  'email', 'meeting', 'discuss', 'resolve', 'fix', 'implement'
];

const PRIORITY_KEYWORDS = {
  high: ['urgent', 'asap', 'critical', 'important', 'priority', 'immediately'],
  medium: ['soon', 'next week', 'upcoming', 'moderate'],
  low: ['later', 'eventually', 'when possible', 'low priority']
};

export const extractActionItems = (text: string): Partial<ActionItem>[] => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const actionItems: Partial<ActionItem>[] = [];

  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    
    // Check if sentence contains action keywords
    const hasActionKeyword = ACTION_KEYWORDS.some(keyword => 
      lowerSentence.includes(keyword.toLowerCase())
    );

    if (hasActionKeyword) {
      // Extract time information
      const timeExtractions = extractTimeFromText(sentence);
      let scheduledTime = timeExtractions.length > 0 ? timeExtractions[0].extractedTime : undefined;
      
      // Try NLP parsing if no time extraction found
      if (!scheduledTime) {
        scheduledTime = parseNLPDateTime(sentence);
      }
      
      // Determine priority
      let priority: 'low' | 'medium' | 'high' = 'medium';
      
      for (const [level, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
        if (keywords.some(keyword => lowerSentence.includes(keyword))) {
          priority = level as 'low' | 'medium' | 'high';
          break;
        }
      }

      // Extract potential assignee
      const assigneeMatch = sentence.match(/(?:assign|responsible|@)(?:ed)?\s+(?:to\s+)?(\w+)/i);
      const assignee = assigneeMatch ? assigneeMatch[1] : undefined;

      // Extract due date
      const dueDateMatch = sentence.match(/(?:due|deadline|by)\s+(\w+\s+\d{1,2}|\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2})/i);
      const dueDate = dueDateMatch ? new Date(dueDateMatch[1]) : undefined;

      actionItems.push({
        text: sentence.trim(),
        priority,
        assignee,
        dueDate: dueDate && !isNaN(dueDate.getTime()) ? dueDate : undefined,
        scheduledTime,
        completed: false,
        createdAt: new Date()
      });
    }
  });

  return actionItems;
};

export const highlightActionKeywords = (text: string): string => {
  let highlightedText = text;
  
  ACTION_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    highlightedText = highlightedText.replace(regex, `<mark class="bg-yellow-200 px-1">$&</mark>`);
  });

  return highlightedText;
};