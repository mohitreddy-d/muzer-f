import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from '@/context/RoomContext';
import { QueueItem, voteQueueItem, AddToQueuePayload } from '@/services/roomService';
import QueueList from '@/components/QueueList';
import UserList from '@/components/UserList';
import AddTrackModal from '@/components/AddTrackModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';

const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const {
    currentRoom,
    queue,
    members,
    addTrackToQueue,
  } = useRoom();

  const [showAdd, setShowAdd] = useState(false);

  // If user reloads page and context lost, we might need to navigate back
  useEffect(() => {
    if (!currentRoom && !roomId) {
      navigate('/');
    }
  }, [currentRoom, roomId, navigate]);

  if (!currentRoom) {
    return (
      <div className="h-screen flex items-center justify-center text-center">
        <p className="text-zinc-500">Loading room...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-zinc-700 flex justify-between items-center bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-lg text-white">
            {currentRoom.name} <span className="text-sm text-zinc-400">(Code: {currentRoom.code})</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setShowAdd(true)} className="gap-1 bg-red-500 hover:bg-red-600 text-white">
            <Plus className="w-4 h-4" /> Add Track
          </Button>
          <span className="text-zinc-400 text-sm hidden md:inline">{members?.length || 0} listeners</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden bg-gradient-to-b from-black to-zinc-900">
        <section className="flex-1 overflow-y-auto p-4">
          <QueueList
            queue={queue as QueueItem[]}
            onVote={async (itemId: string, voteValue: 1 | -1) => {
              if (!currentRoom) return;
              try {
                await voteQueueItem(currentRoom.id, itemId, voteValue);
              } catch (error) {
                console.error("Failed to cast vote:", error);
              }
            }}
          />
        </section>
        <aside className="hidden md:block w-64 border-l border-zinc-700 overflow-y-auto p-4 bg-black/30">
          <UserList members={members || []} />
        </aside>
      </div>

      {showAdd && (
        <AddTrackModal
          onSelect={async (trackDetails: AddToQueuePayload) => {
            await addTrackToQueue(trackDetails);
            setShowAdd(false);
          }}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
};

export default RoomPage; 