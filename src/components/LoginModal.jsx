import React, { useEffect, useRef, useState } from 'react';
import { FiX, FiMail, FiLock, FiUser } from 'react-icons/fi';
import { api } from '../lib/api';

export default function LoginModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const overlayRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // forms
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // fecha no ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // limpa ao abrir
  useEffect(() => {
    if (isOpen) {
      setError('');
      setLoading(false);
      // mantém valores se quiser; ou zera:
      // setEmail(''); setPassword(''); setDisplayName('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        const r = await api.post('/api/auth/login', { email, password });
        localStorage.setItem('token', r.token);
      } else {
        const r = await api.post('/api/auth/register', { email, password, displayName });
        localStorage.setItem('token', r.token);
      }
      onClose?.();
      // vai para /user
      window.location.href = '/user';
    } catch (err) {
      setError(err?.message || 'Falha na autenticação');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="w-full max-w-md mx-4 rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="inline-flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{tab === 'login' ? 'Entrar' : 'Criar conta'}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300" aria-label="Fechar">
            <FiX size={18} />
          </button>
        </div>

        {/* tabs */}
        <div className="px-5 pt-4">
          <div className="inline-flex rounded-full bg-gray-100 dark:bg-gray-800 p-1">
            <button
              onClick={() => setTab('login')}
              className={
                'px-4 py-1 rounded-full text-sm ' + (tab === 'login' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow' : 'text-gray-600 dark:text-gray-300')
              }
            >
              Login
            </button>
            <button
              onClick={() => setTab('register')}
              className={
                'px-4 py-1 rounded-full text-sm ' + (tab === 'register' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow' : 'text-gray-600 dark:text-gray-300')
              }
            >
              Registrar
            </button>
          </div>
        </div>

        {/* body */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          {tab === 'register' && (
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Nome público</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiUser />
                </span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-lg pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="Seu nome"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FiMail />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="voce@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Senha</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FiLock />
              </span>
              <input
                type="password"
                value={password}
                minLength={6}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="w-full mt-2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-medium py-2 transition-colors">
            {loading ? 'Enviando...' : tab === 'login' ? 'Entrar' : 'Criar conta'}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Ao continuar você concorda com nossos termos.</p>
        </form>
      </div>
    </div>
  );
}
