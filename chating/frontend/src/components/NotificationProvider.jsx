import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRoomsByUser } from '../store/roomsSlice'
import { addNotification } from '../store/notificationsSlice'
import { connectToRooms } from '../api/chatSocket'

/**
 * App-level (renders nothing). Holds a single WebSocket connection subscribed
 * to every room the current user has joined, so a new message in any of those
 * rooms raises a notification regardless of which page is on screen.
 */
function NotificationProvider() {
  const dispatch = useDispatch()
  const username = localStorage.getItem('chatUserName') || ''

  const myRooms = useSelector((state) => state.rooms.myRooms)
  const activeRoomId = useSelector((state) => state.notifications.activeRoomId)

  // The socket handler is created once per connection, but activeRoomId changes
  // as the user navigates. Mirror it into a ref so the handler always reads the
  // latest value without us having to tear down and rebuild the connection.
  const activeRoomRef = useRef(activeRoomId)
  useEffect(() => {
    activeRoomRef.current = activeRoomId
  }, [activeRoomId])

  // Load the rooms this user belongs to, so we know which topics to watch.
  useEffect(() => {
    if (username) dispatch(fetchRoomsByUser(username))
  }, [dispatch, username])

  // (Re)open the connection whenever the set of joined rooms changes. The sorted
  // id list is the dependency — joining/leaving a room rebuilds the subscriptions.
  const roomKey = [...myRooms.map((r) => r.id)].sort().join(',')
  useEffect(() => {
    if (!username || !roomKey) return

    const roomIds = roomKey.split(',')
    const client = connectToRooms(roomIds, (roomId, message) => {
      //! when the backend broadcasts to /topic/room/C, only the C subscription fires, and it calls onMessage("C", message) — your handler knows it was room C, not A or E.
      // Ignore our own messages and the room we're actively viewing.
      if (message.sender === username) return
      if (roomId === activeRoomRef.current) return

      dispatch(
        addNotification({
          roomId,
          sender: message.sender,
          content: message.content,
          timestamp: message.timestamp,
        }),
      )
    })

    return () => client.deactivate()
  }, [dispatch, username, roomKey])

  console.log("Hii ji kaha ho ji app", myRooms);

  return null
}

export default NotificationProvider
