import { Users, Circle } from "lucide-react";

export default function OnlineUsers({ users, currentUserId }) {
  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-40 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <Circle className="w-3 h-3 text-green-500 fill-current animate-pulse" />
        <Users className="w-4 h-4 text-gray-700" />
        <span className="font-semibold text-gray-900 text-sm">
          Online ({users.length})
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {users.slice(0, 8).map((user) => (
          <div
            key={user.id}
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              user.id === currentUserId
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            title={user.username}
          >
            {user.username.slice(0, 8)}
            {user.id === currentUserId && " (You)"}
          </div>
        ))}
        {users.length > 8 && (
          <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
            +{users.length - 8}
          </div>
        )}
      </div>
    </div>
  );
}
