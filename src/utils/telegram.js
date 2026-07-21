import { formatIQD } from './currency'

// Replace these with your actual Telegram bot token and chat id.
const YOUR_BOT_TOKEN = 'YOUR_BOT_TOKEN'
const YOUR_CHAT_ID = 'YOUR_CHAT_ID'

/**
 * Sends a notification to a Telegram chat whenever a payment is recorded.
 * Fails silently (logs to console) so a Telegram outage never blocks
 * the payment flow in the app.
 */
export async function notifyTelegram(amount, subscriberName) {
  if (YOUR_BOT_TOKEN === 'YOUR_BOT_TOKEN' || YOUR_CHAT_ID === 'YOUR_CHAT_ID') {
    console.warn('Telegram not configured — set YOUR_BOT_TOKEN / YOUR_CHAT_ID in src/utils/telegram.js')
    return
  }

  const text = `Received ${formatIQD(amount)} from ${subscriberName}`

  try {
    const url = `https://api.telegram.org/bot${YOUR_BOT_TOKEN}/sendMessage`
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: YOUR_CHAT_ID,
        text,
      }),
    })
  } catch (err) {
    console.error('Telegram notification failed:', err)
  }
}
