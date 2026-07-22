import React, { useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext'
import { useLanguage } from './context/LanguageContext'
import { supabase } from './supabaseClient'
import Login from './components/Login'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import SubscriberList from './components/SubscriberList'
import AddSubscriberModal from './components/AddSubscriberModal'

export default function App() {
  const { user, isAdmin } = useAuth()
  const { t } = useLanguage()
  const [subscribers, setSubscribers] = useState([])
  const [todaysPayments, setTodaysPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function loadData() {
      setLoading(true)
      const { data: subsData } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false })

      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const { data: paymentsData } = await supabase
        .from('payment_history')
        .select('*')
        .gte('created_at', startOfDay.toISOString())

      if (!cancelled) {
        setSubscribers(subsData || [])
        setTodaysPayments(paymentsData || [])
        setLoading(false)
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) return <Login />

  const handlePaymentRecorded = (paymentRecord) => {
    setTodaysPayments((prev) => [...prev, paymentRecord])
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {isAdmin && <Dashboard subscribers={subscribers} todaysPayments={todaysPayments} />}

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('subscribersList')}</h2>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="text-sm font-medium px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
              </svg>
              {t('addSubscriber')}
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-slate-500 dark:text-slate-400">{t('loading')}</p>
        ) : (
          <SubscriberList
            subscribers={subscribers}
            setSubscribers={setSubscribers}
            payments={todaysPayments}
            onPaymentRecorded={handlePaymentRecorded}
          />
        )}
      </main>

      {showAddModal && (
        <AddSubscriberModal
          onClose={() => setShowAddModal(false)}
          onAdded={(newSub) => setSubscribers((prev) => [newSub, ...prev])}
        />
      )}
    </div>
  )
}
