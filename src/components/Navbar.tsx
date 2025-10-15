import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold">Cottagio</Link>
        <nav className="space-x-4">
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
          <Link to="/cart" className="hover:underline">Cart</Link>
          <button
            onClick={() => setDark(!dark)}
            className="ml-4 px-3 py-1 rounded bg-slate-100 dark:bg-slate-700"
          >
            {dark ? 'Light' : 'Dark'}
          </button>
        </nav>
      </div>
    </header>
  )
}
