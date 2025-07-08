import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, AlertCircle } from 'lucide-react';

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

    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      handleOAuthCallback(code);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
    setIsLoading(true);
    try {
      // Exchange code for access token
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI,
        }),
      });

      const data = await response.json();
      
      if (data.access_token) {
        const expiryTime = Date.now() + (data.expires_in * 1000);
        localStorage.setItem('google_access_token', data.access_token);
        localStorage.setItem('google_token_expiry', expiryTime.toString());
        
        setIsAuthenticated(true);
        onAuthSuccess(data.access_token);
      } else {
        throw new Error('Failed to get access token');
      }
    } catch (error) {
      const errorMessage = 'Failed to authenticate with Google Calendar';
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

    const authUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(SCOPE)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`;

    window.location.href = authUrl;
  };

  const handleSignOut = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    setIsAuthenticated(false);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-blue-700 dark:text-blue-300">Connecting to Google Calendar...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
          <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
        </div>
        <button
          onClick={() => setError(null)}
          className="mt-2 text-red-600 dark:text-red-400 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between">
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
      
      {isAuthenticated && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Action items with specific times will be automatically added to your calendar.
        </p>
      )}
    </div>
  );
};