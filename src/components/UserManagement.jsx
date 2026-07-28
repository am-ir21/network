import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import AddUserModal from './AddUserModal'

const ROLE_STYLES = {
  admin: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  data_entry: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  viewer: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
}

export default function UserManagement() {
  const { t } = useLanguage()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editRole, setEditRole] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [message, setMessage] = useState('')

  const showMessage = useCallback((msg) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }, [])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, role, is_active, last_login, created_at')
      .order('created_at', { ascending: true })
    if (!error) setUsers(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const roleLabel = (role) => {
    if (role === 'admin') return t('roleAdmin')
    if (role === 'data_entry') return t('roleDataEntry')
    if (role === 'viewer') return t('roleViewer')
    return role
  }

  const startEdit = (u) => {
    setEditingUser(u)
    setEditRole(u.role)
  }

  const saveEdit = async () => {
    if (!editingUser) return
    const { error } = await supabase
      .from('users')
      .update({ role: editRole })
      .eq('id', editingUser.id)
    if (error) {
      showMessage(error.message)
    } else {
      showMessage(t('userUpdated'))
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, role: editRole } : u)))
      setEditingUser(null)
    }
  }

  const toggleActive = async (u) => {
    if (u.id === currentUser.id) {
      showMessage(t('cannotDisableSelf'))
      return
    }
    const { error } = await supabase
      .from('users')
      .update({ is_active: !u.is_active })
      .eq('id', u.id)
    if (error) {
      showMessage(error.message)
    } else {
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_active: !u.is_active } : x)))
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    if (deletingId === currentUser.id) {
      showMessage(t('cannotDeleteSelf'))
      setDeletingId(null)
      return
    }
    const { error } = await supabase.from('users').delete().eq('id', deletingId)
    if (error) {
      showMessage(error.message)
    } else {
      showMessage(t('userDeleted'))
      setUsers((prev) => prev.filter((u) => u.id !== deletingId))
    }
    setDeletingId(null)
  }

  const formatLogin = (ts) => {
    if (!ts) return '—'
    return new Date(ts).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('usersManagement')}</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="text-sm font-medium px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
          </svg>
          {t('addUser')}
        </button>
      </div>

      {message && (
        <div className="mb-3 rounded-xl bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 px-4 py-2.5 text-sm text-brand-700 dark:text-brand-300">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500 dark:text-slate-400">{t('loading')}</p>
      ) : (
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-3 text-start font-semibold text-slate-500 dark:text-slate-400">{t('usernameLabel')}</th>
                  <th className="px-4 py-3 text-start font-semibold text-slate-500 dark:text-slate-400">{t('email')}</th>
                  <th className="px-4 py-3 text-start font-semibold text-slate-500 dark:text-slate-400">{t('role')}</th>
                  <th className="px-4 py-3 text-start font-semibold text-slate-500 dark:text-slate-400">{t('accountStatus')}</th>
                  <th className="px-4 py-3 text-start font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{t('lastLogin')}</th>
                  <th className="px-4 py-3 text-start font-semibold text-slate-500 dark:text-slate-400">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      —
                    </td>
                  </tr>
                )}
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 dark:border-slate-800/60 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {u.username}
                      {u.id === currentUser.id && <span className="ms-2 text-xs text-brand-600 dark:text-brand-400">(you)</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{u.email || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {editingUser?.id === u.id ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="admin">{t('roleAdmin')}</option>
                          <option value="data_entry">{t('roleDataEntry')}</option>
                          <option value="viewer">{t('roleViewer')}</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_STYLES[u.role] || ROLE_STYLES.viewer}`}>
                          {roleLabel(u.role)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${u.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {u.is_active ? t('active') : t('disabled')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                      {formatLogin(u.last_login)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {editingUser?.id === u.id ? (
                          <>
                            <button
                              onClick={saveEdit}
                              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                            >
                              {t('save')}
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                              {t('cancel')}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(u)}
                              className="text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                              {t('editUser')}
                            </button>
                            <button
                              onClick={() => toggleActive(u)}
                              disabled={u.id === currentUser.id}
                              className="text-xs font-medium px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {u.is_active ? t('deactivate') : t('activate')}
                            </button>
                            <button
                              onClick={() => setDeletingId(u.id)}
                              disabled={u.id === currentUser.id}
                              className="text-xs font-medium px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {t('delete')}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onAdded={(newUser) => {
            setUsers((prev) => [...prev, newUser])
            showMessage(t('userAdded'))
          }}
        />
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
            <p className="text-slate-700 dark:text-slate-200 mb-5">{t('confirmDeleteUser')}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {t('no')}
              </button>
              <button
                onClick={handleDelete}
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
