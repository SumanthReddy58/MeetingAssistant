import React from 'react';
import { Play, Pause, Square, Mic, MicOff, Circle } from 'lucide-react';
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
    <div className="bg-white border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-gray-900 mb-2">
            {session ? session.title : 'No Active Session'}
          </h2>
          {session && (
            <p className="text-sm text-gray-500 font-light">
              Started: {session.startTime.toLocaleTimeString()}
            </p>
          )}
        </div>
        
        {session && (
          <div className="flex items-center space-x-2">
            <Circle className={`h-3 w-3 ${session.status === 'active' ? 'text-green-500 fill-current' : 'text-gray-400'}`} />
            <span className="text-sm text-gray-600 font-light capitalize">
              {session.status}
            </span>
          </div>
        )}
      </div>
        
      <div className="flex items-center space-x-4">
          {!session ? (
            <button
              onClick={onStartSession}
              className="flex items-center space-x-3 bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 font-medium transition-colors"
            >
              <Play className="h-5 w-5" />
              <span>Start Session</span>
            </button>
          ) : (
            <>
              <button
                onClick={onToggleRecording}
                className={`flex items-center space-x-3 px-8 py-3 font-medium transition-colors ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-5 w-5" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    <span>Start Recording</span>
                  </>
                )}
              </button>
              
              <button
                onClick={session.status === 'active' ? onPauseSession : onStartSession}
                className="flex items-center space-x-3 bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-3 font-medium transition-colors"
              >
                {session.status === 'active' ? (
                  <>
                    <Pause className="h-5 w-5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    <span>Resume</span>
                  </>
                )}
              </button>
              
              <button
                onClick={onStopSession}
                className="flex items-center space-x-3 border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 font-medium transition-colors"
              >
                <Square className="h-5 w-5" />
                <span>End Session</span>
              </button>
            </>
          )}
      </div>
    </div>
  );
};