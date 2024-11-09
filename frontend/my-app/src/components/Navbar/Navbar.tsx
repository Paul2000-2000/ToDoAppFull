import React from 'react';
import './Navbar.css';
import { IoIosSearch } from "react-icons/io";
import { LuFilter } from "react-icons/lu";
import { IoIosArrowDown } from "react-icons/io";

// Define the type of props (without using interfaces)
const Navbar = ({ searchQuery, setSearchQuery }: { searchQuery: string, setSearchQuery: React.Dispatch<React.SetStateAction<string>> }) => {

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value); // Update state with input value
  };

  return (
    <nav>
      <div className='navbar-left'>
        <IoIosSearch />
        <input
          type='text'
          value={searchQuery}
          onChange={handleInputChange}
          placeholder='Search Project'
          className='navbar-left-inp'
        />
      </div>
      <button className='navbar-right'>
        <LuFilter />
        <span>Filter</span>
        <IoIosArrowDown />
      </button>
    </nav>
  );
};

export default Navbar;
