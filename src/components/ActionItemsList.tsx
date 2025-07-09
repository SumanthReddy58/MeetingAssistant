import React, { useState } from 'react';
import { Check, X, Edit2, Plus, AlertCircle, Clock, User, Calendar, CheckCircle } from 'lucide-react';
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
    <div className="bg-white border border-gray-50">
      <div className="p-12 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-light text-black tracking-tight">
            Action Items ({actionItems.length})
          </h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-3 bg-black hover:bg-gray-900 text-white px-6 py-2.5 text-xs font-medium tracking-wide uppercase transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      <div className="p-12">
        {showAddForm && (
          <div className="mb-12 p-8 border border-gray-100 bg-gray-50">
            <div className="space-y-6">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Enter action item..."
                className="w-full px-0 py-4 border-0 border-b border-gray-200 bg-transparent focus:border-black focus:ring-0 text-black placeholder-gray-400 text-sm"
              />
              <div className="flex space-x-6">
                <select
                  value={newItemPriority}
                  onChange={(e) => setNewItemPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="px-0 py-3 border-0 border-b border-gray-200 bg-transparent focus:border-black focus:ring-0 text-black text-sm"
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
                  className="flex-1 px-0 py-3 border-0 border-b border-gray-200 bg-transparent focus:border-black focus:ring-0 text-black placeholder-gray-400 text-sm"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddItem}
                  className="bg-black hover:bg-gray-900 text-white px-8 py-3 text-sm font-medium tracking-wide transition-colors"
                >
                  Add Item
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="border border-gray-200 hover:border-gray-300 text-gray-600 px-8 py-3 text-sm font-medium tracking-wide transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {actionItems.map((item) => (
            <div
              key={item.id}
              className={`p-8 border-l-2 ${
                item.completed 
                  ? 'bg-green-50 border-green-500' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-4">
                <button
                  onClick={() => onUpdateItem(item.id, { completed: !item.completed })}
                  className={`flex-shrink-0 w-4 h-4 border-2 flex items-center justify-center transition-colors ${
                    item.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {item.completed && <CheckCircle className="h-3 w-3" />}
                </button>

                <div className="flex-1">
                  {editingId === item.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-0 py-3 border-0 border-b border-gray-200 bg-transparent focus:border-black focus:ring-0 text-black text-sm"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 text-xs font-medium tracking-wide uppercase transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="border border-gray-200 hover:border-gray-300 text-gray-600 px-6 py-2 text-xs font-medium tracking-wide uppercase transition-colors"
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
                      <p className={`text-black leading-relaxed text-sm ${item.completed ? 'line-through opacity-60' : ''}`}>
                        {item.text}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium tracking-wide uppercase ${getPriorityColor(item.priority)}`}>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {item.priority}
                        </span>
                        {item.assignee && (
                          <span className="inline-flex items-center text-xs text-gray-400">
                            <User className="h-3 w-3 mr-1" />
                            {item.assignee}
                          </span>
                        )}
                        {item.dueDate && (
                          <span className="inline-flex items-center text-xs text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.dueDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-3 hover:bg-red-50 transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {actionItems.length === 0 && (
            <div className="text-center py-16">
              <div className="w-12 h-12 bg-gray-50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-6 w-6 text-gray-300" />
              </div>
              <p className="text-gray-400 font-light text-sm tracking-wide max-w-xs mx-auto">No action items yet. They'll appear here as you speak or add them manually.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};