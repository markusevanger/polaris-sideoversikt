import { useState } from 'react'
import './App.css'
import { Button } from './components/ui/button'

function App() {

  var [counter, setCounter] = useState(0)

  return (
    <>
    <div className='h-screen w-full flex items-center justify-center flex-col gap-10'>
      <h1 className='text-lg'> {counter }</h1>
      <Button onClick={()=> setCounter(counter+=1)}>Heisann!</Button>
    </div>
      
    </>
  )
}

export default App
