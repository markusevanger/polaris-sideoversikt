import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import Dashboard from "./components/Dashboard.tsx"
import Details from "./components/Details.tsx"
import ErrorPage from "./components/error-page.tsx";


const router = createBrowserRouter([
  {
    path:"/",
    element: <App/>,
    errorElement: <ErrorPage/>,
    children: [
      {
        path:"/",
        element: <Dashboard/>
      }
    ]
  },

  {
    path:"/:name",
    element: <App/>,
    children: [
      {
        path:"/:name",
        element: <Details/>
      }
    ]
  },

])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
)
