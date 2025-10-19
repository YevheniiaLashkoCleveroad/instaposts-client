import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';

const VerificationRequiredRoute = ({ children }) => {
    const { user, loading } = useSelector((s) => s.auth);

    if (loading) return null;

    if (!user) return null;

    if (!user.isVerified) {
        return <Navigate to="/verification-info" replace />;
    }

    return children;
};

export default VerificationRequiredRoute;
