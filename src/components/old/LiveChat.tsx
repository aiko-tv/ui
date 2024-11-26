import { Diamond, Gift } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import { useScene } from '../../contexts/ScenesContext';
import { concatSolanaAddress } from '../../utils/concat';
import { useSocket } from '../../hooks/useSocket';
import { useUser } from '../../contexts/UserContext';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

function getColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 65%)`; // Using HSL for better control over brightness
}


export function LiveChat() {
  const { comments, addComment } = useScene();
  const [inputValue, setInputValue] = useState("");
  const [canSend, setCanSend] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [localMessages, setLocalMessages] = useState<Array<{
    id: string,
    message: string,
    isSystem: boolean,
    timestamp: number
  }>>([]);
  const [showError, setShowError] = useState(false);
  const { userProfile } = useUser();


  const { setVisible } = useWalletModal();
  const openWalletModal = () => {
    setVisible(true); // This opens the wallet modal
  };


  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(time => time - 1);
      } else {
        setCanSend(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (!userProfile) {
      openWalletModal();
      return;
    }

    if (!canSend) {
      setShowError(true);
      setTimeout(() => setShowError(false), 1000);

      setLocalMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        message: `Please wait ${timeLeft} seconds before sending another message`,
        isSystem: true,
        timestamp: Date.now()
      }]);

      // Clean up old system messages after 2 seconds
      setTimeout(() => {
        setLocalMessages(prev => prev.filter(msg =>
          Date.now() - msg.timestamp < 2000
        ));
      }, 2000);

      return;
    }

    addComment(inputValue.trim());
    setInputValue("");
    setCanSend(false);
    setTimeLeft(3);
  };

  // // console.log({comments});

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[0] p-4 bg-gradient-to-t from-black/50 to-transparent">
      <div className="mb-4 space-y-2 max-h-[300px] overflow-y-auto">
        {comments
          .slice(Math.max(comments.length - 6, 0))
          .map((comment) => (
            <div
              key={comment.id}
              className="flex items-center text-white/90 text-sm animate-fade-in"
            >
              <img src={comment.avatar} alt="User Avatar" className="w-6 h-6 rounded-full mr-2" />
              {comment.sender === userProfile?.publicKey ? (
                <span className="font-semibold mr-2">You</span>
              ) : (
                <span className="font-semibold mr-2">{comment.handle}</span>
              )}
              {comment.message.includes('diamonds') ? (
                <>
                  <Diamond className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>{comment.message}</span>
                </>
              ) : (
                <>
                  <span>{comment.message}</span>
                </>
              )}
            </div>
          ))}

        {localMessages.map((msg) => (
          <div
            key={msg.id}
            className="flex items-center text-red-400 text-sm animate-fade-in italic"
          >
            <span>{msg.message}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 md:hidden">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={canSend ? "Add comment..." : `Wait ${timeLeft}s...`}
          className={`flex-1 bg-white/10 text-white rounded-full px-4 py-2 text-sm 
            placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 
            transition-all ${showError ? 'animate-shake ring-2 ring-red-500' : ''}`}
        />
        <button
          type="submit"
          className={`bg-pink-500 text-white p-2 rounded-full transition-colors
            hover:bg-pink-600 ${showError ? 'animate-shake' : ''}`}
        >
          <Gift className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}