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
    <div className="bg-white border border-gray-50">
      <div className="p-12 border-b border-gray-50">
        <h3 className="text-xl font-light text-black tracking-tight">
          Session History
        </h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSessionSelect(session)}
            className="p-12 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-black mb-4 text-sm tracking-wide">
                  {session.title}
                </h4>
                <div className="flex items-center space-x-8 text-xs text-gray-400 font-light">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-2" />
                    {session.startTime.toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-2" />
                    {session.endTime 
                      ? `${Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60)}m`
                      : 'Ongoing'
                    }
                  </span>
                  <span className="flex items-center">
                    <FileText className="h-3 w-3 mr-2" />
                    {session.actionItems.length} items
                  </span>
                </div>
                <div className="flex items-center mt-4">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium tracking-wide uppercase ${
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
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => handleExportCSV(session, e)}
                  className="p-3 hover:bg-gray-100 transition-colors"
                  title="Export Action Items as CSV"
                >
                  <Download className="h-3.5 w-3.5 text-gray-400" />
                </button>
                <button
                  onClick={(e) => handleExportTranscript(session, e)}
                  className="p-3 hover:bg-gray-100 transition-colors"
                  title="Export Transcript as Text"
                >
                  <FileText className="h-3.5 w-3.5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {sessions.length === 0 && (
          <div className="p-16 text-center">
            <div className="w-12 h-12 bg-gray-50 flex items-center justify-center mx-auto mb-6">
              <FileText className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-gray-400 font-light text-sm tracking-wide">No previous sessions found.</p>
          </div>
        )}
      </div>
    </div>
  );
};