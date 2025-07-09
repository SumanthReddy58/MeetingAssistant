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
    <div className="bg-white border border-gray-50 p-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-2xl font-light text-black mb-3 tracking-tight">
            {session ? session.title : 'No Active Session'}
          </h2>
          {session && (
            <p className="text-xs text-gray-400 font-light tracking-wide uppercase">
              Started: {session.startTime.toLocaleTimeString()}
            </p>
          )}
        </div>
        
        {session && (
          <div className="flex items-center space-x-3">
            <Circle className={`h-2 w-2 ${session.status === 'active' ? 'text-green-500 fill-current' : 'text-gray-300'}`} />
            <span className="text-xs text-gray-400 font-light tracking-wide uppercase">
              {session.status}
            </span>
          </div>
        )}
      </div>
        
      <div className="flex items-center space-x-6">
          {!session ? (
            <button
              onClick={onStartSession}
              className="flex items-center space-x-4 bg-black hover:bg-gray-900 text-white px-12 py-4 text-sm font-medium tracking-wide transition-colors"
            >
              <Play className="h-5 w-5" />
              <span>Start Session</span>
            </button>
          ) : (
            <>
              <button
                onClick={onToggleRecording}
                className={`flex items-center space-x-4 px-12 py-4 text-sm font-medium tracking-wide transition-colors ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-black hover:bg-gray-900 text-white'
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
                className="flex items-center space-x-4 bg-gray-50 hover:bg-gray-100 text-black px-12 py-4 text-sm font-medium tracking-wide transition-colors"
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
                className="flex items-center space-x-4 border border-gray-200 hover:border-gray-300 text-gray-600 px-12 py-4 text-sm font-medium tracking-wide transition-colors"
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