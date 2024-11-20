import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { FolderIcon, PhotoIcon, ChartBarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import MediaManager from '../components/studio/MediaManager';
import MediaEditor from '../components/studio/MediaEditor';
import Analytics from '../components/studio/Analytics';
import Settings from '../components/studio/Settings';

export default function Studio() {
  const location = useLocation();

  const tabs = [
    { path: '/studio', icon: FolderIcon, label: 'Media' },
    { path: '/studio/editor', icon: PhotoIcon, label: 'Editor' },
    { path: '/studio/analytics', icon: ChartBarIcon, label: 'Analytics' },
    { path: '/studio/settings', icon: Cog6ToothIcon, label: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-4">
            Tam Tam <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-transparent bg-clip-text">Studio</span>
          </h1>
          
          {/* Navigation Tabs */}
          <nav className="flex flex-wrap gap-2 border-b border-gray-800">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  location.pathname === tab.path
                    ? 'text-purple-500 border-b-2 border-purple-500 bg-gray-900'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-900/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="min-h-[calc(100vh-12rem)]">
          <Routes>
            <Route path="/" element={<MediaManager />} />
            <Route path="/editor" element={<MediaEditor />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}