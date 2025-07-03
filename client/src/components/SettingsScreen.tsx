import React, { useState } from 'react';
import { ArrowLeft, User, Bell, Palette, HelpCircle, LogOut, Tag, ChevronRight, Sun, Moon } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import ProfileScreen from './ProfileScreen';
import ManageCategoriesScreen from './ManageCategoriesScreen';

interface SettingsScreenProps {
  isOpen: boolean;
  onBack: () => void;
}

interface SettingsItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  action?: () => void;
  showArrow?: boolean;
  destructive?: boolean;
  customContent?: React.ReactNode;
}

// Segmented Control Component
interface SegmentedControlProps {
  options: Array<{
    value: string;
    label?: string;
    icon?: React.ReactNode;
  }>;
  value: string;
  onChange: (value: string) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange }) => {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
            value === option.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center space-x-1">
            {option.icon && <span>{option.icon}</span>}
            {option.label && <span>{option.label}</span>}
          </div>
        </button>
      ))}
    </div>
  );
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({ isOpen, onBack }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfile = () => {
    setIsProfileOpen(true);
  };

  const handleManageCategories = () => {
    setIsCategoriesOpen(true);
  };

  const handleNotifications = () => {
    // TODO: Implement notification settings
    console.log('Notifications clicked');
  };

  const handleAppearance = () => {
    // TODO: Implement appearance settings
    console.log('Appearance clicked');
  };

  const handleHelp = () => {
    // TODO: Implement help & feedback
    console.log('Help & Feedback clicked');
  };

  const settingsItems: SettingsItem[] = [
    {
      id: 'profile',
      title: 'Profile',
      icon: <User size={20} className="text-gray-600" />,
      action: handleProfile,
      showArrow: true
    },
    {
      id: 'categories',
      title: 'Manage Categories',
      icon: <Tag size={20} className="text-gray-600" />,
      action: handleManageCategories,
      showArrow: true
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell size={20} className="text-gray-600" />,
      customContent: (
        <SegmentedControl
          options={[
            { value: 'on', label: 'On' },
            { value: 'off', label: 'Off' }
          ]}
          value={notificationsEnabled ? 'on' : 'off'}
          onChange={(value) => setNotificationsEnabled(value === 'on')}
        />
      )
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: <Palette size={20} className="text-gray-600" />,
      customContent: (
        <SegmentedControl
          options={[
            { value: 'light', icon: <Sun size={16} /> },
            { value: 'dark', icon: <Moon size={16} /> }
          ]}
          value={appearance}
          onChange={(value) => setAppearance(value as 'light' | 'dark')}
        />
      )
    },
    {
      id: 'help',
      title: 'Help & Feedback',
      icon: <HelpCircle size={20} className="text-gray-600" />,
      action: handleHelp,
      showArrow: false
    },
    {
      id: 'signout',
      title: 'Sign Out',
      icon: <LogOut size={20} className="text-red-500" />,
      action: handleSignOut,
      showArrow: false,
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
      
      {/* Settings Panel */}
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
            Settings
          </h1>
          <div className="w-10" /> {/* Spacer for center alignment */}
        </div>

        {/* Settings List */}
        <div className="flex-1 px-6 pb-6">
          <div className="space-y-3">
            {settingsItems.map((item) => (
              item.customContent ? (
                // Item with custom content (no click action)
                <div
                  key={item.id}
                  className="w-full bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    {/* Left side - Icon and Text */}
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        {item.icon}
                      </div>
                      
                      {/* Text Content */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-medium text-gray-800">
                          {item.title}
                        </div>
                      </div>
                    </div>

                    {/* Right side - Custom Content */}
                    <div className="flex-shrink-0 ml-3">
                      {item.customContent}
                    </div>
                  </div>
                </div>
              ) : (
                // Regular clickable item
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    {/* Left side - Icon and Text */}
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        {item.icon}
                      </div>
                      
                      {/* Text Content */}
                      <div className="flex-1 min-w-0 text-left">
                        <div 
                          className={`font-medium ${
                            item.destructive ? 'text-red-500' : 'text-gray-800'
                          }`}
                        >
                          {item.title}
                        </div>
                      </div>
                    </div>

                    {/* Right side - Arrow (if applicable) */}
                    {item.showArrow && (
                      <div className="flex-shrink-0 ml-3">
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                </button>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Profile Screen */}
      <ProfileScreen
        isOpen={isProfileOpen}
        onBack={() => setIsProfileOpen(false)}
      />

      {/* Manage Categories Screen */}
      <ManageCategoriesScreen
        isOpen={isCategoriesOpen}
        onBack={() => setIsCategoriesOpen(false)}
      />
    </>
  );
};

export default SettingsScreen;