import React from 'react';
import Navbar from './components/Navbar/Navbar';
import Main from './pages/Main/Main';
import { useState } from 'react';

import './App.css';

function App() {


  const [searchQuery, setSearchQuery] = useState(''); 

  
  return (
    <div className="App">
      
      <Navbar searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
       />
        
      <Main searchQuery={searchQuery} />
    </div>
  );
}

export default App;
