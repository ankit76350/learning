import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

// The backend STOMP endpoint, registered with .withSockJS() in WebSocketConfig.
const WS_URL = 'http://localhost:8082/ws'

/**
 * Open a STOMP-over-SockJS connection to a single room and subscribe to its
 * broadcast topic.
 *
 * @param {string} roomId
 * @param {(message: object) => void} onMessage  called for each broadcast message
 * @param {(connected: boolean) => void} [onStatus]  connection status changes
 * @returns {import('@stomp/stompjs').Client}  the active client (use to publish/deactivate)
 */
export function connectToRoom(roomId, onMessage, onStatus) {
  const client = new Client({
    // SockJS handles the actual transport (the backend requires it).
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 3000, // auto-reconnect if the connection drops
    onConnect: () => {
      client.subscribe(`/topic/room/${roomId}`, (frame) => {
        onMessage(JSON.parse(frame.body))
      })
      onStatus?.(true)
    },
    onWebSocketClose: () => onStatus?.(false),
  })

  client.activate()
  return client
}

/**
 * Publish a message to a room. The server stamps the timestamp, persists it,
 * and broadcasts it back to all subscribers (including us).
 */
export function sendMessage(client, roomId, message) {
  client.publish({
    destination: `/app/chat/${roomId}`,
    body: JSON.stringify(message),
  })
}
