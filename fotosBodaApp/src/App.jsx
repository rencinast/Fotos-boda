import { Routes, Route } from "react-router-dom";
import Upload from "./components/upload";
import Admin from "./components/Admin";
import Gallery from "./components/Gallery";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Upload />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/gallery" element={<Gallery />} />
    </Routes>
  );
}
