import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BrowsePage } from './pages/BrowsePage';
import './styles/main.scss';

const App = () => (
  <Router>
    <div className="app">
      <Routes>
        <Route path="/" element={<BrowsePage />} />
      </Routes>
    </div>
  </Router>
);

export default App;