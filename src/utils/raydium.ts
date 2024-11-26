import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Liquidity, Percent, Token, TokenAmount, TOKEN_PROGRAM_ID } from '@raydium-io/raydium-sdk';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import BN from 'bn.js';
import Decimal from 'decimal.js';
import { AIKO_MINT } from './constants';

// Constants
export const USDC_MINT = new PublicKey(AIKO_MINT);
export const SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');
export const RAYDIUM_MAINNET_PROGRAM_ID = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');

// Pool info for SOL/USDC on Raydium mainnet
const POOL_ID = new PublicKey('58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2');

export interface SwapParams {
  connection: Connection;
  wallet: PublicKey;
  inputMint: PublicKey;
  outputMint: PublicKey;
  amount: number;
  slippage?: number;
}

export async function getSwapTransaction({
  connection,
  wallet,
  inputMint,
  outputMint,
  amount,
  slippage = 1, // 1% default slippage
}: SwapParams): Promise<{ transaction: Transaction; outputAmount: number }> {
  // Fetch pool info
  const poolInfo = await Liquidity.fetchInfo({ connection, poolKeys: { id: POOL_ID } });
  
  // Create token instances
  const inputToken = new Token(TOKEN_PROGRAM_ID, inputMint, 9); // SOL has 9 decimals
  const outputToken = new Token(TOKEN_PROGRAM_ID, outputMint, 6); // USDC has 6 decimals

  // Calculate amounts
  const inputAmount = new TokenAmount(inputToken, new BN(amount * 1e9)); // Convert to lamports
  
  // Get pool state
  const poolState = await Liquidity.getState({ connection, poolKeys: poolInfo });

  // Compute expected output amount
  const { amountOut, minAmountOut } = Liquidity.computeAmountOut({
    poolKeys: poolInfo,
    poolState,
    amountIn: inputAmount,
    currencyOut: outputToken,
    slippage: new Percent(slippage, 100),
  });

  // Get or create associated token accounts
  const inputATA = await getAssociatedTokenAddress(inputMint, wallet);
  const outputATA = await getAssociatedTokenAddress(outputMint, wallet);

  // Create swap instruction
  const swapInstruction = await Liquidity.makeSwapInstruction({
    poolKeys: poolInfo,
    userKeys: {
      tokenAccountIn: inputATA,
      tokenAccountOut: outputATA,
      owner: wallet,
    },
    amountIn: inputAmount,
    minAmountOut,
  });

  // Create transaction
  const transaction = new Transaction().add(swapInstruction);

  // Calculate actual output amount in USDC
  const outputAmount = new Decimal(amountOut.raw.toString())
    .div(new Decimal(10).pow(6))
    .toNumber();

  return {
    transaction,
    outputAmount,
  };
}

export async function getSwapQuote(
  connection: Connection,
  usdcAmount: number
): Promise<number> {
  try {
    // Fetch pool info
    const poolInfo = await Liquidity.fetchInfo({ connection, poolKeys: { id: POOL_ID } });
    const poolState = await Liquidity.getState({ connection, poolKeys: poolInfo });

    // Create token instances
    const usdcToken = new Token(TOKEN_PROGRAM_ID, USDC_MINT, 6);
    const solToken = new Token(TOKEN_PROGRAM_ID, SOL_MINT, 9);

    // Calculate USDC amount in smallest units
    const amountOut = new TokenAmount(usdcToken, new BN(usdcAmount * 1e6));

    // Compute required input amount
    const { amountIn } = Liquidity.computeAmountIn({
      poolKeys: poolInfo,
      poolState,
      amountOut,
      currencyIn: solToken,
      slippage: new Percent(0), // 0 slippage for quote
    });

    // Convert to SOL amount
    return new Decimal(amountIn.raw.toString())
      .div(new Decimal(10).pow(9))
      .toNumber();
  } catch (error) {
    console.error('Error getting swap quote:', error);
    throw error;
  }
}