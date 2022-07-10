import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import Layout from './components/Layout';
import Missing from './components/Missing';
import Unauthorized from './components/Unauthorized';
import RequireAuth from './components/RequireAuth';
import { Routes, Route } from 'react-router-dom';
import Users from './components/Users';
import Weather from './components/Weather';
import LoginA from './components/LoginA';
import Admin from './components/Admin';


function App() {

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* public routes */}
        <Route path="login" element={<Login />} />
        <Route path="loginA" element={<LoginA />} />
        <Route path="register" element={<Register />} />
        <Route path="unauthorized" element={<Unauthorized />} />

        {/* we want to protect these routes */}
        <Route element={<RequireAuth allowedRole="User" />}>
          <Route path="/" element={<Home />} />
        </Route>

        <Route element={<RequireAuth allowedRole="User" />}>
          <Route path="/weather" element={<Weather />} />
        </Route>

        <Route element={<RequireAuth allowedRole="Admin" />}>
          <Route path="/admin" element={<Admin />} />
        </Route>


        <Route element={<RequireAuth allowedRole="User" />}>
          <Route path="/users" element={<Users />} />
        </Route>


        {/* catch all */}
        <Route path="*" element={<Missing />} />
      </Route>
    </Routes>
  );
}

export default App;