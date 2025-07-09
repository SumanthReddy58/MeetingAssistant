import { ActionItem } from '../types';
import toast from 'react-hot-toast';

export interface MeetingOptions {
  duration?: number;
  attendees?: string[];
  reminderMinutes?: number;
}

export interface CalendarEvent {
  id?: string;
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
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
  colorId?: string;
}

export class CalendarService {
  private accessToken: string;
  private baseUrl = 'https://www.googleapis.com/calendar/v3';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async createEvent(actionItem: ActionItem): Promise<string | null> {
    try {
      const event = this.createEventFromActionItem(actionItem);
      
      const response = await fetch(`${this.baseUrl}/calendars/primary/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Calendar API error: ${errorData.error?.message || response.statusText}`);
      }

      const createdEvent = await response.json();
      
      toast.success('✅ Task synced to Google Calendar', {
        duration: 3000,
        position: 'top-right',
      });
      
      return createdEvent.id;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      toast.error('❌ Calendar sync failed', {
        duration: 4000,
        position: 'top-right',
      });
      return null;
    }
  }

  async createEventWithOptions(actionItem: ActionItem, options: MeetingOptions): Promise<string | null> {
    try {
      const event = this.createEventFromActionItemWithOptions(actionItem, options);
      
      const response = await fetch(`${this.baseUrl}/calendars/primary/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Calendar API error: ${errorData.error?.message || response.statusText}`);
      }

      const createdEvent = await response.json();
      
      toast.success('✅ Meeting created in your calendar', {
        duration: 3000,
        position: 'top-right',
      });
      
      return createdEvent.id;
    } catch (error) {
      console.error('Error creating calendar event with options:', error);
      toast.error('❌ Calendar sync failed', {
        duration: 4000,
        position: 'top-right',
      });
      return null;
    }
  }

  async updateEvent(eventId: string, actionItem: ActionItem): Promise<boolean> {
    try {
      const event = this.createEventFromActionItem(actionItem);
      
      const response = await fetch(`${this.baseUrl}/calendars/primary/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }

      toast.success('📅 Calendar event updated', {
        duration: 2000,
        position: 'top-right',
      });

      return true;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      toast.error('❌ Calendar update failed', {
        duration: 3000,
        position: 'top-right',
      });
      return false;
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      toast.success('🗑️ Calendar event deleted', {
        duration: 2000,
        position: 'top-right',
      });

      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      toast.error('❌ Calendar delete failed', {
        duration: 3000,
        position: 'top-right',
      });
      return false;
    }
  }

  async listEvents(maxResults: number = 10): Promise<CalendarEvent[]> {
    try {
      const timeMin = new Date().toISOString();
      const response = await fetch(
        `${this.baseUrl}/calendars/primary/events?timeMin=${timeMin}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`List events failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error listing calendar events:', error);
      return [];
    }
  }

  private createEventFromActionItem(actionItem: ActionItem): CalendarEvent {
    const now = new Date();
    const startTime = actionItem.scheduledTime || actionItem.dueDate || new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minutes duration
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return {
      summary: actionItem.text,
      description: this.createEventDescription(actionItem),
      start: {
        dateTime: startTime.toISOString(),
        timeZone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
      colorId: this.getPriorityColorId(actionItem.priority),
    };
  }

  private createEventFromActionItemWithOptions(actionItem: ActionItem, options: MeetingOptions): CalendarEvent {
    const now = new Date();
    const startTime = actionItem.scheduledTime || actionItem.dueDate || new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const duration = options.duration || 30;
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const event: CalendarEvent = {
      summary: actionItem.text,
      description: this.createEventDescriptionWithOptions(actionItem, options),
      start: {
        dateTime: startTime.toISOString(),
        timeZone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone,
      },
      colorId: this.getPriorityColorId(actionItem.priority),
    };

    // Add attendees if provided
    if (options.attendees && options.attendees.length > 0) {
      (event as any).attendees = options.attendees.map(email => ({ email }));
    }

    // Add reminders if specified
    if (options.reminderMinutes !== undefined) {
      event.reminders = {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: options.reminderMinutes },
        ],
      };
    } else {
      event.reminders = {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      };
    }

    return event;
  }

  private createEventDescription(actionItem: ActionItem): string {
    const parts = [
      '📌 Action Item from Meeting Assistant',
      '',
      `Priority: ${actionItem.priority.toUpperCase()}`,
    ];

    if (actionItem.assignee) {
      parts.push(`Assigned to: ${actionItem.assignee}`);
    }

    if (actionItem.dueDate) {
      parts.push(`Due Date: ${actionItem.dueDate.toLocaleDateString()}`);
    }

    parts.push('', `Created: ${actionItem.createdAt.toLocaleString()}`);

    return parts.join('\n');
  }

  private createEventDescriptionWithOptions(actionItem: ActionItem, options: MeetingOptions): string {
    const parts = [
      '📌 Action Item Meeting - Meeting Assistant',
      '',
      `Task: ${actionItem.text}`,
      `Priority: ${actionItem.priority.toUpperCase()}`,
    ];

    if (actionItem.assignee) {
      parts.push(`Assigned to: ${actionItem.assignee}`);
    }

    if (actionItem.dueDate) {
      parts.push(`Due Date: ${actionItem.dueDate.toLocaleDateString()}`);
    }

    if (options.attendees && options.attendees.length > 0) {
      parts.push(`Attendees: ${options.attendees.join(', ')}`);
    }

    parts.push('', `Duration: ${options.duration || 30} minutes`);
    parts.push(`Created: ${actionItem.createdAt.toLocaleString()}`);

    return parts.join('\n');
  }

  private getPriorityColorId(priority: string): string {
    switch (priority) {
      case 'high': return '11'; // Red
      case 'medium': return '5'; // Yellow
      case 'low': return '10'; // Green
      default: return '1'; // Blue
    }
  }
}