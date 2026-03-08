import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
// import Index from './Index.jsx';
import App from './components/App.jsx';
import Home from './components/Home.jsx';


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App/>} />
      <Route path='/home' element={<Home/>} />
    </Routes>
  </BrowserRouter>  
  // <Index/>
)
