import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Dashboard from "./components/Dashboard.tsx"
import Details from "./components/Details.tsx"
import { siteNameStorageKey, ThemeProvider } from './components/theme-provider.tsx'
import Feedback from './components/Feedback.tsx'


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/:date",
        element: <Dashboard />
      },
      {
        path: "/",
        element: <Dashboard />
      }
    ]
  },

  {
    path: "/:name/:date",
    element: <App />,
    children: [
      {
        path: "/:name/:date",
        element: <Details />
      }
    ]
  },

  {
    path: "/feedback",
    element: <App />,
    children: [
      {
        path: "/feedback",
        element: <Feedback />
      }
    ]
  },

])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey={siteNameStorageKey}>
      <RouterProvider router={router} />
    </ThemeProvider>

  </React.StrictMode>,
)
