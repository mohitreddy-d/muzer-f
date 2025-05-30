import React from 'react';

interface UserListProps {
  members: { id: string; name: string }[] | string[];
}

const UserList: React.FC<UserListProps> = ({ members }) => {
  if (!members.length) return <p className="text-zinc-400">No listeners yet</p>;

  return (
    <div>
      <h3 className="text-white font-semibold mb-2">Listeners</h3>
      <ul className="space-y-1">
        {members.map((m: any) => (
          <li key={typeof m === 'string' ? m : m.id} className="text-zinc-200 truncate">
            {typeof m === 'string' ? m : m.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList; 