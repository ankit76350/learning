import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchRoomsByUser, joinRoom, clearJoinError } from '../store/roomsSlice'
import './RoomsList.css'

function initials(name) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function MyRooms() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const storedName = localStorage.getItem('chatUserName') || ''
  const username = storedName || 'there'

  const { myRooms, myStatus, myError, joining, joinError } = useSelector(
    (state) => state.rooms,
  )

  const [showJoin, setShowJoin] = useState(false)
  const [roomIdDraft, setRoomIdDraft] = useState('')

  // Load the rooms this user has joined from the backend.
  useEffect(() => {
    if (storedName) dispatch(fetchRoomsByUser(storedName))
  }, [dispatch, storedName])

  async function handleJoin(e) {
    e.preventDefault()
    const roomId = roomIdDraft.trim()
    if (!roomId) return

    // unwrap() throws if the thunk was rejected, so we only navigate on success.
    try {
      await dispatch(joinRoom({ roomId, username: storedName })).unwrap()
      setShowJoin(false)
      setRoomIdDraft('')
      navigate(`/chat/${roomId}`)
    } catch {
      // joinError is already set in the store; keep the modal open.
    }
  }

  function closeJoin() {
    setShowJoin(false)
    setRoomIdDraft('')
    dispatch(clearJoinError())
  }

  return (
    <main className="rooms">
      <header className="rooms-header">
        <h1>My Rooms</h1>
        <button
          type="button"
          className="new-room-btn"
          onClick={() => setShowJoin(true)}
        >
          Join Room
        </button>
      </header>

      {myStatus === 'loading' && <p>Loading your rooms…</p>}
      {myError && <p className="rooms-error">{myError}</p>}

      {myStatus === 'succeeded' && myRooms.length === 0 && (
        <p>
          <strong>{username}</strong>, you haven&apos;t joined any room yet.
          Join one with its room ID.
        </p>
      )}

      {myRooms.length > 0 && (
        <ul className="room-list">
          {myRooms.map((room) => (
            <li
              key={room.id}
              className="room-item"
              onClick={() => navigate(`/chat/${room.id}`)}
            >
              <span className="room-avatar">{initials(room.name)}</span>
              <div className="room-info">
                <span className="room-name">{room.name}</span>
                <span className="room-last">{room.id}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showJoin && (
        <div className="modal-overlay" onClick={closeJoin}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <form className="name-form" onSubmit={handleJoin}>
              <h2>Enter Room ID to join</h2>
              <input
                type="text"
                value={roomIdDraft}
                onChange={(e) => {
                  setRoomIdDraft(e.target.value)
                  if (joinError) dispatch(clearJoinError())
                }}
                placeholder="e.g. ROOM-AB12-CD34"
                autoFocus
              />
              {joinError && <p className="rooms-error">{joinError}</p>}
              <div className="name-form-actions">
                <button
                  type="button"
                  className="name-form-cancel"
                  onClick={closeJoin}
                >
                  Cancel
                </button>
                <button type="submit" disabled={!roomIdDraft.trim() || joining}>
                  {joining ? 'Joining…' : 'Join'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default MyRooms
