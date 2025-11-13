import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Calendar } from 'lucide-react';

export function Header() {
  const { profile, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Classroom Booking</h1>
              <p className="text-xs text-gray-600">Resource Management System</p>
            </div>
          </div>

          {profile && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
                </div>
                <p className="text-xs text-gray-600">
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} • {profile.department}
                </p>
              </div>
              <button
                onClick={signOut}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
