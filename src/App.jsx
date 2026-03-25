import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Splash from './pages/Splash'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Explore from './pages/Explore'
import ProjectDetail from './pages/ProjectDetail'
import Upload from './pages/Upload'
import AskDoubt from './pages/AskDoubt'
import Experts from './pages/Experts'
import Profile from './pages/Profile'
import CollegeRepo from './pages/CollegeRepo'

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/explore" element={<Layout><Explore /></Layout>} />
        <Route path="/project/:id" element={<Layout><ProjectDetail /></Layout>} />
        <Route path="/upload" element={<Layout><Upload /></Layout>} />
        <Route path="/doubt" element={<Layout><AskDoubt /></Layout>} />
        <Route path="/experts" element={<Layout><Experts /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/college-repo" element={<Layout><CollegeRepo /></Layout>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
