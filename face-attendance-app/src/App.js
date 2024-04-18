import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import IndexPage from './pages/IndexPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route index element={<IndexPage />} />
      </Routes>
    </Router>
  );
}

export default App;
