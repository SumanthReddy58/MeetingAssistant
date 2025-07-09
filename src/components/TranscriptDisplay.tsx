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
    <div className="bg-white border border-gray-50">
      <div className="p-12 border-b border-gray-50">
        <h3 className="text-xl font-light text-black tracking-tight">
          Live Transcript
        </h3>
      </div>
      
      <div 
        ref={scrollRef}
        className="h-96 overflow-y-auto p-12 space-y-8"
      >
        {transcript.map((segment) => (
          <div 
            key={segment.id}
            className={`p-8 ${
              segment.containsActionItems 
                ? 'bg-yellow-50 border-l-2 border-yellow-400' 
                : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-medium text-black tracking-wide uppercase">
                {segment.speaker}
              </span>
              <span className="text-xs text-gray-400 font-light">
                {segment.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p 
              className="text-gray-600 leading-relaxed text-sm"
              dangerouslySetInnerHTML={{ 
                __html: highlightActionKeywords(segment.text) 
              }}
            />
          </div>
        ))}
        
        {isRecording && liveTranscript && (
          <div className="p-8 bg-blue-50 border-l-2 border-blue-400">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-medium text-black tracking-wide uppercase">
                You (Live)
              </span>
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400 font-light tracking-wide uppercase">
                  Recording...
                </span>
              </div>
            </div>
            <p className="text-gray-600 opacity-75 leading-relaxed text-sm">
              {liveTranscript}
            </p>
          </div>
        )}
        
        {transcript.length === 0 && !liveTranscript && (
          <div className="flex items-center justify-center h-full py-16">
            <div className="text-center max-w-sm">
              <div className="w-12 h-12 bg-gray-50 flex items-center justify-center mx-auto mb-6">
                <Mic className="h-6 w-6 text-gray-300" />
              </div>
              <p className="text-gray-400 font-light text-sm tracking-wide">Start recording to see the transcript here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};