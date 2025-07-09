import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, RefreshCw, ExternalLink } from 'lucide-react';
import { CalendarEvent } from '../types';
import { googleCalendarService } from '../utils/googleCalendar';
import { CreateEventModal } from './CreateEventModal';

interface CalendarViewProps {
  isConnected: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ isConnected }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchEvents();
    }
  }, [isConnected]);

  const fetchEvents = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const upcomingEvents = await googleCalendarService.getUpcomingEvents(20);
      setEvents(upcomingEvents);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch events';
      setError(errorMessage);
      console.error('Failed to fetch calendar events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventCreated = (newEvent: CalendarEvent) => {
    setEvents(prev => [newEvent, ...prev].sort((a, b) => {
      const aTime = a.start.dateTime || a.start.date || '';
      const bTime = b.start.dateTime || b.start.date || '';
      return new Date(aTime).getTime() - new Date(bTime).getTime();
    }));
    setShowCreateModal(false);
  };

  const formatEventTime = (event: CalendarEvent) => {
    const start = event.start.dateTime || event.start.date;
    const end = event.end.dateTime || event.end.date;
    
    if (!start) return 'No time specified';
    
    const startDate = new Date(start);
    const endDate = new Date(end || start);
    
    // All-day event
    if (event.start.date && !event.start.dateTime) {
      return 'All day';
    }
    
    // Same day event
    if (startDate.toDateString() === endDate.toDateString()) {
      return `${startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    }
    
    // Multi-day event
    return `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  };

  const formatEventDate = (event: CalendarEvent) => {
    const start = event.start.dateTime || event.start.date;
    if (!start) return '';
    
    const startDate = new Date(start);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (startDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (startDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return startDate.toLocaleDateString([], { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Calendar Events
          </h3>
        </div>
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Connect to Google Calendar to view your events</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Events
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchEvents}
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                title="Refresh events"
              >
                <RefreshCw className={`h-4 w-4 text-gray-500 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Event</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
              <div className="flex items-center">
                <div className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 dark:text-red-400 text-xs underline hover:no-underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming events found</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
              >
                Create your first event
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {event.summary || 'Untitled Event'}
                        </h4>
                        {event.htmlLink && (
                          <a
                            href={event.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            title="Open in Google Calendar"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatEventDate(event)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatEventTime(event)}
                        </span>
                      </div>

                      {event.location && (
                        <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{event.location}</span>
                        </div>
                      )}

                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}

                      {event.description && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>

                    <div className={`ml-4 px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : event.status === 'tentative'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {event.status || 'confirmed'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onEventCreated={handleEventCreated}
        />
      )}
    </>
  );
};