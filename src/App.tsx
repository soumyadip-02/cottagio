import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import Navbar from './components/Navbar'

export default function App() {
  const [dark, setDark] = useState<boolean>(() => {
    return (localStorage.getItem('theme') || 'light') === 'dark'
  })

  useEffect(() => {
    const el = document.documentElement
    if (dark) el.classList.add('dark')
    else el.classList.remove('dark')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar dark={dark} setDark={setDark} />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </main>
    </div>
  )
}
