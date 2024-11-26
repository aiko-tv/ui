export const concatSolanaAddress = (inputString: string): string => {
  // Validate Solana address format (Base58 characters, 32-44 length)
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  
  if (!solanaAddressRegex.test(inputString)) {
    return inputString;
    throw new Error('Invalid Solana address format');
  }
  
  return inputString.slice(0, 4) + '...' + inputString.slice(-4);
};


