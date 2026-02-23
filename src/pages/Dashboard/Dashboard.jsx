import React, { useEffect, useState, useMemo } from 'react';
import { projectService } from '../../services/api';
import { contactService } from '../../services/contactService';
import { timesheetService } from '../../services/timesheetService';
import { expenseService } from '../../services/expenseService';
import { incomeService } from '../../services/incomeService';
import { useAuth } from '../../context/AuthContext';
import {
  FaBriefcase, FaUserGroup, FaClock, FaChartLine,
  FaCircle, FaCalendarDay, FaFire, FaBolt,
  FaMoneyBillWave, FaFileInvoiceDollar, FaDollarSign, FaFileInvoice
} from 'react-icons/fa6';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

// Clean SaaS Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        fontFamily: "'Inter', sans-serif"
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' }}>{label}</p>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }} />
            <span style={{ color: '#475569', fontSize: '0.8125rem', fontWeight: '500' }}>{entry.name}:</span>
            <span style={{ color: '#0f172a', fontSize: '0.875rem', fontWeight: '600' }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { currentUser } = useAuth();

  // Data states
  const [projects, setProjects] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [timesheetEntries, setTimesheetEntries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);

  // Loading states
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingTimesheet, setLoadingTimesheet] = useState(true);
  const [loadingFinance, setLoadingFinance] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchProjects();
      fetchContacts();
      fetchTimesheet();
      fetchFinance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const data = await projectService.getAll();
      setProjects(data || []);
    } catch (err) {
      console.error('Dashboard error:', err);
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
      console.error('Dashboard error:', err);
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
      console.error('Dashboard error:', err);
    } finally {
      setLoadingTimesheet(false);
    }
  };

  const fetchFinance = async () => {
    try {
      setLoadingFinance(true);
      const [expData, incData] = await Promise.all([
        expenseService.getExpenses(),
        incomeService.getIncomes()
      ]);
      setExpenses(expData || []);
      setIncomes(incData || []);
    } catch (err) {
      console.error('Dashboard finance error:', err);
    } finally {
      setLoadingFinance(false);
    }
  };

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status !== 'Closed' && p.status !== 'Lost').length;
    const wonProjects = projects.filter(p => p.status === 'Won' || p.activeStage === 4).length;

    const totalContacts = contacts.length;
    const leads = contacts.filter(c => c.status === 'Lead').length;
    const customers = contacts.filter(c => c.status === 'Customer').length;
    const activeContacts = contacts.filter(c => c.status === 'Active').length;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    let totalMinutesWeek = 0;
    let totalMinutesAll = 0;
    timesheetEntries.forEach(entry => {
      if (!entry.endTime) return;
      const entryDate = entry.startTime?.toDate ? entry.startTime.toDate() : new Date(entry.startTime);
      const endDate = entry.endTime?.toDate ? entry.endTime.toDate() : new Date(entry.endTime);
      const mins = Math.max(0, Math.floor((endDate - entryDate) / 60000));
      totalMinutesAll += mins;
      if (entryDate >= startOfWeek) totalMinutesWeek += mins;
    });

    return {
      totalProjects, activeProjects, wonProjects,
      totalContacts, leads, customers, activeContacts,
      hoursThisWeek: Math.floor(totalMinutesWeek / 60),
      minutesRemainder: totalMinutesWeek % 60,
      totalHoursAll: Math.floor(totalMinutesAll / 60),
      totalSessions: timesheetEntries.length
    };
  }, [projects, contacts, timesheetEntries]);

  // Calculate Finance Summary
  const financeStats = useMemo(() => {
    const totalExpense = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
    const totalIncome = incomes.reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);
    const netProfit = totalIncome - totalExpense;
    return { totalExpense, totalIncome, netProfit };
  }, [expenses, incomes]);

  // Extract Recent Invoices (Milestones) from Projects
  const recentInvoices = useMemo(() => {
    let allMilestones = [];
    projects.forEach(project => {
      if (project.milestones && Array.isArray(project.milestones)) {
        project.milestones.forEach(m => {
          allMilestones.push({
            ...m,
            projectName: project.title || project.name || 'Untitled Project',
            projectId: project.id,
            clientName: project.clientName || 'Unknown Client',
            currency: project.currency || 'INR',
            dealValue: project.dealValue || 0
          });
        });
      }
    });

    // Sort by date descending
    return allMilestones.sort((a, b) => {
      const dateA = a.invoiceDate ? new Date(a.invoiceDate) : new Date(0);
      const dateB = b.invoiceDate ? new Date(b.invoiceDate) : new Date(0);
      return dateB - dateA;
    }).slice(0, 5);
  }, [projects]);

  const recentContacts = useMemo(() => {
    return [...contacts]
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [contacts]);

  const pipelineSummary = useMemo(() => {
    const stages = {};
    projects.forEach(p => {
      const stage = p.currentStageLabel || p.status || 'Unknown';
      stages[stage] = (stages[stage] || 0) + 1;
    });
    return Object.entries(stages).map(([name, count]) => ({ name, count }));
  }, [projects]);

  const chartData = useMemo(() => {
    return [
      { category: 'Projects', Active: stats.activeProjects, Won: stats.wonProjects, Total: stats.totalProjects },
      { category: 'Contacts', Leads: stats.leads, Customers: stats.customers, Active: stats.activeContacts },
      { category: 'Activity', 'Hours (w)': stats.hoursThisWeek, Sessions: stats.totalSessions }
    ];
  }, [stats]);

  const isLoading = loadingProjects && loadingContacts && loadingTimesheet && loadingFinance;

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // SaaS avatar solid colors
  const getAvatarColor = (name) => {
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f43f5e', '#06b6d4', '#f59e0b'];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
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
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Overview<span className="accent-dot">.</span>
          </h1>
          <p className="dashboard-subtitle">Here&apos;s what&apos;s happening in your workspace</p>
        </div>
        <div className="header-date">
          <FaCalendarDay />
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <div className="stats-row">
        <StatCard icon={<FaBriefcase />} label="Active Deals" value={stats.activeProjects} subtitle={`${stats.totalProjects} total`} color="blue" loading={loadingProjects} />
        <StatCard icon={<FaUserGroup />} label="Total Contacts" value={stats.totalContacts} subtitle={`${stats.leads} leads`} color="purple" loading={loadingContacts} />
        <StatCard icon={<FaClock />} label="Hours This Week" value={`${stats.hoursThisWeek}h ${stats.minutesRemainder}m`} subtitle={`${stats.totalHoursAll}h logged`} color="cyan" loading={loadingTimesheet} />
        <StatCard icon={<FaFire />} label="Won Deals" value={stats.wonProjects} subtitle={`of ${stats.totalProjects} total`} color="green" loading={loadingProjects} />
      </div>

      <div className="stats-row" style={{ marginTop: '1.5rem' }}>
        <StatCard icon={<FaMoneyBillWave />} label="Total Income" value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(financeStats.totalIncome)} color="green" loading={loadingFinance} />
        <StatCard icon={<FaFileInvoiceDollar />} label="Total Expenses" value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(financeStats.totalExpense)} color="red" loading={loadingFinance} />
        <StatCard icon={<FaDollarSign />} label="Net Profit" value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(financeStats.netProfit)} color={financeStats.netProfit >= 0 ? 'green' : 'red'} loading={loadingFinance} />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card chart-card-full">
          <div className="card-header">
            <h3><FaChartLine className="card-header-icon" /> Activity Metrics</h3>
            <div className="chart-legend-custom">
              <span className="legend-item"><span className="dot blue" style={{ background: '#3b82f6' }}></span> Projects</span>
              <span className="legend-item"><span className="dot green" style={{ background: '#10b981' }}></span> Contacts</span>
              <span className="legend-item"><span className="dot purple" style={{ background: '#8b5cf6' }}></span> Performance</span>
            </div>
          </div>
          <div className="card-body-content chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                {/* Clean SaaS Solid Colors instead of Gradients */}
                <Bar dataKey="Active" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="Won" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="Leads" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="Customers" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="Hours (w)" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3><FaUserGroup className="card-header-icon" /> Recent Contacts</h3>
            <span className="badge-count">{contacts.length}</span>
          </div>
          <div className="card-body-content" style={{ padding: '0 24px' }}>
            {loadingContacts ? (
              <div className="card-loading"><div className="loading-spinner small" /></div>
            ) : recentContacts.length === 0 ? (
              <div className="empty-state"><FaUserGroup className="empty-icon" /><p>No contacts yet</p></div>
            ) : (
              <div className="contacts-list">
                {recentContacts.map(contact => (
                  <div key={contact.id} className="contact-row">
                    <div className="contact-avatar" style={{ background: getAvatarColor(contact.name) }}>
                      {getInitials(contact.name)}
                    </div>
                    <div className="contact-info">
                      <span className="contact-name">{contact.name}</span>
                      <span className="contact-detail">{contact.company || contact.email || contact.type || 'Contact'}</span>
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

        <div className="dashboard-card">
          <div className="card-header">
            <h3><FaChartLine className="card-header-icon" /> Pipeline Overview</h3>
            <span className="badge-count">{projects.length}</span>
          </div>
          <div className="card-body-content">
            {loadingProjects ? (
              <div className="card-loading"><div className="loading-spinner small" /></div>
            ) : pipelineSummary.length === 0 ? (
              <div className="empty-state"><FaBriefcase className="empty-icon" /><p>No deals in pipeline</p></div>
            ) : (
              <div className="pipeline-list">
                {pipelineSummary.map(stage => (
                  <div key={stage.name} className="pipeline-row">
                    <div className="pipeline-info">
                      <FaCircle className="pipeline-dot" />
                      <span className="pipeline-name">{stage.name}</span>
                    </div>
                    <div className="pipeline-bar-wrapper">
                      <div className="pipeline-bar" style={{ width: `${Math.min(100, (stage.count / Math.max(projects.length, 1)) * 100)}%` }} />
                    </div>
                    <span className="pipeline-count">{stage.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3><FaClock className="card-header-icon" /> Time Tracking</h3>
            <span className="badge-count">{stats.totalSessions} sessions</span>
          </div>
          <div className="card-body-content">
            {loadingTimesheet ? (
              <div className="card-loading"><div className="loading-spinner small" /></div>
            ) : timesheetEntries.length === 0 ? (
              <div className="empty-state"><FaClock className="empty-icon" /><p>No time entries</p></div>
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
                    <span className="time-label">Total tracked</span>
                    <span className="time-value">{stats.totalHoursAll}h</span>
                  </div>
                  <div className="time-detail-row">
                    <span className="time-label">Sessions</span>
                    <span className="time-value">{stats.totalSessions}</span>
                  </div>
                  <div className="time-detail-row">
                    <span className="time-label">Avg session</span>
                    <span className="time-value">{stats.totalSessions > 0 ? `${Math.round(stats.totalHoursAll / stats.totalSessions * 10) / 10}h` : '—'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3><FaBolt className="card-header-icon" /> Contact Breakdown</h3>
          </div>
          <div className="card-body-content">
            {loadingContacts ? (
              <div className="card-loading"><div className="loading-spinner small" /></div>
            ) : (
              <div className="breakdown-grid">
                <BreakdownItem label="Active" value={stats.activeContacts} color="var(--color-blue)" />
                <BreakdownItem label="Leads" value={stats.leads} color="var(--color-purple)" />
                <BreakdownItem label="Customers" value={stats.customers} color="var(--color-green)" />
                <BreakdownItem label="Inactive" value={contacts.filter(c => c.status === 'Inactive').length} color="var(--text-muted)" />
              </div>
            )}
          </div>
        </div>
        <div className="dashboard-card">
          <div className="card-header">
            <h3><FaFileInvoice className="card-header-icon" /> Recent Invoices</h3>
          </div>
          <div className="card-body-content" style={{ padding: '0 24px' }}>
            {loadingProjects ? (
              <div className="card-loading"><div className="loading-spinner small" /></div>
            ) : recentInvoices.length === 0 ? (
              <div className="empty-state"><FaFileInvoice className="empty-icon" /><p>No invoices yet</p></div>
            ) : (
              <div className="contacts-list">
                {recentInvoices.map(inv => (
                  <div key={inv.id} className="contact-row" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
                    <div className="contact-avatar" style={{ background: '#3b82f6', borderRadius: '8px', fontSize: '1rem' }}>
                      <FaFileInvoiceDollar />
                    </div>
                    <div className="contact-info" style={{ minWidth: 0 }}>
                      <span className="contact-name text-truncate d-block" style={{ maxWidth: '180px' }} title={inv.name}>{inv.name || 'Milestone'}</span>
                      <span className="contact-detail text-truncate d-block" style={{ maxWidth: '180px' }} title={inv.projectName}>{inv.projectName}</span>
                    </div>
                    <div className="d-flex flex-column align-items-end">
                      <span className={`status-badge fw-bold bg-transparent px-0 pt-0 ${inv.isPaid ? 'text-success' : 'text-danger'}`} style={{ border: 'none' }}>
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: inv.currency || 'INR', maximumFractionDigits: 0 }).format((inv.dealValue * (inv.percentage || 0)) / 100)}
                      </span>
                      <span className="contact-detail mt-1" style={{ fontSize: '0.75rem' }}>
                        {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
      <div className="breakdown-dot" style={{ background: color }} />
      <div className="breakdown-value" style={{ color: 'var(--text-main)' }}>{value}</div>
      <div className="breakdown-label">{label}</div>
    </div>
  );
}
