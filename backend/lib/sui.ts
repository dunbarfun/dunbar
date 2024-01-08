import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';

const rpcUrl = getFullnodeUrl('testnet');
const client = new SuiClient({ url: rpcUrl });

export default client;
