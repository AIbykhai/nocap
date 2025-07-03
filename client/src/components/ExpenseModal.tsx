import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface Category {
  id: number;
  name: string;
  emoji: string;
}

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded: () => void;
  editingExpense?: {
    id: number;
    item_name: string;
    amount: number;
    expense_date: string;
    category_id: number;
    recurrence: string | null;
  } | null;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ 
  isOpen, 
  onClose, 
  onExpenseAdded, 
  editingExpense 
}) => {
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [recurrence, setRecurrence] = useState<'None' | 'Weekly' | 'Monthly'>('None');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isEditing = !!editingExpense;

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Pre-fill form when editing
  useEffect(() => {
    if (isOpen && editingExpense) {
      setItemName(editingExpense.item_name);
      setAmount(editingExpense.amount.toString());
      setDate(editingExpense.expense_date);
      setSelectedCategoryId(editingExpense.category_id);
      setRecurrence(editingExpense.recurrence ? 
        (editingExpense.recurrence.charAt(0).toUpperCase() + editingExpense.recurrence.slice(1)) as 'Weekly' | 'Monthly' : 
        'None'
      );
    } else if (isOpen && !editingExpense) {
      // Reset form for new expense
      setItemName('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setRecurrence('None');
    }
  }, [isOpen, editingExpense]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, emoji')
        .order('name');

      if (error) throw error;

      setCategories(data || []);
      
      // Set first category as default if available and not editing
      if (data && data.length > 0 && !editingExpense) {
        setSelectedCategoryId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    }
  };

  const handleSave = async () => {
    if (!itemName.trim() || !amount || !selectedCategoryId) {
      setError('Please fill in all fields');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const expenseData = {
        user_id: user.id,
        item_name: itemName.trim(),
        amount: numAmount,
        category_id: selectedCategoryId,
        expense_date: date,
        recurrence: recurrence === 'None' ? null : recurrence.toLowerCase()
      };

      if (isEditing && editingExpense) {
        // Update existing expense
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', editingExpense.id)
          .eq('user_id', user.id); // Additional security check

        if (error) throw error;
      } else {
        // Create new expense
        const { error } = await supabase
          .from('expenses')
          .insert(expenseData);

        if (error) throw error;
      }

      // Reset form
      setItemName('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedCategoryId(categories.length > 0 ? categories[0].id : null);
      setRecurrence('None');
      
      // Notify parent component
      onExpenseAdded();
      onClose();
    } catch (error) {
      console.error('Error saving expense:', error);
      setError('Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingExpense) return;

    try {
      setDeleting(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('User not authenticated');
        return;
      }

      console.log('Attempting to delete expense with ID:', editingExpense.id);

      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', editingExpense.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      console.log('Delete successful');

      // Notify parent component and close modal
      onExpenseAdded();
      onClose();
    } catch (error) {
      console.error('Error deleting expense:', error);
      setError('Failed to delete expense');
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal Card - 70% of screen dimensions for mobile */}
      <div 
        className="relative bg-white rounded-3xl mx-auto overflow-hidden"
        style={{ 
          width: '70vw',
          height: '70vh',
          maxWidth: '450px',
          maxHeight: '600px',
          minWidth: '320px',
          minHeight: '500px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)' 
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 
            className="text-xl font-semibold"
            style={{ color: '#1C1C1E' }}
          >
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={20} style={{ color: '#6B7280' }} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 pb-6 overflow-y-auto" style={{ height: 'calc(100% - 80px)' }}>
          {/* Error message */}
          {error && (
            <div 
              className="mb-4 p-3 rounded-xl border"
              style={{ 
                backgroundColor: '#FEF2F2', 
                borderColor: '#FECACA',
                color: '#DC2626'
              }}
            >
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-5">
            {/* Item Name */}
            <div>
              <label 
                htmlFor="itemName" 
                className="block text-sm font-medium mb-2"
                style={{ color: '#374151' }}
              >
                Item Name
              </label>
              <div className="relative">
                <Tag 
                  size={18} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: '#9CA3AF' }}
                />
                <input
                  id="itemName"
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ 
                    backgroundColor: '#F9FAFB',
                    color: '#1C1C1E'
                  }}
                  placeholder="What did you buy?"
                  disabled={loading || deleting}
                />
              </div>
            </div>

            {/* Amount */}
            <div>
              <label 
                htmlFor="amount" 
                className="block text-sm font-medium mb-2"
                style={{ color: '#374151' }}
              >
                Amount
              </label>
              <div className="relative">
                <DollarSign 
                  size={18} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: '#9CA3AF' }}
                />
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ 
                    backgroundColor: '#F9FAFB',
                    color: '#1C1C1E'
                  }}
                  placeholder="0.00"
                  disabled={loading || deleting}
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label 
                htmlFor="date" 
                className="block text-sm font-medium mb-2"
                style={{ color: '#374151' }}
              >
                Date
              </label>
              <div className="relative">
                <Calendar 
                  size={18} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: '#9CA3AF' }}
                />
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ 
                    backgroundColor: '#F9FAFB',
                    color: '#1C1C1E'
                  }}
                  disabled={loading || deleting}
                />
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label 
                htmlFor="category" 
                className="block text-sm font-medium mb-2"
                style={{ color: '#374151' }}
              >
                Category
              </label>
              <select
                id="category"
                value={selectedCategoryId || ''}
                onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                style={{ 
                  backgroundColor: '#F9FAFB',
                  color: '#1C1C1E'
                }}
                disabled={loading || deleting}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.emoji} {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Recurrence Segmented Control */}
            <div>
              <label 
                className="block text-sm font-medium mb-3"
                style={{ color: '#374151' }}
              >
                Recurrence
              </label>
              <div 
                className="flex rounded-xl p-1"
                style={{ backgroundColor: '#F3F4F6' }}
              >
                {(['None', 'Weekly', 'Monthly'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRecurrence(option)}
                    disabled={loading || deleting}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${
                      recurrence === option
                        ? 'bg-white shadow-sm'
                        : 'hover:bg-gray-100'
                    }`}
                    style={{
                      color: recurrence === option ? '#1C1C1E' : '#6B7280'
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mt-6">
              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={loading || deleting || !itemName.trim() || !amount || !selectedCategoryId}
                className="w-full py-3 px-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#3B82F6',
                  color: 'white'
                }}
              >
                {loading ? 'Saving...' : isEditing ? 'Update Expense' : 'Save Expense'}
              </button>

              {/* Delete Button - Only show when editing, no confirmation */}
              {isEditing && (
                <button
                  onClick={handleDelete}
                  disabled={loading || deleting}
                  className="w-full py-3 px-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  style={{
                    backgroundColor: '#DC2626',
                    color: 'white'
                  }}
                >
                  <Trash2 size={16} />
                  <span>{deleting ? 'Deleting...' : 'Delete Expense'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;