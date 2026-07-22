import React, { useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { formatIQD } from '../utils/currency'
import PaymentModal from './PaymentModal'
import UndoButton from './UndoButton'

const STATUS_STYLES = {
  green: {
    row: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  },
  yellow: {
    row: 'bg-amber-50/70 dark:bg-amber-950/30',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  },
  red: {
    row: 'bg-red-50/70 dark:bg-red-950/30',
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  },
}

export default function SubscriberList({ subscribers, setSubscribers, payments, onPaymentRecorded }) {
  const { t } = useLanguage()
  const { isAdmin } = useAuth()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [payingFor, setPayingFor] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  // Map of subscriberId -> { id, paymentRecordId, subscriberId, createdAt }
  const [activeUndos, setActiveUndos] = useState({})

  const paymentTimeMap = useMemo(() => {
    const map = {}
    for (const p of payments ?? []) {
      const existing = map[p.subscriber_id]
      if (!existing || new Date(p.received_at) > new Date(existing)) {
        map[p.subscriber_id] = p.received_at
      }
    }
    return map
  }, [payments])

  const filtered = useMemo(() => {
    return subscribers.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase())
      const matchesFilter =
        filter === 'all' ||
        (filter === 'paid' && s.status === 'green') ||
        (filter === 'partial' && s.status === 'yellow') ||
        (filter === 'unpaid' && s.status === 'red')
      return matchesSearch && matchesFilter
    })
  }, [subscribers, search, filter])

  const statusLabel = (status) => {
    if (status === 'green') return t('statusGreen')
    if (status === 'yellow') return t('statusYellow')
    return t('statusRed')
  }

  const handlePaid = (updatedSub, paymentRecord) => {
    setSubscribers((prev) => prev.map((s) => (s.id === updatedSub.id ? updatedSub : s)))
    onPaymentRecorded(paymentRecord)
    setActiveUndos((prev) => ({
      ...prev,
      [updatedSub.id]: {
        id: paymentRecord.id,
        paymentRecordId: paymentRecord.id,
        subscriberId: updatedSub.id,
        createdAt: Date.now(),
      },
    }))
  }

  const handleUndone = (updatedSub, undoKey) => {
    setSubscribers((prev) => prev.map((s) => (s.id === updatedSub.id ? updatedSub : s)))
    setActiveUndos((prev) => {
      const next = { ...prev }
      delete next[updatedSub.id]
      return next
    })
  }

  const handleExpire = (subscriberId) => {
    setActiveUndos((prev) => {
      const next = { ...prev }
      delete next[subscriberId]
      return next
    })
  }

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('subscribers').delete().eq('id', id)
      if (error) throw error
      setSubscribers((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 absolute top-1/2 -translate-y-1/2 start-3 text-slate-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 ps-9 pe-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">{t('filterAll')}</option>
          <option value="paid">{t('filterPaid')}</option>
          <option value="partial">{t('filterPartial')}</option>
          <option value="unpaid">{t('filterUnpaid')}</option>
        </select>
      </div>

      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-start">
                <th className="px-4 py-3 text-start font-semibold text-slate-500 dark:text-slate-400">{t('name')}</th>
                <th className="px-4 py-3 text-start font-semibold text-slate-500 dark:text-slate-400">{t('fee')}</th>
                <th className="px-4 py-3 text-start font-semibold text-slate-500 dark:text-slate-400">{t('paid')}</th>
                <th className="px-4 py-3 text-start font-semibold text-slate-500 dark:text-slate-400">{t('remaining')}</th>
                <th className="px-4 py-3 text-start font-semibold text-slate-500 dark:text-slate-400">{t('status')}</th>
                <th className="px-4 py-3 text-start font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{t('receivedTime')}</th>
                <th className="px-4 py-3 text-start font-semibold text-slate-500 dark:text-slate-400">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    {t('noResults')}
                  </td>
                </tr>
              )}
              {filtered.map((s) => {
                const style = STATUS_STYLES[s.status] || STATUS_STYLES.red
                const remaining = Math.max(0, s.subscription_fee - s.paid_amount)
                const undo = activeUndos[s.id]
                return (
                  <tr key={s.id} className={`border-b border-slate-50 dark:border-slate-800/60 last:border-0 ${style.row}`}>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">{s.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{formatIQD(s.subscription_fee)}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{formatIQD(s.paid_amount)}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{formatIQD(remaining)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        {statusLabel(s.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                      {paymentTimeMap[s.id]
                        ? new Date(paymentTimeMap[s.id]).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {s.status !== 'green' && (
                          <button
                            onClick={() => setPayingFor(s)}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                          >
                            {t('pay')}
                          </button>
                        )}
                        {undo && (
                          <UndoButton payment={undo} onUndone={handleUndone} onExpire={handleExpire} />
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => setDeletingId(s.id)}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          >
                            {t('delete')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {payingFor && (
        <PaymentModal subscriber={payingFor} onClose={() => setPayingFor(null)} onPaid={handlePaid} />
      )}

      {deletingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 modal-backdrop px-4"
          onClick={() => setDeletingId(null)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-slate-700 dark:text-slate-200 mb-5">{t('confirmDelete')}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {t('no')}
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 transition-colors"
              >
                {t('yes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
