import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Summary from "./pages/Summary.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/summary" element={<Summary />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
