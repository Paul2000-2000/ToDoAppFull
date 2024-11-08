import express, { Request, Response } from "express";
import { MongoClient, Collection } from "mongodb";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json()); // Middleware for parsing JSON

const CONNECTION_STRING =
  "mongodb+srv://admin:damongo123D!@cluster0.utdyo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DATABASENAME = "todoapp";
let database;



interface Task {
  _id: string;
  category: string;
  access: string;
  title:string;
  description: string;
  deadline:string;
}


const connectToMongoDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    const client = await MongoClient.connect(CONNECTION_STRING);
    database = client.db(DATABASENAME);
    console.log("MongoDB Connection established");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

app.get("/tasks", async (req: Request, res: Response): Promise<void> => {

  if (!database) {
    res.status(500).send({ error: "Database not connected" });
    return;
  }

  const tasksCollection: Collection<Task> = database.collection("tasks");

  try {
    const result = await tasksCollection.find({}).limit(10).toArray();

    if (!result || result.length === 0) {
      console.log("No tasks found in the database");
      res.status(404).send({ error: "No tasks found" });
      return;
    }
   
    const categories = {
      ToDo: [],
      InProgress: [],
      Completed: []
    };


    result.forEach((task) => {
      switch (task.category) {
        case "To Do":
          categories.ToDo.push(task);
          break;
        case "On Progress":
          categories.InProgress.push(task);
          break;
        case "Done":
          categories.Completed.push(task);
          break;
        default:
          console.warn(`Unknown category: ${task.category}`);
      }
    });

  
    const categoriesArray = [
      { category: "InProgress", tasks: categories.InProgress },
      { category: "Completed", tasks: categories.Completed }
    ];

    res.json(categoriesArray); 

  } catch (error) {
    console.error("Error retrieving tasks:", error);
    res.status(500).send({ error: "Error retrieving tasks" });
  }
});


app.post("/tasks", async (req: Request, res: Response) : Promise<void> => {
  if (!database) {
    res.status(500).send({ error: "Database not connected" });
  }

  const tasksCollection = database.collection("tasks");

  try {
    const newTask = {
      category: req.body.category,
      access: req.body.access,
      deadline: req.body.deadline,
      description: req.body.description, 
      title:req.body.title,
    };


    await tasksCollection.insertOne(newTask);
    res.status(201).send({ message: "Task added successfully" });
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).send({ error: "Error adding task" });
  }
});


app.delete("/tasks/:id", async (req: Request, res: Response) : Promise<void> => {
  if (!database) {
    res.status(500).send({ error: "Database not connected" });
  }

  const tasksCollection : Collection<Task> = database.collection("tasks");

  try {
    const result = await tasksCollection.deleteOne({ id: req.query.id as string });
    if (result.deletedCount === 0) {
      res.status(404).send({ message: "Task not found" });
    }

    res.status(200).send({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).send({ error: "Error deleting task" });
  }
});

// Start server
const startServer = async () => {
  await connectToMongoDB();
  app.listen(5038, () => {
    console.log("Server running on port 5038");
  });
};

startServer();
