import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import RapidDetail from './pages/RapidDetail';
import Auth from './pages/Auth';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rapid/:id" element={<RapidDetail />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
