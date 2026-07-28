import { formatIQD } from './currency'

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID

/**
 * Sends a notification to a Telegram chat whenever a payment is recorded.
 * Fails silently (logs to console) so a Telegram outage never blocks
 * the payment flow in the app.
 */
export async function notifyTelegram(amount, subscriberName) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('Telegram not configured — set VITE_TELEGRAM_BOT_TOKEN and VITE_TELEGRAM_CHAT_ID in your .env file')
    return
  }

  const text = `Received ${formatIQD(amount)} from ${subscriberName}`

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
      }),
    })
    if (!res.ok) {
      console.error('Telegram API returned error status:', res.status)
    }
  } catch (err) {
    console.error('Telegram notification failed:', err)
  }
}
