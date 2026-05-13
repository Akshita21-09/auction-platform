import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Loader from './components/common/Loader';

// Pages (lazy-loaded)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AuctionListing from './pages/AuctionListing';
import AuctionDetails from './pages/AuctionDetails';
import Dashboard from './pages/Dashboard';
import CreateAuction from './pages/CreateAuction';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  const { loading } = useAuth();

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-dark-800">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auctions" element={<AuctionListing />} />
          <Route path="/auctions/:id" element={<AuctionDetails />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-auction"
            element={
              <ProtectedRoute>
                <CreateAuction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
