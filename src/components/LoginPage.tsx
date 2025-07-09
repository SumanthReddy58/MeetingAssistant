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
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 flex-col justify-center px-12 xl:px-20">
        <div className="max-w-sm">
          <div className="mb-8">
            <div className="relative mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-white flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
            <h1 className="text-3xl xl:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Meeting Assistant
            </h1>
            <p className="text-lg xl:text-xl text-gray-600 leading-relaxed">
              Transform your meetings with AI-powered voice recognition and intelligent action item extraction.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Live Transcription</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Real-time speech-to-text with intelligent formatting and speaker identification
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Smart Action Items</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  AI automatically extracts and organizes action items with priority levels
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Calendar Integration</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Seamlessly sync with your calendar and automatically schedule follow-ups
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 py-8">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <div className="lg:hidden mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
            <h2 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-3">
              Welcome back
            </h2>
            <p className="text-gray-600">
              Sign in to continue to your meetings
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Google Sign-in Button */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-700 py-3 px-6 rounded-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group font-semibold shadow-sm hover:shadow-md"
              >
                {googleLoading ? (
                  <RefreshCw className="w-6 h-6 animate-spin mr-3" />
                ) : (
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span>
                  {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
                </span>
              </button>
              
              {googleError && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                  {googleError}
                </div>
              )}
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Or continue with email</span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-blue-500 focus:ring-0 text-gray-900 placeholder-gray-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-blue-500 focus:ring-0 text-gray-900 placeholder-gray-500 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-2 border-gray-300 rounded bg-white checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span className="ml-3 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <button className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};