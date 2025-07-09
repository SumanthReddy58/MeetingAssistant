import React from 'react';
import { Sun, Moon, Settings, Zap, User, LogOut, Bell, Search } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  currentSession: any;
  onNewSession: () => void;
  onSettings: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentSession, 
  onNewSession, 
  onSettings,
  onLogout
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white border-b border-gray-50">
      <div className="max-w-7xl mx-auto px-12">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center">
            <div className="flex items-center mr-8">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              Meeting Assistant
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
            </div>
            
            {currentSession && (
              <div className="hidden lg:flex items-center space-x-3 bg-green-50 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 font-medium">
                  Live Session
                </span>
              </div>
            )}
            
            <button
              onClick={onNewSession}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              New Session
            </button>
            
            <div className="flex items-center space-x-2">
              <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </button>
              
              <button
                onClick={toggleTheme}
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 text-gray-600" />
                ) : (
                  <Sun className="h-5 w-5 text-gray-600" />
                )}
              </button>
              
              <button
                onClick={onSettings}
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <button
                onClick={onLogout}
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};