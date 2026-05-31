import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import HomePage from './components/HomePage.jsx'
import WorkIndex from './components/WorkIndex.jsx'
import AboutPage from './components/AboutPage.jsx'
import ProjectDetail from './components/ProjectDetail.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/work" element={<WorkIndex />} />
        <Route path="/work/:projectId" element={<ProjectDetail />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}