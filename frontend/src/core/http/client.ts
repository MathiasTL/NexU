const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

const ACCESS_TOKEN_KEY = 'nextu_access_token'
const REFRESH_TOKEN_KEY = 'nextu_refresh_token'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  if (!refreshToken) return null
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${refreshToken}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
    return data.accessToken
  } catch {
    return null
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken()

  const buildHeaders = (t: string | null): HeadersInit => ({
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  })

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(token),
  })

  if (response.status === 401) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      const retry = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: buildHeaders(newToken),
      })
      if (!retry.ok) {
        clearTokens()
        const err = await retry.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error((err as { detail?: string }).detail ?? `HTTP ${retry.status}`)
      }
      if (retry.status === 204) return undefined as T
      return retry.json() as Promise<T>
    }
    clearTokens()
    throw new Error('Session expired')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error((error as { detail?: string }).detail ?? `HTTP ${response.status}`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
