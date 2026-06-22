import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import RoomList from './pages/RoomList.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/my-rooms-list" element={<RoomList />} />
        <Route path="/admin-room-list" element={<RoomList />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
