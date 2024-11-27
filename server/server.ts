import express, { Request, Response } from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import bodyParser from "body-parser";
import { RowDataPacket, FieldPacket } from "mysql2";

interface Note {
  id: string;
  message: string;
  author_name: string;
  watched: boolean;
}

let connection: mysql.Connection;
async function connectToMySQL() {
  if (connection) {
    return;
  }

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      database: "notes-project",
      user: "root",
      password: "12345",
    });
  } catch (error) {
    console.error("Ошибка при подключении к базе данных", error);
  }
}

const app: express.Application = express();
const port: number = 3000;
const originHost: string = "http://localhost:5173";

app.use(cors({ origin: originHost }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/notes/:id", async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (!connection) {
    res.status(500).send("База данных не подключена");
    return;
  }

  try {
    let query: string = `SELECT * FROM notes WHERE id = ?`;
    let [results, fields]: [RowDataPacket[], FieldPacket[]] = await connection.query<RowDataPacket[]>(query, [id]);
    let result: RowDataPacket = results[0];
    res.send(result);
  } catch (error) {
    console.error("Ошибка при получении заметок", error);
    res.status(500).send("Ошибка при получении заметок");
  }
});

app.post("/api/notes", async (req: Request, res: Response) => {
  let { id, message, author_name, watched }: Note = req.body;

  if (!connection) {
    res.status(500).send("База данных не подключена");
    return;
  }

  if (!id || !message || !author_name) {
    res.status(400).send("Некорректные данные");
    return;
  }

  try {
    let query: string = `INSERT INTO notes (id, message, author_name, watched) VALUES ('${id}','${message}', '${author_name}', ${watched})`;

    let [results, fields]: [RowDataPacket[], FieldPacket[]] = await connection.query(query);
    res.send(results);
  } catch (error) {
    console.error("Ошибка при добавлении заметки", error);
    res.status(500).send("Ошибка при добавлении заметки");
  }
});

app.put("/api/notes/:id", async (req: Request, res: Response) => {
  if (!connection) {
    res.status(500).send("База данных не подключена");
    return;
  }

  const { id } = req.params as { id: string };
  const { watched } = req.body as { watched: boolean };

  try {
    let query: string = `UPDATE notes SET  watched = ${watched} WHERE id = '${id}'`;

    let [results, fields]: [RowDataPacket[], FieldPacket[]] = await connection.query(query);

    const eventId: string = `delete_note_${id}`;
    const eventQuery: string = `
        CREATE EVENT IF NOT EXISTS ${eventId}
        ON SCHEDULE AT CURRENT_TIMESTAMP + INTERVAL 14 DAY
        DO DELETE FROM notes WHERE id = '${id}'`;
    await connection.query(eventQuery);

    if (watched) {
      const eventIdWatched: string = `delete_note_${id}_watched_event`;
      const eventQuery: string = `
          CREATE EVENT IF NOT EXISTS ${eventIdWatched}
          ON SCHEDULE AT CURRENT_TIMESTAMP + INTERVAL 1 DAY
          DO DELETE FROM notes WHERE id = '${id}'`;
      await connection.query(eventQuery);
      await connection.query(`DROP EVENT IF EXISTS ${eventId}`);
    }

    res.send(results);
  } catch (error) {
    res.status(500).send("Ошибка при обновлении заметки");
  }
});

app.listen(port, () => {
  connectToMySQL();
  console.log(`Server started on port ${port}`);
});
