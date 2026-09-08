import { Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import TutorPage from "./pages/TutorPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/tutor" element={<TutorPage />} />
      <Route path="/tutor/:conceptKey" element={<TutorPage />} />
      <Route path="*" element={<DashboardPage />} />
    </Routes>
  );
}
