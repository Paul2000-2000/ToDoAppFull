import React from 'react'
import './Categories.css';
import { useEffect ,useState } from 'react';

import { ITask } from '../../interfaces/interfaces';
import { ICategories } from '../../interfaces/interfaces';

import { HiDotsHorizontal } from "react-icons/hi";

const Categories = () => {

  const [categories, setCategories] = useState<ICategories[]>([]);

  const fetchData = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:5038/tasks');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ICategories[] = await response.json();
      setCategories(data); // Set the state directly with the fetched categories
      console.log(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
}, [])


  return (
    <div className='categories'>
      {
        categories.map((category, index) => (
          <div key={index} className='category'>
            <div className='category-header'>
              
            {
  category.category === 'To Do' ? (
    <div className='category-header-circle todo'></div>
  ) : category.category === 'In Progress' ? (
    <div className='category-header-circle onprogress'></div>
  ) : category.category === 'Completed' ? (
    <div className='category-header-circle done'></div>
  ) : null /* Or some default case */
}
              <h2 className='category-header-category'>{category.category}</h2>
              <div className='category-header-count'>{category.tasks.length}</div>
            </div>
            
              {category.tasks.map((task, index) => (
                <div key={index} className='task'>
                  <div>
                  <div className='task-header'>
                  <div className={`task-header-access ${task.access.toLowerCase()}`}>
  {task.access}
</div>
                    <HiDotsHorizontal/>
                   </div>
                  <p className='task-title'>{task.title}</p>
                  <p className='task-description'>{task.description}</p>
                  </div>
                  <div className='task-deadline'>
                    <span className='task-deadline-sp'>Deadline:</span>
                    <p className='task-deadline-co'>{task.deadline}</p>
                  </div>
                 
                </div>
              ))}
            </div>
          
        ))
      }
      
    </div>
   
  )
}

export default Categories
