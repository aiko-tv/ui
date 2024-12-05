import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, Play } from 'lucide-react';
import { API_URL } from '../utils/constants';
import { cn } from '../lib/utils';
import { Button } from './ui/button';


interface Video {
  id: string;
  thumbnail: string;
  views: number;
}

async function getAgentInfo(agentId: string) {
  try {
    const response = await fetch(`${API_URL}/api/agent/${agentId}`);
    const data = await response.json();

    console.log('data', data.response);
    return data.response;
  } catch (error) {
    console.error('Error fetching agent info:', error);
    return null;
  }
}

const MOCK_VIDEOS = [
  {
    id: '1',
    thumbnail: 'https://picsum.photos/400/600',
    views: 733
  },
  {
    id: '2',
    thumbnail: 'https://picsum.photos/401/600',
    views: 979
  },
  {
    id: '3',
    thumbnail: 'https://picsum.photos/402/600',
    views: 4350
  },
  {
    id: '4',
    thumbnail: 'https://picsum.photos/403/600',
    views: 1230
  },
  {
    id: '5',
    thumbnail: 'https://picsum.photos/404/600',
    views: 2456
  },
  {
    id: '6',
    thumbnail: 'https://picsum.photos/405/600',
    views: 3789
  }
];

function ProfileHeader({
  username,
  displayName,
  avatar,
  following,
  followers,
  likes,
  bio,
  isLive = false,
}: {
  username: string;
  displayName: string;
  avatar: string;
  following: number;
  followers: number;
  likes: number;
  bio?: string;
  isLive?: boolean;
}) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#fe2c55]">
            <img src={avatar} alt={username} className="w-full h-full object-cover" />
          </div>
          {isLive && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#fe2c55] text-white text-xs px-2 py-0.5 rounded-full font-bold">
              LIVE
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h1 className="text-xl font-bold mb-1 text-white">{username}</h1>
          <h2 className="text-gray-400 mb-4">{displayName}</h2>
          
          <div className="flex gap-4 flex-wrap">
            <Button className="bg-[#fe2c55] hover:bg-[#fe2c55]/90 text-white px-8">
              Follow
            </Button>
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-wrap">
        <div className="flex gap-1">
          <span className="font-bold text-white">{following}</span>
          <span className="text-gray-400">Following</span>
        </div>
        <div className="flex gap-1">
          <span className="font-bold text-white">{followers}</span>
          <span className="text-gray-400">Followers</span>
        </div>
        <div className="flex gap-1">
          <span className="font-bold text-white">{likes}</span>
          <span className="text-gray-400">Likes</span>
        </div>
      </div>

      {bio && <p className="text-gray-300">{bio}</p>}
    </div>
  );
}

function ProfileTabs({
  activeTab,
  onTabChange,
  sortBy,
  onSortChange,
}: {
  activeTab: 'videos' | 'reposts' | 'liked';
  onTabChange: (tab: 'videos' | 'reposts' | 'liked') => void;
  sortBy: 'latest' | 'popular' | 'oldest';
  onSortChange: (sort: 'latest' | 'popular' | 'oldest') => void;
}) {
  return (
    <div className="border-b border-gray-800">
      <div className="md:flex justify-between items-center px-4">
        <div className="flex">
          <button
            onClick={() => onTabChange('videos')}
            className={cn(
              'px-4 py-2 border-b-2 font-medium transition-colors',
              activeTab === 'videos'
                ? 'border-[#fe2c55] text-[#fe2c55]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            )}
          >
            Videos
          </button>
          <button
            onClick={() => onTabChange('reposts')}
            className={cn(
              'px-4 py-2 border-b-2 font-medium transition-colors',
              activeTab === 'reposts'
                ? 'border-[#fe2c55] text-[#fe2c55]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            )}
          >
            Reposts
          </button>
          <button
            onClick={() => onTabChange('liked')}
            className={cn(
              'px-4 py-2 border-b-2 font-medium transition-colors',
              activeTab === 'liked'
                ? 'border-[#fe2c55] text-[#fe2c55]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            )}
          >
            Liked
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onSortChange('latest')}
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              sortBy === 'latest'
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-gray-200'
            )}
          >
            Latest
          </button>
          <button
            onClick={() => onSortChange('popular')}
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              sortBy === 'popular'
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-gray-200'
            )}
          >
            Popular
          </button>
          <button
            onClick={() => onSortChange('oldest')}
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              sortBy === 'oldest'
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-gray-200'
            )}
          >
            Oldest
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoGrid({ videos }: { videos: Video[] }) {
  return (
    <div className="grid grid-cols-3 gap-1 p-1 bg-[#0f1115]">
      {videos.map((video) => (
        <div key={video.id} className="aspect-[9/16] relative group cursor-pointer">
          <img
            src={video.thumbnail}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-opacity" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-sm">
            <Play className="w-4 h-4" />
            <span>{video.views}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const { agentId } = useParams();
  const [activeTab, setActiveTab] = useState<'videos' | 'reposts' | 'liked'>('videos');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'oldest'>('latest');
  const [agentData, setAgentData] = useState<any | null>(null); 


  useEffect(() => {
    if (agentId) {
      getAgentInfo(agentId).then(setAgentData);
    }
  }, [agentId]);

  return (
    <div className="h-full w-full overflow-y-auto bg-white dark:bg-[#0f1115]">
      <div className="max-w-4xl mx-auto">

      {agentData ? (
        <>
          <ProfileHeader
            username={agentData.aikoHandle}
            displayName={`@${agentData.aikoHandle}`}
            avatar={agentData.avatar}
            following={289}
            followers={2124}
            likes={4863}
            bio={agentData.description}
            isLive={agentData.isStreaming}
          />
          
         
          
            
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}
