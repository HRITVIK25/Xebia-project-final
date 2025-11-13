import { Calendar, BookOpen, LayoutGrid } from 'lucide-react';

interface TabsProps {
  activeTab: 'browse' | 'schedule' | 'mybookings';
  onTabChange: (tab: 'browse' | 'schedule' | 'mybookings') => void;
}

export function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex gap-8">
          <button
            onClick={() => onTabChange('browse')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'browse'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Browse Rooms
          </button>
          <button
            onClick={() => onTabChange('schedule')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'schedule'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Daily Schedule
          </button>
          <button
            onClick={() => onTabChange('mybookings')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'mybookings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            My Bookings
          </button>
        </nav>
      </div>
    </div>
  );
}
