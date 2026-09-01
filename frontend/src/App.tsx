import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { AdminDashboard } from './pages/AdminDashboard';
import { TutorWorkspace } from './pages/TutorWorkspace';
import { Login } from './pages/Login';
import { Apply } from './pages/Apply';
import { ThemeProvider } from './theme/ThemeProvider';
import { ThemeSwitcher } from './components/ThemeSwitcher';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/tutor" element={<TutorWorkspace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ThemeSwitcher />
      </Router>
    </ThemeProvider>
  );
}

export default App;
