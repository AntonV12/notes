import { useRouteError } from "react-router-dom";

function ErrorPage404() {
  const error = useRouteError() as { statusText: string; data: string };

  console.log(error);

  return (
    <div className="error-page">
      <h2>404 Not Found Error</h2>
      <h2>Запрашиваемой страницы не существует</h2>
      <p>
        <i>{error.statusText}</i>
      </p>
      <p>
        <i>{error.data}</i>
      </p>
    </div>
  );
}

export default ErrorPage404;
