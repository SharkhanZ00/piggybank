import { useState } from 'react';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { buildTopUpRequest } from '../piggy';

// 1 TON = 10^9 нанотонов
const NANOTONS_PER_TON = 1_000_000_000n;

export function TopUpForm({ onSuccess }: { onSuccess?: () => void }) {
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress = useTonAddress();

  const [amount, setAmount] = useState('0.1');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedAmount = Number(amount);
  const isValid = Number.isFinite(parsedAmount) && parsedAmount > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || sending) return;

    setSending(true);
    setError(null);
    try {
      const amountNano = BigInt(Math.round(parsedAmount * 1e9));

      await tonConnectUI.sendTransaction({
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: [buildTopUpRequest(amountNano)],
      });

      // транзакция ушла в кошелёк; результат подтверждаем через onSuccess
      // (например, перечитать баланс через пару секунд)
      setAmount('');
      onSuccess?.();
    } catch (err: any) {
      // пользователь отклонил транзакцию в кошельке — это не страшно
      if (err?.message?.includes('Cancel')) {
        setError('Транзакция отклонена в кошельке');
      } else {
        setError(err?.message ?? 'Не удалось отправить транзакцию');
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
      <input
        type="number"
        step="0.0001"
        min="0"
        placeholder="Сумма, TON"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={!walletAddress || sending}
        style={{ flex: 1 }}
      />
      <button type="submit" disabled={!walletAddress || !isValid || sending}>
        {sending ? 'Отправка...' : 'Пополнить'}
      </button>
      {error && <p style={{ color: 'red', width: '100%' }}>{error}</p>}
    </form>
  );
}
