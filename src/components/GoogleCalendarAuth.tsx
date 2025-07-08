import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { googleCalendarService } from '../utils/googleCalendar';

interface GoogleCalendarAuthProps {
  onAuthSuccess: (accessToken: string) => void;
  onAuthError: (error: string) => void;
}

export const GoogleCalendarAuth: React.FC<GoogleCalendarAuthProps> = ({
  onAuthSuccess,
  onAuthError
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('');

  // Google OAuth configuration
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const REDIRECT_URI = window.location.origin;
  const SCOPE = 'https://www.googleapis.com/auth/calendar';

  useEffect(() => {
    // Check if we have a stored access token
    const storedToken = localStorage.getItem('google_access_token');
    const tokenExpiry = localStorage.getItem('google_token_expiry');
    
    if (storedToken && tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry);
      if (Date.now() < expiryTime) {
        initializeWithToken(storedToken);
      } else {
        // Token expired, remove it
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_token_expiry');
      }
    }

    // Check for OAuth callback with hash fragment (implicit flow)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const expiresIn = hashParams.get('expires_in');
    const error = hashParams.get('error');
    
    if (error) {
      const errorMessage = `OAuth error: ${error}`;
      setError(errorMessage);
      onAuthError(errorMessage);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (accessToken && expiresIn) {
      handleTokenReceived(accessToken, parseInt(expiresIn));
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const initializeWithToken = async (token: string) => {
    setIsLoading(true);
    try {
      const success = await googleCalendarService.initialize(token);
      if (success) {
        setIsAuthenticated(true);
        setError(null);
        onAuthSuccess(token);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_token_expiry');
        setError('Stored token is invalid');
      }
    } catch (error) {
      console.error('Failed to initialize with stored token:', error);
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('google_token_expiry');
      setError('Failed to initialize with stored token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenReceived = async (accessToken: string, expiresIn: number) => {
    setIsLoading(true);
    try {
      const success = await googleCalendarService.initialize(accessToken);
      if (success) {
        const expiryTime = Date.now() + (expiresIn * 1000);
        localStorage.setItem('google_access_token', accessToken);
        localStorage.setItem('google_token_expiry', expiryTime.toString());
        
        setIsAuthenticated(true);
        setError(null);
        onAuthSuccess(accessToken);
      } else {
        throw new Error('Failed to initialize Google Calendar service');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setError(errorMessage);
      onAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    if (!CLIENT_ID) {
      const errorMessage = 'Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.';
      setError(errorMessage);
      onAuthError(errorMessage);
      return;
    }

    setIsLoading(true);
    
    // Use implicit flow with proper scopes
    const authUrl = new URL('https://accounts.google.com/oauth/authorize');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('scope', SCOPE);
    authUrl.searchParams.set('response_type', 'token');
    authUrl.searchParams.set('include_granted_scopes', 'true');
    authUrl.searchParams.set('state', Date.now().toString());

    window.location.href = authUrl.toString();
  };

  const handleSignOut = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    setIsAuthenticated(false);
    setError(null);
    setConnectionStatus('');
  };

  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('Testing connection...');
    
    try {
      const result = await googleCalendarService.testConnection();
      setConnectionStatus(result.message);
      
      if (!result.success) {
        setError(result.message);
        onAuthError(result.message);
      } else {
        setError(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed';
      setError(errorMessage);
      setConnectionStatus(errorMessage);
      onAuthError(errorMessage);
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
            {isAuthenticated ? 'Testing connection...' : 'Connecting to Google Calendar...'}
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
        
        {isAuthenticated ? (
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-600 dark:text-green-400">Connected</span>
            <button
              onClick={handleSignOut}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
          >
            Connect
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              <div className="mt-2 space-y-1">
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 dark:text-red-400 text-xs underline hover:no-underline"
                >
                  Dismiss
                </button>
                {!CLIENT_ID && (
                  <div className="text-xs text-red-600 dark:text-red-400 mt-2">
                    <p className="font-medium">Setup Instructions:</p>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center">Google Cloud Console <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                      <li>Create a new project or select existing one</li>
                      <li>Enable the Google Calendar API</li>
                      <li>Create OAuth 2.0 credentials (Web application)</li>
                      <li>Add <code className="bg-red-100 dark:bg-red-800 px-1 rounded">{window.location.origin}</code> to authorized origins</li>
                      <li>Set VITE_GOOGLE_CLIENT_ID in your .env file</li>
                    </ol>
                  </div>
                )}
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
      
      {isAuthenticated && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Action items with specific times will be automatically added to your calendar.
          </p>
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline disabled:opacity-50"
          >
            Test Connection
          </button>
        </div>
      )}
    </div>
  );
};