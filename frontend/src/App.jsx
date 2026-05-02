import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectPage from "./pages/ProjectPage";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner">Loading...</div>;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
  </>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/projects"
        element={
          <PrivateRoute>
            <AppLayout>
              <Projects />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/projects/:id"
        element={
          <PrivateRoute>
            <AppLayout>
              <ProjectPage />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
