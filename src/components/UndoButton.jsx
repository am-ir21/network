import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useLanguage } from '../context/LanguageContext'

const UNDO_WINDOW_MS = 5 * 60 * 1000 // 5 minutes

export default function UndoButton({ payment, onUndone, onExpire }) {
  const { t } = useLanguage()
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.ceil((UNDO_WINDOW_MS - (Date.now() - payment.createdAt)) / 1000))
  )
  const [undoing, setUndoing] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const remainingMs = UNDO_WINDOW_MS - (Date.now() - payment.createdAt)
      if (remainingMs <= 0) {
        clearInterval(interval)
        setSecondsLeft(0)
        onExpire(payment.subscriberId)
      } else {
        setSecondsLeft(Math.ceil(remainingMs / 1000))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [payment, onExpire])

  const handleUndo = async () => {
    setUndoing(true)
    try {
      const { error } = await supabase.rpc('undo_payment', { p_payment_id: payment.paymentRecordId })
      if (error) throw error

      const { data: updatedSub, error: fetchError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('id', payment.subscriberId)
        .single()
      if (fetchError) throw fetchError

      onUndone(updatedSub, payment.id)
    } catch (err) {
      console.error('Undo failed:', err)
    } finally {
      setUndoing(false)
    }
  }

  if (secondsLeft <= 0) return null

  const mm = Math.floor(secondsLeft / 60)
  const ss = String(secondsLeft % 60).padStart(2, '0')

  return (
    <button
      onClick={handleUndo}
      disabled={undoing}
      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap"
    >
      {t('undo')} ({mm}:{ss})
    </button>
  )
}
