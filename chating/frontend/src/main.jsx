import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import './index.css'
import App from './App.jsx'
import MyRooms from './pages/MyRooms.jsx'
import AdminRooms from './pages/AdminRooms.jsx'
import ChatRoom from './pages/ChatRoom.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/my-rooms-list" element={<MyRooms />} />
          <Route path="/admin-room-list" element={<AdminRooms />} />
          <Route path="/chat/:roomId" element={<ChatRoom />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
