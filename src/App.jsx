import { supabase } from './lib/supabase'
async function getTableData() {
  const { data, error } = await supabase
    .from('posts') // Replace 'your_table_name' with your actual table name in Supabase
    .select('*')

  if (error) {
    console.error('Error fetching data:', error)
  } else {
    console.log('Fetched data:', data)
  }
} 
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./lib/auth";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TutorPage from "./pages/TutorPage";

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div className="spinner" />
      </div>
    );
  }
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/tutor"
        element={
          <PrivateRoute>
            <TutorPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/tutor/:conceptKey"
        element={
          <PrivateRoute>
            <TutorPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
