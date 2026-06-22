const API_ROOT = 'http://localhost:8082/api'
const BASE_URL = `${API_ROOT}/rooms`

// GET /api/messages/{roomId} -> a room's message history (oldest first)
export async function fetchMessagesApi(roomId) {
  const res = await fetch(`${API_ROOT}/messages/${encodeURIComponent(roomId)}`)
  if (!res.ok) throw new Error(`Failed to load messages (${res.status})`)
  return res.json()
}

export async function fetchRoomsApi() {
  const res = await fetch(BASE_URL)
  if (!res.ok) throw new Error(`Failed to load rooms (${res.status})`)
  return res.json()
}

export async function createRoomApi(name) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error(`Failed to create room (${res.status})`)
  return res.json()
}

export async function fetchRoomsByUserApi(username) {
  const res = await fetch(`${BASE_URL}/user/${encodeURIComponent(username)}`)
  if (!res.ok) throw new Error(`Failed to load your rooms (${res.status})`)
  return res.json()
}

export async function joinRoomApi(roomId, username) {
  const res = await fetch(`${BASE_URL}/${roomId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || 'Room does not exist or invalid room ID')
  }
  return data
}
