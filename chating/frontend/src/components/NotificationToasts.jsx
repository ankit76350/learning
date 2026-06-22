import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { dismissNotification } from '../store/notificationsSlice'
import './CSS/Notifications.css'

const AUTO_DISMISS_MS = 5000

/**
 * Global toast layer. Mounted once at the app root (outside <Routes>) so it
 * floats above whatever page the user is on.
 */
function NotificationToasts() {
  const items = useSelector((state) => state.notifications.items)

  if (items.length === 0) return null

  return (
    <div className="toast-stack">
      {items.map((n) => (
        <Toast key={n.id} notification={n} />
      ))}
    </div>
  )
}

function Toast({ notification }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id, roomId, sender, content } = notification

  // Auto-dismiss. Depends only on id, so a new toast arriving doesn't reset
  // the timers of toasts already on screen.
  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismissNotification(id)), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [dispatch, id])

  function open() {
    dispatch(dismissNotification(id))
    navigate(`/chat/${roomId}`)
  }

  function close(e) {
    e.stopPropagation()
    dispatch(dismissNotification(id))
  }

  return (
    <div className="toast" onClick={open} role="button" tabIndex={0}>
      <div className="toast-body">
        <span className="toast-title">
          New message from <strong>{sender}</strong>
        </span>
        <span className="toast-room">{roomId}</span>
        <span className="toast-text">{content}</span>
      </div>
      <button type="button" className="toast-close" onClick={close} aria-label="Dismiss">
        ✕
      </button>
    </div>
  )
}

export default NotificationToasts
