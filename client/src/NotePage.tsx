import { useState, useEffect, useCallback } from "react";
import { NoteType, UserType } from "./Card";
import { useParams, Link } from "react-router-dom";
import ErrorPage404 from "./ErrorPage404";

type RequestStatusType = "idle" | "pending" | "failed";

const NotePage = () => {
  const currentUser: UserType = JSON.parse(localStorage.getItem("user")!);
  const { noteId } = useParams<{ noteId: string }>();
  const [note, setNote] = useState<NoteType>({} as NoteType);
  const [requestStatus, setRequestStatus] = useState<RequestStatusType>("idle");
  const [deleteDate, setDeleteDate] = useState<string>("");

  const applyTheme = useCallback(function (elem: HTMLElement, parameter: string, style: string) {
    if (elem) {
      (elem as HTMLElement).style.setProperty(parameter, style);
    }
  }, []);

  const formatDate = (date: string) => {
    const localeDate = new Date(date);
    const year = String(localeDate.getFullYear());
    const month = String(localeDate.getMonth() + 1).padStart(2, "0");
    const day = String(localeDate.getDate()).padStart(2, "0");
    const hours = String(localeDate.getHours()).padStart(2, "0");
    const minutes = String(localeDate.getMinutes()).padStart(2, "0");
    const res = `${day}.${month}.${year} ${hours}:${minutes}`;
    return res;
  };

  useEffect(() => {
    document.title = `Записочка от ${note?.author_name}`;
    document
      .querySelector("meta[name=description]")!
      .setAttribute("content", `Вам записка от "${note?.author_name}" успейте просмотреть её в течение 14 дней!`);
  }, [note]);

  useEffect(() => {
    (async function fetchNote() {
      setRequestStatus("pending");

      try {
        const response = await fetch(`/api/notes/${noteId}`);
        const data: NoteType = await response.json();
        setNote(data);
        const date = new Date(data.delete_date + "Z");
        setDeleteDate(formatDate(date.toISOString()));

        setRequestStatus("idle");
      } catch (err) {
        console.error(err);
        setRequestStatus("failed");
      }
    })();
  }, [noteId, applyTheme]);

  useEffect(() => {
    const notePage: HTMLElement | null = document.querySelector(".note-page");
    const textContent: HTMLElement | null = document.querySelector(".text-content");

    if (notePage) {
      applyTheme(notePage, "background-image", note.theme);
    }
    if (textContent) {
      applyTheme(textContent, "font-family", note.font);
    }
  }, [applyTheme, note.theme, note.font]);

  useEffect(() => {
    if (note?.id) {
      if (note.author_name !== currentUser?.name && !note.watched) {
        const regex = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})\.(\d{3})Z$/;
        const newDeleteDate: string = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().replace(regex, "$1 $2");

        const newNote: NoteType = {
          ...note,
          delete_date: newDeleteDate,
          watched: true,
        };

        async function updateNote() {
          const response = await fetch(`/api/notes/${note.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newNote),
          });

          return await response.json();
        }

        updateNote();
        setDeleteDate(formatDate(newDeleteDate + "Z"));
      }
    }
  }, [note, currentUser]);

  if (requestStatus === "pending") {
    return <p className="loading">Загрузка...</p>;
  } else if (requestStatus === "failed") {
    return <ErrorPage404 />;
  }

  return (
    <div className="note-page">
      <div className="content">
        <h1>Записочка</h1>
        <h2>от {note?.author_name}</h2>
        <hr />
        <p className="text-content">{note?.message}</p>
      </div>
      <p className="delete-date"> Записка будет удалена {deleteDate}</p>

      <Link to="/">написать ответ</Link>
    </div>
  );
};

export default NotePage;
