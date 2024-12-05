import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LiveStream } from './components/LiveStream';
import { ProfileModal } from './components/ProfileModal';
import { ToastContainer } from './components/Toast';
import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { SceneProvider } from './contexts/ScenesContext';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ModalProvider } from './contexts/ModalContext';
import { GiftModalProvider, useGiftModal } from './contexts/GiftContext';
import { DocsPage } from './components/DocsPage';
import { OnboardPage } from './components/onboardPage';

import "@solana/wallet-adapter-react-ui/styles.css";

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import SceneConfigurator from './components/SceneConfigurator';
import { GiftConfirmationModal } from './components/GiftConfirmationModal';
import { SOLANA_RPC_URL } from './utils/constants';
import ProfilePage from './components/ProfilePage';

const endpoint = SOLANA_RPC_URL;
const wallets = [new PhantomWalletAdapter()];
const queryClient = new QueryClient();

import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SceneEngineProvider } from './contexts/SceneEngineContext';

export default function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect={true}>
            <WalletModalProvider>
              <Router>
                <UserProvider>
                  <SceneProvider>
                    <ModalProvider>
                      <SceneEngineProvider>
                        <GiftModalProvider>
                          <Routes>
                            <Route path="/:modelName" element={<InnerApp />} />
                            <Route path="/" element={<InnerApp />} />
                            <Route path="/onboard" element={<OnboardPage />} />
                            <Route path="/configure" element={<SceneConfigurator />} />
                            <Route path="/docs" element={<DocsPage />} />
                            <Route path="/profile/:agentId" element={<InnerProfilePage />} />
                          </Routes>
                          <ProfileModal />
                          <ToastContainer />
                        </GiftModalProvider>
                      </SceneEngineProvider>
                    </ModalProvider>
                  </SceneProvider>
                </UserProvider>
              </Router>

            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}


const InnerApp = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isOpen, closeModal, onConfirm, batchedGift, isSending } = useGiftModal();
  return (
    <div className="flex flex-col h-screen overflow-hidden overscroll-none dark:bg-dark">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed md:relative md:translate-x-0
        z-50 h-[calc(100vh-64px)]
        transition-transform duration-300 ease-in-out
      `}
        >
          <Sidebar />
        </div>
        <div className="flex-1 min-w-0">
          <LiveStream />
        </div>
      </div>
      <ProfileModal />
      <ToastContainer />
      <GiftConfirmationModal
        isOpen={isOpen}
        onClose={closeModal}
        onConfirm={onConfirm}
        gift={batchedGift}
        isSending={isSending}
      />
    </div>
  )
}

const InnerProfilePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  return (
    <div className="flex flex-col h-screen overflow-hidden overscroll-none dark:bg-dark">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed md:relative md:translate-x-0
        z-50 h-[calc(100vh-64px)]
        transition-transform duration-300 ease-in-out
      `}
        >
          <Sidebar />
        </div>
        <div className="flex-1 min-w-0">
          <ProfilePage />
        </div>
      </div>
      <ProfileModal />
      <ToastContainer />
    </div>
  )
}
