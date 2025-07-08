import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Mic, CheckCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import { googleAuthService } from '../utils/googleAuth';
import { User } from '../types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if running in Electron
  const isElectron = typeof window !== 'undefined' && window.process && window.process.type === 'renderer';
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Check for OAuth callback on component mount
  useEffect(() => {
    const handleCallback = async () => {
      if (window.location.hash.includes('access_token')) {
        setIsLoading(true);
        try {
          const result = await googleAuthService.handleOAuthCallback();
          if (result) {
            const user: User = {
              id: result.user.id,
              email: result.user.email,
              name: result.user.name,
              picture: result.user.picture,
              accessToken: result.accessToken
            };
            onLogin(user);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      } else if (window.location.hash.includes('error')) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        const errorMessage = `OAuth error: ${error}${errorDescription ? ` - ${errorDescription}` : ''}`;
        setError(errorMessage);
      }
    };

    handleCallback();
  }, [onLogin]);

  const handleGoogleSignIn = async () => {
    if (!CLIENT_ID) {
      setError('Google Client ID not configured. Please check your environment setup.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await googleAuthService.signIn();
      // The page will redirect for web auth, so we don't need to handle the result here
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const testStoredToken = async () => {
    const isValid = await googleAuthService.validateStoredToken();
    
    if (isValid) {
      const currentUser = await googleAuthService.getCurrentUser();
      if (currentUser) {
        const user: User = {
          id: currentUser.user.id,
          email: currentUser.user.email,
          name: currentUser.user.name,
          picture: currentUser.user.picture,
          accessToken: currentUser.accessToken
        };
        onLogin(user);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Meeting Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Voice recognition, transcription, and intelligent action item extraction
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
                <Mic className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Voice Recognition</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Real-time speech-to-text transcription</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Action Items</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Automatically extract and manage tasks</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Calendar Integration</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sync action items with Google Calendar</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                    {error}
                  </p>
                  {!CLIENT_ID && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      <p className="font-medium mb-2">Setup Instructions:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center">Google Cloud Console <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                        <li>Create a new project or select existing one</li>
                        <li>Enable the Google Calendar API</li>
                        <li>Create OAuth 2.0 credentials (Web application)</li>
                        <li>Add <code className="bg-red-100 dark:bg-red-800 px-1 rounded">{window.location.origin}</code> to authorized origins</li>
                        <li>Create a <code className="bg-red-100 dark:bg-red-800 px-1 rounded">.env</code> file with <code className="bg-red-100 dark:bg-red-800 px-1 rounded">VITE_GOOGLE_CLIENT_ID=your_client_id</code></li>
                        <li>Restart the development server</li>
                      </ol>
                    </div>
                  )}
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 text-red-600 dark:text-red-400 text-xs underline hover:no-underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sign In Button */}
          <div className="space-y-4">
            {/* Environment Info */}
            {isElectron && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                    Electron OAuth2 Available
                  </span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Secure authentication without popup blockers
                </p>
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading || !CLIENT_ID}
              className={`w-full flex items-center justify-center space-x-3 rounded-lg px-6 py-3 font-medium transition-colors ${
                !CLIENT_ID 
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                  <span>
                    {isElectron ? 'Opening secure auth window...' : 'Signing in...'}
                  </span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A4DA" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>{!CLIENT_ID ? 'Setup Required' : 'Continue with Google'}</span>
                </>
              )}
            </button>

            {/* Test stored token button for debugging */}
            {localStorage.getItem('google_access_token') && (
              <button
                onClick={testStoredToken}
                className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
              >
                Use Stored Authentication
              </button>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 space-y-2">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              By signing in, you agree to allow this app to access your Google profile and Calendar for meeting management features.
            </p>
            {isElectron && (
              <p className="text-xs text-center text-blue-600 dark:text-blue-400">
                Running in Electron - Enhanced security with native OAuth2 flow
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};