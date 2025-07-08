import { MeetingSession, ActionItem } from '../types';

export const exportToCSV = (session: MeetingSession): void => {
  const csvContent = [
    ['Action Item', 'Priority', 'Assignee', 'Due Date', 'Completed', 'Created'],
    ...session.actionItems.map(item => [
      item.text,
      item.priority,
      item.assignee || '',
      item.dueDate?.toLocaleDateString() || '',
      item.completed ? 'Yes' : 'No',
      item.createdAt.toLocaleDateString()
    ])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${session.title}_action_items.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportTranscriptToText = (session: MeetingSession): void => {
  const transcriptContent = [
    `Meeting: ${session.title}`,
    `Date: ${session.startTime.toLocaleDateString()}`,
    `Duration: ${session.endTime ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60) + ' minutes' : 'Ongoing'}`,
    `Participants: ${session.participants.join(', ')}`,
    '',
    'TRANSCRIPT:',
    '=' .repeat(50),
    ...session.transcript.map(segment => 
      `[${segment.timestamp.toLocaleTimeString()}] ${segment.speaker}: ${segment.text}`
    ),
    '',
    'ACTION ITEMS:',
    '=' .repeat(50),
    ...session.actionItems.map((item, index) => 
      `${index + 1}. [${item.priority.toUpperCase()}] ${item.text} ${item.assignee ? `(${item.assignee})` : ''} ${item.dueDate ? `Due: ${item.dueDate.toLocaleDateString()}` : ''}`
    )
  ].join('\n');

  const blob = new Blob([transcriptContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${session.title}_transcript.txt`;
  a.click();
  URL.revokeObjectURL(url);
};