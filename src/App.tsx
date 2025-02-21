import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import ClientDashboard from './pages/ClientDashboard'
import { Toaster } from "@/components/ui/toaster"
import './styles/custom-scrollbar.css'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster />
    </HashRouter>
  )
}

export default App
