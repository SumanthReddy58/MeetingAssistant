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
    <header className="bg-white border-b border-gray-50">
      <div className="max-w-7xl mx-auto px-12">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-black flex items-center justify-center mr-6">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-light text-black tracking-wide">
              Meeting Assistant
            </h1>
          </div>
          
          <div className="flex items-center space-x-8">
            {currentSession && (
              <div className="flex items-center space-x-4">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500 font-light tracking-wide uppercase">
                  {currentSession.title}
                </span>
              </div>
            )}
            
            <button
              onClick={onNewSession}
              className="bg-black hover:bg-gray-900 text-white px-8 py-2.5 text-xs font-medium tracking-wide uppercase transition-colors"
            >
              New Session
            </button>
            
            <button
              onClick={toggleTheme}
              className="p-3 hover:bg-gray-50 transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 text-gray-400" />
              ) : (
                <Sun className="h-4 w-4 text-gray-400" />
              )}
            </button>
            
            <button
              onClick={onSettings}
              className="p-3 hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4 text-gray-400" />
            </button>

            <div className="flex items-center space-x-4 pl-8 border-l border-gray-100">
              <div className="w-7 h-7 bg-gray-50 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <button
                onClick={onLogout}
                className="p-3 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};