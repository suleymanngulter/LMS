import React, { useEffect, useState } from 'react'
import axios from 'axios'
import  {useNavigate, useParams} from 'react-router-dom'

const EditBook = () => {
    const [name, setName] = useState('')
    const [author, setAuthor] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const navigate = useNavigate()
    const {id} = useParams()

    useEffect(() => {
      axios.get(`http://localhost:3001/book/${id}`)
        .then(res => {
          setName(res.data.name);
          setAuthor(res.data.author);
          setImageUrl(res.data.imageUrl);
        })
        .catch(err => console.log(err));
    }, [id]); // Burada id'yi bağımlılık olarak ekliyoruz
  
    // Formu submit ederken yapılacak işlemi handleSubmit ile ayarlıyoruz
    const handleSubmit = (e) => {
      e.preventDefault();
  
      // PUT isteğiyle kitabı güncelliyoruz
      axios.put(`http://localhost:3001/book/${id}`, { name, author, imageUrl })
        .then(res => {
          if (res.data.updated) {
            navigate('/books'); // Güncelleme başarılıysa kitaplar sayfasına yönlendir
          }
        })
        .catch(err => console.log(err));
    };

  return (
    <div className="student-form-container">
      <form className="student-form" onSubmit={handleSubmit}>
        <h2>Kitap Düzenle</h2>
        <div className="form-group">
          <label htmlFor="book">Kitap Adı:</label>
          <input type="text" id="book" name="book"  value={name}
          onChange={(e) => setName(e.target.value)}/>
        </div>
        <div className="form-group">
          <label htmlFor="author">Yazar İsmi:</label>
          <input type="text" id="author" name="author" value ={author}
          onChange={(e) => setAuthor(e.target.value)}/>
        </div>
        <div className="form-group">
          <label htmlFor="image">Resim URL'si:</label>
          <input type="text" id="image" name="image" value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}/>
        </div>
        <button type="submit">Güncelle</button>
      </form>
    </div>
  )
}

export default EditBook