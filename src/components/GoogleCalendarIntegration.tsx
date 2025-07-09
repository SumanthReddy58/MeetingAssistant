import React, { useState } from 'react';
import { Calendar, CheckCircle, AlertCircle, ExternalLink, Settings, User, RefreshCw } from 'lucide-react';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

interface GoogleCalendarIntegrationProps {
  onIntegrationChange: (isConnected: boolean, accessToken: string | null) => void;
}

export const GoogleCalendarIntegration: React.FC<GoogleCalendarIntegrationProps> = ({
  onIntegrationChange
}) => {
  const { isAuthenticated, user, isLoading, error, signIn, signOut } = useGoogleAuth();
  const [showDetails, setShowDetails] = useState(false);

  React.useEffect(() => {
    onIntegrationChange(isAuthenticated, sessionStorage.getItem('google_access_token'));
  }, [isAuthenticated, onIntegrationChange]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-8 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="h-6 w-6 mr-3 text-blue-600" />
            Google Calendar
          </h3>
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full">
                <AlertCircle className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Not Connected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}
        
        {!isAuthenticated ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Connect Google Calendar
            </h4>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
              Automatically create calendar events for your action items with due dates and reminders.
            </p>
            <button
              onClick={signIn}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-3 mx-auto"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Calendar className="h-5 w-5" />
                  <span>Connect Calendar</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                {user?.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-green-600" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-900">
                  {user?.name || 'Google User'}
                </h4>
                <p className="text-sm text-green-700">{user?.email || 'No email available'}</p>
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-2 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5 text-green-600" />
              </button>
            </div>

            {showDetails && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Auto-create events</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Email reminders</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Priority colors</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                onClick={() => window.open('https://calendar.google.com', '_blank')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open Calendar</span>
              </button>
              <button
                onClick={signOut}
                className="text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};