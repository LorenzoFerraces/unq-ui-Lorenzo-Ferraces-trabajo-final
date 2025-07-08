import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <header className="header">
            <div className="header-content">
                <Link to="/" className="logo">
                    WORDLE
                </Link>

                <nav className="nav-links">
                    <Link
                        to="/"
                        className={`nav-link ${isActive('/') ? 'active' : ''}`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/game"
                        className={`nav-link ${isActive('/game') ? 'active' : ''}`}
                    >
                        Play
                    </Link>
                </nav>

                <div className="user-info">
                    <span className="username">Hi, {user?.username}!</span>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header; 