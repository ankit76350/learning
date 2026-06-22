# Engineering Notes: Real-Time Chat & State Management Learnings

This document summarizes the core engineering concepts, best practices, and architecture rules utilized in building the MongoDB-backed real-time chat application with presence tracking. Keep these notes for future reference.

---

## 1. Secrets Management & Database Auto-Configuration

### The Spring Boot MongoDB Key Gotcha
In modern Spring Boot (3.x+), the canonical database connection key is:
```properties
spring.data.mongodb.uri=mongodb+srv://username:password@cluster...
```
If you mistakenly use `spring.mongodb.uri` (omitting `.data`), Spring Boot's automatic configuration ignores the property. It falls back to trying to connect to a default database on `localhost:27017`.

### Excluding Local Configuration from Version Control
When using remote databases or Atlas clusters with sensitive credentials:
1. Keep the credentials in your local `application.properties`.
2. Add the file's path relative to the sub-project to your `.gitignore`:
   ```gitignore
   # Ignore application configuration containing secrets
   /src/main/resources/application.properties
   ```
3. If Git shows the entire directory `src/main/resources/` as ignored, this is normal behavior if `application.properties` is the only file inside that folder.

---

## 2. Spring Boot WebSockets & STOMP (Backend Connection Explained simply)

WebSockets allow two-way communication between the client (frontend) and the server (backend) over a single connection that stays open. In our Spring Boot backend, we configured this in [`WebSocketConfig.java`](backend/src/main/java/com/example/backend/config/WebSocketConfig.java). 

Here is how it works in plain language:

```
                  ┌──────────────────────┐
                  │ Client (React App)   │
                  └──────────┬───────────┘
                             │
            1. Connects to   │ 2. Subscribes to
               "/ws"         │    "/topic/room/ROOM-123"
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │              Spring Boot Backend                       │
  ├────────────────────────────────────────────────────────┤
  │                                                        │
  │  [/ws] ──► Handshake and Connection Port               │
  │                                                        │
  │  [/app] ──► Client sends messages here to hit java    │
  │             controllers (e.g. /app/chat/ROOM-123)      │
  │                                                        │
  │  [/topic] ──► Message Broker broadcasts messages here  │
  │               to all active subscribers                │
  │                                                        │
  └────────────────────────────────────────────────────────┘
```

### A. The Handshake Endpoint (`/ws`)
Think of `/ws` as the **entrance gate**. When the React app starts up, it connects to `http://localhost:8082/ws`.
* **SockJS:** We use `.withSockJS()` on the backend as a backup. If the user's browser or network doesn't support modern WebSockets, SockJS automatically falls back to older methods (like HTTP long-polling) so the chat still works without crashing.
* **CORS:** `.setAllowedOriginPatterns("*")` allows your frontend (which runs on a different port like `5173`) to connect to your backend on `8082`.

### B. The Message Broker (`/topic`)
Think of `/topic` as a **broadcast megaphone** or a radio station.
* When a user subscribes to `/topic/room/ROOM-XYZ`, they are tuning their radio to that channel.
* Any message the server publishes to `/topic/room/ROOM-XYZ` will be automatically shouted out to **every client** currently tuned into that channel.

### C. The Application Destination (`/app`)
Think of `/app` as the **incoming mail box**.
* When the client wants to send a message to a specific room, they publish to `/app/chat/{roomId}/sendMessage`.
* The `/app` prefix routes this message to your Java controller (`@MessageMapping`), where your code can save the message to MongoDB, add timestamps, and then redirect it to the `/topic` megaphone.

---

## 3. WebSocket Multiplexing (Connections vs. Subscriptions)

When building dashboard pages where users listen to messages from multiple channels simultaneously, you must **multiplex** connections.

> [!IMPORTANT]
> **One WebSocket Connection carries many STOMP Subscriptions.**
> Opening a new TCP/WebSocket handshake for every room a user joins is extremely inefficient and will crash your server under load.

### How STOMP solves this (multiplexing)
STOMP (Simple Text Oriented Messaging Protocol) is a sub-protocol running on top of WebSockets. It enables multiple subscriptions over a single open socket.

```javascript
// Good Practice: One WebSocket connection, multiple subscriptions
export function connectToRooms(roomIds, onMessage, onStatus) {
  const client = new Client({                      // <-- Created ONCE = 1 WebSocket Connection
    webSocketFactory: () => new SockJS(WS_URL),
    onConnect: () => {
      roomIds.forEach((roomId) => {
        client.subscribe(`/topic/room/${roomId}`, (frame) => { // <-- Subscribed 5 times on 1 socket
          onMessage(roomId, JSON.parse(frame.body));
        });
      });
    }
  });
  client.activate();
  return client;
}
```

---

## 4. Real-Time Presence Tracking (Stateful Lifecycle Events)

Since WebSockets maintain a continuous TCP connection between the client and the server, the backend can track active connections automatically.

```mermaid
graph TD
    A[Client connects & subscribes to /topic/rooms/ROOM_ID] --> B[Spring fires SessionSubscribeEvent]
    B --> C[Store username in Session Map]
    C --> D[Broadcast new active list to room]
    
    E[Client closes tab / disconnects] --> F[Spring fires SessionDisconnectEvent]
    F --> G[Look up session ID & remove user from Map]
    G --> H[Broadcast updated active list to room]
```

### Key Implementation Principles:
1. **Map Session IDs:** Create an in-memory thread-safe registry (e.g., `ConcurrentHashMap`) mapping the WebSocket `sessionId` to the user's `username` and `roomId`.
2. **Listen to Connection Drops:** Spring's `@EventListener` captures `SessionDisconnectEvent` when a socket closes. This fires even if the client crashes or closes their browser tab without clicking a "Leave" button.
3. **Notify Instantly:** On every subscribe or disconnect event, recalculate the active user list and broadcast a `PRESENCE` payload to `/topic/rooms/{roomId}` so all clients update their headers immediately.

---

## 5. UI Synchrony & Redux State Management

When integrating real-time message feeds into a React/Redux frontend, you must handle state updates carefully:

1. **Do not use local UI optimistic updates for group chat:** 
   If a user types a message and clicks send, do not add the message to the Redux store immediately. 
   - *Why?* The message broker will broadcast the message to `/topic/rooms/{roomId}`, which triggers the subscription handler on all connected clients—including the sender. If you added it optimistically, the sender would see the message twice.
   - *Instead:* Publish the message to the WebSocket, and let the incoming subscription hook add it to the Redux store when it broadcasts back.
2. **Clean up state on unmount:** 
   When leaving the chat room page, always dispatch a cleanup action to purge current messages (e.g., `dispatch(clearMessages())`) and deactivate the socket (`client.deactivate()`). Otherwise, the next room the user opens will briefly flash the previous room's chat history.

---

## 6. Dashboard Routing & User Context Flow

To link everything together, the React application utilizes a central dashboard ([`App.jsx`](frontend/src/App.jsx)) that governs access:

1. **User Identity Persistence:**
   - Before entering any room list, the dashboard checks `localStorage` for `chatUserName`.
   - If missing, it overlays a name entry modal. Storing the name in `localStorage` acts as a simple session mechanism so users don't have to re-enter their names on refresh.
2. **Feature Mapping Cards:**
   - **My Rooms ([`MyRooms.jsx`](frontend/src/pages/MyRooms.jsx)):** Lets users view, join via invitation code, and leave rooms they are registered in.
   - **Admin Panel ([`AdminRooms.jsx`](frontend/src/pages/AdminRooms.jsx)):** Renders every active room and hosts the room creation interface.
