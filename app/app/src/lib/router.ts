export type Network = 'mainnet' | 'testnet';

export const currentNetwork: Network =
  import.meta.env.VITE_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
