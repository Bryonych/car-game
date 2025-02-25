'use client'

import React, { ReactElement, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import Game from '../pages/Game.tsx';
import { Card } from "../data/interfaces.tsx";


function App() : ReactElement {

  useEffect(() => {
    document.title = "Car Game"
  }, [])

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path='/' element={<Game />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;