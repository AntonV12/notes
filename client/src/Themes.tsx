import { useState, useEffect, useRef, useCallback } from "react";
import { backgroundImage, fontFamily } from "./constants";

const Themes = ({
  activeTheme,
  setActiveTheme,
  activeFont,
  setActiveFont,
}: {
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
  activeFont: string;
  setActiveFont: (font: string) => void;
}) => {
  const [showList, setShowList] = useState<boolean>(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const applyStyle = useCallback(function (style: string, setStyle: (style: string) => void, activeStyle: string) {
    if (style === activeStyle) {
      setStyle("");
    } else {
      setStyle(style);
    }
  }, []);

  const toggleShowList = () => {
    setShowList(!showList);
    document.querySelector(".chevron-down")?.classList.toggle("rotated");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        themeRef.current &&
        !themeRef.current.contains(event.target as Node) &&
        listRef.current &&
        !listRef.current.contains(event.target as Node)
      ) {
        setShowList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="themes">
      <div className="current-theme" onClick={toggleShowList} ref={themeRef}>
        Оформление записочки{" "}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="chevron-down"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
          />
        </svg>
      </div>

      {showList && (
        <div className="themes-list" ref={listRef}>
          <div className="list">
            <div>
              <h4>Фон</h4>
              <ul>
                {Object.keys(backgroundImage).map((key) => (
                  <li
                    key={key}
                    onClick={() => applyStyle(backgroundImage[key], setActiveTheme, activeTheme)}
                    className={activeTheme === backgroundImage[key] ? "active" : ""}
                    style={{ backgroundImage: `url(${backgroundImage[key]})` }}
                  >
                    <img src={backgroundImage[key].replace("url(", "").replace(")", "")} alt={key} width={50} /> {key}
                  </li>
                ))}
              </ul>
            </div>

            <hr />
            <div>
              <h4>Шрифт</h4>
              <ul>
                {Object.keys(fontFamily).map((key) => (
                  <li
                    key={key}
                    onClick={() => applyStyle(fontFamily[key], setActiveFont, activeFont)}
                    className={activeFont === fontFamily[key] ? "active" : ""}
                    style={{ fontFamily: fontFamily[key] }}
                  >
                    {key}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button className="btn" onClick={() => setShowList(false)}>
            ок
          </button>
        </div>
      )}
    </div>
  );
};
export default Themes;
