import { apiClient } from './apiClient'

const assertApiEnabled = () => {
  if (!apiClient.isEnabled) {
    throw new Error('Backend not configured. Set VITE_API_BASE_URL to enable API calls.')
  }
}

const normalizeError = (error) => {
  if (!error) return { message: 'Unknown error', status: 500 }
  if (error instanceof Error) {
    return { message: error.message, status: error.status || error.code || 500 }
  }
  if (typeof error === 'string') return { message: error, status: 500 }
  return { message: error.message || 'Request failed', status: error.status || 500 }
}

export const verificationApi = {
  isEnabled: apiClient.isEnabled,
  async getStatus() {
    assertApiEnabled()
    try {
      return await apiClient.get('/api/verification/status')
    } catch (error) {
      throw normalizeError(error)
    }
  },

  async submit(formData) {
    assertApiEnabled()
    try {
      return await apiClient.post('/api/verification/submit', formData)
    } catch (error) {
      throw normalizeError(error)
    }
  },

  async adminList(params = {}) {
    assertApiEnabled()
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value)
      }
    })
    const qs = query.toString()
    const path = qs ? `/api/admin/verification-requests?${qs}` : '/api/admin/verification-requests'
    try {
      return await apiClient.get(path)
    } catch (error) {
      throw normalizeError(error)
    }
  },

  async adminGet(id) {
    assertApiEnabled()
    try {
      return await apiClient.get(`/api/admin/verification-requests/${id}`)
    } catch (error) {
      throw normalizeError(error)
    }
  },

  async adminUpdate(id, payload) {
    assertApiEnabled()
    try {
      return await apiClient.patch(`/api/admin/verification-requests/${id}`, payload)
    } catch (error) {
      throw normalizeError(error)
    }
  },
}
