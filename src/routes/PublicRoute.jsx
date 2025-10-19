import { Navigate } from 'react-router';
import { useSelector } from 'react-redux';

const PublicRoute = ({ children }) => {
    const token = useSelector((state) => state.auth.token);
    return token ? <Navigate to="/" replace /> : children;
};

export default PublicRoute;
