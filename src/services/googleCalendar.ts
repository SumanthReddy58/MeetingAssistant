import { ActionItem } from '../types';

export class GoogleCalendarService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async createEvent(actionItem: ActionItem): Promise<string | null> {
    try {
      const event = {
        summary: actionItem.text,
        description: `Action Item from Meeting Assistant\n\nPriority: ${actionItem.priority}\n${actionItem.assignee ? `Assignee: ${actionItem.assignee}` : ''}`,
        start: {
          dateTime: actionItem.scheduledTime?.toISOString() || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: actionItem.scheduledTime 
            ? new Date(actionItem.scheduledTime.getTime() + 60 * 60 * 1000).toISOString()
            : new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
        colorId: this.getPriorityColor(actionItem.priority),
      };

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`Calendar API error: ${response.statusText}`);
      }

      const createdEvent = await response.json();
      return createdEvent.id;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return null;
    }
  }

  async updateEvent(eventId: string, actionItem: ActionItem): Promise<boolean> {
    try {
      const event = {
        summary: actionItem.text,
        description: `Action Item from Meeting Assistant\n\nPriority: ${actionItem.priority}\n${actionItem.assignee ? `Assignee: ${actionItem.assignee}` : ''}`,
        colorId: this.getPriorityColor(actionItem.priority),
      };

      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      return false;
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      return false;
    }
  }

  private getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return '11'; // Red
      case 'medium': return '5'; // Yellow
      case 'low': return '10'; // Green
      default: return '1'; // Blue
    }
  }

  async getCalendars() {
    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Calendar API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching calendars:', error);
      return null;
    }
  }
}