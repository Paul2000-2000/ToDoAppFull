import React from 'react'
import Categories from '../../components/Categories/Categories'
import './Main.css';
import { useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { HiDotsVertical } from "react-icons/hi";
import { FcExpired } from "react-icons/fc";
import { IoBag } from "react-icons/io5";
import { FaRegClock } from "react-icons/fa";
import { ITask } from '../../interfaces/interfaces';

const Main = () => {

  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const today = new Date().toISOString().split('T')[0];
  const [errorMessage, setErrorMessage] = useState(''); // State to manage error messages


  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [access, setAccess] = useState('');

  // Function to open modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Function to close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const addTask = async (task: ITask): Promise<void> => {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    };
    
    const response = await fetch('http://localhost:5038/tasks', requestOptions);
    
    if (!response.ok) {  // Checks if response is not in the range 200-299
      throw new Error(`Server error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Task added successfully:', data);
    
  } catch (error: unknown) {
    // Check if error is an instance of Error to access error.message safely
    if (error instanceof Error) {
      setErrorMessage(`Failed to add task: ${error.message}`);
    } else {
      setErrorMessage('An unexpected error occurred');
    }
  }
};

   // Function to open modal
   const handleAddTask = () => {
    setErrorMessage(''); // Clear previous error message

    // Validate each field
    if (!title) {
      setErrorMessage('Title is required');
    } else if (!description) {
      setErrorMessage('Description is required');
    } else if (!date) {
      setErrorMessage('Date is required');
    } else if (new Date(date) < new Date(today)) {
      setErrorMessage('Date must be in the future');
    } else if (!access) {
      setErrorMessage('Please assign a priority');
    } else {
      
      // Create a new task object
      const task = {
        category: "To Do",
        access,
        title,
        description,
        deadline: date,
      };

      addTask(task);
    

      console.log('Form submitted successfully!');
      setIsModalOpen(false); 
    }
  };


  return (
    <div className='maindivnow'>
      <div className='maindivnow-content'>
        <div className='maindivnow-content-container '>
          <div className='maindivnow-content-container-img expired'>
            <FcExpired className='maindivnow-content-container-img-ic'/>
          </div>
          <h1 className='maindivnow-content-container-text'>Expired tasks</h1>
          <p className='maindivnow-content-container-count'>5</p>
        </div>
        
        <div className='maindivnow-content-container '>
          <div className='maindivnow-content-container-img active'>
          <IoBag className='maindivnow-content-container-img-ic bag' />
          </div>
          <h1 className='maindivnow-content-container-text'>All Active Tasks</h1>
          <p className='maindivnow-content-container-count'>7</p>
        </div>
          
       
        <div className='maindivnow-content-container '>
          <div className='maindivnow-content-container-img completed'>
          <FaRegClock className='maindivnow-content-container-img-ic clock'/>
          </div>
          <h1 className='maindivnow-content-container-text'>Completed Tasks</h1>
          <p className='maindivnow-content-container-count'>2/7</p>
        </div>
        <button className='maindivnow-content-button' onClick={handleOpenModal}>+ Add Task</button>
        
      </div>
      <Categories />

        {/* Background overlay for dimming effect */}
        {isModalOpen && <div className="overlay"></div>}

     {/* Modal */}
     {isModalOpen && (
        <div className="modal">
          
          <div className='modal-header'>
            <div className='modal-header-content'>
               <div className='modal-header-content-circle'></div>
               <h2>Add Task</h2> s
              
            </div>
            <IoMdClose style={{cursor:"pointer"}} onClick={handleCloseModal}/>
          </div>

        <div className='modal-container'>
          <div className='modal-title-container'>
            <input  value={title}
                  onChange={(e) => setTitle(e.target.value)} type='text' placeholder='Enter a title' required className='modal-title-container-text'/>
            <HiDotsVertical />
          </div>
          <textarea  value={description}
                onChange={(e) => setDescription(e.target.value)} id='description' placeholder='Enter a description...' required  className='modal-container-description'/>
          
          <div className='modal-container-buttons'>
          <input value={date}
                  onChange={(e) => setDate(e.target.value)} id='date' type='date' min={today} required/>

            <select  value={access}
                  onChange={(e) => setAccess(e.target.value)} id='access' className='modal-container-buttons-btn' required>
              <option value="" selected hidden>Assign to</option>
              <option>Low</option>
              <option>Medium</option>
             <option>High</option>
            </select>
            
          </div>


              {/* Error message */}
              {errorMessage && <p style={{ color: 'red' , textAlign:"center" , margin:"5px"}}>{errorMessage}</p>}
            <button className="modal-container-close" onClick={handleAddTask} >Add</button>
          
        </div>
        </div>
      )}

    </div>
  )
}

export default Main
