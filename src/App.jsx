import {BrowserRouter as Router, Routes, Route, useLocation} from "react-router-dom";
import NotFound from "./pages/NotFound.jsx";
import AuthVerify from "./services/auth/AuthVerify.js";
import LoginCard from "./components/auth/LoginCard.js";
import {Provider, useSelector} from "react-redux";
import {store} from "./services/store/store.js";
import {SignUpCard} from "./components/auth/SignUpCard.tsx";
import Navbar from "./components/nav/Navbar.jsx";
import {TooltipProvider} from "./components/ui/tooltip.tsx";
import ReporteGanancias from "./pages/content/reporte.jsx";
import {
    HomePage,
   
    FinancialsPage,
    PropertiesPage,
    PropertyDetailPage,
    RentalDetailPage,
    RentalsPage,
    TenantsPage,
    CalendarPage,
    TenantProfilePage,
    ExplorerPage,
    PropertyCreationPage,
    TenantCreationPage,
    AccountPage,
    MessagesPage, MaintenancePage,
    UserManagementPage
} from "./pages/WrappedPages.js";
import {useSocket} from "./services/hooks/useSocket.js";
import SocketContext from "./services/contexts/SocketContext.js";
import {ThemeProvider} from "./services/contexts/ThemeContext.tsx";
import PublicLanding from "./pages/public/PublicLanding.jsx";
import PropertyDetailPublic from "./components/public/PropertyDetailPublic.jsx";
import PublicCatalog from "./components/public/PublicCatalog.jsx";
import HeroSettings from "./pages/admin/HeroSettings.jsx";






function App() {
    return (
        <div style={{ zoom: '80%' }} className="min-h-screen w-full">
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                <Provider store={store}>
                    <Router>
                        <AppContent/>
                    </Router>
                    <AuthVerify/>
                </Provider>
            </ThemeProvider>
        </div>
    )
}

const AppContent = () => {
    const location = useLocation();
    const isPublicRoute = location.pathname === '/' || location.pathname === '/propiedades' || location.pathname === '/login' || location.pathname === '/signup' || location.pathname.startsWith('/propiedades/');
    const showNavbar = !isPublicRoute;

    const token = useSelector(state => state.authSlice.accessToken)
    const socket = useSocket(token);

    return (
        <SocketContext.Provider value={socket}>
            <TooltipProvider>
                {showNavbar && (<Navbar>
                    <Routes>
                        <Route path="/dashboard" element={<HomePage/>} />
                        <Route path="*" element={<NotFound/>} />
                        <Route path="/account"  element={<AccountPage/>} />
                        <Route path="/settings"  element={<AccountPage/>} />
                        <Route path="/admin/hero-settings" element={<HeroSettings/>} />
                        <Route path="/properties/create" element={<PropertyCreationPage/>} />
                        <Route path="/properties/:id" element={<PropertyDetailPage/>} />
                        <Route path="/properties" element={<PropertiesPage/>} />
                        <Route path="/tenants" element={<TenantsPage/>} />
                        <Route path="/tenants/create" element={<TenantCreationPage/>} />
                        <Route path="/tenants/:id" element={<TenantProfilePage/>} />
                        <Route path="/rentals" element={<RentalsPage/>}/>
                        <Route path="/rentals/:id" element={<RentalDetailPage/>} />
                        <Route path="/financials" element={<FinancialsPage/>} />
                        <Route path="/calendar" element={<CalendarPage/>}/>
                        <Route path="/explorer" element={<ExplorerPage/>}/>
                        <Route path="/messages" element={<MessagesPage/>}/>
                        <Route path="/maintenance" element={<MaintenancePage/>}/>
                        <Route path="/reporte" element={<ReporteGanancias/>}/>
                        <Route path="/users" element={<UserManagementPage/>}/>


                    </Routes>
                </Navbar>)}
                {!showNavbar && (
                    <Routes>
                        <Route path="/" element={<PublicLanding />} />
                        <Route path="/propiedades" element={<PublicCatalog />} />
                        <Route path="/propiedades/:id" element={<PropertyDetailPublic />} />
                        <Route path="/login" element={<LoginCard/>} />
                        <Route path="/signup" element={<SignUpCard/>}/>
                    </Routes>
                )}
            </TooltipProvider>
        </SocketContext.Provider>
    )
}



export default App
