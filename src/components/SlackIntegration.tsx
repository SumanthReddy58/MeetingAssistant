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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-8 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <MessageSquare className="h-6 w-6 mr-3 text-purple-600" />
            Slack Integration
          </h3>
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full">
                <AlertCircle className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Not Connected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
            <div className="mt-2 text-xs text-red-600">
              Make sure to set VITE_SLACK_BOT_TOKEN in your .env file
            </div>
          </div>
        )}

        {!isConnected ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Connect Slack Workspace
            </h4>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
              Get instant notifications when new tasks are created or updated during meetings.
            </p>
            <button
              onClick={initializeSlack}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-3 mx-auto"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <MessageSquare className="h-5 w-5" />
                  <span>Connect Slack</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-purple-900">
                  Slack Notifications Active
                </h4>
                <p className="text-sm text-purple-700">
                  Posting to {selectedChannel}
                </p>
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5 text-purple-600" />
              </button>
            </div>

            {showSettings && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Channel
                  </label>
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-gray-400" />
                    <select
                      value={selectedChannel}
                      onChange={(e) => setSelectedChannel(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
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
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={testSlackConnection}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span>Test Connection</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>New task notifications</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Task update notifications</span>
                </div>
              </div>
              <button
                onClick={disconnect}
                className="text-red-600 hover:text-red-700 font-medium transition-colors"
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