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
    <div className="bg-white border border-gray-100">
      <div className="p-8 border-b border-gray-100">
        <h3 className="text-xl font-light text-gray-900">
          Session History
        </h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSessionSelect(session)}
            className="p-8 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-3">
                  {session.title}
                </h4>
                <div className="flex items-center space-x-6 text-sm text-gray-500 font-light">
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
                <div className="flex items-center mt-3">
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-medium ${
                    session.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : session.status === 'active'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {session.status}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => handleExportCSV(session, e)}
                  className="p-2 hover:bg-gray-200 transition-colors"
                  title="Export Action Items as CSV"
                >
                  <Download className="h-4 w-4 text-gray-500" />
                </button>
                <button
                  onClick={(e) => handleExportTranscript(session, e)}
                  className="p-2 hover:bg-gray-200 transition-colors"
                  title="Export Transcript as Text"
                >
                  <FileText className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {sessions.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-light">No previous sessions found.</p>
          </div>
        )}
      </div>
    </div>
  );
};