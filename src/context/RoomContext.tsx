import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { Room } from '@/types/room';
import {
  createRoom as createRoomService,
  joinRoom as joinRoomService,
  getQueue,
  addToQueue as addToQueueService,
  QueueItem,
  getMembers,
  Member,
  AddToQueuePayload
} from '@/services/roomService';
import { toast } from 'sonner';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from './AuthContext';
import { BACKEND_URL } from '@/constants';

interface RoomContextType {
  currentRoom: Room | null;
  queue: QueueItem[];
  members: Member[];
  isLoading: boolean;
  error: string | null;
  createRoom: (name: string, isPrivate: boolean) => Promise<Room | null>;
  joinRoom: (code: string) => Promise<Room | null>;
  leaveRoom: () => void;
  addTrackToQueue: (trackDetails: AddToQueuePayload) => Promise<void>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};

export const RoomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const ws = useRef<WebSocket | null>(null);

  const isDark = theme === 'dark';
  const toastStyle = {
    borderRadius: '8px',
    background: isDark ? '#27272a' : '#fff',
    color: isDark ? '#fff' : '#18181b',
    border: `1px solid ${isDark ? '#3f3f46' : '#e5e7eb'}`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  };

  const _refreshQueue = async (roomId: string) => {
    try {
      const q = await getQueue(roomId);
      setQueue(q);
    } catch (err) {
      console.error('RoomContext: Failed to refresh queue', err);
    }
  };

  const _refreshMembers = async (roomId: string) => {
    try {
      const m = await getMembers(roomId);
      setMembers(m);
    } catch (err) {
      console.error('RoomContext: Failed to refresh members', err);
    }
  };

  useEffect(() => {
    if (currentRoom && currentRoom.id && isAuthenticated) {
      const wsUrl = `${import.meta.env.VITE_BACKEND_WS_URL || BACKEND_URL.replace(/^http/, 'ws')}/api/v1/ws/${currentRoom.id}`;
      
      ws.current = new WebSocket(wsUrl);
      console.log(`RoomContext: Connecting to WebSocket at ${wsUrl}`);

      ws.current.onopen = () => {
        console.log('RoomContext: WebSocket connected');
        _refreshQueue(currentRoom.id);
        _refreshMembers(currentRoom.id);
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data as string);
          console.log('RoomContext: WebSocket message received:', message);

          switch (message.type) {
            case 'queue_update':
              setQueue(message.queue || []);
              toast.info('Queue updated', { style: toastStyle, duration: 2000 });
              break;
            case 'song_added':
              if (message.track) {
                setQueue(prevQueue => [...prevQueue, message.track]);
                toast.success(`${message.track.track_name} added to queue`, { style: toastStyle, duration: 2000 });
              }
              break;
            case 'song_voted':
              if (message.item_id && message.votes !== undefined) {
                setQueue(prevQueue =>
                  prevQueue.map(item =>
                    item.id === message.item_id ? { ...item, votes: message.votes } : item
                  )
                );
              } else if (message.updated_item) {
                 setQueue(prevQueue => prevQueue.map(item => item.id === message.updated_item.id ? message.updated_item : item));
              }
              break;
            case 'members_update':
              setMembers(message.members || []);
              toast.info('User list updated', { style: toastStyle, duration: 2000 });
              break;
            case 'user_joined':
              if (message.member) {
                setMembers(prevMembers => prevMembers.find(m => m.id === message.member.id) ? prevMembers : [...prevMembers, message.member]);
                toast.info(`${message.member.name || 'A user'} joined`, {style: toastStyle, duration: 2000});
              } else { 
                _refreshMembers(currentRoom.id);
              }
              break;
            case 'user_left':
              if (message.user_id) {
                setMembers(prevMembers => prevMembers.filter(m => m.id !== message.user_id));
                toast.info(`A user left`, {style: toastStyle, duration: 2000});
              } else { 
                 _refreshMembers(currentRoom.id);
              }
              break;
            default:
              console.warn('RoomContext: Unknown WebSocket message type:', message.type);
          }
        } catch (e) {
          console.error('RoomContext: Error processing WebSocket message:', e);
        }
      };

      ws.current.onerror = (error) => {
        console.error('RoomContext: WebSocket error:', error);
        setError('Real-time connection failed.');
      };

      ws.current.onclose = () => {
        console.log('RoomContext: WebSocket disconnected');
      };

      return () => {
        if (ws.current) {
          console.log("RoomContext: Closing WebSocket connection");
          ws.current.close();
          ws.current = null;
        }
      };
    } else {
      if (ws.current) {
        console.log("RoomContext: Closing WebSocket due to no room/auth");
        ws.current.close();
        ws.current = null;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoom, isAuthenticated]);

  const addTrackToQueue = async (trackDetails: AddToQueuePayload) => {
    if (!currentRoom) {
        toast.error("No active room to add a song to.", { style: toastStyle });
        return;
    }
    try {
      await addToQueueService(currentRoom.id, trackDetails);
      toast.success(`\"${trackDetails.track_name}\" requested`, { style: toastStyle });
    } catch (err) {
      console.error('RoomContext: Failed to add to queue', err);
      toast.error('Failed to add to queue', { style: toastStyle });
    }
  };

  const createRoom = async (name: string, isPrivate: boolean): Promise<Room | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const room = await createRoomService({ name, isPrivate });
      setCurrentRoom(room);
      toast.success('Room Created', {
        style: toastStyle,
        description: `Room "${room.name}" created. Code: ${room.code}`,
        duration: 5000,
      });
      return room;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create room';
      setError(errorMessage);
      toast.error('Error Creating Room', { style: toastStyle, description: errorMessage, duration: 5000 });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async (code: string): Promise<Room | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const room = await joinRoomService(code);
      setCurrentRoom(room);
      toast.success('Room Joined', { style: toastStyle, description: `You've joined "${room.name}"`, duration: 3000 });
      return room;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join room';
      setError(errorMessage);
      toast.error('Error Joining Room', { style: toastStyle, description: errorMessage, duration: 3000 });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const leaveRoom = () => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setCurrentRoom(null);
    setQueue([]);
    setMembers([]);
    toast.info('Left Room', { style: toastStyle, description: 'You have left the room', duration: 3000 });
  };

  return (
    <RoomContext.Provider
      value={{
        currentRoom,
        queue,
        members,
        isLoading,
        error,
        createRoom,
        joinRoom,
        leaveRoom,
        addTrackToQueue,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}; 