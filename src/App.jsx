import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Header from './components/common/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Game from './pages/Game';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <div className="app">
                <Header />
                <main className="main-content">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={
                            <Home />
                        } />
                        <Route path="/game" element={
                            <Game />
                        } />
                    </Routes>
                </main>
            </div>
        </AuthProvider>
    );
}

export default App; 