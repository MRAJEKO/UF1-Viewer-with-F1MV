import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './assets/index.css'
import './assets/fonts.css'

import HomePage from './pages/Home'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RouterProvider router={router} />
)
