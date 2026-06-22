const BASE_URL = 'http://localhost:8082/api/rooms'

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
