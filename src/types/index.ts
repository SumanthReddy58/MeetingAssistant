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

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  htmlLink?: string;
  status?: string;
}

export interface CreateEventRequest {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

export interface AppState {
  currentSession: MeetingSession | null;
  sessions: MeetingSession[];
  isRecording: boolean;
  theme: 'light' | 'dark';
  user: User | null;
}