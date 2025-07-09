import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, FileText, Bell, X, Check, AlertCircle } from 'lucide-react';
import { ActionItem } from '../types';
import { CalendarService } from '../services/calendarService';
import { parseNLPDateTime } from '../utils/nlpDateParser';
import toast from 'react-hot-toast';

interface CalendarSyncPromptProps {
  task: ActionItem;
  isOpen: boolean;
  onClose: () => void;
  onSync: (eventId: string) => void;
  accessToken: string | null;
}

interface MeetingOptions {
  enableSync: boolean;
  startTime: string;
  duration: number;
  attendees: string[];
  notes: string;
  enableReminder: boolean;
  reminderMinutes: number;
}

export const CalendarSyncPrompt: React.FC<CalendarSyncPromptProps> = ({
  task,
  isOpen,
  onClose,
  onSync,
  accessToken
}) => {
  const [options, setOptions] = useState<MeetingOptions>({
    enableSync: true,
    startTime: '',
    duration: 30,
    attendees: [],
    notes: '',
    enableReminder: true,
    reminderMinutes: 10
  });
  
  const [newAttendee, setNewAttendee] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize default time when component opens
  useEffect(() => {
    if (isOpen && task) {
      const defaultTime = getDefaultStartTime();
      setOptions(prev => ({
        ...prev,
        startTime: defaultTime,
        notes: task.text
      }));
    }
  }, [isOpen, task]);

  const getDefaultStartTime = (): string => {
    // Try to parse NLP date/time from task text
    const nlpResult = parseNLPDateTime(task.text);
    if (nlpResult) {
      return nlpResult.toISOString().slice(0, 16);
    }

    // Use scheduled time if available
    if (task.scheduledTime) {
      return task.scheduledTime.toISOString().slice(0, 16);
    }

    // Use due date if available
    if (task.dueDate) {
      const dueDateTime = new Date(task.dueDate);
      dueDateTime.setHours(9, 0, 0, 0); // Set to 9 AM
      return dueDateTime.toISOString().slice(0, 16);
    }

    // Default to next 30-minute slot
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 30) * 30;
    now.setMinutes(roundedMinutes, 0, 0);
    
    // If rounded to next hour, adjust
    if (roundedMinutes >= 60) {
      now.setHours(now.getHours() + 1);
      now.setMinutes(0, 0, 0);
    }
    
    return now.toISOString().slice(0, 16);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!options.startTime) {
      newErrors.startTime = 'Start time is required';
    } else {
      const startDate = new Date(options.startTime);
      if (startDate <= new Date()) {
        newErrors.startTime = 'Start time must be in the future';
      }
    }

    if (options.attendees.some(email => !isValidEmail(email))) {
      newErrors.attendees = 'All attendee emails must be valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addAttendee = () => {
    if (newAttendee && isValidEmail(newAttendee) && !options.attendees.includes(newAttendee)) {
      setOptions(prev => ({
        ...prev,
        attendees: [...prev.attendees, newAttendee]
      }));
      setNewAttendee('');
    }
  };

  const removeAttendee = (email: string) => {
    setOptions(prev => ({
      ...prev,
      attendees: prev.attendees.filter(a => a !== email)
    }));
  };

  const handleSync = async () => {
    if (!options.enableSync) {
      onClose();
      return;
    }

    if (!validateForm() || !accessToken) {
      return;
    }

    setIsLoading(true);
    
    try {
      const calendarService = new CalendarService(accessToken);
      
      // Create enhanced task with meeting details
      const enhancedTask: ActionItem = {
        ...task,
        scheduledTime: new Date(options.startTime),
        notes: options.notes
      };

      // Create calendar event with custom options
      const eventId = await calendarService.createEventWithOptions(enhancedTask, {
        duration: options.duration,
        attendees: options.attendees,
        reminderMinutes: options.enableReminder ? options.reminderMinutes : undefined
      });

      if (eventId) {
        onSync(eventId);
        toast.success('✅ Meeting created in your calendar', {
          duration: 4000,
          position: 'top-right',
        });
        onClose();
      }
    } catch (error) {
      console.error('Calendar sync error:', error);
      toast.error('❌ Failed to sync. Please try again.', {
        duration: 4000,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  📆 Sync to Google Calendar?
                </h3>
                <p className="text-sm text-gray-600">
                  Create a meeting reminder for this task
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Task Preview */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="font-medium text-gray-900 mb-2">Task:</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{task.text}</p>
            <div className="flex items-center space-x-3 mt-3">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {task.priority.toUpperCase()} Priority
              </span>
              {task.assignee && (
                <span className="text-xs text-gray-500">
                  Assigned to: {task.assignee}
                </span>
              )}
            </div>
          </div>

          {/* Enable Sync Checkbox */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enableSync"
              checked={options.enableSync}
              onChange={(e) => setOptions(prev => ({ ...prev, enableSync: e.target.checked }))}
              className="w-4 h-4 border-2 border-gray-300 rounded bg-white checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
            />
            <label htmlFor="enableSync" className="text-sm font-medium text-gray-900">
              ✅ Yes, add this as a calendar event
            </label>
          </div>

          {options.enableSync && (
            <>
              {/* Time Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  ⏰ Start Time
                </label>
                <input
                  type="datetime-local"
                  value={options.startTime}
                  onChange={(e) => setOptions(prev => ({ ...prev, startTime: e.target.value }))}
                  className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${
                    errors.startTime ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.startTime && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.startTime}
                  </p>
                )}
              </div>

              {/* Duration Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  ⏳ Duration
                </label>
                <select
                  value={options.duration}
                  onChange={(e) => setOptions(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              {/* Attendees */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  👤 Attendees (optional)
                </label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={newAttendee}
                      onChange={(e) => setNewAttendee(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addAttendee()}
                      placeholder="Enter email address"
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    />
                    <button
                      onClick={addAttendee}
                      disabled={!newAttendee || !isValidEmail(newAttendee)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  
                  {options.attendees.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {options.attendees.map((email) => (
                        <span
                          key={email}
                          className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {email}
                          <button
                            onClick={() => removeAttendee(email)}
                            className="ml-2 hover:text-blue-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {errors.attendees && (
                    <p className="text-xs text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.attendees}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  📋 Notes (optional)
                </label>
                <textarea
                  value={options.notes}
                  onChange={(e) => setOptions(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Add meeting description or notes..."
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 resize-none"
                />
              </div>

              {/* Reminder Toggle */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="enableReminder"
                    checked={options.enableReminder}
                    onChange={(e) => setOptions(prev => ({ ...prev, enableReminder: e.target.checked }))}
                    className="w-4 h-4 border-2 border-gray-300 rounded bg-white checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <label htmlFor="enableReminder" className="text-sm font-medium text-gray-900">
                    🔁 Enable reminder notifications
                  </label>
                </div>
                
                {options.enableReminder && (
                  <div className="ml-7">
                    <select
                      value={options.reminderMinutes}
                      onChange={(e) => setOptions(prev => ({ ...prev, reminderMinutes: parseInt(e.target.value) }))}
                      className="px-3 py-1 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
                    >
                      <option value={5}>5 minutes before</option>
                      <option value={10}>10 minutes before</option>
                      <option value={15}>15 minutes before</option>
                      <option value={30}>30 minutes before</option>
                      <option value={60}>1 hour before</option>
                    </select>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex space-x-3">
          <button
            onClick={handleSync}
            disabled={isLoading || (!options.enableSync && false)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Adding to Calendar...</span>
              </>
            ) : options.enableSync ? (
              <>
                <Check className="h-4 w-4" />
                <span>Add to Calendar</span>
              </>
            ) : (
              <span>Continue without Calendar</span>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg font-semibold transition-all duration-200"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};