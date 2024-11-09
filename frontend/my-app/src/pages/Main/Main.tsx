import React, { useState, useEffect } from 'react';
import Categories from '../../components/Categories/Categories';
import './Main.css';
import { IoMdClose } from "react-icons/io";
import { HiDotsVertical } from "react-icons/hi";
import { FcExpired } from "react-icons/fc";
import { IoBag } from "react-icons/io5";
import { FaRegClock } from "react-icons/fa";
import { ITask } from '../../interfaces/interfaces';
import { ICategories } from '../../interfaces/interfaces';

const Main = ({ searchQuery }: { searchQuery: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [errorMessage, setErrorMessage] = useState('');
  const [categories, setCategories] = useState<ICategories[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [access, setAccess] = useState('');

  
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const fetchData = async (): Promise<void> => {
    try {
      const response = await fetch('https://todoappbackend-1edac8e4706e.herokuapp.com/tasks');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ICategories[] = await response.json();
      setCategories(data); 
      console.log(data);

      const totalTasksCount = data.reduce((total, category) => {
        return total + (category.tasks ? category.tasks.length : 0);
      }, 0);

      setTotalTasks(totalTasksCount);

      const completedTasksCount = data.reduce((totalComplete, category) => {
        return totalComplete + (category.category === 'Completed' ? (category.tasks ? category.tasks.length : 0) : 0);
      }, 0);

      setCompletedTasks(completedTasksCount);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  
  const generateTaskId = (existingTasks: ITask[]): number => {
    const highestId = existingTasks.reduce((max, task) => (task.id > max ? task.id : max), 0);
    return highestId + 1; 
  };

  const addTask = async (task: ITask): Promise<void> => {
    try {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: task.category,
          access: task.access,
          title: task.title,
          description: task.description,
          deadline: task.deadline,
        }),
      };

      const response = await fetch('https://todoappbackend-1edac8e4706e.herokuapp.com/tasks', requestOptions);

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Task added successfully:', data);

    
      setCategories(prevCategories => {
        return prevCategories.map(category => {
          if (category.category === task.category) {
            return { ...category, tasks: [...category.tasks, data] };
          }
          return category;
        });
      });

    
      setTotalTasks(prevTotal => prevTotal + 1);
      if (task.category === 'Completed') {
        setCompletedTasks(prevCompleted => prevCompleted + 1);
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(`Failed to add task: ${error.message}`);
      } else {
        setErrorMessage('An unexpected error occurred');
      }
    }
  };

 
  const handleAddTask = () => {
    setErrorMessage('');

    
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
      
      const taskId = generateTaskId(categories.flatMap(category => category.tasks)); 

      const task = {
        id: taskId,  
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
            <FcExpired className='maindivnow-content-container-img-ic' />
          </div>
          <h1 className='maindivnow-content-container-text'>Expired tasks</h1>
          <p className='maindivnow-content-container-count'>5</p>
        </div>

        <div className='maindivnow-content-container '>
          <div className='maindivnow-content-container-img active'>
            <IoBag className='maindivnow-content-container-img-ic bag' />
          </div>
          <h1 className='maindivnow-content-container-text'>All Active Tasks</h1>
          <p className='maindivnow-content-container-count'>{totalTasks}</p>
        </div>

        <div className='maindivnow-content-container '>
          <div className='maindivnow-content-container-img completed'>
            <FaRegClock className='maindivnow-content-container-img-ic clock' />
          </div>
          <h1 className='maindivnow-content-container-text'>Completed Tasks</h1>
          <p className='maindivnow-content-container-count'>{completedTasks}/{totalTasks}</p>
        </div>
        <button className='maindivnow-content-button' onClick={handleOpenModal}>+ Add Task</button>

      </div>
      <Categories searchQuery={searchQuery}/>

     
      {isModalOpen && <div className="overlay"></div>}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className='modal-header'>
            <div className='modal-header-content'>
              <div className='modal-header-content-circle'></div>
              <h2>Add Task</h2>
            </div>
            <IoMdClose style={{ cursor: "pointer" }} onClick={handleCloseModal} />
          </div>

          <div className='modal-container'>
            <div className='modal-title-container'>
              <input value={title}
                onChange={(e) => setTitle(e.target.value)} type='text' placeholder='Enter a title' required className='modal-title-container-text' />
              <HiDotsVertical />
            </div>
            <textarea value={description}
              onChange={(e) => setDescription(e.target.value)} id='description' placeholder='Enter a description...' required className='modal-container-description' />

            <div className='modal-container-buttons'>
              <input value={date}
                onChange={(e) => setDate(e.target.value)} id='date' type='date' min={today} required />

              <select value={access}
                onChange={(e) => setAccess(e.target.value)} id='access' className='modal-container-buttons-btn' required>
                <option value="" selected hidden>Assign to</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            
            {errorMessage && <p style={{ color: 'red', textAlign: "center", margin: "5px" }}>{errorMessage}</p>}
            <button className="modal-container-close" onClick={handleAddTask} >Add</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
