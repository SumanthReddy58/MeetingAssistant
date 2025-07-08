import React from 'react';
import { Sun, Moon, Settings, FileText, LogOut, User } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { User as UserType } from '../types';

interface HeaderProps {
  currentSession: any;
  user: UserType | null;
  onNewSession: () => void;
  onSettings: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentSession, 
  user, 
  onNewSession, 
  onSettings, 
  onSignOut 
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Meeting Assistant
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {currentSession && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {currentSession.title}
                </span>
              </div>
            )}
            
            <button
              onClick={onNewSession}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              New Session
            </button>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            
            <button
              onClick={onSettings}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* User Menu */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={onSignOut}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};