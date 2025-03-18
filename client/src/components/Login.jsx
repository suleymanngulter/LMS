import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Login.css'; 

const Login = ({ setRoleVar }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const navigate = useNavigate();

  axios.defaults.withCredentials = true; 

  const handleSubmit = () => {
    axios.post('http://localhost:3001/auth/login', { username, password, role })
      .then(res => {
        console.log("Gelen cevap:", res); 

        if (res.data.login && res.data.role === 'admin') {
          setRoleVar('admin');
          navigate('/dashboard'); 
        } else if (res.data.login && res.data.role === 'student') {
          setRoleVar('student');
          navigate('/'); 
        }
      })
      .catch(err => {
        console.log("Hata:", err.response ? err.response.data : err.message);
      });
  };

  return (
    <div className='login-page'>
      <div className="login-container">
        <h2>Giriş</h2>
        <div className="form-group">
          <label htmlFor="username">Kullanıcı Adı:</label>
          <input 
            type="text" 
            placeholder='Kullanıcı Adınızı Giriniz'
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Şifre:</label>
          <input 
            type="password" 
            placeholder='Şifrenizi Girin'
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Rol</label>
          <select 
            name="role" 
            id="role"
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="student">Öğrenci</option>
          </select>
        </div>
        <button className='btn-login' onClick={handleSubmit}>Giriş</button>
      </div>
    </div>
  );
}

export default Login;
