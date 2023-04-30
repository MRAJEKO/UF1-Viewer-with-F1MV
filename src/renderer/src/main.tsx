import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './assets/index.css'
import './assets/fonts.css'
import './assets/colors.css'

import HomePage from './pages/Home'
import FlagDisplay from './pages/FlagDisplay'
import TrackTime from './pages/TrackTime'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/flag_display',
    element: <FlagDisplay />
  },
  {
    path: '/tracktime',
    element: <TrackTime />
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RouterProvider router={router} />
)
