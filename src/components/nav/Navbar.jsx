import { Button } from "../ui/button.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import { BiSolidRocket } from "react-icons/bi";
import Header from "./Header.jsx";
import { Header as PublicHeader } from "../public/header.tsx";

import {
    Building2,
    BuildingIcon,
    CalendarIcon,
    CircleDollarSignIcon,
    DrillIcon,
    HomeIcon,
    UserIcon,
    UsersIcon,
    FileTextIcon,
    LayoutTemplate,
    LogOutIcon
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../services/auth/authSlice.js";
import { usePrefetch } from "../../services/api/authApi.js"
import { useGetUserQuery } from "../../services/api/userApi.js";

const items = [
    {
        title: 'Inicio',
        url: '/dashboard',
        icon: <HomeIcon />,
        section: "MENU"
    },
    {
        title: 'Propiedades',
        url: '/properties',
        icon: <Building2 />,
        section: "MENU"
    },
    {
        title: 'Alquileres',
        url: '/rentals',
        icon: <BuildingIcon />,
        section: "MENU"
    },
    {
        title: 'Finanzas',
        url: '/financials',
        icon: <CircleDollarSignIcon />,
        section: "MENU"
    },
    {
        title: 'Inquilinos',
        url: '/tenants',
        icon: <UserIcon />,
        section: "MENU"
    },
    {
        title: 'Mantenimiento',
        url: '/maintenance',
        icon: <DrillIcon />,
        section: "MENU"
    },
    {
        title: 'Reportes',
        url: '/reporte',
        icon: <FileTextIcon />,
        section: "MENU"
    },
    {
        title: 'Gestión Portada',
        url: '/admin/hero-settings',
        icon: <LayoutTemplate />,
        section: "MENU"
    },
    {
        title: 'Usuarios',
        url: '/users',
        icon: <UsersIcon />,
        section: "MENU"
    },
    {
        title: 'Catálogo GVAmax',
        url: '/gvamax',
        icon: <Building2 />,
        section: "MENU"
    }
]

// eslint-disable-next-line react/prop-types
const Navbar = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const authSlice = useSelector(state => state.authSlice);

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    const { isLoading: userIsLoading } = useGetUserQuery();

    // use prefetch on user, properties API
    const prefetchProperties = usePrefetch("getProperties")
    const prefetchUser = usePrefetch("getUser")
    const prefetchUnits = usePrefetch("getUnits")
    const prefetchTenants = usePrefetch("getTenants")
    const prefetchLeases = usePrefetch("getLeases")
    const prefetchPayments = usePrefetch("getPayments")
    const prefetchMaintenance = usePrefetch("getMaintenanceReports")
    const prefetchExpenses = usePrefetch("getExpenses")

    prefetchUser();
    prefetchProperties();
    prefetchUnits();
    prefetchTenants();
    prefetchLeases();
    prefetchPayments();
    prefetchMaintenance();
    prefetchExpenses();

    function getNavItems(section) {
        return items.filter(item => item.section === section);
    }

    // If user is not logged in, but we are still waiting for the API (/user) to respond, show a loading spinner
    if (!authSlice.accessToken || userIsLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-screen">
                <div className="rounded-md h-12 w-12 border-4 border-t-4 border-blue-500 animate-spin"></div>
            </div>
        )
    }
    // Different nav button variant depending on if the current page is active or not
    function getNavButtonVariant(url) {
        if (url === "/") {
            return location.pathname === url ? "nav-button-active" : "nav-button";
        }

        return location.pathname.includes(url) ? "nav-button-active" : "nav-button";
    }


    const NavBar = () => {
        return (
            <div
                className={"bottom-0 top-[88px] flex flex-col z-40 border-r-2 border-border w-16 md:w-56 bg-background-light fixed "}
            >
                <div className="flex-1 overflow-y-auto py-5">
                    <nav className="hidden md:flex flex-col gap-y-2">
                        <p className="text-muted-foreground font-500 mx-2 uppercase">
                            MENÚ
                        </p>
                        <div className="flex flex-col gap-2 mx-2">
                            {getNavItems("MENU").map((item, index) => (
                                <Button variant={getNavButtonVariant(item.url)} className="w-full justify-start flex gap-2" key={index}
                                    onClick={() => navigate(item.url)}>
                                    {item.icon}
                                    {item.title}
                                </Button>
                            )
                            )}
                        </div>

                        <div className="flex flex-col gap-2 mx-2">
                            {getNavItems("PERSONAL").map((item, index) => (
                                <Button variant={getNavButtonVariant(item.url)} className="w-full justify-start flex gap-2" key={index}
                                    onClick={() => navigate(item.url)}>
                                    {item.icon}
                                    {item.title}
                                </Button>
                            )
                            )}
                        </div>
                    </nav>

                    <nav className="md:hidden flex flex-col justify-center items-center gap-y-1">
                        {getNavItems("MENU").concat(getNavItems("PERSONAL")).map((item, index) => (
                            <Button key={index} variant={getNavButtonVariant(item.url)} size="icon"
                                className="justify-center items-center"
                                onClick={() => navigate(item.url)}>
                                {item.icon}
                            </Button>
                        ))}
                    </nav>
                </div>


            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader alwaysSolid={true} />
            <div className="flex flex-1 pt-[88px] w-full max-w-full overflow-x-hidden">
                <NavBar />
                <main className={"pl-[4.25rem] md:pl-[14.75rem] min-h-[calc(100vh-88px)] w-full max-w-full overflow-x-hidden"}>
                    <Header />
                    <div className="p-2 sm:p-4 bg-background-light rounded-lg border-border border-2 w-full overflow-x-hidden">
                        {children}
                    </div>
                </main>
            </div>
        </div>)
}

export default Navbar;