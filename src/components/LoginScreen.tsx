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
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Check if running in Electron
  const isElectron = typeof window !== 'undefined' && window.process && window.process.type === 'renderer';
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Add debug logging
  const addDebugInfo = (message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Add environment debug info on mount
  useEffect(() => {
    addDebugInfo(`Environment check - Client ID: ${CLIENT_ID ? 'Configured' : 'Missing'}`);
    addDebugInfo(`Current origin: ${window.location.origin}`);
    addDebugInfo(`Is Electron: ${isElectron}`);
  }, []);

  // Check for OAuth callback on component mount
  useEffect(() => {
    const handleCallback = async () => {
      if (window.location.hash.includes('access_token')) {
        addDebugInfo('OAuth callback detected');
        setIsLoading(true);
        try {
          const result = await googleAuthService.handleOAuthCallback();
          if (result) {
            addDebugInfo(`Authentication successful for ${result.user.email}`);
            const user: User = {
              id: result.user.id,
              email: result.user.email,
              name: result.user.name,
              picture: result.user.picture,
              accessToken: result.accessToken
            };
            onLogin(user);
          } else {
            addDebugInfo('OAuth callback processed but no result returned');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
          addDebugInfo(`Authentication error: ${errorMessage}`);
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      } else if (window.location.hash.includes('error')) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        const errorMessage = `OAuth error: ${error}${errorDescription ? ` - ${errorDescription}` : ''}`;
        addDebugInfo(errorMessage);
        setError(errorMessage);
      }
    };

    handleCallback();
  }, [onLogin]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    addDebugInfo(`Starting authentication (${isElectron ? 'Electron' : 'Web'} mode)`);
    addDebugInfo(`Client ID configured: ${!!CLIENT_ID}`);

    try {
      await googleAuthService.signIn();
      // The page will redirect for web auth, so we don't need to handle the result here
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google';
      addDebugInfo(`Sign-in error: ${errorMessage}`);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const testStoredToken = async () => {
    addDebugInfo('Testing stored token...');
    const isValid = await googleAuthService.validateStoredToken();
    addDebugInfo(`Stored token valid: ${isValid}`);
    
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

          {/* Debug Info */}
          {(debugInfo.length > 0 || !CLIENT_ID) && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {!CLIENT_ID ? 'Setup Required' : 'Debug Info'}
                </span>
              </div>
              {!CLIENT_ID && (
                <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                    Google Client ID not configured
                  </p>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                    <p><strong>Step 1:</strong> Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer\" className="underline text-blue-600 dark:text-blue-400">Google Cloud Console</a></p>

                    <p><strong>Step 2:</strong> Create a new project or select existing</p>
                    <p><strong>Step 3:</strong> Enable "Google Calendar API"</p>
                    <p><strong>Step 4:</strong> Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"</p>
                    <p><strong>Step 5:</strong> Choose "Web application"</p>
                    <p><strong>Step 6:</strong> Add <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">{window.location.origin}</code> to "Authorized JavaScript origins"</p>
                    <p><strong>Step 7:</strong> Copy Client ID to your <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">.env</code> file</p>
                    <p><strong>Step 8:</strong> Restart the dev server</p>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                {debugInfo.map((info, index) => (
                  <p key={index} className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                    {info}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start">
                <div className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              </div>
              {!CLIENT_ID && (
                <div className="mt-3 text-xs text-red-600 dark:text-red-400">
                  <p className="font-medium">Setup Required:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center">Google Cloud Console <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                    <li>Create OAuth 2.0 credentials (Web application)</li>
                    <li>Add <code className="bg-red-100 dark:bg-red-800 px-1 rounded">{window.location.origin}</code> to authorized origins</li>
                    <li>Set VITE_GOOGLE_CLIENT_ID in your .env file</li>
                  </ol>
                </div>
              )}
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
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
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
                Test Stored Token
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