import React from "react"
import {Routes, Route} from 'react-router-dom'

import Home from './pages/home/Home'
import Login from './pages/login/Login'

import "./app.css"


function App(){
  return(
    <Routes>
      <Route path='/' index element={<Home />} />
      <Route path='/login' element={<Login/>}/>
    </Routes>

  )
}

export default App;