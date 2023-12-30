import ReactDOM from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'

import './assets/index.scss'
import './assets/fonts.scss'
import './assets/colors.scss'

import HomePage from './pages/Home'
import FlagDisplay from './pages/FlagDisplay'
import TrackTime from './pages/TrackTime'
import SessionLog from './pages/SessionLog'
import TrackInfo from './pages/TrackInfo'
import TeamRadios from './pages/TeamRadios'
import SessionTimer from './pages/SessionTimer'
import SectorStatuses from './pages/SectorStatuses'
import SingleRCM from './pages/SingleRCM'
import Weather from './pages/Weather'
import AutoSwitcher from './pages/AutoSwitcher'
import CrashDetection from './pages/CrashDetection'
import PushLaps from './pages/PushLaps'

const router = createHashRouter([
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
    path: '/sessiontimer',
    element: <SessionTimer />
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
    path: '/sector_statuses',
    element: <SectorStatuses />
  },
  {
    path: '/teamradios',
    element: <TeamRadios />
  },
  {
    path: '/singlercm',
    element: <SingleRCM />
  },
  {
    path: '/crashdetection',
    element: <CrashDetection />
  },
  {
    path: '/weather',
    element: <Weather />
  },
  {
    path: '/current_laps',
    element: <PushLaps />
  },
  {
    path: '/autoswitcher',
    element: <AutoSwitcher />
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RouterProvider router={router} />
)
