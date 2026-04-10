import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import RegistrationForm from './components/RegistrationForm'
import LoginForm from './components/LoginForm'
import './colors.css'
function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<LoginForm />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App
