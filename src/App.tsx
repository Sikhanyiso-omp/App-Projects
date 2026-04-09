import { AuthProvider } from './AuthContext';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { useAuth } from './AuthContext';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse text-primary font-mono">INITIALIZING MINDLOCK...</div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LandingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
