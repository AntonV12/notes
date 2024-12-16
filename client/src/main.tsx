import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./Root.tsx";
import NotePage from "./NotePage.tsx";
import ErrorPage404 from "./ErrorPage404.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage404 />,
  },
  {
    path: "note/:noteId",
    element: <NotePage />,
    errorElement: <ErrorPage404 />,
  },
]);

const rootElement: HTMLElement | null = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}
