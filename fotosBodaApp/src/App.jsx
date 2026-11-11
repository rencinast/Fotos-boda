import { Routes, Route } from "react-router-dom";
import Upload from "./components/upload";
import Admin from "./components/admin";
import Gallery from "./components/gallery";
import AdminLogin from "./components/adminLogin";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Upload />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } 
      />
      <Route path="/gallery" element={<Gallery />} />
    </Routes>
  );
}