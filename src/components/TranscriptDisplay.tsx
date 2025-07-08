import React, { useEffect, useRef } from 'react';
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Live Transcript
        </h3>
      </div>
      
      <div 
        ref={scrollRef}
        className="h-96 overflow-y-auto p-4 space-y-3"
      >
        {transcript.map((segment) => (
          <div 
            key={segment.id}
            className={`p-3 rounded-lg ${
              segment.containsActionItems 
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' 
                : 'bg-gray-50 dark:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {segment.speaker}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {segment.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p 
              className="text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ 
                __html: highlightActionKeywords(segment.text) 
              }}
            />
          </div>
        ))}
        
        {isRecording && liveTranscript && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                You (Live)
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Recording...
                </span>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 opacity-75">
              {liveTranscript}
            </p>
          </div>
        )}
        
        {transcript.length === 0 && !liveTranscript && (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>Start recording to see the transcript here...</p>
          </div>
        )}
      </div>
    </div>
  );
};