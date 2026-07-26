import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { About } from './pages/About'
import { Automation } from './pages/Automation'
import { Concierge } from './pages/Concierge'
import { Gallery } from './pages/Gallery'
import { Home } from './pages/Home'
import { Journal } from './pages/Journal'
import { Menu } from './pages/Menu'
import { Passport } from './pages/Passport'
import { PassportAdmin } from './pages/PassportAdmin'
import { Personality } from './pages/Personality'
import { Reserve } from './pages/Reserve'
import { Ritual } from './pages/Ritual'
import { Secret } from './pages/Secret'
import { Table } from './pages/Table'
import { TablesDesk } from './pages/TablesDesk'
import { Visit } from './pages/Visit'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="menu" element={<Menu />} />
          <Route path="about" element={<About />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="visit" element={<Visit />} />
          <Route path="reserve" element={<Reserve />} />
          <Route path="ritual" element={<Ritual />} />
          <Route path="passport" element={<Passport />} />
          <Route path="personality" element={<Personality />} />
          <Route path="journal" element={<Journal />} />
          <Route path="concierge" element={<Concierge />} />
          <Route path="secret" element={<Secret />} />
          <Route path="table/:tableCode" element={<Table />} />
          <Route path="tables" element={<TablesDesk />} />
          <Route path="admin/passport" element={<PassportAdmin />} />
          <Route path="automation" element={<Automation />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
