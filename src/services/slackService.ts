import { ActionItem } from '../types';
import toast from 'react-hot-toast';

export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: any[];
}

export class SlackService {
  private botToken: string;
  private defaultChannel: string;
  private baseUrl = 'https://slack.com/api';

  constructor(botToken: string, defaultChannel: string = '#team-updates') {
    this.botToken = botToken;
    this.defaultChannel = defaultChannel;
  }

  async postToSlack(task: ActionItem, channel?: string): Promise<void> {
    try {
      const message = this.createTaskMessage(task);
      const targetChannel = channel || this.defaultChannel;

      const response = await fetch(`${this.baseUrl}/chat.postMessage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: targetChannel,
          text: message.text,
          blocks: message.blocks,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Slack API error');
      }

      toast.success('💬 Task posted to Slack', {
        duration: 3000,
        position: 'top-right',
      });

    } catch (error) {
      console.error('Error posting to Slack:', error);
      toast.error('❌ Slack notification failed', {
        duration: 4000,
        position: 'top-right',
      });
    }
  }

  async postTaskUpdate(task: ActionItem, updateType: 'completed' | 'updated' | 'deleted', channel?: string): Promise<void> {
    try {
      const message = this.createTaskUpdateMessage(task, updateType);
      const targetChannel = channel || this.defaultChannel;

      const response = await fetch(`${this.baseUrl}/chat.postMessage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: targetChannel,
          text: message.text,
          blocks: message.blocks,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Slack API error');
      }

      const emoji = updateType === 'completed' ? '✅' : updateType === 'updated' ? '📝' : '🗑️';
      toast.success(`${emoji} Task ${updateType} - Slack notified`, {
        duration: 2000,
        position: 'top-right',
      });

    } catch (error) {
      console.error('Error posting task update to Slack:', error);
      toast.error('❌ Slack update failed', {
        duration: 3000,
        position: 'top-right',
      });
    }
  }

  async getChannels(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations.list`, {
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
        },
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Failed to get channels');
      }

      return data.channels || [];
    } catch (error) {
      console.error('Error getting Slack channels:', error);
      return [];
    }
  }

  private createTaskMessage(task: ActionItem): SlackMessage {
    const priorityEmoji = this.getPriorityEmoji(task.priority);
    const dueDateText = task.dueDate ? task.dueDate.toLocaleDateString() : 'Not set';
    const assigneeText = task.assignee || 'Unassigned';

    return {
      channel: this.defaultChannel,
      text: `📌 New Task Created: "${task.text}"`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📌 New Task Created',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*"${task.text}"*`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Priority:*\n${priorityEmoji} ${task.priority.toUpperCase()}`,
            },
            {
              type: 'mrkdwn',
              text: `*Assigned to:*\n👤 ${assigneeText}`,
            },
            {
              type: 'mrkdwn',
              text: `*Due Date:*\n📅 ${dueDateText}`,
            },
            {
              type: 'mrkdwn',
              text: `*Created:*\n🕐 ${task.createdAt.toLocaleString()}`,
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '🎤 _Created via Meeting Assistant_',
            },
          ],
        },
      ],
    };
  }

  private createTaskUpdateMessage(task: ActionItem, updateType: 'completed' | 'updated' | 'deleted'): SlackMessage {
    const emoji = updateType === 'completed' ? '✅' : updateType === 'updated' ? '📝' : '🗑️';
    const action = updateType === 'completed' ? 'Completed' : updateType === 'updated' ? 'Updated' : 'Deleted';
    
    return {
      channel: this.defaultChannel,
      text: `${emoji} Task ${action}: "${task.text}"`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${emoji} *Task ${action}:* "${task.text}"`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `🎤 _Updated via Meeting Assistant at ${new Date().toLocaleString()}_`,
            },
          ],
        },
      ],
    };
  }

  private getPriorityEmoji(priority: string): string {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }
}