import express from "express";
import mysql from "mysql2/promise";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";

const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "12345",
  database: "notes-project",
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Ошибка при подключении к базе данных", err);
    return;
  } else {
    console.log("Подключение к базе данных установлено");
    connection.release();
  }
});

const app = express();
const port = 3005;
app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/notes/:id/", async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await pool.execute("SELECT * FROM notes WHERE id = ?", [id]);
    if (results.length === 0) {
      return res.status(404).send("Заметка не найдена");
    }
    res.send(results[0]);
  } catch (err) {
    console.error("Ошибка при получении заметки", err);
    res.status(500).send("Ошибка при получении заметки");
  }
});

app.post("/api/notes", async (req, res) => {
  const { id, message, author_name, delete_date, watched, theme, font } = req.body;

  if (!id || !message || !author_name) {
    return res.status(400).send("Некорректные данные");
  }

  try {
    const sql = `INSERT INTO notes (id, message, author_name, delete_date, watched, theme, font) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [results] = await pool.execute(sql, [id, message, author_name, delete_date, watched, theme, font]);
    res.send(results);
  } catch (err) {
    console.error("Ошибка при добавлении заметки", err);
    res.status(500).send("Ошибка при добавлении заметки");
  }
});

app.put("/api/notes/:id", async (req, res) => {
  const { id } = req.params;
  const updatedNote = req.body;

  try {
    const sql = `UPDATE notes SET message = ?, author_name = ?, delete_date = ?, watched = ? WHERE id = ?`;
    const values = [updatedNote.message, updatedNote.author_name, updatedNote.delete_date, updatedNote.watched, id];
    const [results] = await pool.execute(sql, values);
    res.send(results);
  } catch (err) {
    console.error("Ошибка при обновлении заметки", err);
    res.status(500).send("Ошибка при обновлении заметки");
  }
});

cron.schedule("* * * * *", async () => {
  try {
    await pool.execute("DELETE FROM notes WHERE delete_date < NOW()");
  } catch (err) {
    console.error("Ошибка при очистке заметок", err);
  }
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/note/:id", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
