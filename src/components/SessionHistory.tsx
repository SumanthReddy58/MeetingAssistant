import React from 'react';
import { Calendar, Clock, FileText, Download, History, TrendingUp } from 'lucide-react';
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
    <div>
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <History className="h-5 w-5 mr-2 text-green-600" />
          Session History
        </h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSessionSelect(session)}
            className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  {session.title}
                </h4>
                <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                  <span className="flex items-center bg-gray-100 px-2 py-0.5 rounded-full">
                    <Calendar className="h-2.5 w-2.5 mr-1" />
                    {session.startTime.toLocaleDateString()}
                  </span>
                  <span className="flex items-center bg-gray-100 px-2 py-0.5 rounded-full">
                    <Clock className="h-2.5 w-2.5 mr-1" />
                    {session.endTime 
                      ? `${Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60)}m`
                      : 'Ongoing'
                    }
                  </span>
                  <span className="flex items-center bg-gray-100 px-2 py-0.5 rounded-full">
                    <TrendingUp className="h-2.5 w-2.5 mr-1" />
                    {session.actionItems.length} items
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    session.status === 'completed' 
                      ? 'bg-green-100 text-green-700'
                      : session.status === 'active'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => handleExportCSV(session, e)}
                  className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                  title="Export Action Items as CSV"
                >
                  <Download className="h-3.5 w-3.5 text-gray-500" />
                </button>
                <button
                  onClick={(e) => handleExportTranscript(session, e)}
                  className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                  title="Export Transcript as Text"
                >
                  <FileText className="h-3.5 w-3.5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {sessions.length === 0 && (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <History className="h-6 w-6 text-green-400" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">No sessions yet</h4>
            <p className="text-xs text-gray-500">
              Your meeting history will appear here once you start your first session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};