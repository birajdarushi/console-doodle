import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TerminalShell from './components/layout/TerminalShell';
import { StatusPage } from './pages/StatusPage';
import { DeploymentsPage } from './pages/DeploymentsPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { LogsPage } from './pages/LogsPage';
import { AboutPage } from './pages/AboutPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TerminalShell>
          <Routes>
            <Route path="/" element={<StatusPage />} />
            <Route path="/deployments" element={<DeploymentsPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TerminalShell>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
