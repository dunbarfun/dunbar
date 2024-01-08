import sui from '@/lib/sui';
import { MIST_PER_SUI } from '@mysten/sui.js/utils';

// Convert MIST to Sui
const balance = (balance: any) => {
	return Number.parseInt(balance.totalBalance) / Number(MIST_PER_SUI);
};


export default async function getBalance(address: string) {
  const suiAmount = await sui.getBalance({
    owner: address,
  });
  return balance(suiAmount);
}
