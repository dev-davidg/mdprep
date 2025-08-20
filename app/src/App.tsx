import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/Auth';
import CategoryPicker from './pages/CategoryPicker';
import Learning from './pages/Learning';
import TestConfig from './pages/TestConfig';
import TestRun from './pages/TestRun';
import ResultsReview from './pages/ResultsReview';
import FlaggedList from './pages/FlaggedList';
import RequireAuth from './RequireAuth';

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<RequireAuth><CategoryPicker /></RequireAuth>} />
      <Route path="/learn" element={<RequireAuth><Learning /></RequireAuth>} />
      <Route path="/test-config" element={<RequireAuth><TestConfig /></RequireAuth>} />
      <Route path="/test-run" element={<RequireAuth><TestRun /></RequireAuth>} />
      <Route path="/results" element={<RequireAuth><ResultsReview /></RequireAuth>} />
      <Route path="/flagged" element={<RequireAuth><FlaggedList /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}