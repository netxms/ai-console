import { post, get } from './client'

export async function login(username, password) {
  const data = await post('/v1/login', { username, password })
  return {
    sessionGuid: data.token,
    user: {
      id: data.userId,
      username,
      systemAccessRights: data.systemAccessRights,
    },
  }
}

export function logout() {
  return post('/v1/logout')
}

export async function validateSession() {
  const data = await get('/v1/status')
  return {
    userId: data.userId,
    userName: data.userName,
    systemAccessRights: data.systemAccessRights,
  }
}
