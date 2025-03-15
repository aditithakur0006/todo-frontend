const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
let connection;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Get all todos
app.get("/todos", async (req, res) => {
  try {
    const [rows] = await connection.query("SELECT * FROM todos");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new todo
app.post("/add", async (req, res) => {
  try {
    const { description } = req.body;
    const [result] = await connection.query(
      "INSERT INTO todos (description) VALUES (?)",
      [description]
    );
    res.json({ id: result.insertId, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a todo
app.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await connection.query("DELETE FROM todos WHERE id = ?", [id]);
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a todo
app.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    await connection.query("UPDATE todos SET description = ? WHERE id = ?", [
      description,
      id,
    ]);
    res.json({ id, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test route
app.get("/test", (req, res) => {
  res.send("This is working");
});

// Root route
app.get("/", (req, res) => {
  res.send("App is running");
});

const PORT = 3001;

// Database setup
const setupDb = async (db) => {
  try {
    await db.query("CREATE DATABASE IF NOT EXISTS todo_app;");
    await db.query("USE todo_app;");
    await db.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        description VARCHAR(255) NOT NULL
      );
    `);
  } catch (error) {
    console.error("Database setup error:", error);
  }
};

// MySQL Connection
mysql
  .createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "password",
    database: process.env.MYSQL_DATABASE || "todo_app",
  })
  .then(async (_connection) => {
    connection = _connection;
    await setupDb(connection);
    app.listen(PORT, () => console.log("Server is running on port", PORT));
  })
  .catch((err) => console.error("Database connection error:", err));
