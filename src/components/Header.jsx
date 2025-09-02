import React, { useState } from 'react';
import { FiHome, FiBriefcase, FiBell, FiUser, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import LoginModal from './LoginModal';

const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const [loginOpen, setLoginOpen] = useState(false);

  function handleProfileClick(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/user';
    } else {
      setLoginOpen(true);
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-sky-500 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-white text-xl font-bold">DevLink</h1>
            </div>
          </div>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-white hover:text-sky-200 transition-colors" title="Início">
              <FiHome size={20} />
            </a>
            <a href="/jobs" className="text-white hover:text-sky-200 transition-colors" title="Vagas">
              <FiBriefcase size={20} />
            </a>
            <a href="/news" className="text-white hover:text-sky-200 transition-colors" title="Notícias">
              <FiBell size={20} />
            </a>
            <a href="#" onClick={handleProfileClick} className="text-white hover:text-sky-200 transition-colors" title="Perfil">
              <FiUser size={20} />
            </a>
          </nav>

          {/* Busca + Theme (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-full py-2 pl-4 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300 w-64"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white" aria-label="Buscar">
                <FiSearch size={16} />
              </button>
            </div>
            <ThemeToggle />
          </div>

          {/* Botão menu mobile */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white hover:text-sky-200 transition-colors" aria-label="Menu">
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-sky-600 border-t border-sky-400">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Busca mobile */}
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full bg-white rounded-full py-2 pl-4 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" aria-label="Buscar">
                  <FiSearch size={16} />
                </button>
              </div>

              <a href="/" className="flex items-center px-3 py-2 text-white hover:bg-sky-700 rounded-md transition-colors">
                <FiHome size={20} className="mr-3" />
                Home
              </a>
              <a href="/jobs" className="flex items-center px-3 py-2 text-white hover:bg-sky-700 rounded-md transition-colors">
                <FiBriefcase size={20} className="mr-3" />
                Vagas
              </a>
              <a href="/news" className="flex items-center px-3 py-2 text-white hover:bg-sky-700 rounded-md transition-colors">
                <FiBell size={20} className="mr-3" />
                Notícias
              </a>
              <a
                href="#"
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  handleProfileClick(e);
                }}
                className="flex items-center px-3 py-2 text-white hover:bg-sky-700 rounded-md transition-colors"
              >
                <FiUser size={20} className="mr-3" />
                Perfil
              </a>

              <div className="px-3 pt-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de login (global no Header) */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
};

export default Header;
