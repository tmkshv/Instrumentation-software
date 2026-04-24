import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Sessions from "./pages/Sessions";

export default function App() {
  const { ready, authRequired, hasToken } = useAuth();

  if (!ready) {
    return (
      <div className="min-h-full flex items-center justify-center text-muted">
        Connecting to rover...
      </div>
    );
  }

  if (authRequired && !hasToken) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
