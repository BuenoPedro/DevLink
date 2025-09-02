import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { FiEdit2, FiPlus, FiTrash2, FiBriefcase, FiUser, FiGlobe, FiMapPin, FiGithub } from 'react-icons/fi';
import SidebarProfile from '../components/SidebarProfile';

export default function UserProfile() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('perfil'); // perfil | experiencias | competencias

  // form perfil
  const [form, setForm] = useState({
    displayName: '',
    headline: '',
    bio: '',
    avatarUrl: '',
    location: '',
    websiteUrl: '',
    githubUrl: '',
    birthDate: '',
  });

  // skills
  const [skills, setSkills] = useState([]);
  const [skillForm, setSkillForm] = useState({ name: '', proficiency: 3, yearsExp: 0 });

  // experiências
  const [exps, setExps] = useState([]);
  const [expForm, setExpForm] = useState({
    id: null,
    company: '',
    title: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  });

  const canSaveProfile = useMemo(() => true, []);

  useEffect(() => {
    let mounted = true;
    api
      .get('/api/auth/me')
      .then((r) => {
        if (!mounted) return;
        setMe(r.user);
        const p = r.user?.profile ?? {};
        setForm({
          displayName: p.displayName || '',
          headline: p.headline || '',
          bio: p.bio || '',
          avatarUrl: p.avatarUrl || '',
          location: p.location || '',
          websiteUrl: p.websiteUrl || '',
          githubUrl: p.githubUrl || '',
          birthDate: p.birthDate ? p.birthDate.slice(0, 10) : '',
        });
        setSkills(r.user?.skills || []);
        setExps(r.user?.experiences || []);
      })
      .catch(() => (window.location.href = '/'))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const profile = me?.profile || {};

  // -------- Perfil
  const saveProfile = async (e) => {
    e?.preventDefault?.();
    if (!canSaveProfile) return;
    const payload = { ...form };
    try {
      const r = await api.put('/api/users/me/profile', payload);
      // atualiza perfil local
      setMe((old) => {
        const next = { ...(old || {}), ...r.user };
        next.profile = r.user.profile;
        return next;
      });
      setOpen(false);
    } catch (err) {
      alert(err.message || 'Falha ao salvar perfil');
    }
  };

  // -------- Skills
  const addSkill = async (e) => {
    e?.preventDefault?.();
    if (!skillForm.name.trim()) return;
    try {
      const r = await api.post('/api/skills/me', {
        name: skillForm.name.trim(),
        proficiency: Number(skillForm.proficiency) || 3,
        yearsExp: Number(skillForm.yearsExp) || 0,
      });
      const link = {
        userId: me.id,
        skillId: r.skill.id,
        proficiency: r.skill.link.proficiency,
        yearsExp: r.skill.link.yearsExp,
        skill: { id: r.skill.id, name: r.skill.name },
      };
      setSkills((prev) => {
        const exists = prev.some((s) => String(s.skillId) === String(link.skillId));
        return exists ? prev.map((s) => (String(s.skillId) === String(link.skillId) ? link : s)) : [link, ...prev];
      });
      setSkillForm({ name: '', proficiency: 3, yearsExp: 0 });
    } catch (err) {
      alert(err.message || 'Falha ao adicionar competência');
    }
  };

  const removeSkill = async (skillId) => {
    if (!confirm('Remover esta competência?')) return;
    try {
      await api.del(`/api/skills/me/${skillId}`);
      setSkills((prev) => prev.filter((s) => String(s.skillId) !== String(skillId)));
    } catch (err) {
      alert(err.message || 'Falha ao remover competência');
    }
  };

  // -------- Experiências
  const resetExpForm = () => setExpForm({ id: null, company: '', title: '', startDate: '', endDate: '', isCurrent: false, description: '' });

  const editExp = (exp) => {
    setTab('experiencias');
    setOpen(true);
    setExpForm({
      id: exp.id,
      company: exp.company,
      title: exp.title,
      startDate: exp.startDate?.slice(0, 10) || '',
      endDate: exp.endDate ? exp.endDate.slice(0, 10) : '',
      isCurrent: !!exp.isCurrent,
      description: exp.description || '',
    });
  };

  const submitExp = async (e) => {
    e?.preventDefault?.();
    const payload = {
      company: expForm.company,
      title: expForm.title,
      startDate: expForm.startDate,
      endDate: expForm.isCurrent ? null : expForm.endDate || null,
      isCurrent: !!expForm.isCurrent,
      description: expForm.description || '',
    };
    try {
      if (expForm.id) {
        const r = await api.put(`/api/experiences/${expForm.id}`, payload);
        setExps((prev) => prev.map((x) => (String(x.id) === String(r.experience.id) ? r.experience : x)));
      } else {
        const r = await api.post('/api/experiences/me', payload);
        setExps((prev) => [r.experience, ...prev]);
      }
      resetExpForm();
      // não fecha o drawer para permitir cadastros em sequência
    } catch (err) {
      alert(err.message || 'Falha ao salvar experiência');
    }
  };

  const removeExp = async (id) => {
    if (!confirm('Excluir esta experiência?')) return;
    try {
      await api.del(`/api/experiences/${id}`);
      setExps((prev) => prev.filter((x) => String(x.id) !== String(id)));
    } catch (err) {
      alert(err.message || 'Falha ao excluir experiência');
    }
  };

  if (loading) {
    return <div className="pt-24 max-w-4xl mx-auto px-4 text-gray-600 dark:text-gray-300">Carregando...</div>;
  }
  if (!me) return null;

  return (
    <div className="pt-24 max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUNA PRINCIPAL */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <img
                src={profile.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.displayName || me.email)}
                alt=""
                className="w-20 h-20 rounded-full object-cover"
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.displayName || me.email}</h1>
                {profile.headline && <p className="text-gray-600 dark:text-gray-300">{profile.headline}</p>}
                {profile.location && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{profile.location}</p>}

                {/* socials sem LinkedIn */}
                <div className="flex gap-3 mt-2 text-sm">
                  {profile.websiteUrl && (
                    <a className="inline-flex items-center gap-1 text-sky-600 hover:underline" href={profile.websiteUrl} target="_blank" rel="noreferrer">
                      <FiGlobe /> Website
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a className="inline-flex items-center gap-1 text-sky-600 hover:underline" href={profile.githubUrl} target="_blank" rel="noreferrer">
                      <FiGithub /> GitHub
                    </a>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setTab('perfil');
                  setOpen(true);
                }}
                className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white"
              >
                <FiEdit2 /> Editar perfil
              </button>
            </div>

            {profile.bio && <p className="mt-4 text-gray-700 dark:text-gray-200 whitespace-pre-line">{profile.bio}</p>}

            {/* Competências (read-only na página; edição no drawer/aba) */}
            <div className="mt-6">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Competências</h2>
              {skills?.length ? (
                <ul className="grid sm:grid-cols-2 gap-2">
                  {skills.map((s) => (
                    <li key={s.skillId} className="rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 bg-gray-50 dark:bg-gray-800">
                      <div className="text-gray-900 dark:text-gray-100 font-medium">{s.skill.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Proficiência: {s.proficiency}/5 {s.yearsExp ? `• ${s.yearsExp} ano(s)` : ''}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Sem competências ainda.</p>
              )}
            </div>

            {/* Experiências (read-only na página; CRUD no drawer) */}
            <div className="mt-8">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Experiências</h2>
              <div className="space-y-3">
                {exps.length ? (
                  exps.map((e) => (
                    <div key={e.id} className="rounded-lg border border-gray-200 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <FiBriefcase /> {e.title} — {e.company}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(e.startDate).toLocaleDateString()} — {e.isCurrent ? 'Atual' : e.endDate ? new Date(e.endDate).toLocaleDateString() : '—'}
                          </div>
                          {e.description && <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line">{e.description}</p>}
                        </div>
                        <div className="flex gap-2">
                          <button className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200" onClick={() => editExp(e)}>
                            Editar
                          </button>
                          <button className="px-2 py-1 rounded bg-red-600 text-white" onClick={() => removeExp(e.id)}>
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sem experiências cadastradas.</p>
                )}

                <button
                  onClick={() => {
                    resetExpForm();
                    setTab('experiencias');
                    setOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  <FiPlus /> Adicionar experiência
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR DIREITA */}
        <div className="space-y-6">
          <SidebarProfile />
        </div>
      </div>

      {/* DRAWER à direita */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
          <div className="w-full max-w-xl h-full overflow-y-auto bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 p-6">
            {/* Abas */}
            <div className="flex gap-2 mb-4">
              {[
                { key: 'perfil', label: 'Perfil', icon: <FiUser /> },
                { key: 'experiencias', label: 'Experiências', icon: <FiBriefcase /> },
                { key: 'competencias', label: 'Competências', icon: <FiPlus /> },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={
                    'inline-flex items-center gap-2 px-3 py-2 rounded-lg ' +
                    (tab === t.key ? 'bg-sky-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200')
                  }
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Conteúdo por aba */}
            {tab === 'perfil' && (
              <form onSubmit={saveProfile} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Nome público</label>
                    <input
                      className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      value={form.displayName}
                      onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Headline</label>
                    <input
                      className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      value={form.headline}
                      onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Avatar URL</label>
                    <input
                      type="url"
                      className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      value={form.avatarUrl}
                      onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Localização</label>
                    <div className="flex items-center gap-2">
                      <FiMapPin className="text-gray-500" />
                      <input
                        className="flex-1 rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        value={form.location}
                        onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Website</label>
                    <div className="flex items-center gap-2">
                      <FiGlobe className="text-gray-500" />
                      <input
                        type="url"
                        className="flex-1 rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        value={form.websiteUrl}
                        onChange={(e) => setForm((f) => ({ ...f, websiteUrl: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">GitHub</label>
                    <div className="flex items-center gap-2">
                      <FiGithub className="text-gray-500" />
                      <input
                        type="url"
                        className="flex-1 rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        value={form.githubUrl}
                        onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Data de nascimento</label>
                    <input
                      type="date"
                      className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      value={form.birthDate || ''}
                      onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                  <textarea
                    rows={5}
                    className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white">
                    Salvar
                  </button>
                </div>
              </form>
            )}

            {tab === 'experiencias' && (
              <form onSubmit={submitExp} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Empresa</label>
                    <input
                      className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      value={expForm.company}
                      onChange={(e) => setExpForm((v) => ({ ...v, company: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Cargo</label>
                    <input
                      className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      value={expForm.title}
                      onChange={(e) => setExpForm((v) => ({ ...v, title: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Início</label>
                    <input
                      type="date"
                      className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      value={expForm.startDate}
                      onChange={(e) => setExpForm((v) => ({ ...v, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                      Término <small className="text-red-400">(Se for o atual, confirme abaixo)</small>
                    </label>
                    <input
                      type="date"
                      disabled={expForm.isCurrent}
                      className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-60"
                      value={expForm.endDate}
                      onChange={(e) => setExpForm((v) => ({ ...v, endDate: e.target.value }))}
                    />
                    <div className="mt-2 text-sm">
                      <label className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={expForm.isCurrent} onChange={(e) => setExpForm((v) => ({ ...v, isCurrent: e.target.checked }))} />
                        Emprego atual
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                  <textarea
                    rows={4}
                    className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={expForm.description}
                    onChange={(e) => setExpForm((v) => ({ ...v, description: e.target.value }))}
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <button type="button" onClick={resetExpForm} className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    Limpar
                  </button>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                      Fechar
                    </button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white">
                      {expForm.id ? 'Salvar alterações' : 'Adicionar experiência'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {tab === 'competencias' && (
              <div className="space-y-4">
                <form onSubmit={addSkill} className="rounded-lg border border-gray-200 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-800">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                      <input
                        className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        value={skillForm.name}
                        onChange={(e) => setSkillForm((v) => ({ ...v, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Proficiência (1-5)</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        value={skillForm.proficiency}
                        onChange={(e) => setSkillForm((v) => ({ ...v, proficiency: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Anos de exp.</label>
                      <input
                        type="number"
                        min={0}
                        max={60}
                        step="0.5"
                        className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        value={skillForm.yearsExp}
                        onChange={(e) => setSkillForm((v) => ({ ...v, yearsExp: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-right">
                    <button className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white" type="submit">
                      Adicionar
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  {skills.length ? (
                    skills.map((s) => (
                      <div key={s.skillId} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-900">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{s.skill.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Proficiência: {s.proficiency}/5 {s.yearsExp ? `• ${s.yearsExp} ano(s)` : ''}
                          </div>
                        </div>
                        <button onClick={() => removeSkill(s.skillId)} className="px-2 py-1 rounded bg-red-600 text-white">
                          <FiTrash2 />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sem competências ainda.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
