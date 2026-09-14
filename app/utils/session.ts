import { UnauthorizedError } from '~/utils/errors/UnauthorizedError'

export const LOGIN_PATH = '/login'

const HOME_PATH = '/'
const ORIGIN_PROBE = 'http://localhost'

export const isLoginPath = (path: string): boolean => {
  return path.replace(/\/+$/, '').toLowerCase() === LOGIN_PATH
}

export const safeRedirect = (target: unknown): string => {
  if (typeof target !== 'string' || !target.startsWith('/') || target.startsWith('//')) return HOME_PATH

  try {
    const url = new URL(target, ORIGIN_PROBE)

    if (url.origin !== ORIGIN_PROBE || isLoginPath(url.pathname)) return HOME_PATH

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return HOME_PATH
  }
}

export const loginLocation = (from: string) => {
  const redirect = safeRedirect(from)

  return redirect === HOME_PATH ? LOGIN_PATH : { path: LOGIN_PATH, query: { redirect } }
}

export const isSessionEnded = (error: unknown): error is UnauthorizedError => {
  return error instanceof UnauthorizedError
}
