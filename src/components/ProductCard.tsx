import React from 'react'
import { Link } from 'react-router-dom'

export default function ProductCard({product}:{product:any}){
  return (
    <article className="border rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
      <Link to={`/product/${product.id}`}>
        <img src={product.photos[0]} alt={product.title} className="w-full h-48 object-cover" />
      </Link>
      <div className="p-4">
        <h3 className="font-semibold">{product.title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{product.short}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="font-bold">₹{product.price}</div>
          <Link to={`/product/${product.id}`} className="text-indigo-600 dark:text-indigo-400">View</Link>
        </div>
      </div>
    </article>
  )
}
