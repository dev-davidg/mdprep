import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "../pages/Auth";
import CategoryPicker from "../pages/CategoryPicker";
import Learning from "../pages/Learning";
import TestConfig from "../pages/TestConfig";
import TestRun from "../pages/TestRun";
import Results from "../pages/Results";
import Lists from "../pages/Lists";
import Header from "../components/Header";

export default function AppRoutes() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/categories" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/categories" element={<CategoryPicker />} />
          <Route path="/learn/:categoryId" element={<Learning />} />
          <Route path="/test/:categoryId/config" element={<TestConfig />} />
          <Route path="/test/:sessionId/run" element={<TestRun />} />
          <Route path="/results/:sessionId" element={<Results />} />
          <Route path="/lists" element={<Lists />} />
        </Routes>
      </main>
    </>
  );
}