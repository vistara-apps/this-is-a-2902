import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Sequences from './pages/Sequences'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="min-h-screen bg-dark-bg text-dark-text-primary">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/*" element={
              <ProtectedRoute>
                <AppShell>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/leads" element={<Leads />} />
                    <Route path="/sequences" element={<Sequences />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </AppShell>
              </ProtectedRoute>
            } />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(220 20% 12%)',
                color: 'hsl(220 20% 90%)',
                border: '1px solid hsl(220 15% 25%)',
              },
              success: {
                iconTheme: {
                  primary: 'hsl(150 60% 50%)',
                  secondary: 'hsl(220 20% 12%)',
                },
              },
              error: {
                iconTheme: {
                  primary: 'hsl(0 60% 50%)',
                  secondary: 'hsl(220 20% 12%)',
                },
              },
            }}
          />
        </div>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
