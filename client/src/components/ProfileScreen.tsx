import React, { useState } from 'react';
import { ArrowLeft, Key, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface ProfileScreenProps {
  isOpen: boolean;
  onBack: () => void;
}

interface ChangePasswordScreenProps {
  isOpen: boolean;
  onBack: () => void;
}

const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({ isOpen, onBack }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsChanging(true);
      setError('');

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      console.log('Password changed successfully');
      
      // Clear form and go back
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onBack();
      
    } catch (error: any) {
      console.error('Error changing password:', error);
      setError(error.message || 'Failed to change password');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-25 z-[80] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onBack}
      />
      
      {/* Change Password Panel */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 bg-gray-100 z-[90] transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ maxWidth: '80vw' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 bg-gray-100">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-800" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            Change Password
          </h1>
          <div className="w-10" /> {/* Spacer for center alignment */}
        </div>

        {/* Content */}
        <div className="flex-1 px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isChanging}
                className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                {isChanging ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-25 z-[100] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Delete Account Panel */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 bg-gray-100 z-[110] transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ maxWidth: '80vw' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 bg-gray-100">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-800" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            Delete Account
          </h1>
          <div className="w-10" /> {/* Spacer for center alignment */}
        </div>

        {/* Content */}
        <div className="flex-1 px-6 pb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
            </div>
            
            {/* Message */}
            <p className="text-gray-600 text-center mb-6">
              This action cannot be undone. All your expenses, budgets, and account data will be permanently deleted.
            </p>
            
            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ isOpen, onBack }) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleChangePassword = () => {
    setShowChangePassword(true);
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found');
        return;
      }

      console.log('Starting account deletion process for user:', user.id);
      
      // Call server-side API to handle complete user account deletion
      console.log('Requesting complete account deletion from server...');
      const response = await fetch('/api/user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      const result = await response.json();
      console.log('Server response:', result.message);
      
      // The auth user is now deleted, so we don't need to manually sign out
      // The app will automatically redirect to login when it detects no user
      console.log('Account deletion completed successfully');
      
    } catch (error) {
      console.error('Error during account deletion:', error);
      // Even if deletion fails, sign out the user
      await supabase.auth.signOut();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  const profileOptions = [
    {
      id: 'change-password',
      title: 'Change Password',
      icon: <Key size={20} className="text-gray-600" />,
      action: handleChangePassword,
      destructive: false
    },
    {
      id: 'delete-account',
      title: 'Delete Account',
      icon: <Trash2 size={20} className="text-red-500" />,
      action: () => setShowDeleteConfirmation(true),
      destructive: true
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-25 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onBack}
      />
      
      {/* Profile Panel */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 bg-gray-100 z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ maxWidth: '80vw' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 bg-gray-100">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-800" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            Profile
          </h1>
          <div className="w-10" /> {/* Spacer for center alignment */}
        </div>

        {/* Profile Options */}
        <div className="flex-1 px-6 pb-6">
          <div className="space-y-3">
            {profileOptions.map((option) => (
              <button
                key={option.id}
                onClick={option.action}
                disabled={isDeleting}
                className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-3">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {option.icon}
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1 text-left">
                    <div 
                      className={`font-medium ${
                        option.destructive ? 'text-red-500' : 'text-gray-800'
                      }`}
                    >
                      {option.title}
                      {isDeleting && option.id === 'delete-account' && ' (Processing...)'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteAccount}
      />

      {/* Change Password Screen */}
      <ChangePasswordScreen
        isOpen={showChangePassword}
        onBack={() => setShowChangePassword(false)}
      />
    </>
  );
};

export default ProfileScreen;