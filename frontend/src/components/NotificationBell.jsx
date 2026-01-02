import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNotifications } from '../context/NotificationContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const truncate = (value, max = 120) => (value.length > max ? `${value.slice(0, max)}…` : value)

const NotificationBell = () => {
  const { user } = useAuth()
  const { getNotificationsForRole, markAsRead, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)

  const notifications = useMemo(() => getNotificationsForRole(user?.role), [getNotificationsForRole, user])

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications])

  if (!user) {
    return null
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-green-200 text-green-800 hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={unreadCount ? `${unreadCount} unread notifications` : 'Notifications'}
      >
        <FontAwesomeIcon icon="bell" className="text-lg" />
        {!!unreadCount && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-600 text-[10px] text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-green-100 rounded-2xl shadow-xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-amber-100">
            <p className="text-sm font-semibold text-green-900">Notifications</p>
            <button
              type="button"
              onClick={() => markAllAsRead(user.role)}
              className="text-xs font-semibold text-green-700 hover:underline"
            >
              Mark all as read
            </button>
          </div>
          <ul className="max-h-80 overflow-y-auto divide-y divide-amber-50">
            {notifications.length ? (
              notifications.slice(0, 10).map((notification) => (
                <li key={notification.id} className={`px-4 py-3 text-sm ${notification.read ? 'bg-white' : 'bg-green-50/60'}`}>
                  <button
                    type="button"
                    className="w-full text-left space-y-1"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-800">
                      {notification.title}
                    </p>
                    <p className="text-gray-700 leading-snug">{truncate(notification.message)}</p>
                    <p className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p>
                  </button>
                  {notification.action && (
                    <Link
                      to={notification.action}
                      className="mt-2 inline-flex items-center text-xs font-semibold text-green-700 hover:underline"
                      onClick={() => setOpen(false)}
                    >
                      Open workspace →
                    </Link>
                  )}
                </li>
              ))
            ) : (
              <li className="px-4 py-6 text-center text-xs text-gray-500">No notifications yet. You&apos;re all caught up!</li>
            )}
          </ul>
          <div className="px-4 py-3 border-t border-amber-100 text-xs text-gray-500">
            Showing latest {Math.min(notifications.length, 10)} items.
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
