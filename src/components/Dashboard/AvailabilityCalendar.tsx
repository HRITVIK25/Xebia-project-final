import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, Clock, User } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Room = Database['public']['Tables']['rooms']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];

interface BookingWithDetails extends Booking {
  rooms: Room;
  profiles: {
    full_name: string;
    role: string;
  };
}

interface AvailabilityCalendarProps {
  selectedDate?: string;
}

export function AvailabilityCalendar({ selectedDate }: AvailabilityCalendarProps) {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadBookings();

    const channel = supabase
      .channel('bookings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          loadBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [date]);

  const loadBookings = async () => {
    try {
      const startOfDay = `${date}T00:00:00`;
      const endOfDay = `${date}T23:59:59`;

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          rooms:room_id (*),
          profiles:user_id (
            full_name,
            role
          )
        `)
        .eq('status', 'confirmed')
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .order('start_time');

      if (error) throw error;

      setBookings((data as any) || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupBookingsByRoom = () => {
    const grouped: { [key: string]: BookingWithDetails[] } = {};

    bookings.forEach(booking => {
      const roomId = booking.room_id;
      if (!grouped[roomId]) {
        grouped[roomId] = [];
      }
      grouped[roomId].push(booking);
    });

    return grouped;
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupedBookings = groupBookingsByRoom();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Daily Schedule</h2>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {Object.keys(groupedBookings).length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No bookings for this date</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedBookings).map(([roomId, roomBookings]) => {
            const room = roomBookings[0].rooms;
            return (
              <div key={roomId} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">{room.name}</h3>
                  <p className="text-sm text-gray-600">
                    {room.building}, Floor {room.floor} • {room.type === 'lab' ? 'Laboratory' : 'Classroom'}
                  </p>
                </div>
                <div className="divide-y divide-gray-200">
                  {roomBookings.map(booking => (
                    <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{booking.title}</h4>
                          {booking.description && (
                            <p className="text-sm text-gray-600 mt-1">{booking.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{booking.profiles.full_name}</span>
                              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                                booking.profiles.role === 'faculty'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {booking.profiles.role}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-600">
                            {booking.attendee_count} attendees
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
