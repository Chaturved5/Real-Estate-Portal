import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const STORAGE_KEY = 'estateportal.notifications'
const WS_URL = import.meta.env.VITE_NOTIFICATION_WS_URL || ''

const NotificationContext = createContext(null)

const seedNotifications = [
  {
    id: 'NTF-1001',
    role: 'admin',
    title: 'Monthly reconciliation due',
    message: 'Export payout reports and verify Razorpay settlements for October.',
    createdAt: '2025-11-01T08:30:00.000Z',
    read: false,
    action: '/admin'
  },
  {
    id: 'NTF-1002',
    role: 'owner',
    title: 'New review published',
    message: 'Anita Sharma left a 5★ review on Modern Downtown Apartment.',
    createdAt: '2025-10-30T14:00:00.000Z',
    read: false,
    action: '/owners'
  },
  {
    id: 'NTF-1003',
    role: 'agent',
    title: 'Tour follow-up reminder',
    message: 'Reach out to buyer Ajay Mehta after yesterday’s walkthrough.',
    createdAt: '2025-10-29T09:15:00.000Z',
    read: true,
    action: '/brokers'
  },
  {
    id: 'NTF-1004',
    role: 'buyer',
    title: 'Booking confirmed',
    message: 'Your visit slot for Modern Downtown Apartment is confirmed.',
    createdAt: '2025-10-25T17:45:00.000Z',
    read: true,
    action: '/profile'
  }
]

const buildNotification = (input) => ({
  id: `NTF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  role: null,
  title: 'Update',
  message: '',
  createdAt: new Date().toISOString(),
  read: false,
  action: null,
  ...input
})

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedNotifications))
        return seedNotifications
      }
      const parsed = JSON.parse(stored)
      if (!Array.isArray(parsed)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedNotifications))
        return seedNotifications
      }
      return parsed
    } catch (error) {
      console.warn('Failed to parse stored notifications', error)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedNotifications))
      return seedNotifications
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    } catch (error) {
      console.warn('Failed to persist notifications', error)
    }
  }, [notifications])

  const addNotification = useCallback((notification) => {
    setNotifications((previous) => [buildNotification(notification), ...previous])
  }, [])

  const markAsRead = useCallback((notificationId) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    )
  }, [])

  const markAllAsRead = useCallback((role) => {
    setNotifications((previous) =>
      previous.map((notification) => {
        if (!role || !notification.role || notification.role === role) {
          return { ...notification, read: true }
        }
        return notification
      })
    )
  }, [])

  const getNotificationsForRole = useCallback(
    (role) => {
      if (!role) {
        return notifications
      }
      return notifications.filter((notification) => !notification.role || notification.role === role)
    },
    [notifications]
  )

  const wsRef = useRef(null)
  const reconnectTimerRef = useRef(null)

  useEffect(() => {
    if (!WS_URL) {
      return undefined
    }

    let active = true

    const connect = () => {
      if (!active) {
        return
      }

      try {
        wsRef.current = new WebSocket(WS_URL)
      } catch (error) {
        console.warn('Failed to initialise notification websocket', error)
        reconnectTimerRef.current = setTimeout(connect, 5000)
        return
      }

      const socket = wsRef.current
      if (!socket) {
        return
      }

      socket.onopen = () => {
        clearTimeout(reconnectTimerRef.current)
      }

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          if (payload) {
            addNotification(payload)
          }
        } catch (error) {
          console.warn('Failed to parse incoming notification', error)
        }
      }

      socket.onerror = (error) => {
        console.warn('Notification websocket error', error)
        socket.close()
      }

      socket.onclose = () => {
        if (!active) {
          return
        }
        reconnectTimerRef.current = setTimeout(connect, 5000)
      }
    }

    connect()

    return () => {
      active = false
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
      clearTimeout(reconnectTimerRef.current)
    }
  }, [addNotification])

  const value = useMemo(
    () => ({ notifications, addNotification, markAsRead, markAllAsRead, getNotificationsForRole }),
    [addNotification, getNotificationsForRole, markAllAsRead, markAsRead, notifications]
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
