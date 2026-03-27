const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function getToken() {
  return localStorage.getItem('token')
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(method, path, body, isFormData = false) {
  const headers = { ...authHeaders() }
  if (!isFormData) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`)
  return data
}

// Auth
export const register       = (body) => request('POST', '/auth/register', body)
export const login          = (body) => request('POST', '/auth/login', body)
export const getMe          = ()     => request('GET',  '/auth/me')
export const requestReset   = (email) => request('POST', '/reset/request', { email })
export const confirmReset   = (token, password) => request('POST', '/reset/confirm', { token, password })

// Projects
export const getProjects   = (params = {}) => request('GET', '/projects?' + new URLSearchParams(params))
export const getProject    = (id)          => request('GET', `/projects/${id}`)
export const getMyProjects = ()            => request('GET', '/projects/my')
export const getPopular    = ()            => request('GET', '/projects/popular')
export const getRecent     = ()            => request('GET', '/projects/recent')
export const uploadProject  = (formData)    => request('POST',   '/projects', formData, true)
export const approveProject = (id, status)  => request('PATCH',  `/projects/${id}/approve`, { status })
export const rateProject    = (id, rating)  => request('POST',   `/projects/${id}/rate`, { rating })
export const deleteProject  = (id)          => request('DELETE', `/projects/${id}`)

// Doubts
export const getDoubts   = (subject) => request('GET', '/doubts' + (subject ? `?subject=${subject}` : ''))
export const postDoubt   = (formData) => request('POST', '/doubts', formData, true)
export const postAnswer  = (id, formData) => request('POST', `/doubts/${id}/answer`, formData, true)
export const verifyAnswer = (doubtId, answerId) => request('PATCH', `/doubts/${doubtId}/answers/${answerId}/verify`, {})

// Users
export const getProfile    = ()     => request('GET',   '/users/profile')
export const updateProfile = (body) => request('PATCH', '/users/profile', body)
export const saveProject   = (id)   => request('POST',  `/users/save/${id}`, {})
export const getExperts    = ()     => request('GET',   '/users/experts')

// Colleges
export const getColleges         = ()           => request('GET',  '/colleges')
export const getCollegeProjects  = (name, year) => request('GET',  `/colleges/${encodeURIComponent(name)}/projects${year ? `?year=${year}` : ''}`)
export const registerCollege     = (body)       => request('POST', '/colleges/register', body)
