import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Plus, FileText, Clock, Star } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Welcome to DocHelper AI</h2>
        <p className="mb-8">Please sign in to access your documents and templates.</p>
        <Link to="/auth">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <Link to="/editor">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Document
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Documents</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {/* Placeholder for recent documents */}
            <p className="text-gray-500 dark:text-gray-400">No recent documents</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Popular Templates</h2>
            <Star className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {/* Placeholder for templates */}
            <p className="text-gray-500 dark:text-gray-400">Loading templates...</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">AI Assistant</h2>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Let our AI assistant help you create professional documents quickly and easily.
          </p>
          <Button variant="outline" className="w-full">
            Start New Project
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {/* Placeholder for activity feed */}
          <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;