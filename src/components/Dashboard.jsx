import React, { useMemo } from 'react'
import { formatIQD } from '../utils/currency'
import { useLanguage } from '../context/LanguageContext'

export default function Dashboard({ subscribers, todaysPayments }) {
  const { t } = useLanguage()

  const subscriberMap = useMemo(() => {
    const map = {}
    for (const s of subscribers) {
      map[s.id] = s.name
    }
    return map
  }, [subscribers])

  const stats = useMemo(() => {
    const totalCollectedToday = todaysPayments.reduce((sum, p) => sum + Number(p.amount_paid), 0)
    const fullyPaid = subscribers.filter((s) => s.status === 'green').length
    const partial = subscribers.filter((s) => s.status === 'yellow').length
    const unpaid = subscribers.filter((s) => s.status === 'red').length
    return { totalCollectedToday, fullyPaid, partial, unpaid, total: subscribers.length }
  }, [subscribers, todaysPayments])

  const handleExportCSV = () => {
    const header = ['Name', 'Subscription Fee', 'Paid Amount', 'Remaining', 'Status']
    const rows = subscribers.map((s) => [
      s.name,
      s.subscription_fee,
      s.paid_amount,
      Math.max(0, s.subscription_fee - s.paid_amount),
      s.status,
    ])
    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `subscribers_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const cards = [
    { label: t('totalCollectedToday'), value: formatIQD(stats.totalCollectedToday), color: 'from-brand-500 to-brand-600' },
    { label: t('totalFullyPaid'), value: stats.fullyPaid, color: 'from-emerald-500 to-emerald-600' },
    { label: t('totalPartial'), value: stats.partial, color: 'from-amber-500 to-amber-600' },
    { label: t('totalUnpaid'), value: stats.unpaid, color: 'from-red-500 to-red-600' },
  ]

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard')}</h2>
        <button
          onClick={handleExportCSV}
          className="text-sm font-medium px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM10 2a1 1 0 011 1v9.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V3a1 1 0 011-1z" />
          </svg>
          {t('exportCSV')}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 shadow-sm"
          >
            <div className={`h-1.5 w-10 rounded-full bg-gradient-to-r ${c.color} mb-3`} />
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{c.label}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">{t('paymentHistory')}</h3>
        {todaysPayments.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('noPayments')}</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <th className="px-4 py-2.5 text-left font-semibold">{t('subscriberName')}</th>
                  <th className="px-4 py-2.5 text-left font-semibold">{t('amountPaid')}</th>
                  <th className="px-4 py-2.5 text-left font-semibold">{t('receivedTime')}</th>
                </tr>
              </thead>
              <tbody>
                {todaysPayments.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-2.5 text-slate-900 dark:text-white">{subscriberMap[p.subscriber_id] ?? '—'}</td>
                    <td className="px-4 py-2.5 text-slate-900 dark:text-white">{formatIQD(Number(p.amount_paid))}</td>
                    <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                      {p.received_at ? new Date(p.received_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
