import React from 'react';
import { Calendar, Clock, FileText, Download } from 'lucide-react';
import { MeetingSession } from '../types';
import { exportToCSV, exportTranscriptToText } from '../utils/exportUtils';

interface SessionHistoryProps {
  sessions: MeetingSession[];
  onSessionSelect: (session: MeetingSession) => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({ sessions, onSessionSelect }) => {
  const handleExportCSV = (session: MeetingSession, e: React.MouseEvent) => {
    e.stopPropagation();
    exportToCSV(session);
  };

  const handleExportTranscript = (session: MeetingSession, e: React.MouseEvent) => {
    e.stopPropagation();
    exportTranscriptToText(session);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Session History
        </h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSessionSelect(session)}
            className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {session.title}
                </h4>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {session.startTime.toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {session.endTime 
                      ? `${Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60)}m`
                      : 'Ongoing'
                    }
                  </span>
                  <span className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {session.actionItems.length} items
                  </span>
                </div>
                <div className="flex items-center mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    session.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : session.status === 'active'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    {session.status}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => handleExportCSV(session, e)}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Export Action Items as CSV"
                >
                  <Download className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
                <button
                  onClick={(e) => handleExportTranscript(session, e)}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Export Transcript as Text"
                >
                  <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {sessions.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>No previous sessions found.</p>
          </div>
        )}
      </div>
    </div>
  );
};