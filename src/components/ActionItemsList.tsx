import React, { useState } from 'react';
import { Check, X, Edit2, Plus, AlertCircle, Clock, User, Calendar } from 'lucide-react';
import { ActionItem } from '../types';
import { formatTimeForDisplay } from '../utils/timeExtractor';

interface ActionItemsListProps {
  actionItems: ActionItem[];
  onUpdateItem: (id: string, updates: Partial<ActionItem>) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: Partial<ActionItem>) => void;
}

export const ActionItemsList: React.FC<ActionItemsListProps> = ({
  actionItems,
  onUpdateItem,
  onDeleteItem,
  onAddItem
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [newItemPriority, setNewItemPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newItemAssignee, setNewItemAssignee] = useState('');

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
      onAddItem({
        text: newItemText,
        priority: newItemPriority,
        assignee: newItemAssignee || undefined,
        completed: false,
        createdAt: new Date()
      });
      setNewItemText('');
      setNewItemAssignee('');
      setNewItemPriority('medium');
      setShowAddForm(false);
    }
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Action Items ({actionItems.length})
          </h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        {showAddForm && (
          <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="space-y-3">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Enter action item..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <div className="flex space-x-3">
                <select
                  value={newItemPriority}
                  onChange={(e) => setNewItemPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
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
                  className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddItem}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add Item
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {actionItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border ${
                item.completed 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => onUpdateItem(item.id, { completed: !item.completed })}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    item.completed
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                  }`}
                >
                  {item.completed && <Check className="h-3 w-3" />}
                </button>

                <div className="flex-1">
                  {editingId === item.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
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
                      <p className={`text-gray-900 dark:text-white ${item.completed ? 'line-through opacity-60' : ''}`}>
                        {item.text}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {item.priority}
                        </span>
                        {item.assignee && (
                          <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <User className="h-3 w-3 mr-1" />
                            {item.assignee}
                          </span>
                        )}
                        {item.dueDate && (
                          <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
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
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Edit2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <X className="h-4 w-4 text-red-500 dark:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {actionItems.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No action items yet. They'll appear here as you speak or add them manually.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};