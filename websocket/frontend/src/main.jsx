import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { StompProvider } from './StompContext.jsx'
import StudentPage from './pages/StudentPage.jsx'
import TeacherPage from './pages/TeacherPage.jsx'
import StaffPage from './pages/StaffPage.jsx'

createRoot(document.getElementById('root')).render(
  // StompProvider opens ONE shared connection used by every route below.
  <StompProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/studentupdate" element={<StudentPage />} />
        <Route path="/teacherupdate" element={<TeacherPage />} />
        <Route path="/staffupdate" element={<StaffPage />} />
      </Routes>
    </BrowserRouter>
  </StompProvider>
)
