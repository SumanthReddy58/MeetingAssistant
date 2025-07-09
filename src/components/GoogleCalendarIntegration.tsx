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
    <div className="border border-gray-100 rounded-xl">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
            Google Calendar
          </h4>
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-700">Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-full">
                <AlertCircle className="h-3 w-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">Disconnected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs text-red-700">{error}</span>
            </div>
          </div>
        )}
        
        {!isAuthenticated ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h5 className="text-sm font-semibold text-gray-900 mb-2">
              Connect Google Calendar
            </h5>
            <p className="text-xs text-gray-600 mb-4 max-w-xs mx-auto">
              Auto-create events for action items with reminders.
            </p>
            <button
              onClick={signIn}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  <span>Connect Calendar</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                {user?.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-green-600" />
                )}
              </div>
              <div className="flex-1">
                <h5 className="text-xs font-semibold text-green-900">
                  {user?.name || 'Google User'}
                </h5>
                <p className="text-xs text-green-700">{user?.email || 'No email available'}</p>
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-1 hover:bg-green-100 rounded-md transition-colors"
              >
                <Settings className="h-4 w-4 text-green-600" />
              </button>
            </div>

            {showDetails && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Auto-create events</span>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Email reminders</span>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Priority colors</span>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                onClick={() => window.open('https://calendar.google.com', '_blank')}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Open Calendar</span>
              </button>
              <button
                onClick={signOut}
                className="text-red-600 hover:text-red-700 text-xs font-medium transition-colors"
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