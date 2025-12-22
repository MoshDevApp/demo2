/**
 * Screen Monitor Component
 * Real-time monitoring dashboard for digital screens with WebSocket integration
 */

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Monitor, Wifi, WifiOff, MapPin, Clock, Activity } from 'lucide-react';

export default function ScreenMonitor() {
  const [screens, setScreens] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No authentication token found');
      return;
    }

    const newSocket = io('http://localhost:3001', {
      auth: {
        token: token
      }
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      newSocket.emit('request:screen_list');
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('screen_list', (data) => {
      console.log('Received screen list:', data);
      setScreens(data);
    });

    newSocket.on('screen:status', (data) => {
      console.log('Screen status update:', data);
      setScreens(prev =>
        prev.map(screen =>
          screen.id === data.screenId
            ? { ...screen, status: data.status, last_heartbeat: data.timestamp }
            : screen
        )
      );
    });

    newSocket.on('screen:log', (data) => {
      console.log('Screen log:', data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'offline':
        return 'text-red-500';
      case 'error':
        return 'text-yellow-500';
      case 'maintenance':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 border-green-300';
      case 'offline':
        return 'bg-red-100 border-red-300';
      case 'error':
        return 'bg-yellow-100 border-yellow-300';
      case 'maintenance':
        return 'bg-blue-100 border-blue-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const formatLastHeartbeat = (timestamp) => {
    if (!timestamp) return 'Never';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    return `${Math.floor(diffSecs / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Screen Monitor</h1>
            <p className="text-gray-400">Real-time monitoring of digital signage displays</p>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-900 bg-opacity-50 border border-green-500 rounded-lg">
                <Activity className="text-green-500" size={20} />
                <span className="text-green-400 font-medium">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg">
                <WifiOff className="text-red-500" size={20} />
                <span className="text-red-400 font-medium">Disconnected</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {screens.length === 0 ? (
            <div className="col-span-full bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
              <Monitor className="mx-auto text-gray-600 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Screens Found</h3>
              <p className="text-gray-500">Add screens to start monitoring</p>
            </div>
          ) : (
            screens.map((screen) => (
              <div
                key={screen.id}
                className={`${getStatusBg(screen.status)} border-2 rounded-xl p-6 transition-all hover:shadow-lg`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Monitor className={getStatusColor(screen.status)} size={32} />
                    <div>
                      <h3 className="font-semibold text-gray-900">{screen.name}</h3>
                      <p className="text-sm text-gray-600">{screen.device_id?.substring(0, 16)}...</p>
                    </div>
                  </div>

                  {screen.status === 'online' ? (
                    <Wifi className="text-green-500" size={24} />
                  ) : (
                    <WifiOff className="text-red-500" size={24} />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock size={16} />
                    <span>Last seen: {formatLastHeartbeat(screen.last_heartbeat)}</span>
                  </div>

                  {screen.location_name && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin size={16} />
                      <span>{screen.location_name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="font-medium">Provider:</span>
                    <span className="capitalize">{screen.provider?.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-300">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(
                      screen.status
                    )}`}
                  >
                    {screen.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
