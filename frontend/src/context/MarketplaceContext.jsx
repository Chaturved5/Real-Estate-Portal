import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { bookings as seedBookings, payments as seedPayments, properties as seedProperties, users } from '../data/mockData'
import { apiClient } from '../services/apiClient'

const MarketplaceContext = createContext()

const STORAGE_KEYS = {
  properties: 'estateportal.properties',
  bookings: 'estateportal.bookings',
  payments: 'estateportal.payments'
}

const loadFallbackState = (key, fallback) => {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const serialized = window.localStorage.getItem(key)
    if (!serialized) {
      return fallback
    }
    const parsed = JSON.parse(serialized)
    return Array.isArray(parsed) ? parsed : fallback
  } catch (storageError) {
    console.warn(`Failed to parse stored data for ${key}`, storageError) // eslint-disable-line no-console
    return fallback
  }
}

const persistState = (key, value) => {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (storageError) {
    console.warn(`Failed to persist ${key}`, storageError) // eslint-disable-line no-console
  }
}

export const MarketplaceProvider = ({ children }) => {
  const [properties, setProperties] = useState(() => loadFallbackState(STORAGE_KEYS.properties, seedProperties))
  const [bookings, setBookings] = useState(() => loadFallbackState(STORAGE_KEYS.bookings, seedBookings))
  const [payments, setPayments] = useState(() => loadFallbackState(STORAGE_KEYS.payments, seedPayments))
  const [loading, setLoading] = useState(apiClient.isEnabled)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!apiClient.isEnabled) {
      return undefined
    }

    let cancelled = false

    const loadRemoteData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [remoteProperties, remoteBookings, remotePayments] = await Promise.all([
          apiClient.get('/properties'),
          apiClient.get('/bookings'),
          apiClient.get('/payments')
        ])

        if (!cancelled) {
          setProperties(Array.isArray(remoteProperties) ? remoteProperties : [])
          setBookings(Array.isArray(remoteBookings) ? remoteBookings : [])
          setPayments(Array.isArray(remotePayments) ? remotePayments : [])
        }
      } catch (remoteError) {
        if (!cancelled) {
          setError(remoteError.message || 'Failed to load marketplace data. Falling back to mock data.')
          setProperties(seedProperties)
          setBookings(seedBookings)
          setPayments(seedPayments)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadRemoteData()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (apiClient.isEnabled) {
      return
    }
    persistState(STORAGE_KEYS.properties, properties)
  }, [properties])

  useEffect(() => {
    if (apiClient.isEnabled) {
      return
    }
    persistState(STORAGE_KEYS.bookings, bookings)
  }, [bookings])

  useEffect(() => {
    if (apiClient.isEnabled) {
      return
    }
    persistState(STORAGE_KEYS.payments, payments)
  }, [payments])

  const agentsById = useMemo(() => {
    const map = new Map()
    users
      .filter((user) => user.role === 'agent')
      .forEach((agent) => {
        map.set(agent.id, agent)
      })
    return map
  }, [])

  const ownersById = useMemo(() => {
    const map = new Map()
    users
      .filter((user) => user.role === 'owner')
      .forEach((owner) => {
        map.set(owner.id, owner)
      })
    return map
  }, [])

  const searchProperties = (filters) => {
    const { city, type, minPrice, maxPrice, bedrooms } = filters

    return properties.filter((property) => {
      const matchesCity = city ? property.city.toLowerCase().includes(city.toLowerCase()) : true
      const matchesType = type ? property.type === type : true
      const matchesBedrooms = bedrooms ? Number(bedrooms) <= property.bedrooms : true
      const matchesMin = minPrice ? property.price >= Number(minPrice) * 10000000 : true
      const matchesMax = maxPrice ? property.price <= Number(maxPrice) * 10000000 : true

      return matchesCity && matchesType && matchesBedrooms && matchesMin && matchesMax
    })
  }

  const getPropertyById = (propertyId) => properties.find((property) => property.id === propertyId)

  const generatePropertyId = () => {
    const nextIndex = properties.length + 1001
    return `P-${nextIndex}`
  }

  const createProperty = async (propertyPayload) => {
    const optimisticProperty = {
      id: generatePropertyId(),
      status: 'pending',
      rating: 0,
      reviews: [],
      createdAt: new Date().toISOString(),
      ...propertyPayload
    }

    if (apiClient.isEnabled) {
      try {
        const response = await apiClient.post('/properties', propertyPayload)
        if (response) {
          setProperties((prev) => [response, ...prev])
          return response
        }
      } catch (remoteError) {
        setError(remoteError.message || 'Failed to save property remotely. Stored locally instead.')
      }
    }

    setProperties((prev) => [optimisticProperty, ...prev])
    return optimisticProperty
  }

  const updateProperty = async (propertyId, updates) => {
    if (apiClient.isEnabled) {
      try {
        const response = await apiClient.patch(`/properties/${propertyId}`, updates)
        if (response) {
          setProperties((prev) => prev.map((property) => (property.id === propertyId ? response : property)))
          return response
        }
      } catch (remoteError) {
        setError(remoteError.message || 'Failed to update property remotely. Local state updated instead.')
      }
    }

    setProperties((prev) => prev.map((property) => (property.id === propertyId ? { ...property, ...updates } : property)))
    return getPropertyById(propertyId)
  }

  const deleteProperty = async (propertyId) => {
    if (apiClient.isEnabled) {
      try {
        await apiClient.delete(`/properties/${propertyId}`)
      } catch (remoteError) {
        setError(remoteError.message || 'Failed to delete property remotely. Local state updated.')
      }
    }

    setProperties((prev) => prev.filter((property) => property.id !== propertyId))
  }

  const addReview = async (propertyId, review) => {
    let createdReview = {
      id: `R-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString().slice(0, 10),
      ...review
    }

    if (apiClient.isEnabled) {
      try {
        const response = await apiClient.post(`/properties/${propertyId}/reviews`, review)
        if (response) {
          createdReview = response
        }
      } catch (remoteError) {
        setError(remoteError.message || 'Failed to save review remotely. Stored locally instead.')
      }
    }

    setProperties((prev) =>
      prev.map((property) => {
        if (property.id !== propertyId) {
          return property
        }

        const updatedReviews = [createdReview, ...property.reviews]
        const totalScore = updatedReviews.reduce((sum, current) => sum + current.rating, 0)
        const updatedRating = Number((totalScore / updatedReviews.length).toFixed(1))

        return {
          ...property,
          reviews: updatedReviews,
          rating: updatedRating
        }
      })
    )

    return createdReview
  }

  const addBooking = async (booking) => {
    let createdBooking = { ...booking, id: `B-${bookings.length + 7001}` }

    if (apiClient.isEnabled) {
      try {
        const response = await apiClient.post('/bookings', booking)
        if (response) {
          createdBooking = response
        }
      } catch (remoteError) {
        setError(remoteError.message || 'Failed to save booking remotely. Stored locally instead.')
      }
    }

    setBookings((prev) => [createdBooking, ...prev])
    return createdBooking
  }

  const updateBooking = async (bookingId, updates) => {
    if (apiClient.isEnabled) {
      try {
        await apiClient.patch(`/bookings/${bookingId}`, updates)
      } catch (remoteError) {
        setError(remoteError.message || 'Failed to update booking remotely. Local state updated.')
      }
    }

    setBookings((prev) =>
      prev.map((booking) => (booking.id === bookingId ? { ...booking, ...updates } : booking))
    )
  }

  const recordPayment = async (payment) => {
    let createdPayment = { ...payment, id: `PAY-${payments.length + 9001}` }

    if (apiClient.isEnabled) {
      try {
        const response = await apiClient.post('/payments', payment)
        if (response) {
          createdPayment = response
        }
      } catch (remoteError) {
        setError(remoteError.message || 'Failed to save payment remotely. Stored locally instead.')
      }
    }

    setPayments((prev) => [createdPayment, ...prev])
    return createdPayment
  }

  const updatePayment = async (paymentId, updates) => {
    if (apiClient.isEnabled) {
      try {
        await apiClient.patch(`/payments/${paymentId}`, updates)
      } catch (remoteError) {
        setError(remoteError.message || 'Failed to update payment remotely. Local state updated.')
      }
    }

    setPayments((prev) =>
      prev.map((payment) => (payment.id === paymentId ? { ...payment, ...updates } : payment))
    )
  }

  const value = useMemo(
    () => ({
      properties,
      bookings,
      payments,
      agentsById,
      ownersById,
      loading,
      error,
      searchProperties,
      getPropertyById,
      createProperty,
      updateProperty,
      deleteProperty,
      addReview,
      addBooking,
      updateBooking,
      recordPayment,
      updatePayment
    }),
    [properties, bookings, payments, agentsById, ownersById, loading, error]
  )

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>
}

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext)
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider')
  }
  return context
}
