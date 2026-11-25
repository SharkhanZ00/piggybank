import { Address } from '@ton/core';
import { Piggybank } from '@wrappers/Piggybank.gen';

import { getTonClient, formatAddressForNetwork } from './lib/ton';
import { currentNetwork } from './lib/router';

function piggyAddress(network: Network): Address {
  const raw = network === 'testnet'
  ? import.meta.env.VITE_PIGGY_ADDRESS_TESTNET
  : import.meta.env.VITE_PIGGY_ADDRESS_MAINNET;

  if (!raw) {
    throw new Error(
      `No contract address for network "${String(network)}". Add VITE_PIGGY_ADDRESS_${String(network).toUpperCase()} to .env and restart dev server`,
    );
  }
  return Address.parse(raw);
}

export function openPiggy(network: Network) {
  return getTonClient(network).open(
    Piggybank.fromAddress(piggyAddress(network)),
  );
}

export async function getBalance(network: Network): Promise<bigint> {
  return await openPiggy(network).getBalance();
}

export function buildTopUpRequest(network: Network, amountNano: bigint) {
  const piggy = openPiggy(network);
  return {
    address: formatAddressForNetwork(piggyAddress(network).toString(), network),
    amount: (amountNano + 50_000_000n).toString(),
    payload: piggy.createCellOfTopUp({ amount: amountNano }).toBoc().toString('base64'),
  };
}

export function buildWithdrawRequest(network: Network, queryId: bigint, amountNano: bigint) {
  const piggy = openPiggy(network);
  return {
    address: formatAddressForNetwork(piggyAddress(network).toString(), network),
    amount: '50000000',
    payload: piggy.createCellOfWithdraw({ queryId, amount: amountNano }).toBoc().toString('base64'),
  };
}
