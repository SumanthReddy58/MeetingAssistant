import React from 'react';
import { Play, Pause, Square, Mic, MicOff } from 'lucide-react';
import { MeetingSession } from '../types';

interface SessionControlProps {
  session: MeetingSession | null;
  isRecording: boolean;
  onStartSession: () => void;
  onPauseSession: () => void;
  onStopSession: () => void;
  onToggleRecording: () => void;
}

export const SessionControl: React.FC<SessionControlProps> = ({
  session,
  isRecording,
  onStartSession,
  onPauseSession,
  onStopSession,
  onToggleRecording
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {session ? session.title : 'No Active Session'}
          </h2>
          {session && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Started: {session.startTime.toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {!session ? (
            <button
              onClick={onStartSession}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Play className="h-4 w-4" />
              <span>Start Session</span>
            </button>
          ) : (
            <>
              <button
                onClick={onToggleRecording}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    <span>Start Recording</span>
                  </>
                )}
              </button>
              
              <button
                onClick={session.status === 'active' ? onPauseSession : onStartSession}
                className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {session.status === 'active' ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Resume</span>
                  </>
                )}
              </button>
              
              <button
                onClick={onStopSession}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Square className="h-4 w-4" />
                <span>End Session</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};