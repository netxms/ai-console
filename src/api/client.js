const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function request(method, path, { body, headers = {} } = {}) {
  const { useAuthStore } = await import('@/stores/authStore')
  const authStore = useAuthStore()

  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (authStore.sessionGuid) {
    opts.headers['Authorization'] = `Bearer ${authStore.sessionGuid}`
  }

  if (body !== undefined) {
    opts.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, opts)
  } catch (err) {
    throw new ApiError('Network error — check your connection', 0)
  }

  if (response.status === 401 && path !== '/v1/logout') {
    authStore.logout()
    const { default: router } = await import('@/router')
    router.push('/login')
    throw new ApiError('Session expired', 401)
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new ApiError(data?.message || `Request failed: ${response.status}`, response.status, data)
  }

  if (response.status === 204) return null
  return response.json().catch(() => null)
}

export function get(path, options) {
  return request('GET', path, options)
}

export function post(path, body, options) {
  return request('POST', path, { ...options, body })
}

export function put(path, body, options) {
  return request('PUT', path, { ...options, body })
}

export function del(path, options) {
  return request('DELETE', path, options)
}

export { ApiError }
