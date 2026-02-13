import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import Sales from './pages/Sales/Sales';
import Contact from './pages/Contact/Contacts/Contacts';
import Timesheet from './pages/Timesheet/Timesheet';
<<<<<<< HEAD
import Finance from './pages/Finance/Finance';
=======
import TodoList from './pages/TodoList/TodoList';
>>>>>>> 8759994719d62236796692455c1dc341daae1c03
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="sales" element={<Sales />} />
            <Route path="contact" element={<Contact />} />
            <Route path="timesheet" element={<Timesheet />} />
<<<<<<< HEAD
            <Route path="finance" element={<Finance />} />
=======
            <Route path="todolist" element={<TodoList />} />
>>>>>>> 8759994719d62236796692455c1dc341daae1c03
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
