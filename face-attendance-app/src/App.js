import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import Instructor from './pages/Instructor';

function App() {
  return (
    <Router>
      <Routes>
        <Route index element={<Instructor content={"attendance"} />} />
        <Route path='/records' element={<Instructor content={"records"} />} />
      </Routes>
    </Router>
  );
}

export default App;
