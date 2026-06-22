# 🔌 Beginners Guide to WebSockets (React + Spring Boot)

This guide breaks down how WebSockets and STOMP work in this project in **very simple language**. Use this for your study and future reference!

---

## 1. What are WebSockets and STOMP? (The Easy Explanation)

### Regular HTTP (The Old Way: Request-Response)
* **How it works:** Like ordering pizza. You (the client) call the restaurant (the server) and ask for pizza. They deliver it, and the call ends. If you want another pizza, you must call them again. The server **cannot** send you food unless you ask first.
* **Why it's bad for chat:** If someone else sends you a chat message, the server can't tell you. You would have to keep asking the server every 2 seconds: "Any new messages? Any new messages?" (This is called *polling* and it wastes a lot of energy).

### WebSockets (The New Way: Constant Connection)
* **How it works:** Like a phone call. You call the server, they pick up, and you **both keep the line open**. Either of you can speak at any time without hanging up.
* **Why it's great:** The moment a message arrives on the server, the server can instantly push it to the client.

### STOMP (The Sub-Protocol)
* **How it works:** WebSockets just send raw text/bytes. STOMP is like a **messaging format** or **address system** on top of WebSockets. It gives us things like:
  * **Destinations (URLs):** Where to send/receive messages (like `/topic/studentupdate` or `/app/studentupdate`).
  * **Actions:** `SEND` (to send a message) and `SUBSCRIBE` (to listen for messages).

---

## 2. How the Backend (Spring Boot) Works

The backend handles connections and routes messages to the right folders.

### 📁 `WebSocketConfig.java` (The Configuration)
This file sets up the WebSocket connection and tells Spring Boot where to route messages.

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 1. Megaphone (Broadcast Channel)
        // Any URL starting with "/topic" is a public channel.
        // If a client listens to "/topic/cricket", they get all cricket updates.
        config.enableSimpleBroker("/topic");

        // 2. Mailbox (Input Channel)
        // If a client wants to send a message to the backend, the message URL must start with "/app"
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 3. The Front Door (Handshake URL)
        // Clients must first connect to "http://localhost:8080/ws" to start the connection.
        // ".withSockJS()" is a backup. If a client's browser is old and doesn't support WebSockets, 
        // SockJS falls back to older methods automatically so the app doesn't break.
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
```

### 📁 `NotificationController.java` (The Message Router)
This file listens to client messages, processes them, and broadcasts them.

```java
@Controller
public class NotificationController {

    // 1. Client sends message to: "/app/studentupdate"
    @MessageMapping("/studentupdate")
    // 2. Backend automatically broadcasts the returned value to: "/topic/studentupdate"
    @SendTo("/topic/studentupdate")
    public String studentUpdate(@Payload String message) {
        log.info("Student update: {}", message);
        return message; // This return value is what gets broadcasted!
    }
}
```

---

## 3. How the Frontend (React) Works

The frontend connects to the backend, sends messages, and subscribes to listen for updates.

### 📁 `StompContext.jsx` (The Shared Connection)
We want **one single connection** for the entire React app. We use React Context so every page can share the same connection without opening new ones.

```javascript
export function StompProvider({ children }) {
  const [client, setClient] = useState(null)

  useEffect(() => {
    // 1. Point to the backend "/ws" endpoint using SockJS
    const c = Stomp.over(() => new SockJS('http://localhost:8080/ws'))
    
    // 2. Connect
    c.connect({}, () => {
      console.log('Connected!')
      setClient(c) // Save the connected client
    })

    // 3. Cleanup: Close connection when app is closed/refreshed
    return () => {
      if (c.connected) c.disconnect()
    }
  }, [])

  return <StompContext.Provider value={client}>{children}</StompContext.Provider>
}
```

### 📁 `App.jsx` (Sending Messages)
When we click "Send", we use `client.send()` to pass the message to the backend.

```javascript
const client = useStomp() // Get the connected client

const send = () => {
  // We send the message to "/app/studentupdate" (backend's mailbox)
  // Arguments: (Destination URL, headers, body)
  client.send('/app/studentupdate', {}, 'Hello Students!')
}
```

### 📁 `UpdateFeed.jsx` (Listening/Subscribing)
To display messages in real-time, we must subscribe to the topic channel (e.g. `/topic/studentupdate`).

```javascript
useEffect(() => {
  if (!client) return // Wait until connection is ready

  // 1. Subscribe to "/topic/studentupdate" (backend's megaphone)
  const subscription = client.subscribe('/topic/studentupdate', (response) => {
    // 2. When a message is received, append it to our state list
    setMessages((prev) => [...prev, response.body])
  })

  // 3. CRITICAL: Unsubscribe when we leave the page!
  return () => subscription.unsubscribe()
}, [client, topic])
```

---

## 🚨 5 Golden Rules & Gotchas to Keep in Mind!

If you build more WebSocket apps in the future, always remember these:

### 1. The Prefix Trap ⚠️
* When the client **sends** a message, they **must** include the prefix `/app`. E.g., `client.send('/app/studentupdate', ...)`
* When the client **listens (subscribes)** to a message, they **must** use the prefix `/topic`. E.g., `client.subscribe('/topic/studentupdate', ...)`
* *Mismatching these is the #1 reason why messages don't reach the controller or clients.*

### 2. Always Unsubscribe! 🧹
* When a component unmounts (e.g., you change pages or close a component), you **must** unsubscribe: `subscription.unsubscribe()`.
* **Why?** If you don't unsubscribe, the connection stays alive in the background. Every time you open and close that page, you will create a duplicate listener. You will start receiving the same message 2x, 3x, 4x times, causing bugs and slow performance!

### 3. Share One Connection (Multiplexing) 🔌
* Do not create a `new SockJS` connection in every component. 
* Always use a Context Provider (like `StompProvider`) to open **one** connection, and let all components subscribe and send messages through that single connection. This keeps network usage low.

### 4. SockJS is a Helper, not a Protocol 🤝
* Raw WebSocket connections start with `ws://` or `wss://`.
* SockJS starts with `http://` or `https://` because it starts as an HTTP handshake, and then automatically upgrades to a WebSocket. Make sure your client URLs match!
  * **Raw WS URL:** `ws://localhost:8080/ws`
  * **SockJS URL:** `http://localhost:8080/ws`

### 5. CORS Settings 🌐
* Since your React app usually runs on a different port (like `5173` or `3000`) than the backend (`8080`), you must tell Spring Boot to allow connections from different ports using `.setAllowedOriginPatterns("*")` inside `WebSocketConfig.java`. Otherwise, the browser will block the connection.
