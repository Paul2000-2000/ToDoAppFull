import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import { ObjectId } from "mongodb";
const app = express();
app.use(cors());
app.use(express.json());
const CONNECTION_STRING =
  "mongodb+srv://admin:damongo123D!@cluster0.utdyo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DATABASENAME = "todoapp";
let database;
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
app.get("/tasks", async (req, res) => {
  if (!database) {
    res.status(500).send({ error: "Database not connected" });
    return;
  }
  const tasksCollection = database.collection("tasks");
  try {
    const result = await tasksCollection
      .find({})
      .sort({ id: 1 })
      .limit(10)
      .toArray();
    if (!result || result.length === 0) {
      console.log("No tasks found in the database");
      res.status(404).send({ error: "No tasks found" });
      return;
    }
    const categories = {
      ToDo: [],
      InProgress: [],
      Completed: [],
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
      { id: new ObjectId(), category: "To Do", tasks: categories.ToDo },
      {
        id: new ObjectId(),
        category: "In Progress",
        tasks: categories.InProgress,
      },
      {
        id: new ObjectId(),
        category: "Completed",
        tasks: categories.Completed,
      },
    ];
    res.json(categoriesArray);
  } catch (error) {
    console.error("Error retrieving tasks:", error);
    res.status(500).send({ error: "Error retrieving tasks" });
  }
});
app.post("/tasks", async (req, res) => {
  if (!database) {
    res.status(500).send({ error: "Database not connected" });
    return;
  }
  const tasksCollection = database.collection("tasks");
  try {
    const latestTask = await tasksCollection
      .find()
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    const newId = latestTask.length > 0 ? latestTask[0].id + 1 : 1;
    const newTask = {
      id: newId,
      category: req.body.category,
      access: req.body.access,
      deadline: req.body.deadline,
      description: req.body.description,
      title: req.body.title,
    };
    await tasksCollection.insertOne(newTask);
    res.status(201).send({ message: "Task added successfully", task: newTask });
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).send({ error: "Error adding task" });
  }
});
app.put("/tasks/:id", async (req, res) => {
  if (!database) {
    res.status(500).send({ error: "Database not connected" });
    return;
  }
  const tasksCollection = database.collection("tasks");
  try {
    const taskId = parseInt(req.params.id);
    const updatedTask = {
      category: req.body.category,
      access: req.body.access,
      deadline: req.body.deadline,
      description: req.body.description,
      title: req.body.title,
    };
    const result = await tasksCollection.updateOne(
      { id: taskId },
      { $set: updatedTask }
    );
    if (result.modifiedCount === 0) {
      res.status(404).send({ message: "Task not found" });
      return;
    }
    res.status(200).send({ message: "Task updated successfully" });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).send({ error: "Error updating task" });
  }
});
app.delete("/tasks/:id", async (req, res) => {
  if (!database) {
    res.status(500).send({ error: "Database not connected" });
    return;
  }
  const tasksCollection = database.collection("tasks");
  try {
    const taskId = parseInt(req.params.id); // Convert the id to a number
    const result = await tasksCollection.deleteOne({ id: taskId });
    if (result.deletedCount === 0) {
      res.status(404).send({ message: "Task not found" });
      return;
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
