import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import App from './App.jsx'
import ErrorPage from "./components/error.jsx";
import FileList from "./components/FileList.jsx";
import LlmList from "./components/LlmList.jsx";
import PromptList from "./components/PromptList.jsx";
import TestView from "./components/TestView.jsx";
import Candlestick from "./components/Candlestick.jsx";
import Welcome from "./components/Welcome.jsx";
import './index.css'

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/",
                element: <Welcome />,
            },
        ],
        errorElement: <ErrorPage />
    },
    {
        path: "/candlestick",
        element: <App />,
        children: [
            {
                path: "/candlestick",
                element: <Candlestick />,
            },
        ],
        errorElement: <ErrorPage />
    },
    {
        path: "/prompts",
        element: <App />,
        children: [
            {
                path: "/prompts",
                element: <PromptList />,
            },
        ],
        errorElement: <ErrorPage />
    },
    {
        path: "/llms",
        element: <App />,
        children: [
            {
                path: "/llms",
                element: <LlmList />,
            },
        ],
        errorElement: <ErrorPage />
    },
    {
        path: "/files",
        element: <App />,
        children: [
            {
                path: "/files",
                element: <FileList />,
            },
        ],
        errorElement: <ErrorPage />
    },
    {
        path: "/tests",
        element: <App />,
        children: [
            {
                path: "/tests",
                element: <TestView />,
            },
        ],
        errorElement: <ErrorPage />
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* <App /> */}
        <RouterProvider router={router} />
    </React.StrictMode>,
)
