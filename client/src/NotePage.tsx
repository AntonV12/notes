import { useState, useEffect } from "react";
import { NoteType, UserType } from "./Card";
import { useParams } from "react-router-dom";

const host: string = "http://localhost:3000";
type RequestStatusType = "idle" | "pending" | "failed";

const NotePage = () => {
  const currentUser: UserType = JSON.parse(localStorage.getItem("user")!);
  const { noteId } = useParams<{ noteId: string }>();
  const [note, setNote] = useState<NoteType>({} as NoteType);
  const [requestStatus, setRequestStatus] = useState<RequestStatusType>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = `Записочка от ${note?.author_name}`;
  }, [note]);

  useEffect(() => {
    (async function fetchNote() {
      setError(null);
      setRequestStatus("pending");

      try {
        const response = await fetch(`${host}/api/notes/${noteId}`);
        const data: NoteType = await response.json();
        setNote(data);

        setRequestStatus("idle");
      } catch (err) {
        setError("Ошибка загрузки: " + err);
        setRequestStatus("failed");
      }
    })();
  }, [noteId]);

  useEffect(() => {
    if (note?.id) {
      if (note?.author_name !== currentUser?.name && !note?.watched) {
        const newNote: NoteType = {
          ...note,
          watched: true,
        };

        fetch(`${host}/api/notes/${note.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newNote),
        });
      }
    }
  }, [note, currentUser]);

  if (requestStatus === "pending") {
    return <p className="loading">Загрузка...</p>;
  } else if (requestStatus === "failed") {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="note-page">
      <h1>Записочка</h1>
      <h2>от {note?.author_name}</h2>
      <hr />
      <p>{note?.message}</p>
    </div>
  );
};

export default NotePage;
