import { useTonAddress, TonConnectButton } from '@tonconnect/ui-react';
import { piggy, getBalance, buildTopUpRequest, buildWithdrawRequest } from './piggy';
import { useState, useEffect } from 'react';

import { currentNetwork } from './lib/router';

const network = currentNetwork;

export default function App() {
  const walletAddress = useTonAddress();
  const [balance, setBalance] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getBalance(network)
    .then((b) => {
      console.log('Contract balance (nanotons):', b.toString());
      setBalance(b);
    })
    .catch((e) => console.error('Balance error:', e?.message ?? e))
    .finally(() => setLoading(false));
  }, []);

  async function handleTopUp(amountNano: bigint) {
    await window.tonConnectUI?.sendTransaction({
      validUntil: Date.now() + 5 * 60 * 1000,
      messages: [buildTopUpRequest(amountNano)],
    });
  }

  async function handleWithdraw(amountNano: bigint) {
    await window.tonConnectUI?.sendTransaction({
      validUntil: Date.now() + 5 * 60 * 1000,
      messages: [buildWithdrawRequest(BigInt(Date.now()), amountNano)],
    });
  }

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h1>PiggyBank DApp</h1>

      <div style={{ marginBottom: '16px' }}>
        <TonConnectButton />
      </div>

      {walletAddress ? (
        <p>Кошелёк: {walletAddress}</p>
      ) : (
        <p>Подключите кошелёк, чтобы видеть баланс и управлять контрактом.</p>
      )}

      <div style={{ margin: '20px 0', padding: '12px', border: '1px solid #ccc' }}>
        <h3>Balance in PiggyBank</h3>
        {loading ? (
          <p>Load...</p>
        ) : balance === null ? (
          <p>Cannot get the balance</p>
        ) : (
          <p>{(Number(balance) / 1_000_000_000).toFixed(4)} TON</p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => handleTopUp(1_000_000_000n)} // 1 TON
          disabled={!walletAddress || loading}
        >
          TopUp 1 TON
        </button>
        <button
          onClick={() => handleWithdraw(500_000_000n)} // 0.5 TON
          disabled={!walletAddress || loading || balance === null}
        >
          Withdraw 0.5 TON
        </button>
      </div>
    </div>
  );
}
