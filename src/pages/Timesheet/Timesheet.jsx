import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { timesheetService } from '../../services/timesheetService';
import { Button, Table, Spinner, Card } from 'react-bootstrap';
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

    // Calculate duration for finished entries
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
        return <div className="p-5 text-center"><Spinner animation="border" variant="danger" /></div>;
    }

    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4 d-flex align-items-center gap-2" style={{ color: 'var(--accent-success)' }}>
                <Clock size={28} /> Timesheet
            </h2>

            <div className="row g-4">
                {/* Timer Section */}
                <div className="col-md-4">
                    <Card className="glass-panel text-center h-100 border-0">
                        <Card.Body className="d-flex flex-column justify-content-center align-items-center py-5">
                            <h5 className="text-muted mb-3">{currentSession ? "Currently Working" : "Not Clocked In"}</h5>
                            <div className="display-4 fw-bold mb-4 font-monospace text-light" style={{ letterSpacing: '2px' }}>
                                {timer}
                            </div>

                            {!currentSession ? (
                                <Button
                                    className="btn-neon w-75 py-3 fs-5 d-flex align-items-center justify-content-center gap-2"
                                    onClick={handleClockIn}
                                    style={{ background: 'var(--accent-success)', borderColor: 'var(--accent-success)', color: '#000' }}
                                >
                                    <Play size={20} fill="currentColor" /> Clock In
                                </Button>
                            ) : (
                                <Button
                                    className="btn-neon w-75 py-3 fs-5 d-flex align-items-center justify-content-center gap-2 bg-danger border-danger text-white"
                                    onClick={handleClockOut}
                                >
                                    <Pause size={20} fill="currentColor" /> Clock Out
                                </Button>
                            )}
                        </Card.Body>
                    </Card>
                </div>

                {/* History Section */}
                <div className="col-md-8">
                    <Card className="glass-panel border-0 h-100">
                        <Card.Header className="bg-transparent border-bottom border-secondary pt-3">
                            <h5 className="mb-0 text-white">Using History</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <Table hover variant="dark" className="mb-0 bg-transparent">
                                    <thead className="text-muted small text-uppercase">
                                        <tr>
                                            <th className="bg-transparent border-secondary ps-4">Date</th>
                                            <th className="bg-transparent border-secondary">Start Time</th>
                                            <th className="bg-transparent border-secondary">End Time</th>
                                            <th className="bg-transparent border-secondary">Duration</th>
                                            <th className="bg-transparent border-secondary">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center py-4 text-muted">No entries found.</td>
                                            </tr>
                                        ) : (
                                            entries.map(entry => {
                                                const startDate = entry.startTime.toDate ? entry.startTime.toDate() : new Date(entry.startTime);
                                                const endDate = entry.endTime ? (entry.endTime.toDate ? entry.endTime.toDate() : new Date(entry.endTime)) : null;

                                                return (
                                                    <tr key={entry.id}>
                                                        <td className="ps-4 align-middle">{format(startDate, 'MMM dd, yyyy')}</td>
                                                        <td className="align-middle">{format(startDate, 'hh:mm a')}</td>
                                                        <td className="align-middle">{endDate ? format(endDate, 'hh:mm a') : '-'}</td>
                                                        <td className="align-middle fw-medium">{getDuration(entry)}</td>
                                                        <td className="align-middle">
                                                            <span className={`badge rounded-pill ${!entry.endTime ? 'bg-success' : 'bg-secondary'}`}>
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
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
}
