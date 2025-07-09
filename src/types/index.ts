export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  dueDate?: Date;
  scheduledTime?: Date;
  assignee?: string;
  calendarEventId?: string;
  notes?: string;
}

export interface TranscriptSegment {
  id: string;
  speaker: string;
  text: string;
  timestamp: Date;
  containsActionItems: boolean;
}

export interface MeetingSession {
  id: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  transcript: TranscriptSegment[];
  actionItems: ActionItem[];
  participants: string[];
  status: 'active' | 'completed' | 'paused';
}

export interface AppState {
  currentSession: MeetingSession | null;
  sessions: MeetingSession[];
  isRecording: boolean;
  theme: 'light' | 'dark';
}