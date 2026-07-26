import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { CustomCursor } from './CustomCursor'
import { Footer } from './Footer'
import { Header } from './Header'
import { Preloader } from './Preloader'
import { SecretBeans } from './SecretBeans'
import { SvgDefs } from './SvgDefs'
import { useLenis } from '../hooks/useLenis'
import { useMagnetic } from '../hooks/useMagnetic'

export function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [booted, setBooted] = useState(!isHome)
  const [showPreloader, setShowPreloader] = useState(isHome)

  useEffect(() => {
    if (!isHome) {
      setBooted(true)
      setShowPreloader(false)
    }
  }, [isHome])

  useLenis(booted)
  useMagnetic()

  const onPreloaderDone = useCallback(() => {
    setShowPreloader(false)
    setBooted(true)
  }, [])

  return (
    <>
      <SvgDefs />
      <CustomCursor />
      <div className="grain" />
      {showPreloader && <Preloader onDone={onPreloaderDone} />}
      {booted && (
        <>
          <Header />
          <SecretBeans />
          <main key={location.pathname} className="page-enter">
            <Outlet />
          </main>
          <Footer />
        </>
      )}
    </>
  )
}
