import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BrowsePage } from './pages/BrowsePage';
import './styles/main.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<BrowsePage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;