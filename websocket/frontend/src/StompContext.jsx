import { createContext, useContext, useEffect, useState } from 'react'
import SockJS from 'sockjs-client'
import { Stomp } from '@stomp/stompjs'

// One shared STOMP connection for the whole app. The home page uses it to
// SEND, and each page uses it to SUBSCRIBE to its own topic.
const StompContext = createContext(null)

export function StompProvider({ children }) {
  // null until the handshake finishes; pages wait for this before subscribing.
  const [client, setClient] = useState(null)

  useEffect(() => {
    // Connect to the endpoint from WebSocketConfig -> addEndpoint("/ws").
    const c = Stomp.over(() => new SockJS('http://localhost:8080/ws'))
    c.connect({}, () => {
      console.log('STOMP connected')
      setClient(c)
    })

    // Close the socket when the app unmounts.
    return () => {
      if (c.connected) c.disconnect()
    }
  }, [])

  return <StompContext.Provider value={client}>{children}</StompContext.Provider>
}

// Convenience hook so components can grab the connected client (or null).
export function useStomp() {
  return useContext(StompContext)
}
