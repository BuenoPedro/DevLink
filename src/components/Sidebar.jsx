import { FiExternalLink, FiTrendingUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import SidebarProfile from './SidebarProfile';

const Sidebar = () => {
  // Mock data para vagas
  const jobs = [
    { id: 1, title: 'Desenvolvedor React Senior', company: 'TechCorp', location: 'São Paulo, SP' },
    { id: 2, title: 'Full Stack Developer', company: 'StartupXYZ', location: 'Remote' },
    { id: 3, title: 'Frontend Engineer', company: 'DevStudio', location: 'Rio de Janeiro, RJ' },
  ];

  // Mock data para notícias
  const news = [
    { id: 1, title: 'React 19 Beta: Novidades e Breaking Changes', source: 'React Blog' },
    { id: 2, title: 'Como o TypeScript 5.3 Melhora a DX', source: 'TypeScript Weekly' },
    { id: 3, title: 'Tendências de Frontend para 2024', source: 'Dev Community' },
  ];

  return (
    <div className="space-y-6">
      {/* Pessoas que talvez conheça */}
      <SidebarProfile />

      {/* Bloco de Vagas */}
      <div className="card">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Novas Vagas</h2>
            <Link to="/jobs" className="text-sky-500 hover:text-sky-600 text-sm font-medium">
              Ver mais
            </Link>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 pb-3 last:pb-0">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">{job.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs mb-1">{job.company}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">{job.location}</p>
              </div>
            ))}
          </div>

          <Link to="/jobs" className="w-full mt-4 text-sky-500 hover:text-sky-600 text-sm font-medium flex items-center justify-center space-x-1">
            <span>Ver todas as vagas</span>
            <FiExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* Bloco de Notícias */}
      <div className="card">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
              <FiTrendingUp size={18} />
              <span>Notícias</span>
            </h2>
            <Link to="/news" className="text-sky-500 hover:text-sky-600 text-sm font-medium">
              Ver mais
            </Link>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            {news.map((article) => (
              <div key={article.id} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 pb-3 last:pb-0">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1 leading-tight">{article.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs">{article.source}</p>
              </div>
            ))}
          </div>

          <Link to="/news" className="w-full mt-4 text-sky-500 hover:text-sky-600 text-sm font-medium flex items-center justify-center space-x-1">
            <span>Ver mais notícias</span>
            <FiExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
