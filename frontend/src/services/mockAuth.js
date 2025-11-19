const STORAGE_KEY = 'estateportal.mockAuthUsers'

const ROLE_PREFIX_MAP = {
  admin: 'ADM',
  owner: 'OWN',
  agent: 'AGN',
  buyer: 'BUY'
}

const seedUsers = [
  {
    id: 'ADM-1001',
    name: 'System Admin',
    email: 'admin@estateportal.com',
    role: 'admin',
    password: 'Admin@123',
    phone: '+91 98765 00000',
    company: 'EstatePortal HQ',
    bio: 'Oversees platform operations, compliance, and reporting.'
  },
  {
    id: 'U-2001',
    name: 'Neeraj Mehta',
    email: 'neeraj@estateportal.com',
    role: 'owner',
    password: 'Owner@123',
    phone: '+91 91234 56789',
    company: 'Mehta Realty Holdings',
    bio: 'Premium residential landlord focusing on Mumbai & Pune micro-markets.'
  },
  {
    id: 'A-3001',
    name: 'Rohan Kapoor',
    email: 'rohan@estateportal.com',
    role: 'agent',
    password: 'Broker@123',
    phone: '+91 90000 12345',
    company: 'Elite Brokers Collective',
    bio: 'Certified broker assisting NRI investors with prime market entries.'
  },
  {
    id: 'BUY-4001',
    name: 'Anita Sharma',
    email: 'buyer@estateportal.com',
    role: 'buyer',
    password: 'Buyer@123',
    phone: '+91 88990 11223',
    company: 'Freelance Designer',
    bio: 'Searching for smart-connected apartments near key tech hubs.'
  }
]

const sanitizeUser = (user) => {
  const { password, ...safeUser } = user
  return safeUser
}

const loadUsers = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedUsers))
      return [...seedUsers]
    }
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedUsers))
      return [...seedUsers]
    }
    return parsed
  } catch (error) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedUsers))
    return [...seedUsers]
  }
}

const saveUsers = (users) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

const createToken = (userId) => `mock-token-${userId}`

const getRolePrefix = (role) => ROLE_PREFIX_MAP[role] || 'USR'

const generateId = (role, users) => {
  const prefix = getRolePrefix(role)
  const candidates = users
    .map((user) => user.id)
    .filter((id) => id.startsWith(`${prefix}-`))
    .map((id) => Number.parseInt(id.split('-')[1], 10))
    .filter((num) => Number.isFinite(num))
  const nextCounter = candidates.length ? Math.max(...candidates) + 1 : 1001
  return `${prefix}-${nextCounter}`
}

const findUserByToken = (token) => {
  if (!token || typeof token !== 'string' || !token.startsWith('mock-token-')) {
    return null
  }
  const userId = token.replace('mock-token-', '')
  const users = loadUsers()
  return users.find((user) => user.id === userId) || null
}

export const mockAuth = {
  async login({ email, password }) {
    const users = loadUsers()
    const user = users.find((entry) => entry.email.toLowerCase() === email.toLowerCase())

    if (!user || user.password !== password) {
      throw new Error('Invalid email or password')
    }

    const token = createToken(user.id)
    return { token, user: sanitizeUser(user) }
  },

  async register({ name, email, password, role }) {
    const users = loadUsers()
    const existing = users.find((entry) => entry.email.toLowerCase() === email.toLowerCase())
    if (existing) {
      throw new Error('An account with this email already exists')
    }

    const id = generateId(role, users)
    const newUser = {
      id,
      name,
      email,
      role,
      password,
      phone: '',
      company: '',
      bio: ''
    }
    const updatedUsers = [newUser, ...users]
    saveUsers(updatedUsers)

    const token = createToken(id)
    return { token, user: sanitizeUser(newUser) }
  },

  async getUserFromToken(token) {
    const user = findUserByToken(token)
    return user ? sanitizeUser(user) : null
  },

  async updateProfile(token, updates) {
    const users = loadUsers()
    const user = findUserByToken(token)
    if (!user) {
      throw new Error('Session expired. Please sign in again.')
    }

    const allowedFields = ['name', 'phone', 'company', 'bio']
    const nextUser = {
      ...user,
      ...Object.fromEntries(
        Object.entries(updates || {}).filter(([key]) => allowedFields.includes(key))
      )
    }

    const index = users.findIndex((entry) => entry.id === user.id)
    if (index >= 0) {
      users.splice(index, 1, nextUser)
      saveUsers(users)
    }

    return sanitizeUser(nextUser)
  },

  async changePassword(token, { currentPassword, newPassword }) {
    const users = loadUsers()
    const user = findUserByToken(token)
    if (!user) {
      throw new Error('Session expired. Please sign in again.')
    }

    if (user.password !== currentPassword) {
      throw new Error('Current password is incorrect')
    }

    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long')
    }

    const updatedUser = { ...user, password: newPassword }
    const index = users.findIndex((entry) => entry.id === user.id)
    if (index >= 0) {
      users.splice(index, 1, updatedUser)
      saveUsers(users)
    }

    return true
  },

  async logout() {
    return true
  }
}
