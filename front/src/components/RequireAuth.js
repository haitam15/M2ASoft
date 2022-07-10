import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const RequireAuth = ({ allowedRole }) => {
    const { auth } = useAuth();
    const location = useLocation();

    return (

        auth?.token ? auth.token?.role === allowedRole ? <Outlet /> 
            : <Navigate to="/unauthorized" state={{ from: location }} replace />
            : allowedRole === "User"
            ? <Navigate to="/login" state={{ from: location }} replace />
            : <Navigate to="/loginA" state={{ from: location }} replace />

        // auth?.token?.role === allowedRole
        //     ? <Outlet />
        //     : auth?.user
        //         ? <Navigate to="/unauthorized" state={{ from: location }} replace />
        //         : <Navigate to="/login" state={{ from: location }} replace />
    );
}

export default RequireAuth;