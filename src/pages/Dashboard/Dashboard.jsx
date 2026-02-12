import React, { useEffect, useState, useMemo } from 'react';
import { projectService } from '../../services/api';
import { contactService } from '../../services/contactService';
import { timesheetService } from '../../services/timesheetService';
import { useAuth } from '../../context/AuthContext';
import {
  FaBriefcase, FaUserGroup, FaClock, FaChartLine,
  FaArrowTrendUp, FaArrowTrendDown, FaBuilding, FaEnvelope,
  FaPhone, FaCircle, FaCalendarDay, FaFire, FaBolt
} from 'react-icons/fa6';
import './Dashboard.css';

export default function Dashboard() {
  const { currentUser } = useAuth();

  // Data states
  const [projects, setProjects] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [timesheetEntries, setTimesheetEntries] = useState([]);

  // Loading / error states (independent per source)
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingTimesheet, setLoadingTimesheet] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentUser) {
      fetchProjects();
      fetchContacts();
      fetchTimesheet();
    }
  }, [currentUser]);

  // --- Independent Data Fetchers ---
  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const data = await projectService.getAll();
      setProjects(data || []);
    } catch (err) {
      console.error('Dashboard: Error loading projects:', err);
      setErrors(prev => ({ ...prev, projects: err.message }));
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchContacts = async () => {
    try {
      setLoadingContacts(true);
      const data = await contactService.getContacts();
      setContacts(data || []);
    } catch (err) {
      console.error('Dashboard: Error loading contacts:', err);
      setErrors(prev => ({ ...prev, contacts: err.message }));
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchTimesheet = async () => {
    try {
      setLoadingTimesheet(true);
      const data = await timesheetService.getUserEntries(currentUser.uid);
      setTimesheetEntries(data || []);
    } catch (err) {
      console.error('Dashboard: Error loading timesheet:', err);
      setErrors(prev => ({ ...prev, timesheet: err.message }));
    } finally {
      setLoadingTimesheet(false);
    }
  };

  // --- Computed Stats ---
  const stats = useMemo(() => {
    // Projects
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p =>
      p.status !== 'Closed' && p.status !== 'Lost'
    ).length;
    const wonProjects = projects.filter(p => p.status === 'Won' || p.activeStage === 4).length;

    // Contacts
    const totalContacts = contacts.length;
    const leads = contacts.filter(c => c.status === 'Lead').length;
    const customers = contacts.filter(c => c.status === 'Customer').length;
    const activeContacts = contacts.filter(c => c.status === 'Active').length;

    // Timesheet — hours this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    let totalMinutesWeek = 0;
    let totalMinutesAll = 0;
    timesheetEntries.forEach(entry => {
      if (!entry.endTime) return;
      const entryDate = entry.startTime?.toDate
        ? entry.startTime.toDate()
        : new Date(entry.startTime);
      const endDate = entry.endTime?.toDate
        ? entry.endTime.toDate()
        : new Date(entry.endTime);
      const diffMs = endDate - entryDate;
      const mins = Math.max(0, Math.floor(diffMs / 60000));
      totalMinutesAll += mins;
      if (entryDate >= startOfWeek) {
        totalMinutesWeek += mins;
      }
    });

    const hoursThisWeek = Math.floor(totalMinutesWeek / 60);
    const minutesRemainder = totalMinutesWeek % 60;
    const totalHoursAll = Math.floor(totalMinutesAll / 60);

    return {
      totalProjects,
      activeProjects,
      wonProjects,
      totalContacts,
      leads,
      customers,
      activeContacts,
      hoursThisWeek,
      minutesRemainder,
      totalHoursAll,
      totalSessions: timesheetEntries.length
    };
  }, [projects, contacts, timesheetEntries]);

  // Recent contacts (last 5)
  const recentContacts = useMemo(() => {
    return [...contacts]
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [contacts]);

  // Pipeline stages summary
  const pipelineSummary = useMemo(() => {
    const stages = {};
    projects.forEach(p => {
      const stage = p.currentStageLabel || p.status || 'Unknown';
      stages[stage] = (stages[stage] || 0) + 1;
    });
    return Object.entries(stages).map(([name, count]) => ({ name, count }));
  }, [projects]);

  const isLoading = loadingProjects && loadingContacts && loadingTimesheet;

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getAvatarGradient = (name) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    ];
    if (!name) return gradients[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return gradients[Math.abs(hash) % gradients.length];
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Welcome Back<span className="accent-dot">.</span>
          </h1>
          <p className="dashboard-subtitle">
            Here&apos;s what&apos;s happening across your workspace
          </p>
        </div>
        <div className="header-date">
          <FaCalendarDay className="me-2" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-row">
        <StatCard
          icon={<FaBriefcase />}
          label="Active Deals"
          value={stats.activeProjects}
          subtitle={`${stats.totalProjects} total`}
          color="blue"
          loading={loadingProjects}
        />
        <StatCard
          icon={<FaUserGroup />}
          label="Total Contacts"
          value={stats.totalContacts}
          subtitle={`${stats.leads} leads · ${stats.customers} customers`}
          color="purple"
          loading={loadingContacts}
        />
        <StatCard
          icon={<FaClock />}
          label="Hours This Week"
          value={`${stats.hoursThisWeek}h ${stats.minutesRemainder}m`}
          subtitle={`${stats.totalHoursAll}h total logged`}
          color="cyan"
          loading={loadingTimesheet}
        />
        <StatCard
          icon={<FaFire />}
          label="Won Deals"
          value={stats.wonProjects}
          subtitle={`of ${stats.totalProjects} total`}
          color="green"
          loading={loadingProjects}
        />
      </div>

      {/* Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Contacts */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3><FaUserGroup className="card-header-icon" /> Recent Contacts</h3>
            <span className="badge-count">{contacts.length}</span>
          </div>
          <div className="card-body-content">
            {loadingContacts ? (
              <div className="card-loading"><div className="loading-spinner small" /></div>
            ) : recentContacts.length === 0 ? (
              <div className="empty-state">
                <FaUserGroup className="empty-icon" />
                <p>No contacts yet</p>
              </div>
            ) : (
              <div className="contacts-list">
                {recentContacts.map(contact => (
                  <div key={contact.id} className="contact-row">
                    <div className="contact-avatar" style={{ background: getAvatarGradient(contact.name) }}>
                      {getInitials(contact.name)}
                    </div>
                    <div className="contact-info">
                      <span className="contact-name">{contact.name}</span>
                      <span className="contact-detail">
                        {contact.company || contact.email || contact.type || 'Contact'}
                      </span>
                    </div>
                    <span className={`status-badge status-${(contact.status || 'active').toLowerCase()}`}>
                      {contact.status || 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sales Pipeline */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3><FaChartLine className="card-header-icon" /> Sales Pipeline</h3>
            <span className="badge-count">{projects.length}</span>
          </div>
          <div className="card-body-content">
            {loadingProjects ? (
              <div className="card-loading"><div className="loading-spinner small" /></div>
            ) : pipelineSummary.length === 0 ? (
              <div className="empty-state">
                <FaBriefcase className="empty-icon" />
                <p>No deals in pipeline</p>
              </div>
            ) : (
              <div className="pipeline-list">
                {pipelineSummary.map(stage => (
                  <div key={stage.name} className="pipeline-row">
                    <div className="pipeline-info">
                      <FaCircle className="pipeline-dot" />
                      <span className="pipeline-name">{stage.name}</span>
                    </div>
                    <div className="pipeline-bar-wrapper">
                      <div
                        className="pipeline-bar"
                        style={{ width: `${Math.min(100, (stage.count / Math.max(projects.length, 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="pipeline-count">{stage.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Time Tracking Summary */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3><FaClock className="card-header-icon" /> Time Tracking</h3>
            <span className="badge-count">{stats.totalSessions} sessions</span>
          </div>
          <div className="card-body-content">
            {loadingTimesheet ? (
              <div className="card-loading"><div className="loading-spinner small" /></div>
            ) : timesheetEntries.length === 0 ? (
              <div className="empty-state">
                <FaClock className="empty-icon" />
                <p>No time entries yet</p>
              </div>
            ) : (
              <div className="time-summary">
                <div className="time-ring-container">
                  <div className="time-ring">
                    <div className="time-ring-inner">
                      <span className="time-ring-value">{stats.hoursThisWeek}h</span>
                      <span className="time-ring-label">this week</span>
                    </div>
                  </div>
                </div>
                <div className="time-details">
                  <div className="time-detail-row">
                    <span className="time-label">Total hours logged</span>
                    <span className="time-value">{stats.totalHoursAll}h</span>
                  </div>
                  <div className="time-detail-row">
                    <span className="time-label">Sessions this period</span>
                    <span className="time-value">{stats.totalSessions}</span>
                  </div>
                  <div className="time-detail-row">
                    <span className="time-label">Avg per session</span>
                    <span className="time-value">
                      {stats.totalSessions > 0
                        ? `${Math.round(stats.totalHoursAll / stats.totalSessions * 10) / 10}h`
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats / Contact Breakdown */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3><FaBolt className="card-header-icon" /> Contact Breakdown</h3>
          </div>
          <div className="card-body-content">
            {loadingContacts ? (
              <div className="card-loading"><div className="loading-spinner small" /></div>
            ) : (
              <div className="breakdown-grid">
                <BreakdownItem label="Active" value={stats.activeContacts} color="#4facfe" />
                <BreakdownItem label="Leads" value={stats.leads} color="#43e97b" />
                <BreakdownItem label="Customers" value={stats.customers} color="#f093fb" />
                <BreakdownItem label="Inactive" value={contacts.filter(c => c.status === 'Inactive').length} color="#64748b" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function StatCard({ icon, label, value, subtitle, color, loading }) {
  return (
    <div className={`stat-card-dash stat-${color}`}>
      {loading ? (
        <div className="stat-loading"><div className="loading-spinner small" /></div>
      ) : (
        <>
          <div className="stat-icon-dash">{icon}</div>
          <div className="stat-value-dash">{value}</div>
          <div className="stat-label-dash">{label}</div>
          {subtitle && <div className="stat-subtitle-dash">{subtitle}</div>}
        </>
      )}
    </div>
  );
}

function BreakdownItem({ label, value, color }) {
  return (
    <div className="breakdown-item">
      <div className="breakdown-value" style={{ color }}>{value}</div>
      <div className="breakdown-label">{label}</div>
      <div className="breakdown-dot" style={{ background: color }} />
    </div>
  );
}
