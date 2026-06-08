'use client';

import { useState } from 'react';
import { AlertCircle, Megaphone } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}

export default function AnnouncementsPage() {
  const [announcements] = useState<Announcement[]>([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <p className="mt-1 text-gray-600">Read school announcements and updates</p>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No announcements yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="px-6 py-4 hover:bg-gray-50">
                <p className="font-semibold text-gray-900">{announcement.title}</p>
                <p className="text-gray-600 mt-1">{announcement.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(announcement.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
