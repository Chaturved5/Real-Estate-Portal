import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import AnimatedHamburger from '../components/AnimatedHamburger.jsx'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Browse', to: '/marketplace' },
  { label: 'Owners', to: '/owner/dashboard' },
  { label: 'Brokers', to: '/brokers' },
  { label: 'Contact', to: '/contact' }
]

const bottomNavLinks = [
  { label: 'Home', to: '/', icon: 'house-chimney' },
  { label: 'Browse', to: '/marketplace', icon: 'magnifying-glass' },
  { label: 'Owners', to: '/owner/dashboard', icon: 'key' },
  { label: 'Brokers', to: '/brokers', icon: 'handshake' },
  { label: 'Contact', to: '/contact', icon: 'location-dot' }
]

const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, authLoading, hydrating } = useAuth()
  const { theme, toggleTheme, resetToSystem } = useTheme()
  const isDarkMode = theme === 'dark'
  const profileChipClass = isDarkMode
    ? 'border-white/25 bg-slate-900/80 text-white'
    : 'border-green-200/60 bg-white/80 text-green-900'
  const actionButtonClass = isDarkMode
    ? 'border-white/25 bg-slate-900/80 text-white'
    : 'border-green-200/70 bg-white/80 text-green-800'
  const menuSurfaceClass = isDarkMode
    ? 'border-white/15 bg-slate-900/95 text-green-50'
    : 'border-green-100/70 bg-white/95 text-green-900'

  useEffect(() => {
    setMobileMenuOpen(false)
    setProfileMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="living-room-background min-h-screen flex flex-col transition-colors duration-500">
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/80 shadow-sm sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 sm:h-16">
            <Link to="/" className="text-lg sm:text-2xl font-bold text-green-900 flex items-center flex-shrink-0">
              <span className="text-2xl sm:text-3xl mr-1 sm:mr-2 text-green-700" aria-hidden="true">
                <FontAwesomeIcon icon="house-chimney" />
              </span>
              <span className="hidden xs:inline">EstatePortal</span>
              <span className="xs:hidden">Estate</span>
            </Link>

            <div className="hidden md:flex flex-1 items-center justify-center space-x-6 xl:space-x-8">
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

            <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
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
                  checked={!isDarkMode}
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
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative group">
                      <Link
                        to="/profile"
                        title={`${user.name} • ${user.role}`}
                        aria-label={`${user.name} • ${user.role}`}
                        className={`flex items-center gap-2 rounded-full px-2 py-1 sm:px-2.5 sm:py-1.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 ${profileChipClass}`}
                      >
                        <span className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full shadow-inner ${isDarkMode ? 'bg-slate-800 text-green-200' : 'bg-green-100 text-green-800'}`}>
                          <FontAwesomeIcon icon="user" className={isDarkMode ? 'text-green-200' : 'text-green-800'} />
                        </span>
                      </Link>
                      <div className={`pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max max-w-[min(16rem,calc(100vw-2.5rem))] rounded-xl border ${isDarkMode ? 'border-white/15 bg-green-950 text-green-100' : 'border-green-200/70 bg-white text-green-900'} shadow-lg ring-1 ring-black/5 px-3 py-2 text-sm hidden group-hover:block group-focus-within:block animate-[fadeScale_160ms_ease-out]`}
                        role="tooltip"
                        aria-hidden="true"
                      >
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs uppercase tracking-wide opacity-80">{user.role}</p>
                        <p className="mt-1 text-xs">
                          <span className={`inline-flex items-center gap-1 ${user?.verified ? 'text-green-500' : 'text-red-500'}`}>
                            <FontAwesomeIcon icon={user?.verified ? 'shield-halved' : 'lock'} />
                            {user?.verified ? 'Verified' : 'Unverified'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <div
                        role="button"
                        tabIndex={0}
                        aria-haspopup="true"
                        aria-expanded={profileMenuOpen}
                        onClick={() => setProfileMenuOpen((open) => !open)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            setProfileMenuOpen((open) => !open)
                          }
                        }}
                        onBlur={() => setTimeout(() => setProfileMenuOpen(false), 160)}
                        className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-md text-lg shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 ml-auto ${actionButtonClass}`}
                      >
                        <AnimatedHamburger
                          checked={profileMenuOpen}
                          onChange={() => setProfileMenuOpen((open) => !open)}
                          label="Open account menu"
                        />
                        <span className="sr-only">Open account menu</span>
                      </div>

                      {profileMenuOpen && (
                        <div className={`absolute right-0 mt-2 w-56 origin-top-right rounded-xl border shadow-lg ring-1 ring-black/5 transition duration-150 ease-out animate-[fadeScale_160ms_ease-out] ${menuSurfaceClass}`}>
                          <div className="py-2 text-sm">
                            <div className="px-3 pb-2 text-left border-b border-green-100/70">
                              <p className="text-sm font-semibold">{user.name}</p>
                              <p className="text-[11px] uppercase tracking-wide opacity-80">{user.role}</p>
                            </div>
                            <Link
                              to="/profile"
                              className={`flex items-center gap-2 px-3 py-2 hover:bg-green-50 ${isDarkMode ? 'hover:bg-white/5' : ''}`}
                            >
                              <span className="text-green-700">
                                <FontAwesomeIcon icon="user" />
                              </span>
                              Profile
                            </Link>
                            <Link
                              to="/profile?complete=true"
                              className={`flex items-center gap-2 px-3 py-2 hover:bg-green-50 ${isDarkMode ? 'hover:bg-white/5' : ''}`}
                            >
                              <span className="text-green-700">
                                <FontAwesomeIcon icon="clipboard-list" />
                              </span>
                              Complete Profile
                            </Link>
                            <Link
                              to="/dashboard"
                              className={`flex items-center gap-2 px-3 py-2 hover:bg-green-50 ${isDarkMode ? 'hover:bg-white/5' : ''}`}
                            >
                              <span className="text-green-700">
                                <FontAwesomeIcon icon="key" />
                              </span>
                              Dashboard
                            </Link>
                            <Link
                              to="/settings/account"
                              className={`flex items-center gap-2 px-3 py-2 hover:bg-green-50 ${isDarkMode ? 'hover:bg-white/5' : ''}`}
                            >
                              <span className="text-green-700">
                                <FontAwesomeIcon icon="shield-halved" />
                              </span>
                              Account Settings
                            </Link>
                            <Link
                              to="/notifications"
                              className={`flex items-center gap-2 px-3 py-2 hover:bg-green-50 ${isDarkMode ? 'hover:bg-white/5' : ''}`}
                            >
                              <span className="text-green-700">
                                <FontAwesomeIcon icon="bell" />
                              </span>
                              Notifications
                            </Link>
                            <button
                              type="button"
                              onClick={async () => {
                                await logout()
                                setProfileMenuOpen(false)
                                navigate('/')
                              }}
                              disabled={authLoading || hydrating}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-green-50 ${isDarkMode ? 'hover:bg-white/5' : ''} disabled:opacity-60`}
                            >
                              <span className="text-green-700">
                                <FontAwesomeIcon icon="arrow-right-long" />
                              </span>
                              Logout
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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

            <div className="hidden p-1 ml-1">
              <AnimatedHamburger
                checked={mobileMenuOpen}
                onChange={() => setMobileMenuOpen((open) => !open)}
                label="Toggle navigation"
              />
            </div>
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
                    checked={!isDarkMode}
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

      <main className="flex-1 relative z-10 max-[767px]:pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))]">
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
                  <a
                    href="#"
                    className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg sm:text-xl transition duration-200 ease-out hover:scale-110 hover:text-green-200 hover:shadow-[0_0_16px_rgba(74,222,128,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-green-900"
                    aria-label="Facebook"
                  >
                    <FontAwesomeIcon icon={["fab", "facebook"]} />
                  </a>
                  <a
                    href="#"
                    className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg sm:text-xl transition duration-200 ease-out hover:scale-110 hover:text-green-200 hover:shadow-[0_0_16px_rgba(74,222,128,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-green-900"
                    aria-label="Twitter"
                  >
                    <FontAwesomeIcon icon={["fab", "twitter"]} />
                  </a>
                  <a
                    href="#"
                    className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg sm:text-xl transition duration-200 ease-out hover:scale-110 hover:text-green-200 hover:shadow-[0_0_16px_rgba(74,222,128,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-green-900"
                    aria-label="Instagram"
                  >
                    <FontAwesomeIcon icon={["fab", "instagram"]} />
                  </a>
                  <a
                    href="#"
                    className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg sm:text-xl transition duration-200 ease-out hover:scale-110 hover:text-green-200 hover:shadow-[0_0_16px_rgba(74,222,128,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-green-900"
                    aria-label="LinkedIn"
                  >
                    <FontAwesomeIcon icon={["fab", "linkedin"]} />
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

      <nav className="fixed inset-x-0 bottom-0 z-50 hidden max-[767px]:block px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.85rem)]">
        <div
          className={`mx-auto max-w-7xl rounded-2xl border shadow-lg backdrop-blur-md ${
            isDarkMode
              ? 'border-white/15 bg-slate-900/90 text-green-50'
              : 'border-green-200/70 bg-white/95 text-green-900'
          }`}
        >
          <ul className={`grid grid-cols-5 divide-x ${isDarkMode ? 'divide-white/10' : 'divide-green-100'}`}>
            {bottomNavLinks.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors ${
                      isActive
                        ? isDarkMode
                          ? 'text-green-300'
                          : 'text-green-700'
                        : isDarkMode
                          ? 'text-green-100'
                          : 'text-green-900'
                    }`
                  }
                >
                  <FontAwesomeIcon
                    icon={item.icon}
                    className={`text-base mb-1 ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}
                  />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  )
}

export default MainLayout
