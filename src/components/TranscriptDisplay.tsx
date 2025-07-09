import React, { useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';
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
    <div className="bg-white border border-gray-100">
      <div className="p-8 border-b border-gray-100">
        <h3 className="text-xl font-light text-gray-900">
          Live Transcript
        </h3>
      </div>
      
      <div 
        ref={scrollRef}
        className="h-96 overflow-y-auto p-8 space-y-6"
      >
        {transcript.map((segment) => (
          <div 
            key={segment.id}
            className={`p-6 ${
              segment.containsActionItems 
                ? 'bg-yellow-50 border-l-4 border-yellow-400' 
                : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-900">
                {segment.speaker}
              </span>
              <span className="text-xs text-gray-500 font-light">
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
          <div className="p-6 bg-blue-50 border-l-4 border-blue-400">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-900">
                You (Live)
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500 font-light">
                  Recording...
                </span>
              </div>
            </div>
            <p className="text-gray-700 opacity-75 leading-relaxed">
              {liveTranscript}
            </p>
          </div>
        )}
        
        {transcript.length === 0 && !liveTranscript && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-light">Start recording to see the transcript here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};