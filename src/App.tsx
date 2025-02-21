import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import ClientDashboard from './pages/ClientDashboard'
import { Toaster } from "@/components/ui/toaster"
import './styles/custom-scrollbar.css'

function App() {
  // Check if we're on GitHub Pages
  const isGitHubPages = window.location.hostname.includes('github.io');
  const basename = isGitHubPages ? '/Omni-Portal' : '';

  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard/*" element={<DashboardPage />} />
        <Route path="/client-dashboard/*" element={<ClientDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Router>
  )
}

export default App
