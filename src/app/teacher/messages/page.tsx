'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, MessageSquare } from 'lucide-react';
import { getBackendUrl } from '@/lib/backend-url';

interface Message {
  id: string;
  sender: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  type?: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/teacher/messages`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.statusText}`);
        }

        const data = await response.json();
        setMessages(data.messages || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-gray-600">Communication with parents and school</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 mx-auto" style={{ borderColor: '#0A66C2', borderBottomColor: '#0A66C2', borderTopColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderWidth: '2px' }}></div>
            <p className="mt-4 text-gray-600">Loading messages...</p>
          </div>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No messages yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition"
                style={{
                  backgroundColor: !msg.read ? '#0A66C220' : ''
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`font-medium ${!msg.read ? 'font-bold' : ''} text-gray-900`}>
                      {msg.sender}
                    </p>
                    <p className="text-gray-600 font-medium">{msg.subject}</p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{msg.body}</p>
                  </div>
                  <span className="text-xs text-gray-600 flex-shrink-0 ml-4">
                    {new Date(msg.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
