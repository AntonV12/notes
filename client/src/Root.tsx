import "./styles.scss";
import { useState, useEffect } from "react";
import Card from "./Card";
import { nanoid } from "nanoid";
import { Link, Outlet, useLocation } from "react-router-dom";
import Description from "./Description";

export default function Root() {
  const user: string | null = localStorage.getItem("user");
  const [userId, setUserId] = useState<string>(user && JSON.parse(user).id);
  const location = useLocation();

  useEffect(() => {
    if (!userId) {
      const id: string = nanoid();
      localStorage.setItem("user", JSON.stringify({ id: id, name: "" }));
      setUserId(id);
    }
  }, [userId]);

  return (
    <div className="App">
      <div className="container">
        <header>
          <div id="logo">
            <Link to="/">
              <img src="/logo.png" alt="logo" />
            </Link>
            <p className="host">{window.location.hostname}</p>
          </div>
          <div className="title">
            <h1>Сервис Записочки</h1>
          </div>
        </header>

        {location.pathname === "/" && (
          <>
            <Description />
            <Card userId={userId} />
          </>
        )}

        <Outlet />
        <footer>2024 &copy; AntonV</footer>
      </div>
    </div>
  );
}
