import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './assets/index.css'
import './assets/fonts.css'
import './assets/colors.css'

import HomePage from './pages/Home'
import FlagDisplay from './pages/FlagDisplay'
import TrackTime from './pages/TrackTime'
import SessionLog from './pages/SessionLog'
import TrackInfo from './pages/TrackInfo'
import TeamRadios from "./pages/TeamRadios"

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
  },
  {
    path: '/session_log',
    element: <SessionLog />
  },
  {
    path: '/trackinfo',
    element: <TrackInfo />
  },
  {
    path: '/teamradios',
    element: <TeamRadios />
  },
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RouterProvider router={router} />
)
