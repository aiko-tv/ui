import React, { useEffect } from 'react';
import { Header } from './Header.tsx';
import { Link } from 'react-router-dom';
export const CreateCharacterPage = () => {
  
  useEffect(() => {
    // Listen for messages from the iframe
    window.addEventListener('message', handleMessage);

    return () => {
      // Cleanup the event listener when the component unmounts
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  // Then modify your handleMessage function
  const handleMessage = async (event: MessageEvent) => {
    console.log('event', event);
    if (event.data.status === 200) {
      window.showToast('Avatar created!', 'success');
    } else {
      window.showToast('Creation failed, please try again!', 'error');
    }
  }


  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100">
      <Header onMenuClick={() => {}} />
      <div className="absolute top-[4.5rem] right-8">
           <Link to="/onboard">
               <h2 className="text-md">
                   Already have a model?
               </h2>
               <p className="text-xs font-light">
                   Upload your .vrm file instead
               </p>
           </Link>
        </div> 
      <div className="h-[calc(100vh-100px)]">
       <div className="h-full pb-4">
       <iframe
            src="https://character-studio-umber.vercel.app" // Replace with the actual iframe source
            width="100%"
            height="100%"
            frameBorder="0"
            title="Character Builder"
        ></iframe>
       </div>
      </div>
    </div>
  );
};
