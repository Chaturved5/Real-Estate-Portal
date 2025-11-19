const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

let authToken = null

const buildUrl = (path) => {
  if (!API_BASE_URL) {
    return null
  }
  return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`
}

const request = async (method, path, body) => {
  const url = buildUrl(path)
  if (!url) {
    throw new Error("API base URL is not configured")
  }

  const headers = {}

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  if (body !== undefined && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  const options = {
    method,
    headers
  }

  if (body !== undefined) {
    options.body = body instanceof FormData ? body : JSON.stringify(body)
  }

  const response = await fetch(url, options)
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed with status ${response.status}`)
  }
  if (response.status === 204) {
    return null
  }
  return response.json()
}

export const apiClient = {
  isEnabled: Boolean(API_BASE_URL),
  setAuthToken: (token) => {
    authToken = token || null
  },
  clearAuthToken: () => {
    authToken = null
  },
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path)
}
