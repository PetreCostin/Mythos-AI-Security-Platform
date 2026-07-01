import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LoadingSpinner } from './components/LoadingSpinner'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const AIChatPage = lazy(() => import('./pages/AIChatPage'))
const ThreatHuntingPage = lazy(() => import('./pages/ThreatHuntingPage'))
const CVEIntelligencePage = lazy(() => import('./pages/CVEIntelligencePage'))
const IOCSearchPage = lazy(() => import('./pages/IOCSearchPage'))
const IncidentResponsePage = lazy(() => import('./pages/IncidentResponsePage'))
const MalwareAnalysisPage = lazy(() => import('./pages/MalwareAnalysisPage'))
const VulnerabilityScannerPage = lazy(() => import('./pages/VulnerabilityScannerPage'))
const AttackPathPage = lazy(() => import('./pages/AttackPathPage'))
const DevSecOpsPage = lazy(() => import('./pages/DevSecOpsPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner className="min-h-screen" label="Loading security workspace" />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="ai-chat" element={<AIChatPage />} />
              <Route path="threat-hunting" element={<ThreatHuntingPage />} />
              <Route path="cve-intelligence" element={<CVEIntelligencePage />} />
              <Route path="ioc-search" element={<IOCSearchPage />} />
              <Route path="incident-response" element={<IncidentResponsePage />} />
              <Route path="malware-analysis" element={<MalwareAnalysisPage />} />
              <Route path="vulnerability-scanner" element={<VulnerabilityScannerPage />} />
              <Route path="attack-path" element={<AttackPathPage />} />
              <Route path="devsecops" element={<DevSecOpsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
