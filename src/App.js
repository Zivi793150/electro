import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Category from './pages/Category';
import Product from './pages/Product';
import About from './pages/About';
import Contacts from './pages/Contacts';
import Policy from './pages/Policy';
import Cooperation from './pages/Cooperation';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/category" element={<Category />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/about" element={<About />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/cooperation" element={<Cooperation />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
