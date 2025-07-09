import React, { useState } from 'react';
import { ArrowRight, Zap, FileText, Calendar, Users, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn: googleSignIn, isLoading: googleLoading, error: googleError } = useGoogleAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    onLogin();
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      // If successful, the useGoogleAuth hook will update the auth state
      // and we can proceed to login
      onLogin();
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 flex-col justify-center px-8 xl:px-16">
        <div className="max-w-md mx-auto">
          <div className="mb-10">
            <div className="relative mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-3 border-white flex items-center justify-center">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              AI Meeting Assistant
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Revolutionize your meetings with real-time AI transcription, smart action item detection, and seamless calendar integration for maximum productivity.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Real-Time Voice Recognition</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Advanced AI converts speech to text instantly with speaker identification and smart formatting
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Intelligent Task Extraction</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Machine learning automatically identifies, prioritizes, and organizes actionable tasks from conversations
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Smart Calendar Sync</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Automatically creates calendar events with reminders, priority colors, and intelligent scheduling
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-6">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <div className="lg:hidden mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-5 w-5 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600 text-sm">
              Sign in to continue to your meetings
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Google Sign-in Button */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group font-medium shadow-sm hover:shadow-md text-sm"
              >
                {googleLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span>
                  {googleLoading ? 'Signing in...' : 'Continue with Google'}
                </span>
              </button>
              
              {googleError && (
                <div className={`text-xs text-center p-3 rounded-lg ${
                  googleError.includes('Redirecting') 
                    ? 'text-blue-600 bg-blue-50 border border-blue-200' 
                    : 'text-red-600 bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center justify-center">
                    {googleError.includes('Redirecting') && (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    )}
                    {googleError}
                  </div>
                  {googleError.includes('Popup blocked') && (
                    <div className="mt-2 text-xs text-gray-600">
                      <p>To use popup sign-in, please:</p>
                      <p>1. Allow popups for this site in your browser</p>
                      <p>2. Or wait for automatic redirect to Google</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-500 font-medium">Or continue with email</span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg bg-white focus:border-blue-500 focus:ring-0 text-gray-900 placeholder-gray-500 transition-colors text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg bg-white focus:border-blue-500 focus:ring-0 text-gray-900 placeholder-gray-500 transition-colors text-sm"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-2 border-gray-300 rounded bg-white checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span className="ml-2 text-xs text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group font-medium shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-center text-xs text-gray-600">
              Don't have an account?{' '}
              <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};