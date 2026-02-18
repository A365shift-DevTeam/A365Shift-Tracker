import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaChartColumn, FaUserGroup, FaClock, FaRightFromBracket, FaHouse, FaMoneyBillWave, FaListCheck, FaFileInvoice } from 'react-icons/fa6';

function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= breakpoint);
    React.useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= breakpoint);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [breakpoint]);
    return isMobile;
}

export default function MainLayout() {
    const { logout } = useAuth();
    const location = useLocation();
    const [isHovered, setIsHovered] = React.useState(false);
    const isMobile = useIsMobile();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const navItems = [
        { path: '/', icon: <FaHouse size={20} />, label: 'Dashboard' },
        { path: '/sales', icon: <FaChartColumn size={20} />, label: 'Sales' },
        { path: '/todolist', icon: <FaListCheck size={20} />, label: 'Todo' },
        { path: '/contact', icon: <FaUserGroup size={20} />, label: 'Contacts' },
        { path: '/timesheet', icon: <FaClock size={20} />, label: 'Time' },
        { path: '/finance', icon: <FaMoneyBillWave size={20} />, label: 'Finance' },
        { path: '/invoice', icon: <FaFileInvoice size={20} />, label: 'Invoice' },
    ];

    /* ───── MOBILE LAYOUT ───── */
    if (isMobile) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', paddingBottom: '72px' }}>
                {/* Main Content */}
                <div style={{ padding: '8px' }}>
                    <div
                        className="w-100 overflow-auto"
                        style={{
                            minHeight: 'calc(100vh - 88px)',
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

                {/* Bottom Navigation */}
                <nav style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '64px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    padding: '0 4px',
                    zIndex: 1000
                }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '2px',
                                    textDecoration: 'none',
                                    color: isActive ? '#3b82f6' : '#94a3b8',
                                    fontSize: '0.6rem',
                                    fontWeight: isActive ? 700 : 500,
                                    padding: '6px 4px',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s ease',
                                    flex: 1,
                                    maxWidth: '64px',
                                    position: 'relative'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '36px',
                                    height: '28px',
                                    borderRadius: '14px',
                                    background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    transition: 'all 0.2s ease'
                                }}>
                                    {React.cloneElement(item.icon, { size: 18 })}
                                </div>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '2px',
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '0.6rem',
                            fontWeight: 500,
                            padding: '6px 4px',
                            cursor: 'pointer',
                            flex: 1,
                            maxWidth: '64px'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '28px',
                            borderRadius: '14px'
                        }}>
                            <FaRightFromBracket size={18} />
                        </div>
                        <span>Logout</span>
                    </button>
                </nav>
            </div>
        );
    }

    /* ───── DESKTOP LAYOUT ───── */
    return (
        <div className="d-flex" style={{ height: '100vh', overflow: 'hidden', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            {/* Sidebar */}
            <div
                className="d-flex flex-column p-3 m-3"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    width: isHovered ? '240px' : '80px',
                    transition: 'width 0.3s ease, background 0.3s ease',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    borderRadius: '16px',
                    flexShrink: 0,
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                }}
            >
                <Link to="/" className={`d-flex align-items-center mb-3 text-decoration-none px-2 ${!isHovered ? 'justify-content-center' : ''}`} style={{ height: '40px' }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ minWidth: '24px' }}>
                        {!isHovered && <FaChartColumn size={24} color="#3b82f6" />}
                    </div>
                    {isHovered && (
                        <span className="fs-5 fw-bold text-nowrap" style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '-0.3px'
                        }}>
                            A365 Tracker
                        </span>
                    )}
                </Link>
                <hr style={{ borderColor: 'rgba(0,0,0,0.08)', opacity: 0.5 }} />
                <ul className="nav nav-pills flex-column mb-auto gap-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <li className="nav-item" key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`nav-link d-flex align-items-center ${isHovered ? 'gap-3 px-3' : 'justify-content-center px-0'} py-2`}
                                    style={{
                                        color: isActive ? '#3b82f6' : '#64748b',
                                        background: isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                                        border: isActive ? '1px solid rgba(59, 130, 246, 0.12)' : '1px solid transparent',
                                        borderRadius: '10px',
                                        fontWeight: isActive ? 600 : 500,
                                        fontSize: '0.9rem',
                                        transition: 'all 0.2s ease',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden'
                                    }}
                                    title={!isHovered ? item.label : ''}
                                >
                                    <div style={{ minWidth: '20px', display: 'flex', justifyContent: 'center' }}>
                                        {item.icon}
                                    </div>
                                    {isHovered && <span>{item.label}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
                <hr style={{ borderColor: 'rgba(0,0,0,0.08)', opacity: 0.5 }} />
                <button
                    onClick={handleLogout}
                    className={`btn d-flex align-items-center w-100 py-2 ${isHovered ? 'gap-2 justify-content-center' : 'justify-content-center px-0'}`}
                    style={{
                        background: 'rgba(239, 68, 68, 0.06)',
                        border: '1px solid rgba(239, 68, 68, 0.12)',
                        color: '#ef4444',
                        borderRadius: '10px',
                        fontWeight: 500,
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden'
                    }}
                    title={!isHovered ? 'Sign out' : ''}
                >
                    <FaRightFromBracket />
                    {isHovered && <span>Sign out</span>}
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
