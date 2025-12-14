import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useAuth } from '../context/AuthContext.jsx'
import NotificationBell from '../components/NotificationBell.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Browse', to: '/marketplace' },
  { label: 'For Owners', to: '/owners' },
  { label: 'For Brokers', to: '/brokers' },
  { label: 'Contact', to: '/contact' }
]

const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, authLoading, hydrating } = useAuth()
  const { theme, toggleTheme, resetToSystem } = useTheme()
  const isDarkMode = theme === 'dark'

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="living-room-background min-h-screen flex flex-col transition-colors duration-500">
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/80 shadow-sm sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link to="/" className="text-lg sm:text-2xl font-bold text-green-900 flex items-center">
              <span className="text-2xl sm:text-3xl mr-1 sm:mr-2 text-green-700" aria-hidden="true">
                <FontAwesomeIcon icon="house-chimney" />
              </span>
              <span className="hidden xs:inline">EstatePortal</span>
              <span className="xs:hidden">Estate</span>
            </Link>

            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `nav-link text-sm xl:text-base ${isActive ? 'nav-link-active' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="hidden sm:flex items-center space-x-3">
              <label
                className="theme-switch"
                title="Right-click to follow system preference"
                onContextMenu={(event) => {
                  event.preventDefault()
                  resetToSystem()
                }}
              >
                <span className="sr-only">Toggle theme</span>
                <input
                  type="checkbox"
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  checked={isDarkMode}
                  onChange={toggleTheme}
                />
                <span className="theme-switch__slider" aria-hidden="true">
                  <span className="theme-switch__star theme-switch__star--1" />
                  <span className="theme-switch__star theme-switch__star--2" />
                  <span className="theme-switch__star theme-switch__star--3" />
                  <svg viewBox="0 0 16 16" className="theme-switch__cloud">
                    <path
                      transform="matrix(.77976 0 0 .78395-299.99-418.63)"
                      fill="#fff"
                      d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925"
                    />
                  </svg>
                </span>
              </label>
              {isAuthenticated ? (
                <>
                  <NotificationBell />
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-900">{user.name}</p>
                    <p className="text-xs uppercase tracking-wide text-green-600">{user.role}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      await logout()
                      setMobileMenuOpen(false)
                      navigate('/')
                    }}
                    disabled={authLoading || hydrating}
                    className="border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors disabled:opacity-60"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm sm:text-base text-green-900 hover:text-green-600 transition-colors font-medium px-2 sm:px-0"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-green-700 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-green-800 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            <button
              className="lg:hidden text-green-900 text-2xl sm:text-3xl p-1"
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              <span className="sr-only">Toggle navigation</span>
              <FontAwesomeIcon icon={mobileMenuOpen ? 'xmark' : 'bars'} />
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden py-4 space-y-3 mobile-nav-panel mt-3">
              <div className="flex items-center justify-between border border-green-200/50 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-gray-600">Appearance</span>
                <label
                  className="theme-switch"
                  title="Right-click to follow system preference"
                  onContextMenu={(event) => {
                    event.preventDefault()
                    resetToSystem()
                  }}
                >
                  <span className="sr-only">Toggle theme</span>
                  <input
                    type="checkbox"
                    aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    checked={isDarkMode}
                    onChange={toggleTheme}
                  />
                  <span className="theme-switch__slider" aria-hidden="true">
                    <span className="theme-switch__star theme-switch__star--1" />
                    <span className="theme-switch__star theme-switch__star--2" />
                    <span className="theme-switch__star theme-switch__star--3" />
                    <svg viewBox="0 0 16 16" className="theme-switch__cloud">
                      <path
                        transform="matrix(.77976 0 0 .78395-299.99-418.63)"
                        fill="#fff"
                        d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925"
                      />
                    </svg>
                  </span>
                </label>
              </div>
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `block py-2 font-semibold rounded-lg px-2 transition-colors ${
                      isActive ? 'bg-green-50 text-green-700' : 'text-green-900 hover:text-green-600'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="pt-4 space-y-2 sm:hidden">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 border border-green-200 text-green-700 font-medium rounded-lg text-center hover:bg-green-50 transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        await logout()
                        setMobileMenuOpen(false)
                        navigate('/')
                      }}
                      disabled={authLoading || hydrating}
                      className="w-full py-2 border border-green-200 text-green-700 font-medium rounded-lg hover:bg-green-50 transition-colors disabled:opacity-60"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block py-2 text-green-900 hover:text-green-600 font-medium transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block py-2 bg-green-700 text-white text-center rounded-lg hover:bg-green-800"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      <footer className="bg-green-900 text-white py-8 sm:py-12 relative z-10" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">About</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li>
                  <Link to="/about" className="text-xs sm:text-sm md:text-base hover:text-green-300 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="text-xs sm:text-sm md:text-base hover:text-green-300 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="/press" className="text-xs sm:text-sm md:text-base hover:text-green-300 transition-colors">
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">Resources</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li>
                  <Link to="/blog" className="text-xs sm:text-sm md:text-base hover:text-green-300 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/guides" className="text-xs sm:text-sm md:text-base hover:text-green-300 transition-colors">
                    Buying Guides
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-xs sm:text-sm md:text-base hover:text-green-300 transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">Legal</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li>
                  <Link to="/terms" className="text-xs sm:text-sm md:text-base hover:text-green-300 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-xs sm:text-sm md:text-base hover:text-green-300 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-xs sm:text-sm md:text-base hover:text-green-300 transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">Contact</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li>
                  <a
                    href="mailto:support@estateportal.com"
                    className="text-xs sm:text-sm md:text-base hover:text-green-300 transition-colors break-words"
                  >
                    support@estateportal.com
                  </a>
                </li>
                <li>
                  <a href="tel:+911234567890" className="text-xs sm:text-sm md:text-base hover:text-green-300 transition-colors">
                    +91 123 456 7890
                  </a>
                </li>
                <li className="flex space-x-3 sm:space-x-4 mt-3 sm:mt-4">
                  <a href="#" className="hover:text-green-300 transition-colors text-xl sm:text-2xl" aria-label="Facebook">
                    📘
                  </a>
                  <a href="#" className="hover:text-green-300 transition-colors text-xl sm:text-2xl" aria-label="Twitter">
                    🐦
                  </a>
                  <a href="#" className="hover:text-green-300 transition-colors text-xl sm:text-2xl" aria-label="Instagram">
                    📷
                  </a>
                  <a href="#" className="hover:text-green-300 transition-colors text-xl sm:text-2xl" aria-label="LinkedIn">
                    💼
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-green-700 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
            <p>&copy; 2025 EstatePortal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
