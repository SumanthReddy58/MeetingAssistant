import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { googleCalendarService } from '../utils/googleCalendar';

interface GoogleCalendarAuthProps {
  accessToken: string | null;
  onConnectionChange: (isConnected: boolean) => void;
}

export const GoogleCalendarAuth: React.FC<GoogleCalendarAuthProps> = ({
  accessToken,
  onConnectionChange
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('');

  useEffect(() => {
    if (accessToken) {
      initializeCalendar();
    } else {
      setIsConnected(false);
      onConnectionChange(false);
    }
  }, [accessToken]);

  const initializeCalendar = async () => {
    if (!accessToken) return;
    
    setIsLoading(true);
    try {
      const success = await googleCalendarService.initialize(accessToken);
      setIsConnected(success);
      onConnectionChange(success);
      if (success) {
        setError(null);
        setConnectionStatus('Successfully connected to Google Calendar');
      } else {
        setError('Failed to connect to Google Calendar');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize calendar';
      setError(errorMessage);
      setIsConnected(false);
      onConnectionChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('Testing connection...');
    
    try {
      const result = await googleCalendarService.testConnection();
      setConnectionStatus(result.message);
      
      if (!result.success) {
        setError(result.message);
      } else {
        setError(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed';
      setError(errorMessage);
      setConnectionStatus(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-blue-700 dark:text-blue-300">
            {isConnected ? 'Testing connection...' : 'Connecting to Google Calendar...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Google Calendar
          </span>
        </div>
        
        {isConnected ? (
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-600 dark:text-green-400">Connected</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-xs text-red-600 dark:text-red-400">Not Connected</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              <div className="mt-2">
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 dark:text-red-400 text-xs underline hover:no-underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {connectionStatus && !error && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
          <span className="text-blue-700 dark:text-blue-300 text-sm">{connectionStatus}</span>
        </div>
      )}
      
      {accessToken ? (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isConnected 
              ? 'Calendar integration is active. You can now view and create events.'
              : 'Calendar access is available but connection failed. Try testing the connection.'
            }
          </p>
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline disabled:opacity-50"
          >
            Test Connection
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Sign in with Google to enable calendar integration.
        </p>
      )}
    </div>
  );
};