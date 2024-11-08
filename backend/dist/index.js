import Express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";

const app = Express();
app.use(cors());
app.use(Express.json());

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
  }
  const tasksCollection = database.collection("tasks");
  try {
    const result = await tasksCollection.find({}).limit(10).toArray();
    if (!result || result.length === 0) {
      console.log("No tasks found in the database");
      res.status(404).send({ error: "No tasks found" });
    }
    res.json(result);
  } catch (error) {
    console.error("Error retrieving tasks:", error);
    res.status(500).send({ error: "Error retrieving tasks" });
  }
});

app.post("/api/tasks", async (req, res) => {
  if (!database) {
    res.status(500).send({ error: "Database not connected" });
  }
  const tasksCollection = database.collection("tasks");
  try {
    const count = await tasksCollection.countDocuments();
    const newTask = {
      id: (count + 1).toString(),
      description: req.body.newNotes, // Ensure `newNotes` exists on `req.body`
    };
    await tasksCollection.insertOne(newTask);
    res.status(201).send({ message: "Task added successfully" });
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).send({ error: "Error adding task" });
  }
});

app.delete("/api/tasks", async (req, res) => {
  if (!database) {
    res.status(500).send({ error: "Database not connected" });
  }
  const tasksCollection = database.collection("tasks");
  try {
    const result = await tasksCollection.deleteOne({ id: req.query.id });
    if (result.deletedCount === 0) {
      res.status(404).send({ message: "Task not found" });
    }
    res.status(200).send({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).send({ error: "Error deleting task" });
  }
});

const startServer = async () => {
  await connectToMongoDB();
  app.listen(5038, () => {
    console.log("Server running on port 5038");
  });
};
startServer();
