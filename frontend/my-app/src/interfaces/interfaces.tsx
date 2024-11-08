export interface ITask {
    _id?: string;
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