import "./styles.scss";
import { useState, useEffect } from "react";
import Card from "./Card";
import { nanoid } from "nanoid";
import { Link, Outlet, useLocation } from "react-router-dom";

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
        <div id="logo">
          <Link to="/">
            <img src="/logo.png" alt="logo" width={70} />
            <strong>Сервис Записочки</strong>
          </Link>
        </div>

        {location.pathname === "/" && <Card userId={userId} />}
        <Outlet />
      </div>
      <footer>2024 &copy; AntonV</footer>
    </div>
  );
}
