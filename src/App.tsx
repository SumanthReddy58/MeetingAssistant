import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { SessionControl } from './components/SessionControl';
import { TranscriptDisplay } from './components/TranscriptDisplay';
import { ActionItemsList } from './components/ActionItemsList';
import { SessionHistory } from './components/SessionHistory';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { useLocalStorage } from './hooks/useLocalStorage';
import { MeetingSession, ActionItem, TranscriptSegment } from './types';
import { extractActionItems } from './utils/actionItemExtractor';

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
    <div className="min-h-screen bg-gray-50">
      <Header
        currentSession={currentSession}
        onNewSession={handleStartSession}
        onSettings={() => setShowHistory(!showHistory)}
        onLogout={handleLogout}
      />
      
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
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
          
          <div className="space-y-8">
            <ActionItemsList
              actionItems={currentSession?.actionItems || []}
              onUpdateItem={handleUpdateActionItem}
              onDeleteItem={handleDeleteActionItem}
              onAddItem={handleAddActionItem}
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