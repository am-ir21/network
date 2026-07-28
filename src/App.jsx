import React, { useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext'
import { useLanguage } from './context/LanguageContext'
import { supabase } from './supabaseClient'
import Login from './components/Login'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import SubscriberList from './components/SubscriberList'
import AddSubscriberModal from './components/AddSubscriberModal'
import UserManagement from './components/UserManagement'

export default function App() {
  const { user, isAdmin, canEdit, canDelete } = useAuth()
  const { t } = useLanguage()
  const [subscribers, setSubscribers] = useState([])
  const [todaysPayments, setTodaysPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [view, setView] = useState('subscribers')

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
      <Header onNavigate={setView} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {view === 'users' ? (
          <>
            <button
              onClick={() => setView('subscribers')}
              className="mb-4 text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {t('backToSubscribers')}
            </button>
            <UserManagement />
          </>
        ) : (
          <>
            {isAdmin && <Dashboard subscribers={subscribers} todaysPayments={todaysPayments} />}

            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('subscribersList')}</h2>
              {canEdit && (
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
          </>
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
