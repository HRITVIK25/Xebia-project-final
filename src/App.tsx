import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { SignupForm } from './components/Auth/SignupForm';
import { Header } from './components/Layout/Header';
import { Tabs } from './components/Layout/Tabs';
import { RoomList } from './components/Dashboard/RoomList';
import { AvailabilityCalendar } from './components/Dashboard/AvailabilityCalendar';
import { MyBookings } from './components/Booking/MyBookings';
import { BookingModal } from './components/Booking/BookingModal';
import type { Database } from './lib/database.types';

type Room = Database['public']['Tables']['rooms']['Row'];

function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      {isLogin ? (
        <LoginForm onToggleMode={() => setIsLogin(false)} />
      ) : (
        <SignupForm onToggleMode={() => setIsLogin(true)} />
      )}
    </div>
  );
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState<'browse' | 'schedule' | 'mybookings'>('browse');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBookingSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'browse' && (
          <RoomList key={refreshKey} onSelectRoom={setSelectedRoom} />
        )}
        {activeTab === 'schedule' && (
          <AvailabilityCalendar key={refreshKey} />
        )}
        {activeTab === 'mybookings' && (
          <MyBookings key={refreshKey} />
        )}
      </main>

      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthScreen />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
