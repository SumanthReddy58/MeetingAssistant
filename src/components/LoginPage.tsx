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
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 flex-col justify-center px-20">
        <div className="max-w-sm">
          <div className="mb-16">
            <div className="w-12 h-12 bg-black flex items-center justify-center mb-12">
              <Mic className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-light text-black mb-8 leading-tight tracking-tight">
              Meeting Assistant
            </h1>
            <p className="text-lg text-gray-600 font-light leading-relaxed">
              Transform your meetings with intelligent voice recognition and automated action item extraction.
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex items-start space-x-6">
              <div className="w-6 h-6 bg-gray-200 flex items-center justify-center flex-shrink-0">
                <FileText className="h-3 w-3 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-black mb-2 text-sm tracking-wide">Live Transcription</h3>
                <p className="text-xs text-gray-500 font-light leading-relaxed">
                  Real-time speech-to-text with intelligent formatting
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-6 h-6 bg-gray-200 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-3 w-3 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-black mb-2 text-sm tracking-wide">Smart Actions</h3>
                <p className="text-xs text-gray-500 font-light leading-relaxed">
                  Automatically extract and organize action items
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-6 h-6 bg-gray-200 flex items-center justify-center flex-shrink-0">
                <Users className="h-3 w-3 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-black mb-2 text-sm tracking-wide">Team Collaboration</h3>
                <p className="text-xs text-gray-500 font-light leading-relaxed">
                  Share transcripts and assign tasks seamlessly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-12 sm:px-20 lg:px-32">
        <div className="w-full max-w-xs mx-auto">
          <div className="mb-16">
            <div className="lg:hidden mb-12">
              <div className="w-10 h-10 bg-black flex items-center justify-center mb-6">
                <Mic className="h-5 w-5 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-light text-black mb-3 tracking-tight">
              Welcome back
            </h2>
            <p className="text-gray-500 font-light text-sm">
              Sign in to continue to your meetings
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-black mb-3 tracking-wide uppercase">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-0 py-4 border-0 border-b border-gray-200 bg-transparent focus:border-black focus:ring-0 text-black placeholder-gray-400 transition-colors text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-black mb-3 tracking-wide uppercase">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-0 py-4 border-0 border-b border-gray-200 bg-transparent focus:border-black focus:ring-0 text-black placeholder-gray-400 transition-colors text-sm"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between pt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-3 h-3 border border-gray-300 bg-white checked:bg-black checked:border-black focus:ring-0 focus:ring-offset-0"
                />
                <span className="ml-3 text-xs text-gray-500">Remember me</span>
              </label>
              <button
                type="button"
                className="text-xs text-black hover:text-gray-700 font-medium transition-colors tracking-wide"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-4 px-6 hover:bg-gray-900 focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group text-sm font-medium tracking-wide"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500">
              Don't have an account?{' '}
              <button className="text-black hover:text-gray-700 font-medium transition-colors tracking-wide">
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};