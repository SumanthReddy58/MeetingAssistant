import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

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
        setIsAuthenticated(true);
        onAuthSuccess(storedToken);
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
    
    if (accessToken && expiresIn) {
      handleTokenReceived(accessToken, parseInt(expiresIn));
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check for OAuth callback with query parameters (authorization code flow)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      const errorMessage = `OAuth error: ${errorParam}`;
      setError(errorMessage);
      onAuthError(errorMessage);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (code) {
      handleOAuthCallback(code);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleTokenReceived = (accessToken: string, expiresIn: number) => {
    const expiryTime = Date.now() + (expiresIn * 1000);
    localStorage.setItem('google_access_token', accessToken);
    localStorage.setItem('google_token_expiry', expiryTime.toString());
    
    setIsAuthenticated(true);
    setError(null);
    onAuthSuccess(accessToken);
  };

  const handleOAuthCallback = async (code: string) => {
    setIsLoading(true);
    try {
      // For security reasons, the client secret should not be exposed in frontend code
      // This is a simplified approach - in production, you'd want to handle this server-side
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
          code,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI,
        }),
      });

      const data = await response.json();
      
      if (data.access_token) {
        handleTokenReceived(data.access_token, data.expires_in);
      } else {
        throw new Error(data.error_description || 'Failed to get access token');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to authenticate with Google Calendar';
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

    // Use implicit flow for better browser compatibility
    const authUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(SCOPE)}&` +
      `response_type=token&` +
      `include_granted_scopes=true&` +
      `state=${Date.now()}`;

    window.location.href = authUrl;
  };

  const handleSignOut = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    setIsAuthenticated(false);
    setError(null);
  };

  const testConnection = async () => {
    const token = localStorage.getItem('google_access_token');
    if (!token) {
      setError('No access token available');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setError(null);
        alert('Connection successful! You can now create calendar events.');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed';
      setError(errorMessage);
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
          <span className="text-blue-700 dark:text-blue-300">Connecting to Google Calendar...</span>
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
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
                  <div className="text-xs text-red-600 dark:text-red-400">
                    <p className="font-medium">Setup Instructions:</p>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center">Google Cloud Console <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                      <li>Create a new project or select existing one</li>
                      <li>Enable the Google Calendar API</li>
                      <li>Create OAuth 2.0 credentials</li>
                      <li>Add your domain to authorized origins</li>
                      <li>Set VITE_GOOGLE_CLIENT_ID in your environment</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isAuthenticated && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Action items with specific times will be automatically added to your calendar.
          </p>
          <button
            onClick={testConnection}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
          >
            Test Connection
          </button>
        </div>
      )}
    </div>
  );
};