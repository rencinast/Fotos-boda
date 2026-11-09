import { Routes, Route } from "react-router-dom";
import Upload from "../components/upload";
import Admin from "../components/admin";
import Gallery from "../components/gallery";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Upload />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/gallery" element={<Gallery />} />
    </Routes>
  );
}
