import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Target } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBudgetSaved: () => void;
}

const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, onBudgetSaved }) => {
  const [dailyBudget, setDailyBudget] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(false);

  // Fetch existing budget when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchExistingBudget();
    }
  }, [isOpen]);

  const fetchExistingBudget = async () => {
    try {
      setInitialLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const { data, error } = await supabase
        .from('budgets')
        .select('daily_budget, monthly_budget')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      // Populate form with existing values if they exist
      if (data) {
        setDailyBudget(data.daily_budget ? data.daily_budget.toString() : '');
        setMonthlyBudget(data.monthly_budget ? data.monthly_budget.toString() : '');
      } else {
        // Reset form for new budget
        setDailyBudget('');
        setMonthlyBudget('');
      }
    } catch (error) {
      console.error('Error fetching budget:', error);
      setError('Failed to load existing budget');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate that at least one budget is provided
    if (!dailyBudget.trim() && !monthlyBudget.trim()) {
      setError('Please enter at least one budget amount');
      return;
    }

    // Validate numeric values
    const dailyAmount = dailyBudget.trim() ? parseFloat(dailyBudget) : null;
    const monthlyAmount = monthlyBudget.trim() ? parseFloat(monthlyBudget) : null;

    if (dailyAmount !== null && (isNaN(dailyAmount) || dailyAmount < 0)) {
      setError('Please enter a valid daily cap amount');
      return;
    }

    if (monthlyAmount !== null && (isNaN(monthlyAmount) || monthlyAmount < 0)) {
      setError('Please enter a valid monthly cap amount');
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

      // Perform upsert operation
      const { error } = await supabase
        .from('budgets')
        .upsert({
          user_id: user.id,
          daily_budget: dailyAmount,
          monthly_budget: monthlyAmount
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Notify parent component and close modal
      onBudgetSaved();
      onClose();
    } catch (error) {
      console.error('Error saving budget:', error);
      setError('Failed to save budget');
    } finally {
      setLoading(false);
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
          <div className="flex items-center space-x-2">
            <Target style={{ color: '#3B82F6' }} size={24} />
            <h2 
              className="text-xl font-semibold"
              style={{ color: '#1C1C1E' }}
            >
              Set Your Cap
            </h2>
          </div>
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

          {/* Loading state */}
          {initialLoading ? (
            <div className="flex items-center justify-center py-8">
              <div style={{ color: '#6B7280' }}>Loading existing budget...</div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Daily Cap */}
              <div>
                <label 
                  htmlFor="dailyBudget" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#374151' }}
                >
                  Daily Cap
                </label>
                <div className="relative">
                  <DollarSign 
                    size={18} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: '#9CA3AF' }}
                  />
                  <input
                    id="dailyBudget"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    style={{ 
                      backgroundColor: '#F9FAFB',
                      color: '#1C1C1E'
                    }}
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>
                <p 
                  className="text-xs mt-1"
                  style={{ color: '#6B7280' }}
                >
                  How much you want to spend per day
                </p>
              </div>

              {/* Monthly Cap */}
              <div>
                <label 
                  htmlFor="monthlyBudget" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#374151' }}
                >
                  Monthly Cap
                </label>
                <div className="relative">
                  <Calendar 
                    size={18} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: '#9CA3AF' }}
                  />
                  <input
                    id="monthlyBudget"
                    type="number"
                    step="0.01"
                    min="0"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    style={{ 
                      backgroundColor: '#F9FAFB',
                      color: '#1C1C1E'
                    }}
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>
                <p 
                  className="text-xs mt-1"
                  style={{ color: '#6B7280' }}
                >
                  Your total monthly spending limit
                </p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={loading || (!dailyBudget.trim() && !monthlyBudget.trim())}
                className="w-full mt-6 py-3 px-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#3B82F6',
                  color: 'white'
                }}
              >
                {loading ? 'Saving...' : 'Save It'}
              </button>

              {/* Helper text */}
              <p 
                className="text-xs text-center mt-3"
                style={{ color: '#6B7280' }}
              >
                You can set one or both budget limits. Leave empty to remove a budget.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;