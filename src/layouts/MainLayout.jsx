import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaChartColumn, FaUserGroup, FaClock, FaRightFromBracket, FaHouse } from 'react-icons/fa6';

export default function MainLayout() {
    const { logout } = useAuth();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const navItems = [
        { path: '/', icon: <FaHouse />, label: 'Dashboard' },
        { path: '/sales', icon: <FaChartColumn />, label: 'Sales' },
        { path: '/contact', icon: <FaUserGroup />, label: 'Contacts' },
        { path: '/timesheet', icon: <FaClock />, label: 'Timesheet' },
    ];

    return (
        <div className="d-flex" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            <div className="d-flex flex-column p-3 glass-panel m-3" style={{ width: '250px' }}>
                <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none text-white">
                    <span className="fs-4 fw-bold" style={{ color: 'var(--accent-primary)' }}>A365 Tracker</span>
                </a>
                <hr className="text-secondary" />
                <ul className="nav nav-pills flex-column mb-auto">
                    {navItems.map((item) => (
                        <li className="nav-item mb-2" key={item.path}>
                            <Link
                                to={item.path}
                                className={`nav-link text-white d-flex align-items-center gap-2 ${location.pathname === item.path ? 'active' : ''}`}
                                style={{
                                    background: location.pathname === item.path ? 'var(--bg-glass)' : 'transparent',
                                    border: location.pathname === item.path ? '1px solid var(--accent-primary)' : 'none'
                                }}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
                <hr className="text-secondary" />
                <button onClick={handleLogout} className="btn btn-outline-danger d-flex align-items-center gap-2 w-100 justify-content-center">
                    <FaRightFromBracket /> Sign out
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 p-3">
                <div className="glass-panel h-100 w-100 overflow-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
