import { Outlet } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar'

function App() {
  return (
    <>
      <div className="min-h-screen w-screen flex">
        <div className="w-64 h-screen fixed top-0 left-0 z-40">
          <Sidebar />
        </div>
        <div className={"flex flex-grow ml-64"}>
          <Outlet />
        </div >
      </div>
    </>
  )
}

export default App
