export interface ITask {
  
    id : number;
    category: string;
    access: string;
    title:string;
    description: string;
    deadline:string;
  }
  
export interface ICategories{
   category: string,
   id : string,
   tasks : ITask[];
}