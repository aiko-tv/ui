declare global {
  interface Window {
    showToast: (message: string, type: 'success' | 'error') => void;
  }
}

export {}; 