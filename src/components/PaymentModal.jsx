import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { formatIQD } from '../utils/currency'
import { notifyTelegram } from '../utils/telegram'

export default function PaymentModal({ subscriber, onClose, onPaid }) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const remaining = Math.max(0, subscriber.subscription_fee - subscriber.paid_amount)
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handlePayFull = () => {
    setAmount(String(remaining))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const num = Number(amount)
    if (!amount || isNaN(num) || num <= 0) {
      setError(t('invalidAmount'))
      return
    }

    setSaving(true)
    setError('')
    try {
      const { data, error: insertError } = await supabase
        .from('payment_history')
        .insert({
          subscriber_id: subscriber.id,
          collector_id: user?.id ?? null,
          amount_paid: num,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Fetch the updated subscriber row (trigger already updated it server-side).
      const { data: updatedSub, error: fetchError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('id', subscriber.id)
        .single()

      if (fetchError) throw fetchError

      notifyTelegram(num, subscriber.name)

      onPaid(updatedSub, data)
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 modal-backdrop px-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t('recordPayment')}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{subscriber.name}</p>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
            <p className="text-slate-500 dark:text-slate-400 mb-0.5">{t('fee')}</p>
            <p className="font-semibold text-slate-900 dark:text-white">{formatIQD(subscriber.subscription_fee)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
            <p className="text-slate-500 dark:text-slate-400 mb-0.5">{t('remaining')}</p>
            <p className="font-semibold text-slate-900 dark:text-white">{formatIQD(remaining)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('amount')}</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t('enterAmount')}
                autoFocus
                className="flex-1 min-w-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={handlePayFull}
                className="shrink-0 rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-semibold px-3 text-sm hover:bg-brand-200 dark:hover:bg-brand-900/70 transition-colors"
              >
                {t('payFull')}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-2.5 transition-colors"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
