import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSun, FiMoon, FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import useAuthStore from '../store/useAuthStore';

const Navbar = ({ darkMode, setDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();

  const navLinks = [
    { name: 'Home', href: '/', isRoute: true },
    { name: 'Courses', href: '/courses', isRoute: true },
    { name: 'About', href: '#about', isRoute: false },
  ];

  const handleNavClick = (e, link) => {
    e.preventDefault();
    setIsOpen(false);
    
    if (link.isRoute) {
      navigate(link.href);
    } else if (location.pathname === '/') {
      const element = document.querySelector(link.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <nav className='fixed w-full top-0 z-50 bg-gray-900/95 backdrop-blur-lg shadow-lg border-b border-gray-800'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-20'>
          <Link to='/' className='text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent'>
            StudySphere
          </Link>

          <div className='hidden md:flex items-center gap-10'>
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link)}
                className='text-base font-medium text-gray-300 hover:text-white transition-colors cursor-pointer'
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className='flex items-center space-x-5'>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className='p-2.5 rounded-full hover:bg-gray-800 transition-colors'
            >
              {darkMode ? <FiSun className='text-yellow-400 text-xl' /> : <FiMoon className='text-gray-300 text-xl' />}
            </button>

            {isAuthenticated ? (
              <div className='hidden md:block relative'>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold'
                >
                  <FiUser />
                  <span>{user?.name}</span>
                </button>
                
                {showUserMenu && (
                  <div className='absolute right-0 mt-2 w-56 bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-700 overflow-hidden'>
                    <Link to='/dashboard' onClick={() => setShowUserMenu(false)} className='flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors'>
                      Dashboard
                    </Link>
                    <Link to='/my-courses' onClick={() => setShowUserMenu(false)} className='flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors'>
                      My Courses
                    </Link>
                    <Link to='/profile' onClick={() => setShowUserMenu(false)} className='flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors'>
                      Profile
                    </Link>
                    {(user?.role === 'instructor' || user?.role === 'admin') && (
                      <Link to='/instructor/courses' onClick={() => setShowUserMenu(false)} className='flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border-t border-gray-700'>
                        Manage Courses
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link to='/admin' onClick={() => setShowUserMenu(false)} className='flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors'>
                        Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className='flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors w-full text-left border-t border-gray-700'>
                      <FiLogOut />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to='/login' className='hidden md:block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold'>
                Login
              </Link>
            )}

            <button onClick={() => setIsOpen(!isOpen)} className='md:hidden p-2 rounded-lg hover:bg-gray-800'>
              {isOpen ? <FiX className='text-2xl text-gray-300' /> : <FiMenu className='text-2xl text-gray-300' />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className='md:hidden pb-4'>
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={(e) => handleNavClick(e, link)} className='block py-2 text-gray-300 hover:text-white transition-colors cursor-pointer'>
                {link.name}
              </a>
            ))}
            {isAuthenticated ? (
              <>
                <Link to='/dashboard' onClick={() => setIsOpen(false)} className='block py-2 text-gray-300 hover:text-white'>Dashboard</Link>
                <Link to='/my-courses' onClick={() => setIsOpen(false)} className='block py-2 text-gray-300 hover:text-white'>My Courses</Link>
                <Link to='/profile' onClick={() => setIsOpen(false)} className='block py-2 text-gray-300 hover:text-white'>Profile</Link>
                {(user?.role === 'instructor' || user?.role === 'admin') && (
                  <Link to='/instructor/courses' onClick={() => setIsOpen(false)} className='block py-2 text-gray-300 hover:text-white'>Manage Courses</Link>
                )}
                {user?.role === 'admin' && (
                  <Link to='/admin' onClick={() => setIsOpen(false)} className='block py-2 text-gray-300 hover:text-white'>Admin Panel</Link>
                )}
                <button onClick={handleLogout} className='mt-4 w-full px-6 py-2 bg-red-600 text-white rounded-full'>Logout</button>
              </>
            ) : (
              <Link to='/login' onClick={() => setIsOpen(false)} className='mt-4 block w-full px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-center'>Login</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
