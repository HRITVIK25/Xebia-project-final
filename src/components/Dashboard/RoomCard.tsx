import { MapPin, Users, Layers } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Room = Database['public']['Tables']['rooms']['Row'];

interface RoomCardProps {
  room: Room;
  onBook: (room: Room) => void;
}

export function RoomCard({ room, onBook }: RoomCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{room.name}</h3>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
            room.type === 'lab'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {room.type === 'lab' ? 'Laboratory' : 'Classroom'}
          </span>
        </div>
        <button
          onClick={() => onBook(room)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Book Now
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600 text-sm">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{room.building}, Floor {room.floor}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <Users className="w-4 h-4 mr-2" />
          <span>Capacity: {room.capacity} people</span>
        </div>
      </div>

      {room.equipment && room.equipment.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-start text-sm">
            <Layers className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
            <div className="flex flex-wrap gap-2">
              {room.equipment.map((item, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {room.description && (
        <p className="mt-4 text-sm text-gray-600 border-t border-gray-200 pt-4">
          {room.description}
        </p>
      )}
    </div>
  );
}
