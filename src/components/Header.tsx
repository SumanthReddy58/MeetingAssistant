import React from 'react';
import { Sun, Moon, Settings, Mic, User, LogOut } from 'lucide-react';
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
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-900 rounded-sm flex items-center justify-center mr-4">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-light text-gray-900">
              Meeting Assistant
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            {currentSession && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 font-light">
                  {currentSession.title}
                </span>
              </div>
            )}
            
            <button
              onClick={onNewSession}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 text-sm font-medium transition-colors"
            >
              New Session
            </button>
            
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-50 transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-gray-600" />
              ) : (
                <Sun className="h-5 w-5 text-gray-600" />
              )}
            </button>
            
            <button
              onClick={onSettings}
              className="p-2 hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </button>

            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};