import { GIFTS, Gift } from '../utils/constants';
import { useState, useEffect } from 'react';


export function useGifts(onGiftReceived: (giftName: string, giftImage: string, quantity?: number) => void) {
  const [gifts] = useState<Gift[]>(GIFTS);


  // Sends random gifts every 5 seconds
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const randomGift = gifts[Math.floor(Math.random() * gifts.length)];
  //     const quantity = Math.random() < 0.2 ? Math.floor(Math.random() * 5) + 2 : 1;
  //     onGiftReceived(randomGift.name, randomGift.image, quantity);
  //   }, 5000);

  //   return () => clearInterval(interval);
  // }, [gifts, onGiftReceived]);

  return { gifts };
}