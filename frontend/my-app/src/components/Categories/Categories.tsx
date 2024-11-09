import React, { useEffect, useState } from 'react';
import './Categories.css';
import { ITask } from '../../interfaces/interfaces';
import { ICategories } from '../../interfaces/interfaces';
import { IoMdClose } from "react-icons/io";
import { HiDotsHorizontal } from "react-icons/hi";

const Categories =({ searchQuery }: { searchQuery: string })=> {
  const [action, setAction] = useState(""); 
  const [errorMessage, setErrorMessage] = useState(''); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<ICategories[]>([]);
  const [taskToEdit, setTaskToEdit] = useState<ITask | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [access, setAccess] = useState('');
  

  // DELETE TASK: Uses number id
  const handleDelete = async (id: number) => {
    try {
      const requestOptions = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      };
      const response = await fetch(`http://localhost:5038/tasks/${id}`, requestOptions); 
      if (!response.ok) {  
        throw new Error(`Server error: ${response.statusText}`);
      }

      setCategories(prevCategories => {
        return prevCategories.map(category => ({
          ...category,
          tasks: category.tasks.filter(task => task.id !== id),  // Using number `id`
        }));
      });
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(`Failed to delete task: ${error.message}`);
      } else {
        setErrorMessage('An unexpected error occurred');
      }
    }
  };

  // EDIT TASK: Uses number id
  const handleEdit = (id: number) => {
    setAction("");
    const category = categories.find((category) =>
      category.tasks.some((task) => task.id === id)  // Using number `id`
    );
    const task = category?.tasks.find((task) => task.id === id);  // Using number `id`

    if (task) {
      setTaskToEdit(task);
      setTitle(task.title);
      setDescription(task.description);
      setCategory(task.category); 
      setDate(task.deadline);
      setAccess(task.access);
      setIsModalOpen(true); 
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrorMessage('');
    setTaskToEdit(null);
    setTitle('');
    setDescription('');
    setCategory('');
    setDate('');
    setAccess('');
  };

  const handleUpdateTask = async () => {
    if (!taskToEdit) return;

    const updatedTask = {
      ...taskToEdit,
      title,
      description,
      category,
      deadline: date,
      access,
    };

    try {
      const response = await fetch(`http://localhost:5038/tasks/${taskToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        throw new Error(`Error updating task: ${response.statusText}`);
      }

      setIsModalOpen(false);
      fetchData();  // Refresh the task list after update
    } catch (error) {
      setErrorMessage('Failed to update task');
      console.error(error);
    }
  };

  const fetchData = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:5038/tasks');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ICategories[] = await response.json();
      setCategories(data); 
      console.log(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCategories = categories.map(category => {
    const filteredTasks = category.tasks.filter(task =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      ...category,
      tasks: filteredTasks,
    };
  });

    

  return (
    <div className='categories'>
      {
        filteredCategories.map((category, index) => (
          <div key={index} className='category'>
            <div className='category-header'>
              {
                category.category === 'To Do' ? (
                  <div className='category-header-circle todo'></div>
                ) : category.category === 'On Progress' ? (
                  <div className='category-header-circle onprogress'></div>
                ) : category.category === 'Completed' ? (
                  <div className='category-header-circle done'></div>
                ) : null
              }
              <h2 className='category-header-category'>{category.category}</h2>
              <div className='category-header-count'>{category.tasks.length}</div>
            </div>
            
            {category.tasks.map((task, index) => (
              <div key={index} className='task'>
                <div className='task-header'>
                  <div className={`task-header-access ${task.access.toLowerCase()}`}>
                    {task.access}
                  </div>
                  <select value={action} className="category-select" onChange={(e) => {
                    const action = e.target.value;
                    if (action === "delete" && task.id) {  // Using number `id`
                      handleDelete(task.id); 
                    } else if (action === "edit" && task.id) {  // Using number `id`
                      handleEdit(task.id); 
                    }
                  }}>
                    <option value="" hidden>
                      <HiDotsHorizontal />
                    </option>
                    <option value="edit">Edit Task</option>
                    <option value="delete">Delete Task</option>
                  </select>
                </div>
                <p className='task-title'>{task.title}</p>
                <p className='task-description'>{task.description}</p>
                <div className='task-deadline'>
                  <span className='task-deadline-sp'>Deadline:</span>
                  <p className='task-deadline-co'>{task.deadline}</p>
                </div>
              </div>
            ))}
          </div>
        ))
      }

      {isModalOpen && (
        <div className="modal">
          <div className="modal-header">
            <div className="modal-header-content">
              <div className="modal-header-content-circle"></div>
              <h2>Edit Task</h2>
            </div>
            <IoMdClose onClick={handleCloseModal} />
          </div>

          <div className="modal-container">
            <div className="modal-title-container">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                placeholder="Enter a title"
                required
                className="modal-title-container-text"
              />
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description..."
              required
              className="modal-container-description"
            />

            <div className="modal-container-category">
              <label htmlFor="category">Category:</label>
              <select
                id="category"
                value={category}  
                onChange={(e) => setCategory(e.target.value)}  
                className="modal-category-dropdown"
                required
              >
                <option value="" disabled hidden>
                  Select Category
                </option>
                <option value="To Do">To Do</option>
                <option value="On Progress">In Progress</option>
                <option value="Done">Completed</option>
              </select>
            </div>

            <div className="modal-container-buttons">
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                type="date"
                required
              />
              <select
                value={access}
                onChange={(e) => setAccess(e.target.value)}
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Error message */}
            {errorMessage && <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>}
            <button className="modal-container-close" onClick={handleUpdateTask}>
              Update Task
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories;
