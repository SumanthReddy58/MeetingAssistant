import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { SessionControl } from './components/SessionControl';
import { TranscriptDisplay } from './components/TranscriptDisplay';
import { ActionItemsList } from './components/ActionItemsList';
import { SessionHistory } from './components/SessionHistory';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { useLocalStorage } from './hooks/useLocalStorage';
import { CalendarService } from './services/calendarService';
import { SlackService } from './services/slackService';
import { GoogleCalendarIntegration } from './components/GoogleCalendarIntegration';
import { SlackIntegration } from './components/SlackIntegration';
import { MeetingSession, ActionItem, TranscriptSegment } from './types';
import { extractActionItems } from './utils/actionItemExtractor';
import { Toaster } from 'react-hot-toast';
import { Settings } from 'lucide-react';

// Date reviver function to convert ISO date strings back to Date objects
const dateReviver = (key: string, value: any) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
    return new Date(value);
  }
  return value;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessions, setSessions] = useLocalStorage<MeetingSession[]>('meeting-sessions', [], dateReviver);
  const [currentSession, setCurrentSession] = useState<MeetingSession | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [calendarAccessToken, setCalendarAccessToken] = useState<string | null>(null);
  const [slackService, setSlackService] = useState<SlackService | null>(null);
  
  const { isListening, transcript, interimTranscript, isSupported, startListening, stopListening, resetTranscript } = useVoiceRecognition();

  useEffect(() => {
    // Only process final transcript results to avoid duplicates
    if (transcript && transcript.trim() && currentSession) {
      // Add transcript segment
      const newSegment: TranscriptSegment = {
        id: Date.now().toString(),
        speaker: 'You',
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
  }, [transcript, currentSession, resetTranscript]);

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

  const handleStartSession = () => {
    const newSession: MeetingSession = {
      id: Date.now().toString(),
      title: `Meeting ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      startTime: new Date(),
      transcript: [],
      actionItems: [],
      participants: ['You'],
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
      const item = currentSession.actionItems.find(item => item.id === id);
      
      // Update calendar event if connected and item has calendar event
      if (isCalendarConnected && calendarAccessToken && item?.calendarEventId) {
        const calendarService = new CalendarService(calendarAccessToken);
        const updatedItem = { ...item, ...updates };
        calendarService.updateEvent(item.calendarEventId, updatedItem);
      }

      // Post to Slack if connected and task is being completed
      if (slackService && updates.completed === true && !item?.completed) {
        const updatedItem = { ...item, ...updates } as ActionItem;
        slackService.postTaskUpdate(updatedItem, 'completed');
      } else if (slackService && updates.completed === false && item?.completed) {
        const updatedItem = { ...item, ...updates } as ActionItem;
        slackService.postTaskUpdate(updatedItem, 'updated');
      }
      
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
      const item = currentSession.actionItems.find(item => item.id === id);
      
      // Delete calendar event if connected and item has calendar event
      if (isCalendarConnected && calendarAccessToken && item?.calendarEventId) {
        const calendarService = new CalendarService(calendarAccessToken);
        calendarService.deleteEvent(item.calendarEventId);
      }

      // Post to Slack if connected
      if (slackService && item) {
        slackService.postTaskUpdate(item, 'deleted');
      }
      
      setCurrentSession({
        ...currentSession,
        actionItems: currentSession.actionItems.filter(item => item.id !== id)
      });
    }
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

      // Create calendar event if connected and item has scheduled time
      if (isCalendarConnected && calendarAccessToken && (newItem.scheduledTime || newItem.dueDate)) {
        const calendarService = new CalendarService(calendarAccessToken);
        calendarService.createEvent(newItem).then(eventId => {
          if (eventId) {
            newItem.calendarEventId = eventId;
            updateSessionWithNewItem(newItem);
          }
        });
      } else {
        updateSessionWithNewItem(newItem);
      }

      // Post to Slack if connected
      if (slackService) {
        slackService.postToSlack(newItem);
      }
    }
  };

  const updateSessionWithNewItem = (newItem: ActionItem) => {
    setCurrentSession(prev => prev ? {
      ...prev,
      actionItems: [...prev.actionItems, newItem]
    } : null);
  };

  const handleSessionSelect = (session: MeetingSession) => {
    setCurrentSession(session);
    setShowHistory(false);
  };

  const handleCalendarIntegrationChange = (isConnected: boolean, accessToken: string | null) => {
    setIsCalendarConnected(isConnected);
    setCalendarAccessToken(accessToken);
  };

  const handleSlackServiceChange = (service: SlackService | null) => {
    setSlackService(service);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentSession(null);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-900 mb-4">
            Voice Recognition Not Supported
          </h1>
          <p className="text-gray-600 font-light">
            Your browser doesn't support voice recognition. Please use a modern browser like Chrome.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gray-50">
        <Header
          currentSession={currentSession}
          onNewSession={handleStartSession}
          onSettings={() => setShowHistory(!showHistory)}
          onLogout={handleLogout}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Main Content Area */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
            {/* Primary Content - Session Control & Transcript */}
            <div className="xl:col-span-3 space-y-6">
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
            
            {/* Sidebar - Action Items & Integrations */}
            <div className="xl:col-span-1 space-y-6">
              <ActionItemsList
                actionItems={currentSession?.actionItems || []}
                onUpdateItem={handleUpdateActionItem}
                onDeleteItem={handleDeleteActionItem}
                onAddItem={handleAddActionItem}
              />
              
              {/* Integrations Panel */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-gray-600" />
                  Integrations
                </h3>
                <div className="space-y-4">
                  <GoogleCalendarIntegration
                    onIntegrationChange={handleCalendarIntegrationChange}
                  />
                  
                  <SlackIntegration
                    onSlackServiceChange={handleSlackServiceChange}
                  />
                </div>
              </div>
              
              {/* Session History */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <SessionHistory
                  sessions={sessions}
                  onSessionSelect={handleSessionSelect}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;