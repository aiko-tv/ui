import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';

export function useViewerCount(agentId: string) {
  const { socket } = useSocket();
  const [viewerCount, setViewerCount] = useState<number>(0);

  useEffect(() => {
    if (!socket) return;

    // Create the channel name in the same format as shown in the socket message
    const channel = `${agentId}_viewer_count`;

    // Listen for viewer count updates
    socket.on(channel, (data: { count: number }) => {
      setViewerCount(data.count);
    });

    // Cleanup listener when component unmounts
    return () => {
      socket?.off(channel);
    };
  }, [socket, agentId]);

  return viewerCount;
}
