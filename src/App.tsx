import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { SessionControl } from './components/SessionControl';
import { TranscriptDisplay } from './components/TranscriptDisplay';
import { ActionItemsList } from './components/ActionItemsList';
import { SessionHistory } from './components/SessionHistory';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { useLocalStorage } from './hooks/useLocalStorage';
import { MeetingSession, ActionItem, TranscriptSegment, User } from './types';
import { extractActionItems } from './utils/actionItemExtractor';
import { GoogleCalendarAuth } from './components/GoogleCalendarAuth';
import { googleCalendarService, createCalendarEvent } from './utils/googleCalendar';
import { googleAuthService } from './utils/googleAuth';

// Date reviver function to convert ISO date strings back to Date objects
const dateReviver = (key: string, value: any) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
    return new Date(value);
  }
  return value;
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [sessions, setSessions] = useLocalStorage<MeetingSession[]>('meeting-sessions', [], dateReviver);
  const [currentSession, setCurrentSession] = useState<MeetingSession | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  
  const { isListening, transcript, interimTranscript, isSupported, startListening, stopListening, resetTranscript } = useVoiceRecognition();

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if we're handling an OAuth callback
        if (window.location.hash.includes('access_token')) {
          const result = await googleAuthService.handleOAuthCallback();
          if (result) {
            const userData: User = {
              id: result.user.id,
              email: result.user.email,
              name: result.user.name,
              picture: result.user.picture,
              accessToken: result.accessToken
            };
            setUser(userData);
            
            // Initialize calendar service with the new token
            const success = await googleCalendarService.initialize(result.accessToken);
            setIsCalendarConnected(success);
            setIsCheckingAuth(false);
            return;
          }
        }

        // Check for existing stored authentication
        const currentUser = await googleAuthService.getCurrentUser();
        if (currentUser) {
          const userData: User = {
            id: currentUser.user.id,
            email: currentUser.user.email,
            name: currentUser.user.name,
            picture: currentUser.user.picture,
            accessToken: currentUser.accessToken
          };
          setUser(userData);
          
          // Initialize calendar service with the stored token
          const success = await googleCalendarService.initialize(currentUser.accessToken);
          setIsCalendarConnected(success);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Only process final transcript results to avoid duplicates
    if (transcript && transcript.trim() && currentSession) {
      // Add transcript segment
      const newSegment: TranscriptSegment = {
        id: Date.now().toString(),
        speaker: user?.name || 'You',
        text: transcript,
        timestamp: new Date(),
        containsActionItems: false
      };

      // Extract action items from transcript
      const extractedItems = extractActionItems(transcript);
      
      if (extractedItems.length > 0) {
        newSegment.containsActionItems = true;
        
        // Add new action items
        const newActionItems: ActionItem[] = extractedItems.map(item => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          text: item.text || '',
          priority: item.priority || 'medium',
          completed: false,
          createdAt: new Date(),
          assignee: item.assignee,
          dueDate: item.dueDate,
          scheduledTime: item.scheduledTime
        }));

        // Create calendar events for items with scheduled times
        if (isCalendarConnected) {
          newActionItems.forEach(async (item) => {
            if (item.scheduledTime) {
              try {
                const eventId = await createCalendarEvent(
                  `Action Item: ${item.text}`,
                  `Meeting: ${currentSession.title}\nPriority: ${item.priority}${item.assignee ? `\nAssignee: ${item.assignee}` : ''}`,
                  item.scheduledTime
                );
                if (eventId) {
                  item.calendarEventId = eventId;
                }
              } catch (error) {
                console.error('Failed to create calendar event:', error);
              }
            }
          });
        }

        setCurrentSession(prev => prev ? {
          ...prev,
          transcript: [...prev.transcript, newSegment],
          actionItems: [...prev.actionItems, ...newActionItems]
        } : null);
      } else {
        setCurrentSession(prev => prev ? {
          ...prev,
          transcript: [...prev.transcript, newSegment]
        } : null);
      }

      resetTranscript();
    }
  }, [transcript, currentSession, resetTranscript, user, isCalendarConnected]);

  // Save current session to sessions array whenever it changes
  useEffect(() => {
    if (currentSession) {
      setSessions(prev => {
        const existingIndex = prev.findIndex(s => s.id === currentSession.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = currentSession;
          return updated;
        } else {
          return [...prev, currentSession];
        }
      });
    }
  }, [currentSession, setSessions]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    // Initialize calendar service with the new token
    googleCalendarService.initialize(userData.accessToken).then(success => {
      setIsCalendarConnected(success);
    });
  };

  const handleSignOut = () => {
    googleAuthService.signOut();
    setUser(null);
    setIsCalendarConnected(false);
    setCurrentSession(null);
  };

  const handleStartSession = () => {
    const newSession: MeetingSession = {
      id: Date.now().toString(),
      title: `Meeting ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      startTime: new Date(),
      transcript: [],
      actionItems: [],
      participants: [user?.name || 'You'],
      status: 'active'
    };
    setCurrentSession(newSession);
  };

  const handlePauseSession = () => {
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        status: 'paused'
      });
    }
  };

  const handleStopSession = () => {
    if (currentSession) {
      const completedSession = {
        ...currentSession,
        status: 'completed' as const,
        endTime: new Date()
      };
      setCurrentSession(null);
      setSessions(prev => {
        const existingIndex = prev.findIndex(s => s.id === completedSession.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = completedSession;
          return updated;
        } else {
          return [...prev, completedSession];
        }
      });
    }
  };

  const handleToggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleUpdateActionItem = (id: string, updates: Partial<ActionItem>) => {
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        actionItems: currentSession.actionItems.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      });
    }
  };

  const handleDeleteActionItem = (id: string) => {
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        actionItems: currentSession.actionItems.filter(item => item.id !== id)
      });
    }
  };

  const handleCalendarAuthSuccess = async (accessToken: string) => {
    const success = await googleCalendarService.initialize(accessToken);
    setIsCalendarConnected(success);
  };

  const handleCalendarAuthError = (error: string) => {
    console.error('Calendar auth error:', error);
    setIsCalendarConnected(false);
  };

  const handleAddActionItem = (item: Partial<ActionItem>) => {
    if (currentSession) {
      const newItem: ActionItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        text: item.text || '',
        priority: item.priority || 'medium',
        completed: false,
        createdAt: new Date(),
        assignee: item.assignee,
        dueDate: item.dueDate,
        scheduledTime: item.scheduledTime
      };
      
      // Create calendar event if scheduled time is provided and calendar is connected
      if (newItem.scheduledTime && isCalendarConnected) {
        createCalendarEvent(
          `Action Item: ${newItem.text}`,
          `Meeting: ${currentSession.title}\nPriority: ${newItem.priority}${newItem.assignee ? `\nAssignee: ${newItem.assignee}` : ''}`,
          newItem.scheduledTime
        ).then(eventId => {
          if (eventId) {
            newItem.calendarEventId = eventId;
            setCurrentSession(prev => prev ? {
              ...prev,
              actionItems: prev.actionItems.map(item => 
                item.id === newItem.id ? { ...item, calendarEventId: eventId } : item
              )
            } : null);
          }
        }).catch(error => {
          console.error('Failed to create calendar event:', error);
        });
      }
      
      setCurrentSession({
        ...currentSession,
        actionItems: [...currentSession.actionItems, newItem]
      });
    }
  };

  const handleSessionSelect = (session: MeetingSession) => {
    setCurrentSession(session);
    setShowHistory(false);
  };

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if user is not authenticated
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Voice Recognition Not Supported
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your browser doesn't support voice recognition. Please use a modern browser like Chrome.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header
        currentSession={currentSession}
        user={user}
        onNewSession={handleStartSession}
        onSettings={() => setShowHistory(!showHistory)}
        onSignOut={handleSignOut}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <SessionControl
              session={currentSession}
              isRecording={isListening}
              onStartSession={handleStartSession}
              onPauseSession={handlePauseSession}
              onStopSession={handleStopSession}
              onToggleRecording={handleToggleRecording}
            />
            
            <TranscriptDisplay
              transcript={currentSession?.transcript || []}
              liveTranscript={interimTranscript}
              isRecording={isListening}
            />
          </div>
          
          <div className="space-y-6">
            <ActionItemsList
              actionItems={currentSession?.actionItems || []}
              onUpdateItem={handleUpdateActionItem}
              onDeleteItem={handleDeleteActionItem}
              onAddItem={handleAddActionItem}
            />
            
            <GoogleCalendarAuth
              onAuthSuccess={handleCalendarAuthSuccess}
              onAuthError={handleCalendarAuthError}
            />
            
            <SessionHistory
              sessions={sessions}
              onSessionSelect={handleSessionSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;