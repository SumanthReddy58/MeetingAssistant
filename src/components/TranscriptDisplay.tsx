import React, { useEffect, useRef } from 'react';
import { Mic, MessageSquare, Sparkles } from 'lucide-react';
import { TranscriptSegment } from '../types';
import { highlightActionKeywords } from '../utils/actionItemExtractor';

interface TranscriptDisplayProps {
  transcript: TranscriptSegment[];
  liveTranscript: string;
  isRecording: boolean;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
  liveTranscript,
  isRecording
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, liveTranscript]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-8 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <MessageSquare className="h-6 w-6 mr-3 text-blue-600" />
          Live Transcript
          </h3>
          {transcript.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Sparkles className="h-4 w-4" />
              <span>{transcript.length} segments</span>
            </div>
          )}
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="h-96 overflow-y-auto p-8 space-y-6"
      >
        {transcript.map((segment) => (
          <div 
            key={segment.id}
            className={`p-6 rounded-xl transition-all duration-200 ${
              segment.containsActionItems 
                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 shadow-sm' 
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-blue-600">
                    {segment.speaker.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {segment.speaker}
                </span>
                {segment.containsActionItems && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                    Action Items
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {segment.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: highlightActionKeywords(segment.text) 
              }}
            />
          </div>
        ))}
        
        {isRecording && liveTranscript && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                  <Mic className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  You (Live)
                </span>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                  Recording
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">
                  Live
                </span>
              </div>
            </div>
            <p className="text-gray-700 opacity-75 leading-relaxed">
              {liveTranscript}
            </p>
          </>
        )}
        
        {transcript.length === 0 && !liveTranscript && (
          <div className="flex items-center justify-center h-full py-16">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No transcript yet</h4>
              <p className="text-gray-500">
                Start recording to see real-time transcription with automatic action item detection
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};