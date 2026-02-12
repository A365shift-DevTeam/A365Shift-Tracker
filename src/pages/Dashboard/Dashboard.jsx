import React, { useEffect, useState } from 'react';
import { projectService } from '../../services/api';
import { contactService } from '../../services/contactService';
import { timesheetService } from '../../services/timesheetService';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from 'react-bootstrap';

export default function Dashboard() {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        activeTasks: 0,
        leads: 0,
        hoursThisWeek: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            loadDashboardStats();
        }
    }, [currentUser]);

    const loadDashboardStats = async () => {
        try {
            setLoading(true);

            // 1. Get Projects (Active Tasks)
            // Assuming simplified "all projects" count for now, or filter by status if needed
            const projects = await projectService.getAll();
            const activeProjects = projects.length; // You might want to filter by status !== 'Completed'

            // 2. Get Contacts (Leads)
            const contacts = await contactService.getContacts();
            const leads = contacts.filter(c => c.status === 'Lead').length;

            // 3. Get Timesheets (Hours This Week)
            const entries = await timesheetService.getUserEntries(currentUser.uid);

            // Calculate hours for current week
            const now = new Date();
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            startOfWeek.setHours(0, 0, 0, 0);

            let totalMinutes = 0;
            entries.forEach(entry => {
                if (!entry.endTime) return; // Skip active sessions or handle differently
                const entryDate = entry.startTime.toDate ? entry.startTime.toDate() : new Date(entry.startTime);

                if (entryDate >= startOfWeek) {
                    const end = entry.endTime.toDate ? entry.endTime.toDate() : new Date(entry.endTime);
                    const diffMs = end - entryDate;
                    totalMinutes += Math.floor(diffMs / 60000);
                }
            });

            const hours = Math.floor(totalMinutes / 60);

            setStats({
                activeTasks: activeProjects,
                leads: leads,
                hoursThisWeek: hours
            });

        } catch (error) {
            console.error("Error loading dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-5 text-center"><Spinner animation="border" variant="primary" /></div>;
    }

    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4">Welcome Back!</h2>
            <div className="row">
                <div className="col-md-4 mb-3">
                    <div className="glass-panel p-4 text-center h-100">
                        <h3 className="display-4 fw-bold text-primary">{stats.activeTasks}</h3>
                        <p className="text-muted text-uppercase small letter-spacing-2">Active Projects</p>
                    </div>
                </div>
                <div className="col-md-4 mb-3">
                    <div className="glass-panel p-4 text-center h-100">
                        <h3 className="display-4 fw-bold text-success">{stats.leads}</h3>
                        <p className="text-muted text-uppercase small letter-spacing-2">New Leads</p>
                    </div>
                </div>
                <div className="col-md-4 mb-3">
                    <div className="glass-panel p-4 text-center h-100">
                        <h3 className="display-4 fw-bold text-info">{stats.hoursThisWeek}h</h3>
                        <p className="text-muted text-uppercase small letter-spacing-2">Hours This Week</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
