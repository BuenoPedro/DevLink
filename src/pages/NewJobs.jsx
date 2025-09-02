import Sidebar from '../components/Sidebar';

const jobs = [
  { id: 1, title: 'Desenvolvedor React Senior', company: 'TechCorp', location: 'São Paulo/SP', description: 'Lidere iniciativas front-end com React e RSC.' },
  { id: 2, title: 'Full Stack Developer', company: 'StartupXYZ', location: 'Remoto', description: 'Stack Node/React, CI/CD e testes.' },
  { id: 3, title: 'Frontend Engineer', company: 'DevStudio', location: 'Rio de Janeiro/RJ', description: 'Acessibilidade, performance e Design System.' },
];

export default function NewJobs() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 py-6">
      <div className="hidden lg:block lg:col-span-1"></div>

      {/* coluna central (mesmo do feed) */}
      <div className="col-span-1 lg:col-span-2 space-y-6">
        {jobs.map((job) => (
          <div key={job.id} className="card">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold">{job.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {job.company} • {job.location}
              </p>
            </div>

            <div className="p-4">
              <p className="text-gray-800 dark:text-gray-100 leading-relaxed">{job.description}</p>

              <div className="mt-4">
                <button className="btn-primary">Candidatar-se</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* sidebar direita */}
      <div className="hidden lg:block lg:col-span-1">
        <Sidebar />
      </div>
    </div>
  );
}
