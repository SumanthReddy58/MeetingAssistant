interface CalendarEvent {
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
  reminders: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

class GoogleCalendarService {
  private accessToken: string | null = null;
  private isInitialized = false;

  async initialize(accessToken: string) {
    try {
      this.accessToken = accessToken;
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Calendar:', error);
      return false;
    }
  }

  private getHeaders() {
    if (!this.accessToken) {
      throw new Error('Access token not available');
    }
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async createEvent(event: CalendarEvent): Promise<string | null> {
    if (!this.isInitialized || !this.accessToken) {
      throw new Error('Google Calendar not initialized');
    }

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      throw error;
    }
  }

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<boolean> {
    if (!this.isInitialized || !this.accessToken) {
      throw new Error('Google Calendar not initialized');
    }

    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to update calendar event:', error);
      return false;
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    if (!this.isInitialized || !this.accessToken) {
      throw new Error('Google Calendar not initialized');
    }

    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete calendar event:', error);
      return false;
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();

export const createCalendarEvent = async (
  title: string,
  description: string,
  dateTime: Date,
  durationMinutes: number = 30
): Promise<string | null> => {
  const startTime = new Date(dateTime);
  const endTime = new Date(dateTime.getTime() + durationMinutes * 60000);

  const event: CalendarEvent = {
    summary: title,
    description,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 15 },
        { method: 'email', minutes: 60 },
      ],
    },
  };

  return await googleCalendarService.createEvent(event);
};