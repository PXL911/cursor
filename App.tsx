import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import CourseManagement from './pages/CourseManagement';

const App: React.FC = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/course-management" element={<CourseManagement />} />
          <Route path="/" element={<Navigate to="/course-management" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
