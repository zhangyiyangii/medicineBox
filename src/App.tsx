import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Medications from './pages/Medications';
import History from './pages/History';
import Emergency from './pages/Emergency';
import Family from './pages/Family';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/medications" element={<Medications />} />
          <Route path="/history" element={<History />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/family" element={<Family />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
