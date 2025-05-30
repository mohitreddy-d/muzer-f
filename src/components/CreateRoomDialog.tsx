import React, { useState } from 'react';
import { 
  Music2, 
  X, 
  Lock, 
  Globe
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InteractiveButton } from '@/components/ui/interactive-button';
import { useRoom } from '@/context/RoomContext';
import { useTheme } from '@/context/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface CreateRoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateRoomDialog: React.FC<CreateRoomDialogProps> = ({ isOpen, onClose }) => {
  const [roomName, setRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const { createRoom, isLoading } = useRoom();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      return;
    }
    
    const createdRoom = await createRoom(roomName.trim(), isPrivate);
    if (createdRoom) {
      setRoomName('');
      setIsPrivate(false);
      onClose();
      navigate(`/room/${createdRoom.id}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-lg ${isDark ? 'bg-zinc-900' : 'bg-white'} p-6 relative shadow-xl`}>
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <Music2 className="w-5 h-5 text-red-500" />
          </div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Create New Room
          </h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="roomName" className={`block text-sm font-medium mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>
              Room Name
            </label>
            <Input
              id="roomName"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className={`${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200'} w-full`}
            />
          </div>
          
          <div>
            <p className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>
              Room Privacy
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`flex-1 gap-2 ${
                  !isPrivate 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : `${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`
                }`}
              >
                <Globe size={16} />
                Public
              </Button>
              <Button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex-1 gap-2 ${
                  isPrivate 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : `${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`
                }`}
              >
                <Lock size={16} />
                Private
              </Button>
            </div>
            <p className={`mt-2 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {isPrivate 
                ? 'Private rooms require a room code to join'
                : 'Public rooms can be joined by anyone with the code'}
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className={`${isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-zinc-200 hover:bg-zinc-100'}`}
          >
            Cancel
          </Button>
          <InteractiveButton
            disabled={!roomName.trim() || isLoading}
            onClick={handleCreateRoom}
            className={`${
              !roomName.trim() 
                ? `${isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-200 text-zinc-500'} cursor-not-allowed` 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isLoading ? 'Creating...' : 'Create Room'}
          </InteractiveButton>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomDialog; 