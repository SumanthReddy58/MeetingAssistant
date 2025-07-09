import React, { useState } from 'react';
import { ArrowRight, Mic, FileText, Calendar, Users } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    onLogin();
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 flex-col justify-center px-16">
        <div className="max-w-md">
          <div className="mb-12">
            <div className="w-16 h-16 bg-black rounded-sm flex items-center justify-center mb-8">
              <Mic className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-light text-gray-900 mb-6 leading-tight">
              Meeting Assistant
            </h1>
            <p className="text-lg text-gray-600 font-light leading-relaxed">
              Transform your meetings with intelligent voice recognition, 
              real-time transcription, and automated action item extraction.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-sm flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 text-gray-700" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Live Transcription</h3>
                <p className="text-sm text-gray-600 font-light">
                  Real-time speech-to-text with intelligent formatting
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-sm flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-gray-700" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Smart Actions</h3>
                <p className="text-sm text-gray-600 font-light">
                  Automatically extract and organize action items
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-sm flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 text-gray-700" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Team Collaboration</h3>
                <p className="text-sm text-gray-600 font-light">
                  Share transcripts and assign tasks seamlessly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-12">
            <div className="lg:hidden mb-8">
              <div className="w-12 h-12 bg-black rounded-sm flex items-center justify-center mb-4">
                <Mic className="h-6 w-6 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-light text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600 font-light">
              Sign in to continue to your meetings
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-0 py-3 border-0 border-b border-gray-200 bg-transparent focus:border-gray-900 focus:ring-0 text-gray-900 placeholder-gray-400 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-0 py-3 border-0 border-b border-gray-200 bg-transparent focus:border-gray-900 focus:ring-0 text-gray-900 placeholder-gray-400 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 border border-gray-300 rounded-sm bg-white checked:bg-gray-900 checked:border-gray-900 focus:ring-0 focus:ring-offset-0"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-gray-900 hover:text-gray-700 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white py-3 px-4 hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
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

          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <button className="text-gray-900 hover:text-gray-700 font-medium transition-colors">
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};