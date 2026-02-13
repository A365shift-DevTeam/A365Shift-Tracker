import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaChartColumn, FaUserGroup, FaClock, FaRightFromBracket, FaHouse, FaListCheck } from 'react-icons/fa6';

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
        { path: '/todolist', icon: <FaListCheck />, label: 'Todo List' },
        { path: '/contact', icon: <FaUserGroup />, label: 'Contacts' },
        { path: '/timesheet', icon: <FaClock />, label: 'Timesheet' },
    ];

    return (
        <div className="d-flex" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            {/* Sidebar */}
            <div
                className="d-flex flex-column p-3 m-3"
                style={{
                    width: '240px',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    borderRadius: '16px',
                    flexShrink: 0,
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                }}
            >
                <a href="/" className="d-flex align-items-center mb-3 text-decoration-none px-2">
                    <span className="fs-5 fw-bold" style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        letterSpacing: '-0.3px'
                    }}>
                        A365 Tracker
                    </span>
                </a>
                <hr style={{ borderColor: 'rgba(0,0,0,0.08)', opacity: 0.5 }} />
                <ul className="nav nav-pills flex-column mb-auto gap-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <li className="nav-item" key={item.path}>
                                <Link
                                    to={item.path}
                                    className="nav-link d-flex align-items-center gap-3 px-3 py-2"
                                    style={{
                                        color: isActive ? '#3b82f6' : '#64748b',
                                        background: isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                                        border: isActive ? '1px solid rgba(59, 130, 246, 0.12)' : '1px solid transparent',
                                        borderRadius: '10px',
                                        fontWeight: isActive ? 600 : 500,
                                        fontSize: '0.9rem',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
                <hr style={{ borderColor: 'rgba(0,0,0,0.08)', opacity: 0.5 }} />
                <button
                    onClick={handleLogout}
                    className="btn d-flex align-items-center gap-2 w-100 justify-content-center py-2"
                    style={{
                        background: 'rgba(239, 68, 68, 0.06)',
                        border: '1px solid rgba(239, 68, 68, 0.12)',
                        color: '#ef4444',
                        borderRadius: '10px',
                        fontWeight: 500,
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <FaRightFromBracket /> Sign out
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 p-3" style={{ minWidth: 0 }}>
                <div
                    className="h-100 w-100 overflow-auto"
                    style={{
                        background: 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.6)',
                        borderRadius: '16px',
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                    }}
                >
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
