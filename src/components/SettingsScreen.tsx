import React from 'react';
import { ArrowLeft, User, Bell, Shield, HelpCircle, LogOut, Tag, Palette, Database } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';

interface SettingsScreenProps {
  onBack: () => void;
}

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  showArrow?: boolean;
  destructive?: boolean;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleManageCategories = () => {
    // TODO: Implement category management
    console.log('Manage Categories clicked');
  };

  const handleNotifications = () => {
    // TODO: Implement notification settings
    console.log('Notifications clicked');
  };

  const handlePrivacy = () => {
    // TODO: Implement privacy settings
    console.log('Privacy & Security clicked');
  };

  const handleAppearance = () => {
    // TODO: Implement appearance settings
    console.log('Appearance clicked');
  };

  const handleDataExport = () => {
    // TODO: Implement data export
    console.log('Data Export clicked');
  };

  const handleHelp = () => {
    // TODO: Implement help & support
    console.log('Help & Support clicked');
  };

  const settingsItems: SettingsItem[] = [
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'Manage your account information',
      icon: <User size={20} style={{ color: '#3B82F6' }} />,
      action: () => console.log('Profile clicked'),
      showArrow: true
    },
    {
      id: 'categories',
      title: 'Manage Categories',
      subtitle: 'Add, edit, or remove expense categories',
      icon: <Tag size={20} style={{ color: '#10B981' }} />,
      action: handleManageCategories,
      showArrow: true
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Configure alerts and reminders',
      icon: <Bell size={20} style={{ color: '#F59E0B' }} />,
      action: handleNotifications,
      showArrow: true
    },
    {
      id: 'appearance',
      title: 'Appearance',
      subtitle: 'Customize the app\'s look and feel',
      icon: <Palette size={20} style={{ color: '#8B5CF6' }} />,
      action: handleAppearance,
      showArrow: true
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      subtitle: 'Manage your data and security settings',
      icon: <Shield size={20} style={{ color: '#6B7280' }} />,
      action: handlePrivacy,
      showArrow: true
    },
    {
      id: 'data',
      title: 'Data Export',
      subtitle: 'Download your expense data',
      icon: <Database size={20} style={{ color: '#06B6D4' }} />,
      action: handleDataExport,
      showArrow: true
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: <HelpCircle size={20} style={{ color: '#84CC16' }} />,
      action: handleHelp,
      showArrow: true
    },
    {
      id: 'signout',
      title: 'Sign Out',
      subtitle: 'Sign out of your account',
      icon: <LogOut size={20} style={{ color: '#EF4444' }} />,
      action: handleSignOut,
      showArrow: false,
      destructive: true
    }
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F5F7' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} style={{ color: '#1C1C1E' }} />
        </button>
        <h1 
          className="text-xl font-semibold"
          style={{ 
            color: '#1C1C1E',
            fontFamily: 'SF Compact Rounded, Inter, system-ui, -apple-system, sans-serif'
          }}
        >
          Settings
        </h1>
        <div className="w-10" /> {/* Spacer for center alignment */}
      </div>

      {/* Settings List */}
      <div className="flex-1 px-6 pb-6">
        <div className="space-y-3">
          {settingsItems.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className="w-full bg-white rounded-2xl p-4 transition-all duration-200 hover:scale-[0.98] active:scale-[0.96]"
              style={{ 
                boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.08), 0 1px 3px 0 rgba(0, 0, 0, 0.06)' 
              }}
            >
              <div className="flex items-center justify-between">
                {/* Left side - Icon and Text */}
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  {/* Icon Container */}
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#F3F4F6' }}
                  >
                    {item.icon}
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div 
                      className={`font-medium ${item.destructive ? 'text-red-600' : ''}`}
                      style={{ 
                        color: item.destructive ? '#EF4444' : '#1C1C1E',
                        fontFamily: 'SF Compact Rounded, Inter, system-ui, -apple-system, sans-serif'
                      }}
                    >
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div 
                        className="text-sm mt-1 truncate"
                        style={{ 
                          color: '#6B7280',
                          fontFamily: 'SF Compact Rounded, Inter, system-ui, -apple-system, sans-serif'
                        }}
                      >
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side - Arrow (if applicable) */}
                {item.showArrow && (
                  <div className="flex-shrink-0 ml-3">
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 16 16" 
                      fill="none"
                      style={{ color: '#9CA3AF' }}
                    >
                      <path 
                        d="M6 12L10 8L6 4" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* App Version Footer */}
        <div className="mt-8 text-center">
          <p 
            className="text-xs"
            style={{ 
              color: 'rgba(107, 114, 128, 0.5)',
              fontFamily: 'SF Compact Rounded, Inter, system-ui, -apple-system, sans-serif'
            }}
          >
            NoCap Finance v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;