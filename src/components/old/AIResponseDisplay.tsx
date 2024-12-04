import React, { useEffect, useState } from 'react';
import { useSceneEngine } from '../../contexts/SceneEngineContext';
import { API_URL } from '../../utils/constants';

export default function AIResponseDisplay() {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const { currentResponse, audioRef } = useSceneEngine();
  const [agentMap, setAgentMap] = useState<{ [agentId: string]: { name: string, walletAddress: string } }>({});

  // Add this to determine position based on response ID
  const isRightSide = React.useMemo(() => {
    return currentResponse?.id ? parseInt(currentResponse.id, 10) % 2 === 0 : false;
  }, [currentResponse?.id]);

  // can we get currentAudio and isPlaying from audioRef?
  const currentAudio = React.useMemo(() => audioRef.current?.src, [audioRef.current?.src]);
  const isPlaying = React.useMemo(() => audioRef.current?.paused, [audioRef.current?.paused]);

  // console.log({ currentAudio, isPlaying })

  useEffect(() => {
    if (!currentResponse?.text) return;

    setShouldRender(true);
    setIsVisible(false);

    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => {
      clearTimeout(showTimer);
    };
  }, [currentResponse?.id]);

  useEffect(() => {
    // get agent map from API
    const getAgentMap = async () => {
      const response = await fetch(`${API_URL}/api/agents`);
      const data = await response.json();
      setAgentMap(data);
    };
    getAgentMap();
  }, []);

  const getReplyTypeText = () => {
    if (currentResponse?.isGiftResponse) return "'s gift";
    if (currentResponse?.replyToMessage && currentResponse.replyToMessage.length > 0) return "'s message";
    return '';
  };

  if (!currentResponse?.text || !shouldRender) return <></>;

  const { text, replyToUser: replyTo, replyToMessage, replyToHandle, replyToPfp, isGiftResponse, agentId } = currentResponse;
  const agentName = agentId ? agentMap[agentId]?.name : '';

  const isReplyToMessage = replyToMessage && replyToMessage.length > 0;

  return (
    <>
      <div
        className={`absolute ${isRightSide ? 'right-0' : 'left-0'} top-32 z-50 transform w-[85%] max-w-sm
          transition-all duration-300 ease-in-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="bg-white/90 rounded-lg shadow-lg p-4">
          {agentName && (
            <div className="text-gray-500 text-sm mb-2">
              {agentName}
            </div>
          )}
          {replyTo && (
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <img src={replyToPfp} alt={replyToHandle} className="w-6 h-6 rounded-full flex-shrink-0" />
              Reply to {replyToHandle}{getReplyTypeText()}
            </div>
          )}
          {replyToMessage && (
            <div className="bg-gray-100 text-gray-700 text-sm p-2 rounded mb-2">
              <p>{replyToMessage}</p>
            </div>
          )}
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="max-h-[30vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <p className="text-black text-base font-medium">
                  {text}
                </p>
              </div>
              {/* Audio Indicator */}
              {/* {currentAudio && isPlaying && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-3 bg-primary rounded-full animate-pulse`}
                        style={{
                          animationDelay: `${i * 0.2}s`
                        }}
                      />
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={toggleMute}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}