import { useState, memo, useCallback, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import { Link } from "react-router-dom";
import Themes from "./Themes";

export type NoteType = {
  id: string;
  message: string;
  author_name: string;
  delete_date: string;
  watched: boolean;
  theme: string;
  font: string;
};

export type UserType = {
  id: string;
  name: string;
};

const Card = ({ userId }: { userId: string }) => {
  const [value, setValue] = useState<string>("");
  const [buttonValue, setButtonValue] = useState<string>("создать записочку");
  const [note, setNote] = useState<NoteType>({
    id: "",
    message: "",
    author_name: "",
    delete_date: "",
    watched: false,
    theme: "",
    font: "",
  });
  const location: string = window.location.origin;
  const [isHiddenMessage, setIsHiddenMessage] = useState<boolean>(true);
  const user: UserType = JSON.parse(localStorage.getItem("user")!);
  const [username, setUsername] = useState<string>(user ? user.name : "");
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTheme, setActiveTheme] = useState<string>("");
  const [activeFont, setActiveFont] = useState<string>("");

  useEffect(() => {
    document.title = "Сервис Записочки";
    document
      .querySelector("meta[name=description]")!
      .setAttribute(
        "content",
        "Сервис Записочки. Платформа, позволяющая пользователям создать короткие записки, которые можно отправить другим людям по ссылке. Напишите сообщение, получите ссылку и отправьте ее другому человеку"
      );
  }, []);

  const handleChangeText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const onCreateLink = async () => {
    try {
      setError("");

      if (value.trim() && username.trim()) {
        const noteId: string = nanoid().replace(/-/g, "_");
        const regex = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})\.(\d{3})Z$/;
        const newDeleteDate: string = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .replace(regex, "$1 $2");

        const newNote: NoteType = {
          id: noteId,
          message: value,
          author_name: username,
          delete_date: newDeleteDate,
          watched: false,
          theme: activeTheme,
          font: activeFont,
        };

        await fetch("/api/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newNote),
        });

        localStorage.setItem("user", JSON.stringify({ id: userId, name: username }));
        setNote(newNote);
        handleCopy(noteId);
      } else {
        setError("Не заполнено поле");
      }
    } catch (err) {
      setError(err as string);
    }
  };

  const handleFocus = useCallback(() => {
    if (Object.keys(note).length > 0) {
      setNote({ id: "", message: "", author_name: "", delete_date: "", watched: false, theme: "", font: "" });
    }

    if (error) {
      setError("");
    }

    if (buttonValue !== "создать записочку") {
      setButtonValue("создать записочку");
    }
  }, [note, error, buttonValue]);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(`${location}/note/${id}`);
    setButtonValue("ссылка готова и скопирована");
    handleShowMessage();
  };

  const handleShowMessage = () => {
    setIsHiddenMessage(false);

    const timeout: NodeJS.Timeout = setTimeout(() => {
      setIsHiddenMessage(true);
    }, 2000);
    return () => clearTimeout(timeout);
  };

  return (
    <div className="card">
      <div className="input-block">
        <div className="inputs">
          <label htmlFor="username">Ваше имя: </label>
          <input
            type="text"
            id="username"
            value={username}
            ref={inputRef}
            onChange={handleChangeUsername}
            onFocus={handleFocus}
            style={error && !username.trim() ? { border: "3px solid red", marginBottom: 0 } : {}}
            autoFocus
          />
        </div>
        {error && !username.trim() && <p className="error">{error}</p>}
        <Themes
          activeTheme={activeTheme}
          setActiveTheme={setActiveTheme}
          activeFont={activeFont}
          setActiveFont={setActiveFont}
        />
      </div>

      <textarea
        value={value}
        onChange={handleChangeText}
        onFocus={handleFocus}
        style={{ border: error && !value.trim() ? "3px solid red" : "", fontFamily: activeFont, fontSize: "1.6rem" }}
        placeholder="Введите текст записки"
      ></textarea>
      {error && !value.trim() && <p className="error">{error}</p>}
      <button onClick={onCreateLink} disabled={note.id !== ""}>
        {buttonValue}
      </button>
      {note.id && (
        <>
          <p>
            <Link className="link" to={`${location}/note/${note.id}`}>
              {location}/note/{note.id}
            </Link>
          </p>
          <button onClick={() => handleCopy(note.id)}>скопировать ссылку</button>
          {!isHiddenMessage && <p className="message">ссылка скопирована</p>}
        </>
      )}
    </div>
  );
};

export default memo(Card);
