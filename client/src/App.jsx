import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import { Toaster } from 'react-hot-toast'
import { AuthContext } from './context/AuthContext'

const App = () => {

  const { authUser } = useContext(AuthContext);

  return (
    <div className="bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#020617] min-h-screen">
      <Toaster />
      <Routes>
        <Route path='/' element={authUser ? <Home /> : <Navigate to='/login'/>} />
        <Route path='/login' element={!authUser ? <Login /> : <Navigate to='/'/>} />
        <Route path='/profile' element={authUser ? <Profile /> : <Navigate to='/login'/>} />
      </Routes>
    </div>
  )
}

export default App
