import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'

export default function Header({ onNavigate }) {
  const { user, logout, canManageUsers } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { t, lang, toggleLang } = useLanguage()

  const roleLabel = (role) => {
    if (role === 'admin') return t('roleAdmin')
    if (role === 'data_entry') return t('roleDataEntry')
    if (role === 'viewer') return t('roleViewer')
    return role
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold shadow-sm">
            ₪
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">{t('appName')}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
              {t('loggedInAs')}: <span className="font-medium">{user?.username}</span> ·{' '}
              {roleLabel(user?.role)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canManageUsers && (
            <button
              onClick={() => onNavigate?.('users')}
              className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16.5V18h-6v-1h-.07zM4.5 13a4.5 4.5 0 014.5 4.5V18H0v-.5A4.5 4.5 0 014.5 13z" />
              </svg>
              <span className="hidden sm:inline">{t('manageUsers')}</span>
            </button>
          )}

          <button
            onClick={toggleLang}
            className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t('language')}
          >
            {lang === 'en' ? 'العربية' : 'English'}
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? t('lightMode') : t('darkMode')}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          <button
            onClick={logout}
            className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/70 transition-colors"
          >
            {t('logout')}
          </button>
        </div>
      </div>
    </header>
  )
}
