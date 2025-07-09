import React, { useState } from 'react';
import { Check, X, Edit2, Plus, AlertCircle, Clock, User, Calendar, CheckCircle, Target, Zap } from 'lucide-react';
import { ActionItem } from '../types';
import { formatTimeForDisplay } from '../utils/timeExtractor';
import { CalendarSyncPrompt } from './CalendarSyncPrompt';

interface ActionItemsListProps {
  actionItems: ActionItem[];
  onUpdateItem: (id: string, updates: Partial<ActionItem>) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: Partial<ActionItem>) => void;
  isCalendarConnected?: boolean;
  calendarAccessToken?: string | null;
}

export const ActionItemsList: React.FC<ActionItemsListProps> = ({
  actionItems,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  isCalendarConnected = false,
  calendarAccessToken = null
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [newItemPriority, setNewItemPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newItemAssignee, setNewItemAssignee] = useState('');
  const [showCalendarPrompt, setShowCalendarPrompt] = useState(false);
  const [pendingTask, setPendingTask] = useState<ActionItem | null>(null);

  const handleEdit = (item: ActionItem) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const handleSaveEdit = () => {
    if (editingId) {
      onUpdateItem(editingId, { text: editText });
      setEditingId(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleAddItem = () => {
    if (newItemText.trim()) {
      const newTask: Partial<ActionItem> = {
        text: newItemText,
        priority: newItemPriority,
        assignee: newItemAssignee || undefined,
        completed: false,
        createdAt: new Date()
      };

      // If calendar is connected, show sync prompt
      if (isCalendarConnected && calendarAccessToken) {
        const fullTask: ActionItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          ...newTask,
          text: newTask.text || '',
          priority: newTask.priority || 'medium',
          completed: false,
          createdAt: new Date()
        };
        setPendingTask(fullTask);
        setShowCalendarPrompt(true);
      } else {
        // Add directly without calendar sync
        onAddItem(newTask);
      }

      setNewItemText('');
      setNewItemAssignee('');
      setNewItemPriority('medium');
      setShowAddForm(false);
    }
  };

  const handleCalendarSync = (eventId: string) => {
    if (pendingTask) {
      const taskWithCalendar = { ...pendingTask, calendarEventId: eventId };
      onAddItem(taskWithCalendar);
      setPendingTask(null);
    }
  };

  const handleCalendarPromptClose = () => {
    if (pendingTask) {
      onAddItem(pendingTask);
      setPendingTask(null);
    }
    setShowCalendarPrompt(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-8 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Target className="h-6 w-6 mr-3 text-purple-600" />
            Action Items ({actionItems.length})
          </h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      <div className="p-8">
        {showAddForm && (
          <div className="mb-8 p-6 border border-gray-200 bg-gray-50 rounded-xl">
            <div className="space-y-4">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Enter action item..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
              <div className="flex space-x-4">
                <select
                  value={newItemPriority}
                  onChange={(e) => setNewItemPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <input
                  type="text"
                  value={newItemAssignee}
                  onChange={(e) => setNewItemAssignee(e.target.value)}
                  placeholder="Assignee (optional)"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddItem}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                >
                  Add Item
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {actionItems.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-xl border-l-4 transition-all duration-200 ${
                item.completed 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 shadow-sm' 
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-4">
                <button
                  onClick={() => onUpdateItem(item.id, { completed: !item.completed })}
                  className={`flex-shrink-0 w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                    item.completed
                      ? 'bg-green-500 border-green-500 text-white shadow-sm'
                      : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                  }`}
                >
                  {item.completed && <CheckCircle className="h-3 w-3" />}
                </button>

                <div className="flex-1">
                  {editingId === item.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSaveEdit}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                      {item.scheduledTime && (
                        <span className="inline-flex items-center text-xs text-blue-500 dark:text-blue-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatTimeForDisplay(item.scheduledTime)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className={`text-gray-900 leading-relaxed ${item.completed ? 'line-through opacity-60' : ''}`}>
                        {item.text}
                      </p>
                      <div className="flex items-center space-x-3 mt-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(item.priority)}`}>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                        </span>
                        {item.assignee && (
                          <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            <User className="h-3 w-3 mr-1" />
                            {item.assignee}
                          </span>
                        )}
                        {item.dueDate && (
                          <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.dueDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {actionItems.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-purple-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No action items yet</h4>
              <p className="text-gray-500 max-w-xs mx-auto">
                Action items will automatically appear here as you speak, or you can add them manually.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Sync Prompt */}
      {pendingTask && (
        <CalendarSyncPrompt
          task={pendingTask}
          isOpen={showCalendarPrompt}
          onClose={handleCalendarPromptClose}
          onSync={handleCalendarSync}
          accessToken={calendarAccessToken}
        />
      )}
    </div>
  );
};