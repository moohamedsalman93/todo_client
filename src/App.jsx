
import { LoadingProvider, useLoading } from './utils/LoadingContext'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import AdminPage from './pages/Admin/AdminPage';
import EmployeePage from './pages/User/EmployeePage';
import LoadingSpinner from './utils/LoadingSpinner';
import { useEffect } from 'react';
import axios from 'axios';



function App() {

  const { showLoading, hideLoading, isLoading } = useLoading();

  useEffect(() => {

    const reqInterceptor = axios.interceptors.request.use(config => {
      showLoading();
      return config;
    }, error => {
      hideLoading();
      return Promise.reject(error);
    });

    const resInterceptor = axios.interceptors.response.use(response => {
      hideLoading();
      return response;
    }, error => {
      hideLoading();
      return Promise.reject(error);
    });

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, []);



  return (

    <div className="w-full h-screen bg-[#f9fbfe] font-mono ">
      {isLoading && <LoadingSpinner />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-page" element={<AdminPage />} />
          <Route path="/user-page" element={<EmployeePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
