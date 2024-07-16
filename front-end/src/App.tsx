import { useState } from 'react'
import './App.css'
import { Outlet } from "react-router-dom"
import { Button } from './components/ui/button'

function App() {


  return (
    <>
      <Outlet/>     
    </>
  )
}

export default App
