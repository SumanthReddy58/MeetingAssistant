import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, AlertCircle, Settings, Hash, Send, RefreshCw } from 'lucide-react';
import { SlackService } from '../services/slackService';
import toast from 'react-hot-toast';

interface SlackIntegrationProps {
  onSlackServiceChange: (slackService: SlackService | null) => void;
}

export const SlackIntegration: React.FC<SlackIntegrationProps> = ({
  onSlackServiceChange
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [slackService, setSlackService] = useState<SlackService | null>(null);

  useEffect(() => {
    initializeSlack();
  }, []);

  const initializeSlack = async () => {
    const botToken = import.meta.env.VITE_SLACK_BOT_TOKEN;
    const defaultChannel = import.meta.env.VITE_SLACK_CHANNEL || '#team-updates';

    if (botToken && botToken !== 'xoxb-your-slack-bot-token-here') {
      setIsLoading(true);
      try {
        const service = new SlackService(botToken, defaultChannel);
        const channelList = await service.getChannels();
        
        setSlackService(service);
        setChannels(channelList);
        setSelectedChannel(defaultChannel);
        setIsConnected(true);
        setError(null);
        
        onSlackServiceChange(service);
        
        toast.success('💬 Slack connected successfully', {
          duration: 3000,
          position: 'top-right',
        });
      } catch (err) {
        setError('Failed to connect to Slack. Please check your bot token.');
        setIsConnected(false);
        onSlackServiceChange(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Slack bot token not configured');
      setIsConnected(false);
      onSlackServiceChange(null);
    }
  };

  const testSlackConnection = async () => {
    if (!slackService) return;
    
    setIsLoading(true);
    try {
      const testTask = {
        id: 'test-' + Date.now(),
        text: 'Test message from Meeting Assistant',
        priority: 'medium' as const,
        completed: false,
        createdAt: new Date(),
        assignee: 'Test User'
      };

      await slackService.postToSlack(testTask, selectedChannel);
    } catch (err) {
      toast.error('❌ Slack test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setSlackService(null);
    setIsConnected(false);
    setChannels([]);
    setSelectedChannel('');
    setError(null);
    onSlackServiceChange(null);
    
    toast.success('Slack disconnected', {
      duration: 2000,
      position: 'top-right',
    });
  };

  return (
    <div className="border border-gray-100 rounded-xl">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center">
            <MessageSquare className="h-4 w-4 mr-2 text-purple-600" />
            Slack Integration
          </h4>
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-700">Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-full">
                <AlertCircle className="h-3 w-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">Disconnected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs text-red-700">{error}</span>
            </div>
            <div className="mt-1 text-xs text-red-600">
              Make sure to set VITE_SLACK_BOT_TOKEN in your .env file
            </div>
          </div>
        )}

        {!isConnected ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <h5 className="text-sm font-semibold text-gray-900 mb-2">
              Connect Slack Workspace
            </h5>
            <p className="text-xs text-gray-600 mb-4 max-w-xs mx-auto">
              Get instant notifications for task updates.
            </p>
            <button
              onClick={initializeSlack}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4" />
                  <span>Connect Slack</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <h5 className="text-xs font-semibold text-purple-900">
                  Slack Notifications Active
                </h5>
                <p className="text-xs text-purple-700">
                  Posting to {selectedChannel}
                </p>
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 hover:bg-purple-100 rounded-md transition-colors"
              >
                <Settings className="h-4 w-4 text-purple-600" />
              </button>
            </div>

            {showSettings && (
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Default Channel
                  </label>
                  <div className="flex items-center space-x-2">
                    <Hash className="h-3 w-3 text-gray-400" />
                    <select
                      value={selectedChannel}
                      onChange={(e) => setSelectedChannel(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="#team-updates">#team-updates</option>
                      {channels.map((channel) => (
                        <option key={channel.id} value={`#${channel.name}`}>
                          #{channel.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <button
                    onClick={testSlackConnection}
                    disabled={isLoading}
                    className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                    <span>Test Connection</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-600">
                <div className="flex items-center space-x-1 mb-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>New task notifications</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Task update notifications</span>
                </div>
              </div>
              <button
                onClick={disconnect}
                className="text-red-600 hover:text-red-700 text-xs font-medium transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};