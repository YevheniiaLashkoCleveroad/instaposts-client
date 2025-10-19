import { Navigate } from 'react-router';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
    const token = useSelector((state) => state.auth.token);
    return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
