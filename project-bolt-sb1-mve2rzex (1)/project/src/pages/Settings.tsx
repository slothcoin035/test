import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { User, Bell, Shield, CreditCard } from 'lucide-react';

const Settings = () => {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <User className="w-6 h-6 text-blue-500 dark:text-blue-300" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Profile Settings</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Manage your account details and preferences
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600"
              />
            </div>
            <Button>Save Changes</Button>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
              <Bell className="w-6 h-6 text-purple-500 dark:text-purple-300" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Notifications</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Configure how you want to receive notifications
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span>Email notifications for document updates</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span>Email notifications for comments</span>
            </label>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <Shield className="w-6 h-6 text-green-500 dark:text-green-300" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Security</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Manage your security preferences
              </p>
            </div>
          </div>
          <div className="mt-6">
            <Button variant="outline">Change Password</Button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
              <CreditCard className="w-6 h-6 text-orange-500 dark:text-orange-300" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Billing</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Manage your subscription and payment methods
              </p>
            </div>
          </div>
          <div className="mt-6">
            <Button variant="outline">Manage Subscription</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;