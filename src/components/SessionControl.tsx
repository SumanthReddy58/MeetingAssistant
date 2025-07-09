import React from 'react';
import { Play, Pause, Square, Mic, MicOff, Circle, Clock, Users, BarChart3 } from 'lucide-react';
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {!session ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mic className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Ready to Start Recording?
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Create a new session to begin voice transcription and automatic action item extraction.
          </p>
          <button
            onClick={onStartSession}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-3 mx-auto"
          >
            <Play className="h-6 w-6" />
            <span>Start New Session</span>
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {session.title}
              </h2>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Started: {session.startTime.toLocaleTimeString()}
                </span>
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {session.participants.length} participants
                </span>
                <span className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {session.actionItems.length} action items
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                session.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : session.status === 'paused'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                <Circle className={`h-2 w-2 ${
                  session.status === 'active' ? 'text-green-500 fill-current animate-pulse' : 'text-gray-400 fill-current'
                }`} />
                <span className="capitalize">{session.status}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Duration</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {Math.round((Date.now() - session.startTime.getTime()) / 1000 / 60)}m
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Transcript Lines</p>
                  <p className="text-2xl font-bold text-purple-900">{session.transcript.length}</p>
                </div>
                <Mic className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            
            <div className="bg-green-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Action Items</p>
                  <p className="text-2xl font-bold text-green-900">{session.actionItems.length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={onToggleRecording}
              className={`flex items-center space-x-3 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${
                isRecording 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-6 w-6" />
                  <span>Stop Recording</span>
                </>
              ) : (
                <>
                  <Mic className="h-6 w-6" />
                  <span>Start Recording</span>
                </>
              )}
            </button>
            
            <button
              onClick={session.status === 'active' ? onPauseSession : onStartSession}
              className="flex items-center space-x-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 px-6 py-4 rounded-xl text-lg font-semibold transition-all duration-200"
            >
              {session.status === 'active' ? (
                <>
                  <Pause className="h-6 w-6" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-6 w-6" />
                  <span>Resume</span>
                </>
              )}
            </button>
            
            <button
              onClick={onStopSession}
              className="flex items-center space-x-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 px-6 py-4 rounded-xl text-lg font-semibold transition-all duration-200"
            >
              <Square className="h-6 w-6" />
              <span>End Session</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
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