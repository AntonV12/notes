import { useState, memo, useCallback } from "react";
import { nanoid } from "nanoid";
import { Link } from "react-router-dom";

const host = "http://localhost:3000";

export type NoteType = {
  id: string;
  message: string;
  author_name: string;
  watched: boolean;
};

export type UserType = {
  id: string;
  name: string;
};

const Card = ({ userId }: { userId: string }) => {
  const [value, setValue] = useState<string>("");
  const [buttonValue, setButtonValue] = useState<string>("Получить ссылку");
  const [note, setNote] = useState<NoteType>({
    id: "",
    message: "",
    author_name: "",
    watched: false,
  });
  const location: string = window.location.origin;
  const [isHiddenMessage, setIsHiddenMessage] = useState<boolean>(true);
  const user: UserType = JSON.parse(localStorage.getItem("user")!);
  const [username, setUsername] = useState<string>(user ? user.name : "");
  const [error, setError] = useState<string>("");

  console.log(user);

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
        const newNote: NoteType = {
          id: noteId,
          message: value,
          author_name: username,
          watched: false,
        };

        await fetch(`${host}/api/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newNote),
        });

        await fetch(`${host}/api/notes/${newNote.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newNote),
        });

        localStorage.setItem("user", JSON.stringify({ id: userId, name: username }));
        setNote(newNote);
        handleCopy(noteId);
        setValue("");
      } else {
        setError("Не заполнено поле");
      }
    } catch (err) {
      setError(err as string);
    }
  };

  const handleFocus = useCallback(() => {
    if (Object.keys(note).length > 0) {
      setNote({ id: "", message: "", author_name: "", watched: false });
    }

    if (error) {
      setError("");
    }

    if (buttonValue !== "Получить ссылку") {
      setButtonValue("Получить ссылку");
    }
  }, [note, error, buttonValue]);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(`${location}/note/${id}`);
    setButtonValue("Ссылка готова и скопирована");
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
        <label htmlFor="username">Ваше имя: </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={handleChangeUsername}
          onFocus={handleFocus}
          style={error && !username.trim() ? { border: "3px solid red", marginBottom: 0 } : {}}
          disabled={user?.name !== ""}
        />
        {error && !username.trim() && <p className="error">{error}</p>}
      </div>
      <textarea
        value={value}
        onChange={handleChangeText}
        onFocus={handleFocus}
        style={error && !value.trim() ? { border: "3px solid red" } : {}}
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
          <button onClick={() => handleCopy(note.id)}>Скопировать ссылку</button>
          {!isHiddenMessage && <p className="message">Ссылка скопирована</p>}
        </>
      )}
    </div>
  );
};

export default memo(Card);
