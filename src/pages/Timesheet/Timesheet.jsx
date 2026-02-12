import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { timesheetService } from '../../services/timesheetService';
import { Button, Table, Card } from 'react-bootstrap';
import { Play, Pause, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function Timesheet() {
    const { currentUser } = useAuth();
    const [entries, setEntries] = useState([]);
    const [currentSession, setCurrentSession] = useState(null);
    const [timer, setTimer] = useState("00:00:00");
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (currentUser) {
            loadTimesheetData();
        }
    }, [currentUser]);

    // Timer Logic
    useEffect(() => {
        if (currentSession) {
            intervalRef.current = setInterval(() => {
                const start = currentSession.startTime.toDate ? currentSession.startTime.toDate() : new Date(currentSession.startTime);
                const now = new Date();
                const diff = now - start;

                const hours = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);

                setTimer(
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
            setTimer("00:00:00");
        }
        return () => clearInterval(intervalRef.current);
    }, [currentSession]);

    const loadTimesheetData = async () => {
        setLoading(true);
        try {
            const active = await timesheetService.getCurrentSession(currentUser.uid);
            setCurrentSession(active);
            const history = await timesheetService.getUserEntries(currentUser.uid);
            setEntries(history);
        } catch (error) {
            console.error("Error loading timesheets:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClockIn = async () => {
        try {
            await timesheetService.clockIn(currentUser.uid);
            await loadTimesheetData();
        } catch (error) {
            console.error("Clock In failed:", error);
        }
    };

    const handleClockOut = async () => {
        try {
            await timesheetService.clockOut(currentSession.id);
            await loadTimesheetData();
        } catch (error) {
            console.error("Clock Out failed:", error);
        }
    };

    const getDuration = (entry) => {
        if (!entry.endTime) return "Active";
        const start = entry.startTime.toDate ? entry.startTime.toDate() : new Date(entry.startTime);
        const end = entry.endTime.toDate ? entry.endTime.toDate() : new Date(entry.endTime);
        const diff = end - start;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };

    if (loading && !entries.length) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                <div className="loading-spinner" style={{
                    width: 40, height: 40, border: '3px solid var(--border-color)',
                    borderTopColor: 'var(--accent-primary)', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ padding: '28px 32px', color: 'var(--text-primary)' }}>
            {/* Header */}
            <div className="d-flex align-items-center gap-3 mb-4">
                <Clock size={24} style={{ color: 'var(--accent-primary)', opacity: 0.7 }} />
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                        Timesheet
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Track your work hours
                    </p>
                </div>
            </div>

            <div className="row g-4">
                {/* Timer Section */}
                <div className="col-md-4">
                    <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '40px 24px',
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                            {currentSession ? "Currently Working" : "Not Clocked In"}
                        </p>
                        <div style={{
                            fontSize: '3rem',
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            color: currentSession ? 'var(--accent-primary)' : 'var(--text-primary)',
                            letterSpacing: '3px',
                            marginBottom: 28,
                            lineHeight: 1
                        }}>
                            {timer}
                        </div>

                        {!currentSession ? (
                            <button
                                onClick={handleClockIn}
                                style={{
                                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                                    border: 'none',
                                    color: '#fff',
                                    padding: '14px 0',
                                    width: '80%',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.25)'
                                }}
                            >
                                <Play size={18} fill="currentColor" /> Clock In
                            </button>
                        ) : (
                            <button
                                onClick={handleClockOut}
                                style={{
                                    background: 'linear-gradient(135deg, #ef4444, #f87171)',
                                    border: 'none',
                                    color: '#fff',
                                    padding: '14px 0',
                                    width: '80%',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2)'
                                }}
                            >
                                <Pause size={18} fill="currentColor" /> Clock Out
                            </button>
                        )}
                    </div>
                </div>

                {/* History Section */}
                <div className="col-md-8">
                    <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        height: '100%'
                    }}>
                        <div style={{
                            padding: '18px 22px',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h5 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                Session History
                            </h5>
                            <span style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                background: 'var(--bg-card-hover)',
                                border: '1px solid var(--border-color)',
                                padding: '3px 10px',
                                borderRadius: 20,
                                fontWeight: 600
                            }}>
                                {entries.length} entries
                            </span>
                        </div>
                        <div className="table-responsive">
                            <Table hover className="mb-0" style={{ '--bs-table-bg': 'transparent' }}>
                                <thead>
                                    <tr>
                                        <th style={{ background: 'var(--bg-card-hover)', color: 'var(--text-muted)', border: 'none', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, paddingLeft: 22 }}>Date</th>
                                        <th style={{ background: 'var(--bg-card-hover)', color: 'var(--text-muted)', border: 'none', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Start</th>
                                        <th style={{ background: 'var(--bg-card-hover)', color: 'var(--text-muted)', border: 'none', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>End</th>
                                        <th style={{ background: 'var(--bg-card-hover)', color: 'var(--text-muted)', border: 'none', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Duration</th>
                                        <th style={{ background: 'var(--bg-card-hover)', color: 'var(--text-muted)', border: 'none', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', border: 'none' }}>
                                                No entries found.
                                            </td>
                                        </tr>
                                    ) : (
                                        entries.map(entry => {
                                            const startDate = entry.startTime.toDate ? entry.startTime.toDate() : new Date(entry.startTime);
                                            const endDate = entry.endTime ? (entry.endTime.toDate ? entry.endTime.toDate() : new Date(entry.endTime)) : null;

                                            return (
                                                <tr key={entry.id}>
                                                    <td style={{ paddingLeft: 22, color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
                                                        {format(startDate, 'MMM dd, yyyy')}
                                                    </td>
                                                    <td style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
                                                        {format(startDate, 'hh:mm a')}
                                                    </td>
                                                    <td style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
                                                        {endDate ? format(endDate, 'hh:mm a') : '—'}
                                                    </td>
                                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                                                        {getDuration(entry)}
                                                    </td>
                                                    <td style={{ borderColor: 'var(--border-color)' }}>
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            fontWeight: 600,
                                                            padding: '3px 10px',
                                                            borderRadius: 20,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            background: !entry.endTime ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.1)',
                                                            color: !entry.endTime ? '#10b981' : '#94a3b8'
                                                        }}>
                                                            {!entry.endTime ? 'Active' : 'Completed'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
