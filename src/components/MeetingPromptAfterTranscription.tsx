import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, FileText, Bell, X, Check, AlertCircle, Sparkles } from 'lucide-react';
import { ActionItem } from '../types';
import { CalendarService } from '../services/calendarService';
import { parseNLPDateTime, formatParsedDateTime } from '../utils/nlpDateParser';
import toast from 'react-hot-toast';

interface MeetingPromptAfterTranscriptionProps {
  task: ActionItem;
  isOpen: boolean;
  onClose: () => void;
  onCreateMeeting: (eventId: string) => void;
  accessToken: string | null;
}

interface MeetingOptions {
  createMeeting: boolean;
  startTime: string;
  duration: number;
  attendees: string[];
  notes: string;
  enableReminder: boolean;
  reminderMinutes: number;
}

export const MeetingPromptAfterTranscription: React.FC<MeetingPromptAfterTranscriptionProps> = ({
  task,
  isOpen,
  onClose,
  onCreateMeeting,
  accessToken
}) => {
  const [options, setOptions] = useState<MeetingOptions>({
    createMeeting: true,
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
        notes: `Meeting about: ${task.text}`
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

    // Default to next hour
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return now.toISOString().slice(0, 16);
  };

  const extractAttendeesFromText = (text: string): string[] => {
    // Look for email patterns
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex) || [];
    
    // Look for names after "with", "call", "meet", etc.
    const namePatterns = [
      /(?:with|call|meet|contact)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi,
      /@([A-Za-z]+)/g
    ];
    
    const names: string[] = [];
    namePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        names.push(match[1]);
      }
    });
    
    return [...emails, ...names.filter(name => !emails.includes(name))];
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (options.createMeeting) {
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addAttendee = () => {
    if (newAttendee && !options.attendees.includes(newAttendee)) {
      setOptions(prev => ({
        ...prev,
        attendees: [...prev.attendees, newAttendee]
      }));
      setNewAttendee('');
    }
  };

  const removeAttendee = (attendee: string) => {
    setOptions(prev => ({
      ...prev,
      attendees: prev.attendees.filter(a => a !== attendee)
    }));
  };

  const handleCreateMeeting = async () => {
    if (!options.createMeeting) {
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
        onCreateMeeting(eventId);
        toast.success('📅 Meeting created from voice transcription!', {
          duration: 4000,
          position: 'top-right',
        });
        onClose();
      }
    } catch (error) {
      console.error('Meeting creation error:', error);
      toast.error('❌ Failed to create meeting. Please try again.', {
        duration: 4000,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-extract attendees when task changes
  useEffect(() => {
    if (task && task.text) {
      const extractedAttendees = extractAttendeesFromText(task.text);
      if (extractedAttendees.length > 0) {
        setOptions(prev => ({
          ...prev,
          attendees: extractedAttendees
        }));
      }
    }
  }, [task]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-200 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  📅 Create Meeting for This Task?
                </h3>
                <p className="text-sm text-gray-600">
                  Captured from voice transcription
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
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2 text-purple-600" />
              Task Details:
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">{task.text}</p>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {task.priority.toUpperCase()} Priority
              </span>
              {task.assignee && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  👤 {task.assignee}
                </span>
              )}
            </div>
          </div>

          {/* Create Meeting Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="createMeeting"
              checked={options.createMeeting}
              onChange={(e) => setOptions(prev => ({ ...prev, createMeeting: e.target.checked }))}
              className="w-5 h-5 border-2 border-gray-300 rounded bg-white checked:bg-purple-600 checked:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0"
            />
            <label htmlFor="createMeeting" className="text-base font-medium text-gray-900">
              ✅ Yes, create a calendar meeting for this task
            </label>
          </div>

          {options.createMeeting && (
            <>
              {/* Time Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  ⏰ Meeting Time
                </label>
                <input
                  type="datetime-local"
                  value={options.startTime}
                  onChange={(e) => setOptions(prev => ({ ...prev, startTime: e.target.value }))}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 ${
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
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
                  👤 Meeting Attendees
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newAttendee}
                      onChange={(e) => setNewAttendee(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addAttendee()}
                      placeholder="Enter name or email"
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    />
                    <button
                      onClick={addAttendee}
                      disabled={!newAttendee}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  
                  {options.attendees.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {options.attendees.map((attendee) => (
                        <span
                          key={attendee}
                          className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                        >
                          {attendee}
                          <button
                            onClick={() => removeAttendee(attendee)}
                            className="ml-2 hover:text-purple-600"
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
                  📝 Meeting Notes
                </label>
                <textarea
                  value={options.notes}
                  onChange={(e) => setOptions(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Add meeting agenda or notes..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 resize-none"
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
                    className="w-4 h-4 border-2 border-gray-300 rounded bg-white checked:bg-purple-600 checked:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <label htmlFor="enableReminder" className="text-sm font-medium text-gray-900">
                    🔔 Enable meeting reminders
                  </label>
                </div>
                
                {options.enableReminder && (
                  <div className="ml-7">
                    <select
                      value={options.reminderMinutes}
                      onChange={(e) => setOptions(prev => ({ ...prev, reminderMinutes: parseInt(e.target.value) }))}
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 text-sm"
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
            onClick={handleCreateMeeting}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Meeting...</span>
              </>
            ) : options.createMeeting ? (
              <>
                <Calendar className="h-5 w-5" />
                <span>✅ Create Meeting</span>
              </>
            ) : (
              <span>Continue without Meeting</span>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg font-semibold transition-all duration-200"
          >
            ❌ No, thanks
          </button>
        </div>
      </div>
    </div>
  );
};