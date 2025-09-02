import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function SidebarProfile() {
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.get('/api/users/me/suggestions?limit=6');
        if (!mounted) return;
        setPeople(data.users || []);
      } catch (e) {
        // se não autenticado, só não mostra sugestões
        setError(e?.message || 'Falha ao carregar sugestões');
      } finally {
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <div className="card">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pessoas que talvez conheça</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Baseado em competências semelhantes</p>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-sm text-gray-600 dark:text-gray-300">Carregando…</div>
        ) : error ? (
          <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
        ) : people.length === 0 ? (
          <div className="text-sm text-gray-600 dark:text-gray-300">Sem sugestões no momento.</div>
        ) : (
          <ul className="space-y-3">
            {people.map((p) => {
              const name = p?.profile?.displayName || p.email;
              const avatar = p?.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff`;

              // mostrar até 3 skills em comum (overlap vem do backend)
              const tags = (p.overlap || []).slice(0, 3);

              return (
                <li key={p.id} className="flex items-start gap-3">
                  <img src={avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/user/${p.id}`} className="block font-medium text-gray-900 dark:text-gray-100 truncate hover:underline" title={name}>
                      {name}
                    </Link>
                    {p.headline && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={p.headline}>
                        {p.headline}
                      </p>
                    )}
                    {tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {tags.map((t) => (
                          <span
                            key={t}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border border-sky-100 dark:border-sky-800"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link
                    to={`/user/${p.id}`}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                  >
                    Ver perfil
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
