import { useTonConnectUI } from '@tonconnect/ui-react';
import { buildWithdrawRequest } from '../piggy';

export function WithdrawButton() {
  const [tonConnectUI] = useTonConnectUI();

  async function withdraw() {
    await tonConnectUI.sendTransaction({
      validUntil: Date.now() + 5 * 60 * 1000,
      messages: [buildWithdrawRequest(Date.now(), BigInt(0.01 * 1e9))],
    });
  }

  return <button onClick={withdraw}>Withdraw 0.01 TON</button>;
}
