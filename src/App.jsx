import './App.css'
import {Route, Routes} from "react-router";
import PublicRoute from "./routes/PublicRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import VerifyPage from "./pages/VerifyPage.jsx";
import VerificationRequiredRoute from "./routes/VerificationRequiredRoute.jsx";
import InfoPage from "./pages/InfoPage.jsx";
import FeedPage from "./pages/FeedPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

function App() {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage/>
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <RegisterPage/>
                    </PublicRoute>
                }
            />

            <Route path="/verify" element={<ProtectedRoute><VerifyPage/></ProtectedRoute>}/>
            <Route path="/verification-info" element={<ProtectedRoute><InfoPage/></ProtectedRoute>}/>

            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <VerificationRequiredRoute>
                            <Layout/>
                        </VerificationRequiredRoute>
                    </ProtectedRoute>
                }
            >
                <Route index element={<FeedPage/>}/>
                <Route path="users" element={<UsersPage/>}/>
                <Route path="users/:id" element={<ProfilePage/>}/>
            </Route>

            <Route path="*" element={<ErrorPage/>}/>
        </Routes>
    )
}

export default App
