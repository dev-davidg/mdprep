import { Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Subjects from "@/pages/Subjects";
import Mode from "@/pages/Mode";
import Learning from "@/pages/Learning";
import Test from "@/pages/Test";
import Results from "@/pages/Results";
import Review from "@/pages/Review";
import Settings from "@/pages/Settings";

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home/>} />
      <Route path="/subjects" element={<Subjects/>} />
      <Route path="/mode" element={<Mode/>} />
      <Route path="/learning" element={<Learning/>} />
      <Route path="/test" element={<Test/>} />
      <Route path="/results" element={<Results/>} />
      <Route path="/review" element={<Review/>} />
      <Route path="/settings" element={<Settings/>} />\n      <Route path="/diag" element={<Diag/>} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
