"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSelector, useDispatch } from "react-redux"
import { useGetUserQuery } from "@/services/api/userApi.js"
import { logout } from "@/services/auth/authSlice.js"

export function Header({ alwaysSolid = false }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobileMenuOpen])

  const authSlice = useSelector((state: any) => state.authSlice)
  const dispatch = useDispatch()
  const { data: userResponse } = useGetUserQuery(undefined, { skip: !authSlice?.accessToken })
  const user = userResponse?.data

  const handleLogout = () => {
    dispatch(logout())
    localStorage.removeItem('refreshToken')
  }

  const desktopNavLinks = [
    { href: "/", label: "Inicio" },
    { href: "/propiedades", label: "Propiedades" },
    { href: "/#nosotros", label: "Sobre Nosotros" },
    { href: "/#contacto", label: "Contacto" },
  ]

  const mobileNavLinks = [
    { href: "/", label: "Inicio" },
    { href: "/propiedades", label: "Catálogo Completo" },
    { href: "/propiedades?type=Venta", label: "Ventas" },
    { href: "/propiedades?type=Alquiler", label: "Alquileres" },
    { href: "/#nosotros", label: "Sobre Nosotros" },
    { href: "/#contacto", label: "Contacto" },
  ]

  // Conditionally add Login or Admin
  if (authSlice?.accessToken && user && ['ADMIN', 'EMPLOYEE', 'REALTOR'].includes(user.role)) {
      desktopNavLinks.push({ href: "/dashboard", label: "Admin" })
      mobileNavLinks.push({ href: "/dashboard", label: "Admin" })
  } else if (!authSlice?.accessToken) {
      desktopNavLinks.push({ href: "/login", label: "Login" })
      mobileNavLinks.push({ href: "/login", label: "Login" })
  } else {
      // If logged in but not admin (e.g. TENANT), they might go to dashboard too, but let's call it "Mi Panel"
      desktopNavLinks.push({ href: "/dashboard", label: "Mi Panel" })
      mobileNavLinks.push({ href: "/dashboard", label: "Mi Panel" })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || alwaysSolid ? "bg-[#0a0a0a] py-3 shadow-lg" : "bg-transparent py-6"
        }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4 group">
          <img
            src="/images/logo.png"
            alt="Logo"
            width={100}
            height={100}
            className="h-14 md:h-16 w-auto object-contain transition-all duration-300"
          />
          <div className="flex flex-col justify-center">
            <span className="text-xl md:text-2xl font-bold tracking-widest text-white transition-colors duration-300">
              JORGE A. PIGHIN
            </span>
            <span className="w-full h-[2px] bg-[#C7A15E] mt-1 transition-all duration-300"></span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {desktopNavLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-300 tracking-wide"
            >
              {link.label}
            </Link>
          ))}

          <Button
            asChild
            className="bg-[#C7A15E] hover:bg-[#b8923f] text-black font-medium px-6 py-2 rounded-none transition-all duration-300"
          >
            <Link to="/#contacto">Agendar Cita</Link>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 top-[72px] bg-black transition-all duration-300 overflow-y-auto pb-20 ${isMobileMenuOpen ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
          }`}
      >
        <nav className="flex flex-col items-center justify-start min-h-full pt-12 pb-24 gap-8">
          {mobileNavLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-medium text-white/80 hover:text-white transition-colors duration-300 tracking-wide"
            >
              {link.label}
            </Link>
          ))}

          <Button
            asChild
            className="bg-[#C7A15E] hover:bg-[#b8923f] text-black font-medium px-8 py-3 rounded-none transition-all duration-300 mt-4"
          >
            <Link to="/#contacto" onClick={() => setIsMobileMenuOpen(false)}>
              Agendar Cita
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
