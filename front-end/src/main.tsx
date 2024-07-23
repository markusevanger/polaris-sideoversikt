import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import Dashboard from "./components/Dashboard.tsx"
import Details from "./components/Details.tsx"


const router = createBrowserRouter([
  {
    path:"/",
    element: <App/>,
    children: [
      {
        path:"/",
        element: <Dashboard/>
      }
    ]
  },

  {
    path:"/:name/:date",
    element: <App/>,
    children: [
      {
        path:"/:name/:date",
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
