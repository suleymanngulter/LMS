import React from 'react'
import { Link } from 'react-router-dom'
import '../css/Navbar.css'

const Navbar = ({role}) => {
  return (
    <nav className='navbar'>
        <div className='navbar-left'>
            <Link to="/" className='navbar-brand'>Kitap Mağazası</Link>
        </div>
        <div className='navbar-right'>

            {role === "student" && <>
              <Link to="/LikedBooks" className="navbar-link">Beğendiğim Kitaplar</Link>
              
            

            <buton className="navbar-link"style={{background:'none',border:'none' }}
            onClick={()=>{
              const token = localStorage.getItem("token");
              if (token) {
                const redirectUrl = `http://localhost:8501?token=${token}`;
                window.location.href = redirectUrl;
              }else{
                alert("Önce giriş yapman gerekiyor.");
              }
            }} 
            
            >Kitap Öneri
            </buton>
            </>
            }


            <Link to="/books" className='navbar-link'>Kitaplar</Link>
            {role === "admin" && <>
              <Link to="/addbook" className="navbar-link">Kitap Ekle</Link>
              <Link to="/addstudent" className="navbar-link">Öğrenci Ekle</Link>
              <Link to="/dashboard" className="navbar-link">Panel</Link>
            </>
            }
            {role === "" ?
            <Link to="/login" className='navbar-link'>Giriş</Link>
             : <Link to="/logout" className='navbar-link'>Çıkış</Link>
             }
            
        </div>
    </nav>
  )
}

export default Navbar