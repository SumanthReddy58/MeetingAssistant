import { CalendarEvent, CreateEventRequest } from '../types';

class GoogleCalendarService {
  private accessToken: string | null = null;
  private isInitialized = false;
  private readonly API_BASE = 'https://www.googleapis.com/calendar/v3';

  async initialize(accessToken: string): Promise<boolean> {
    try {
      // Validate the token by making a test request
      const response = await fetch(`${this.API_BASE}/calendars/primary`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        this.accessToken = accessToken;
        this.isInitialized = true;
        console.log('Google Calendar initialized successfully');
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Calendar initialization failed:', response.status, response.statusText, errorData);
        return false;
      }
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
      'Accept': 'application/json',
    };
  }

  async getUpcomingEvents(maxResults: number = 10): Promise<CalendarEvent[]> {
    if (!this.isInitialized || !this.accessToken) {
      throw new Error('Google Calendar not initialized');
    }

    try {
      const now = new Date().toISOString();
      const url = `${this.API_BASE}/calendars/primary/events?timeMin=${encodeURIComponent(now)}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Get events failed:', response.status, response.statusText, errorData);
        throw new Error(`Failed to get events: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Failed to get calendar events:', error);
      throw error;
    }
  }

  async createEvent(eventData: CreateEventRequest): Promise<CalendarEvent> {
    if (!this.isInitialized || !this.accessToken) {
      throw new Error('Google Calendar not initialized');
    }

    try {
      console.log('Creating calendar event:', eventData);
      
      const response = await fetch(`${this.API_BASE}/calendars/primary/events`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Create event failed:', response.status, response.statusText, errorData);
        throw new Error(`Failed to create event: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('Event created successfully:', data.id);
      return data;
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      throw error;
    }
  }

  async updateEvent(eventId: string, eventData: Partial<CreateEventRequest>): Promise<CalendarEvent> {
    if (!this.isInitialized || !this.accessToken) {
      throw new Error('Google Calendar not initialized');
    }

    try {
      const response = await fetch(`${this.API_BASE}/calendars/primary/events/${eventId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Update event failed:', response.status, response.statusText, errorData);
        throw new Error(`Failed to update event: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update calendar event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    if (!this.isInitialized || !this.accessToken) {
      throw new Error('Google Calendar not initialized');
    }

    try {
      const response = await fetch(`${this.API_BASE}/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok && response.status !== 404) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete event failed:', response.status, response.statusText, errorData);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete calendar event:', error);
      return false;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isInitialized || !this.accessToken) {
      return { success: false, message: 'Not initialized' };
    }

    try {
      const response = await fetch(`${this.API_BASE}/calendars/primary`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          message: `Connected to calendar: ${data.summary || 'Primary Calendar'}` 
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          message: `Connection failed: ${response.status} ${errorData.error?.message || response.statusText}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();