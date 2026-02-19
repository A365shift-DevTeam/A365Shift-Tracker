import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    LayoutDashboard, FileDown, Briefcase, MapPin, Globe, CreditCard, Building, Users,
    Plus, Trash2, ArrowLeft, DollarSign, FileText, ArrowRight, Filter, Wallet, CheckCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// ==========================================
// 1. STYLES (Injected CSS)
// ==========================================
const TrackerStyles = () => (
    <style>{`
        /* Premium Light Theme (Adapted) */
        .tracker-wrapper {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: #333;
            min-height: 100vh;
            background: #f4f6f9;
            padding: 2rem;
        }

        /* --- Global Utils --- */
        .text-dark { color: #212529 !important; }
        .text-muted { color: #6c757d !important; }
        .text-primary { color: #0d6efd !important; }
        .text-success { color: #198754 !important; }
        .text-danger { color: #dc3545 !important; }
        .text-warning { color: #ffc107 !important; }
        
        .fw-bold { font-weight: 700 !important; }
        .small { font-size: 0.875rem; }
        .font-monospace { font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace; }

        /* --- Buttons --- */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.375rem 0.75rem;
            border-radius: 0.375rem;
            font-weight: 500;
            transition: all 0.2s;
            cursor: pointer;
            border: 1px solid transparent;
        }
        .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.875rem; }
        
        .btn-primary { background-color: #0d6efd; color: white; border-color: #0d6efd; }
        .btn-primary:hover { background-color: #0b5ed7; }
        
        .btn-outline-primary { color: #0d6efd; border-color: #0d6efd; background: transparent; }
        .btn-outline-primary:hover { color: #fff; background-color: #0d6efd; }

        .btn-outline-secondary { color: #6c757d; border-color: #6c757d; background: transparent; }
        .btn-outline-secondary:hover { color: #fff; background-color: #6c757d; }

        .btn-outline-success { color: #198754; border-color: #198754; background: transparent; }
        .btn-outline-success:hover { color: #fff; background-color: #198754; }

        .btn-outline-danger { color: #dc3545; border-color: #dc3545; background: transparent; }
        .btn-outline-danger:hover { color: #fff; background-color: #dc3545; }

        .btn-dark { background-color: #212529; color: white; border-color: #212529; }
        .btn-dark:hover { background-color: #424649; }

        .btn-white { background-color: #fff; color: #000; border-color: #fff; }
        .btn-white:hover { background-color: #e2e6ea; }

        .btn-link { background: none; border: none; padding: 0; text-decoration: none; }
        .btn-link:hover { text-decoration: underline; }

        /* --- Invoice Stage Cards --- */
        .invoice-view {
            max-width: 1200px;
            margin: 0 auto;
        }

        .stage {
            background: #fff;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            margin: 16px 0;
            overflow: hidden;
            color: #000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.02);
        }

        .bar {
            background: #000;
            border-bottom: 1px solid #e9ecef;
            padding: 10px 14px;
            font-weight: 700;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #fff;
        }

        .stage-p { padding: 14px; }

        .grid-stage {
            display: grid;
            grid-template-columns: 220px 1fr 180px 1fr;
            gap: 10px;
            align-items: center;
        }
        @media (max-width: 900px) { .grid-stage { grid-template-columns: 1fr; } }

        .stage-input, .stage-select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ced4da;
            border-radius: 6px;
            background: #fff;
            color: #212529;
            transition: border-color 0.2s;
        }
        .stage-input:focus, .stage-select:focus {
            outline: none;
            border-color: #86b7fe;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }

        .stage-label { font-weight: 600; color: #495057; }

        .stage-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        .stage-table th, .stage-table td { border: 1px solid #dee2e6; padding: 10px; text-align: left; vertical-align: middle; }
        .stage-table th { background: #f8f9fa; color: #495057; font-weight: 600; font-size: 0.9rem; }
        
        /* KPIs */
        .stage-kpi { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 1rem; }
        .stage-card { background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 12px 16px; min-width: 200px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .stage-muted { color: #6c757d; font-size: 0.85rem; margin-bottom: 4px; }
        .kpi-value { font-weight: 700; font-size: 1.1rem; color: #212529; }

        /* --- Dashboard Cards (Light Theme) --- */
        .dashboard-card {
            background: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 0.5rem;
            overflow: hidden;
            height: 100%;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }
        .dashboard-card-body { padding: 1.5rem; }
        .dashboard-card-header {
            padding: 1rem 1.5rem;
            background: #fff;
            border-bottom: 1px solid #f1f3f5;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
         /* --- Tables (Light) --- */
        .table-custom {
            width: 100%;
            color: #212529;
            border-collapse: collapse;
        }
        .table-custom th, .table-custom td {
            padding: 0.75rem;
            border-bottom: 1px solid #dee2e6;
        }
        .table-custom th {
            font-size: 0.75rem;
            text-transform: uppercase;
            color: #6c757d;
            font-weight: 600;
            background-color: #f8f9fa;
        }
        .table-custom tr:hover { background-color: #f8f9fa; cursor: pointer; }

        /* Utilities */
        .d-flex { display: flex; }
        .align-items-center { align-items: center; }
        .justify-content-center { justify-content: center; }
        .justify-content-between { justify-content: space-between; }
        .text-center { text-align: center; }
        .text-end { text-align: right; }
        .gap-1 { gap: 0.25rem; }
        .gap-2 { gap: 0.5rem; }
        .gap-3 { gap: 1rem; }
        .mb-1 { margin-bottom: 0.25rem; }
        .mb-3 { margin-bottom: 1rem; }
        .mb-4 { margin-bottom: 1.5rem; }
        .mb-5 { margin-bottom: 3rem; }
        .p-1 { padding: 0.25rem; }
        .p-2 { padding: 0.5rem; }
        .p-3 { padding: 1rem; }
        .rounded { border-radius: 0.375rem !important; }
        .rounded-circle { border-radius: 50% !important; }
        .bg-opacity-10 { --bs-bg-opacity: 0.1; }
        .bg-primary { background-color: rgba(13, 110, 253, var(--bs-bg-opacity, 1)) !important; }
        .bg-success { background-color: rgba(25, 135, 84, var(--bs-bg-opacity, 1)) !important; }
        .bg-danger { background-color: rgba(220, 53, 69, var(--bs-bg-opacity, 1)) !important; }
        .bg-warning { background-color: rgba(255, 193, 7, var(--bs-bg-opacity, 1)) !important; }
        
        .row { display: flex; flex-wrap: wrap; margin-right: -0.75rem; margin-left: -0.75rem; }
        .col-md-3, .col-md-4, .col-md-6, .col-md-8 { padding-right: 0.75rem; padding-left: 0.75rem; width: 100%; }
        @media (min-width: 768px) {
            .col-md-3 { flex: 0 0 25%; max-width: 25%; }
            .col-md-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
            .col-md-6 { flex: 0 0 50%; max-width: 50%; }
            .col-md-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
        }
        
        .btn-icon { background: none; border: none; cursor: pointer; padding: 4px; display: inline-flex; align-items: center; justify-content: center; color: inherit; }
        .btn-icon:hover { opacity: 0.8; }
    `}</style>
);

// ==========================================
// 2. UTILITY SERVICES (PDF & Excel)
// ==========================================

const generateInvoicePDF = (milestone, details, taxes) => {
    const doc = new jsPDF();
    const currency = details.currency || 'AED';
    const baseAmount = (details.dealValue * milestone.percentage) / 100;
    const chargesList = Array.isArray(taxes) ? taxes : (taxes.gst ? [{ name: 'GST', percentage: taxes.gst }] : []);
    const totalTaxAmount = chargesList.reduce((sum, charge) => sum + ((baseAmount * (parseFloat(charge.percentage) || 0)) / 100), 0);
    const totalAmount = baseAmount + totalTaxAmount;

    doc.setFontSize(22); doc.setTextColor(40); doc.text("INVOICE", 14, 22);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Invoice #: INV-${milestone.id}-${Date.now().toString().slice(-4)}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 35);
    doc.text(`Status: ${milestone.status}`, 14, 40);

    doc.setFontSize(12); doc.setTextColor(0);
    doc.text(details.delivery || "Your Company Name", 200, 22, { align: 'right' });
    doc.setFontSize(10);
    doc.text("Business Address Line 1", 200, 28, { align: 'right' });
    doc.text("City, Country, Zip", 200, 33, { align: 'right' });

    doc.text("Bill To:", 14, 55);
    doc.setFontSize(12); doc.text(details.clientName || "Client Name", 14, 62);
    doc.setFontSize(10);
    doc.text(details.location || "Client Location", 14, 68);
    doc.text(`Project ID: ${details.projectId}`, 14, 74);

    autoTable(doc, {
        startY: 85,
        head: [['Description', 'Percentage', `Amount (${currency})`]],
        body: [[milestone.name, `${milestone.percentage}%`, baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })]],
        theme: 'striped', headStyles: { fillColor: [66, 66, 66] }
    });

    let finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal:`, 140, finalY);
    doc.text(`${currency} ${baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, finalY, { align: 'right' });

    chargesList.forEach(charge => {
        finalY += 6;
        const amt = (baseAmount * (parseFloat(charge.percentage) || 0)) / 100;
        doc.text(`${charge.name} (${charge.percentage}%):`, 140, finalY);
        doc.text(`${currency} ${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, finalY, { align: 'right' });
    });

    doc.setDrawColor(200); doc.line(140, finalY + 4, 200, finalY + 4);
    doc.setFontSize(12); doc.setFont(undefined, 'bold');
    doc.text(`Total:`, 140, finalY + 10);
    doc.text(`${currency} ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, finalY + 10, { align: 'right' });

    doc.setFontSize(10); doc.setFont(undefined, 'normal');
    doc.text("Payment Terms: Due within 30 days.", 14, finalY + 30);
    doc.text("Bank Details: Bank Name, Account: XXXXXX, Swift: XXXXX", 14, finalY + 35);

    doc.save(`Invoice_${milestone.name.replace(/[^a-z0-9]/gi, '_')}.pdf`);
};

const generatePaymentInvoicePDF = (stakeholder, details, dealValue) => {
    const doc = new jsPDF();
    const currency = details.currency || 'AED';
    const payAmt = (dealValue * (parseFloat(stakeholder.percentage) || 0)) / 100;
    const taxRate = parseFloat(stakeholder.payoutTax) || 0;
    const taxAmt = (payAmt * taxRate) / 100;
    const netPay = payAmt - taxAmt;

    doc.setFontSize(22); doc.setTextColor(40); doc.text("PAYMENT INVOICE", 14, 22);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Invoice #: PAY-${stakeholder.id}-${Date.now().toString().slice(-4)}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 35);
    doc.text(`Status: ${stakeholder.payoutStatus || 'Pending'}`, 14, 40);

    doc.setFontSize(12); doc.setTextColor(0);
    doc.text(details.delivery || "Your Company Name", 200, 22, { align: 'right' });
    doc.setFontSize(10);
    doc.text("Business Address Line 1", 200, 28, { align: 'right' });
    doc.text("City, Country, Zip", 200, 33, { align: 'right' });

    doc.text("Pay To:", 14, 55);
    doc.setFontSize(14); doc.setFont(undefined, 'bold');
    doc.text(stakeholder.name || "Stakeholder", 14, 63);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Project: ${details.projectId}`, 14, 70);
    doc.text(`Client: ${details.clientName || 'N/A'}`, 14, 76);
    if (stakeholder.paidDate) doc.text(`Paid Date: ${stakeholder.paidDate}`, 14, 82);

    autoTable(doc, {
        startY: 92,
        head: [['Description', 'Share %', `Amount (${currency})`]],
        body: [[`Payment to ${stakeholder.name}`, `${stakeholder.percentage}%`, `${currency} ${payAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}`]],
        theme: 'striped', headStyles: { fillColor: [66, 66, 66] }
    });

    let finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal:`, 140, finalY);
    doc.text(`${currency} ${payAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, finalY, { align: 'right' });

    if (taxRate > 0) {
        finalY += 6;
        doc.text(`Tax (${taxRate}%):`, 140, finalY);
        doc.text(`- ${currency} ${taxAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, finalY, { align: 'right' });
    }

    doc.setDrawColor(200); doc.line(140, finalY + 4, 200, finalY + 4);
    doc.setFontSize(12); doc.setFont(undefined, 'bold');
    doc.text(`Net Pay:`, 140, finalY + 10);
    doc.text(`${currency} ${netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, finalY + 10, { align: 'right' });

    doc.setFontSize(10); doc.setFont(undefined, 'normal');
    doc.text("Payment Terms: Due within 30 days.", 14, finalY + 30);
    doc.text("Bank Details: Bank Name, Account: XXXXXX, Swift: XXXXX", 14, finalY + 35);

    doc.save(`Payment_Invoice_${(stakeholder.name || 'stakeholder').replace(/[^a-z0-9]/gi, '_')}.pdf`);
};

const generateProjectReportPDF = (details, stakeholders, milestones, taxes) => {
    const doc = new jsPDF();
    const currency = details.currency || 'AED';
    const totalDistributed = stakeholders.reduce((sum, s) => sum + (details.dealValue * s.percentage) / 100, 0);
    const netProfit = details.dealValue - totalDistributed;
    const chargesList = Array.isArray(taxes) ? taxes : (taxes.gst ? [{ name: 'GST', percentage: taxes.gst }] : []);
    const totalChargesString = chargesList.map(c => `${c.name}: ${c.percentage}%`).join(', ');

    doc.setFontSize(24); doc.setTextColor(40); doc.text("PROJECT FINANCIAL REPORT", 14, 22);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Project ID: ${details.projectId}`, 14, 35);

    doc.setFontSize(14); doc.setTextColor(0); doc.text("Executive Summary", 14, 50);

    const summaryData = [
        ["Deal Value", `${currency} ${details.dealValue.toLocaleString()}`],
        ["Total Distributed", `${currency} ${totalDistributed.toLocaleString()}`],
        ["Net Profit (Projected)", `${currency} ${netProfit.toLocaleString()}`],
        ["Tax Configuration", totalChargesString || "None"]
    ];

    autoTable(doc, {
        startY: 55, body: summaryData, theme: 'plain', styles: { fontSize: 11, cellPadding: 2 }, columnStyles: { 0: { fontStyle: 'bold', width: 80 } }
    });

    let finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14); doc.text("Stakeholder Distribution", 14, finalY);

    const stakeholderBody = stakeholders.map(s => [
        s.name, `${s.percentage}%`, `${currency} ${(details.dealValue * s.percentage / 100).toLocaleString()}`
    ]);

    autoTable(doc, {
        startY: finalY + 5, head: [['Name / Role', 'Share %', 'Amount']], body: stakeholderBody, theme: 'striped', headStyles: { fillColor: [41, 128, 185] }
    });

    finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text("Invoicing Schedule", 14, finalY);

    const totalTaxRate = chargesList.reduce((sum, c) => sum + (parseFloat(c.percentage) || 0), 0);
    const invoiceBody = milestones.map(m => {
        const base = (details.dealValue * m.percentage) / 100;
        const tax = (base * totalTaxRate) / 100;
        const total = base + tax;
        return [
            m.name,
            `${m.percentage}%`,
            m.status,
            `${currency} ${base.toLocaleString()}`,
            `${currency} ${tax.toLocaleString()}`,
            `${currency} ${total.toLocaleString()}`
        ];
    });

    autoTable(doc, {
        startY: finalY + 5,
        head: [['Milestone', '%', 'Status', 'Base', 'Tax', 'Total']],
        body: invoiceBody,
        theme: 'grid',
        headStyles: { fillColor: [39, 174, 96] },
        styles: { fontSize: 9 }
    });

    doc.save(`${details.projectId}_Full_Report.pdf`);
};

const generateDashboardPDF = (projects, filter) => {
    const doc = new jsPDF();
    const totalRevenue = projects.reduce((sum, p) => sum + (parseFloat(p.dealValue) || 0), 0);
    const activeProjects = projects.filter(p => !p.isArchived).length;
    const totalCollected = projects.reduce((sum, p) => sum + p.milestones.reduce((mSum, m) => m.status === 'Paid' ? mSum + ((p.dealValue * m.percentage) / 100) : mSum, 0), 0);
    const currency = projects.length > 0 ? projects[0].currency : 'AED';

    doc.setFontSize(24); doc.setTextColor(40); doc.text("EXECUTIVE DASHBOARD", 14, 22);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Filter View: ${filter}`, 14, 35);

    doc.setDrawColor(200); doc.setFillColor(245, 245, 245); doc.rect(14, 45, 182, 30, 'F');
    doc.setFontSize(12); doc.setTextColor(0);
    doc.text("Total Revenue", 30, 55); doc.text("Active Projects", 90, 55); doc.text("Total Collected", 150, 55);
    doc.setFontSize(16); doc.setFont(undefined, 'bold');
    doc.text(`${currency} ${totalRevenue.toLocaleString()}`, 30, 65); doc.text(`${activeProjects}`, 90, 65); doc.text(`${currency} ${totalCollected.toLocaleString()}`, 150, 65);

    doc.setFontSize(14); doc.setFont(undefined, 'normal'); doc.text("Project Performance Details", 14, 90);

    const tableBody = projects.map(p => {
        const collected = p.milestones.reduce((mSum, m) => m.status === 'Paid' ? mSum + ((p.dealValue * m.percentage) / 100) : mSum, 0);
        return [p.projectId, p.clientName, `${p.currency} ${p.dealValue.toLocaleString()}`, `${p.currency} ${collected.toLocaleString()}`, p.isArchived ? "Archived" : "Active"];
    });

    autoTable(doc, {
        startY: 95, head: [['ID', 'Client', 'Value', 'Collected', 'Status']], body: tableBody, theme: 'striped', headStyles: { fillColor: [52, 73, 94] }
    });

    doc.save(`Dashboard_Report_${filter}.pdf`);
};

const exportProjectReport = (details, stakeholders, milestones, taxes) => {
    const wb = XLSX.utils.book_new();
    const currency = details.currency;
    const totalDistributed = stakeholders.reduce((sum, s) => sum + (details.dealValue * s.percentage) / 100, 0);
    const totalInvoiced = milestones.reduce((sum, m) => sum + (details.dealValue * m.percentage) / 100, 0);
    const netProfit = details.dealValue - totalDistributed;

    const chargesList = Array.isArray(taxes) ? taxes : (taxes.gst ? [{ name: 'GST', percentage: taxes.gst }] : []);
    const totalChargePct = chargesList.reduce((sum, c) => sum + (parseFloat(c.percentage) || 0), 0);
    const chargesBreakdown = chargesList.map(c => `${c.name}: ${c.percentage}%`).join(', ');

    const dashboardData = [
        ["PROJECT FINANCIAL DASHBOARD"],
        ["Generated On", new Date().toLocaleString()],
        [],
        ["KEY METRICS"],
        ["Total Deal Value", details.dealValue],
        ["Currency", currency],
        ["Total Distributed", totalDistributed],
        ["Net Profit (Projected)", netProfit],
        ["Profit Margin", `${((netProfit / details.dealValue) * 100).toFixed(2)}%`],
        ["Total Invoiced", totalInvoiced],
        [],
        ["FINANCIAL CONFIGURATION"],
        ["Charges Applied", chargesBreakdown || "None"],
        ["Total Charge %", `${totalChargePct}%`],
        [],
        ["PROJECT DETAILS"],
        ["Project ID", details.projectId],
        ["Client", details.clientName],
        ["Delivery", details.delivery],
        ["Location", details.location]
    ];
    const wsDashboard = XLSX.utils.aoa_to_sheet(dashboardData);
    wsDashboard['!cols'] = [{ wch: 25 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsDashboard, "Dashboard");

    const stakeholderHeader = ["Role / Name", "Share %", `Amount (${currency})`, "Payout Tax %"];
    const stakeholderData = stakeholders.map(s => [
        s.name, `${s.percentage}%`, (details.dealValue * s.percentage) / 100, `${s.payoutTax || 0}%`
    ]);
    const wsStakeholders = XLSX.utils.aoa_to_sheet([stakeholderHeader, ...stakeholderData]);
    wsStakeholders['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsStakeholders, "Stakeholders");

    const milestoneHeader = ["Milestone", "Percentage", "Status", `Base (${currency})`, `Tax/Charges (${currency})`, `Total (${currency})`];
    const milestoneData = milestones.map(m => {
        const base = (details.dealValue * m.percentage) / 100;
        const tax = (base * totalChargePct) / 100;
        const total = base + tax;
        return [m.name, `${m.percentage}%`, m.status, base, tax, total];
    });
    const wsMilestones = XLSX.utils.aoa_to_sheet([milestoneHeader, ...milestoneData]);
    wsMilestones['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsMilestones, "Invoicing Schedule");

    const safeName = (details.projectId || 'Project').replace(/[^a-z0-9]/gi, '_');
    XLSX.writeFile(wb, `${safeName}_Full_Report.xlsx`);
};

const exportDashboardExcel = (projects, filter) => {
    const wb = XLSX.utils.book_new();
    const totalRevenue = projects.reduce((sum, p) => sum + (parseFloat(p.dealValue) || 0), 0);
    const summaryData = [
        ["EXECUTIVE DASHBOARD REPORT"], ["Filter Applied", filter], [],
        ["Total Revenue", totalRevenue], [], ["DISTRIBUTION BY PROJECT"], ["Project", "Value"]
    ];
    projects.forEach(p => summaryData.push([p.projectId, p.dealValue]));
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Executive Summary");
    XLSX.writeFile(wb, `Dashboard_Report_${filter}.xlsx`);
};

// ==========================================
// 3. SUB COMPONENTS (Dashboard & Invoice)
// ==========================================

const Dashboard = ({ projects, onOpenProject, onCreateProject }) => {
    const [filter, setFilter] = useState('All');
    const [chartMetric, setChartMetric] = useState('Revenue');
    const [displayCurrency, setDisplayCurrency] = useState('AED');

    // Global Labels (Sync with Sales Settings)
    const [projectTypes, setProjectTypes] = useState([
        localStorage.getItem('app_product_label') || 'Products',
        localStorage.getItem('app_service_label') || 'Services'
    ]);
    const [activeTypeIndex, setActiveTypeIndex] = useState(0);

    // Listen for storage changes to update labels dynamically
    useEffect(() => {
        const handleStorageChange = () => {
            setProjectTypes([
                localStorage.getItem('app_product_label') || 'Products',
                localStorage.getItem('app_service_label') || 'Services'
            ]);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Filter Logic
    const filteredProjects = projects.filter(p => {
        if (filter === 'All') return true;
        const pDate = new Date(p.dateCreated);
        const now = new Date();
        if (filter === 'Yearly') return pDate.getFullYear() === now.getFullYear();
        if (filter === 'Monthly') return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
        return true;
    });

    // KPI Calcs
    const totalRevenue = filteredProjects.reduce((sum, p) => sum + (parseFloat(p.dealValue) || 0), 0);
    const activeProjects = filteredProjects.filter(p => !p.isArchived).length;
    const totalSplits = filteredProjects.reduce((sum, p) => sum + p.stakeholders.reduce((sSum, s) => sSum + ((parseFloat(p.dealValue) || 0) * s.percentage) / 100, 0), 0);
    const totalCollected = filteredProjects.reduce((sum, p) => sum + p.milestones.reduce((mSum, m) => m.status === 'Paid' ? mSum + ((p.dealValue * m.percentage) / 100) : mSum, 0), 0);

    useEffect(() => {
        if (filteredProjects.length > 0) {
            setDisplayCurrency(filteredProjects[0].currency);
        } else {
            setDisplayCurrency('AED');
        }
    }, [filteredProjects]);

    const chartData = filteredProjects.map(p => ({
        name: p.projectId,
        value: chartMetric === 'Revenue' ? (parseFloat(p.dealValue) || 0) :
            chartMetric === 'Splits' ? p.stakeholders.reduce((sSum, s) => sSum + ((parseFloat(p.dealValue) || 0) * s.percentage) / 100, 0) :
                p.milestones.reduce((mSum, m) => m.status === 'Paid' ? mSum + ((p.dealValue * m.percentage) / 100) : mSum, 0)
    }));

    const statusData = [{ name: 'Active', value: activeProjects }, { name: 'Completed', value: filteredProjects.length - activeProjects }];
    const COLORS = ['#0d6efd', '#198754', '#ffc107', '#dc3545'];

    return (
        <div className="container py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Project Dashboard</h2>
                    <p className="text-muted m-0">Overview of all financial projects</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-primary" onClick={onCreateProject}><Plus size={18} /> New Project</button>
                    <button className="btn btn-outline-success" onClick={() => exportDashboardExcel(filteredProjects, filter)}><FileDown size={16} /> Export</button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="row mb-5">
                <div className="dashboard-card col-md-3">
                    <div className="dashboard-card-body">
                        <div className="d-flex justify-content-between mb-3">
                            <div><p className="text-muted small mb-1">Total Revenue</p><h3 className="text-dark fw-bold m-0">{displayCurrency} {totalRevenue.toLocaleString()}</h3></div>
                            <div className="p-2 bg-success bg-opacity-10 rounded"><DollarSign className="text-success" size={24} /></div>
                        </div>
                    </div>
                </div>
                <div className="dashboard-card col-md-3">
                    <div className="dashboard-card-body">
                        <div className="d-flex justify-content-between mb-3">
                            <div><p className="text-muted small mb-1">Active Projects</p><h3 className="text-dark fw-bold m-0">{activeProjects}</h3></div>
                            <div className="p-2 bg-primary bg-opacity-10 rounded"><Briefcase className="text-primary" size={24} /></div>
                        </div>
                    </div>
                </div>
                <div className="dashboard-card col-md-3">
                    <div className="dashboard-card-body">
                        <div className="d-flex justify-content-between mb-3">
                            <div><p className="text-muted small mb-1">Total Splits</p><h3 className="text-dark fw-bold m-0">{displayCurrency} {totalSplits.toLocaleString()}</h3></div>
                            <div className="p-2 bg-danger bg-opacity-10 rounded"><Users className="text-danger" size={24} /></div>
                        </div>
                    </div>
                </div>
                <div className="dashboard-card col-md-3">
                    <div className="dashboard-card-body">
                        <div className="d-flex justify-content-between mb-3">
                            <div><p className="text-muted small mb-1">Total Collected</p><h3 className="text-dark fw-bold m-0">{displayCurrency} {totalCollected.toLocaleString()}</h3></div>
                            <div className="p-2 bg-warning bg-opacity-10 rounded"><Wallet className="text-warning" size={24} /></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="row mb-5">
                <div className="col-md-8 mb-4">
                    <div className="dashboard-card">
                        <div className="dashboard-card-header">
                            <h5 className="text-dark m-0">{chartMetric} by Project</h5>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setChartMetric(chartMetric === 'Revenue' ? 'Splits' : 'Revenue')}>Toggle Metric</button>
                        </div>
                        <div className="dashboard-card-body" style={{ height: 300, position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="name" stroke="#6c757d" />
                                    <YAxis stroke="#6c757d" />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#dee2e6', color: '#212529' }} />
                                    <Bar dataKey="value" fill="#0d6efd" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 mb-4">
                    <div className="dashboard-card">
                        <div className="dashboard-card-header"><h5 className="text-dark m-0">Status Distribution</h5></div>
                        <div className="dashboard-card-body" style={{ height: 300, position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#dee2e6', color: '#212529' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Project List */}
            <div className="dashboard-card">
                <div className="dashboard-card-header"><h5 className="text-dark m-0">Recent Projects</h5></div>
                <div className="table-responsive">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th>Project Name</th><th>Client</th><th>Deal Value</th><th>Collected</th><th>Status</th><th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProjects.map(project => {
                                const collected = project.milestones.reduce((sum, m) => m.status === 'Paid' ? sum + ((project.dealValue * m.percentage) / 100) : sum, 0);
                                return (
                                    <tr key={project.id} onClick={() => onOpenProject(project.id)}>
                                        <td><div className="fw-bold text-dark">{project.projectId}</div></td>
                                        <td>{project.clientName}</td>
                                        <td className="font-monospace text-dark fw-bold">{project.currency} {parseFloat(project.dealValue).toLocaleString()}</td>
                                        <td className="font-monospace text-warning">{project.currency} {collected.toLocaleString()}</td>
                                        <td><span className="text-success">Active</span></td>
                                        <td><button className="btn btn-sm btn-outline-primary rounded-circle"><ArrowRight size={14} /></button></td>
                                    </tr>
                                );
                            })}
                            {filteredProjects.length === 0 && <tr><td colSpan="6" className="text-center py-4 text-muted">No projects found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const BusinessDetails = ({ details, updateDetails }) => (
    <div className="stage">
        <div className="bar">Stage 1 — Business Details</div>
        <div className="stage-p">
            <div className="grid-stage">
                <label className="stage-label">Project ID</label>
                <input className="stage-input" value={details.projectId} onChange={(e) => updateDetails('projectId', e.target.value)} />
                <label className="stage-label">Client Name</label>
                <input className="stage-input" value={details.clientName} onChange={(e) => updateDetails('clientName', e.target.value)} />
                <label className="stage-label">Delivery</label>
                <input className="stage-input" value={details.delivery || ''} onChange={(e) => updateDetails('delivery', e.target.value)} placeholder="Ambot365" />
                <label className="stage-label">Billing Location</label>
                <input className="stage-input" value={details.location} onChange={(e) => updateDetails('location', e.target.value)} />
                <label className="stage-label">Deal Value</label>
                <input type="number" className="stage-input" value={details.dealValue} onChange={(e) => updateDetails('dealValue', e.target.value)} />
                <label className="stage-label">Currency</label>
                <select className="stage-select" value={details.currency} onChange={(e) => updateDetails('currency', e.target.value)}>
                    <option value="AED">AED</option><option value="USD">USD</option><option value="INR">INR</option>
                </select>
            </div>
        </div>
    </div>
);

const StageTwoCombined = ({ stakeholders, addStakeholder, removeStakeholder, updateStakeholder, charges, addCharge, removeCharge, updateCharge, dealValue, currency }) => {
    const totalPct = stakeholders.reduce((sum, s) => sum + (parseFloat(s.percentage) || 0), 0);
    const totalAmt = stakeholders.reduce((sum, s) => sum + ((dealValue * (parseFloat(s.percentage) || 0)) / 100), 0);

    const totalChargePct = charges ? charges.reduce((sum, c) => sum + (parseFloat(c.percentage) || 0), 0) : 0;
    const totalChargeAmt = charges ? charges.reduce((sum, c) => sum + ((dealValue * (parseFloat(c.percentage) || 0)) / 100), 0) : 0;

    return (
        <div className="stage">
            <div className="bar">
                <span>Stage 2 — Project Splits & Finance Charges</span>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-white d-flex align-items-center gap-1" onClick={addStakeholder}>
                        <Plus size={14} /> Add Party
                    </button>
                    <button className="btn btn-sm btn-white d-flex align-items-center gap-1" onClick={addCharge}>
                        <Plus size={14} /> Add Charge
                    </button>
                </div>
            </div>
            <div className="stage-p">
                {/* Share Percentage Section */}
                <h6 className="fw-bold mb-3 text-muted">Share Percentage</h6>
                <table className="stage-table mb-4">
                    <thead>
                        <tr>
                            <th>Party</th><th style={{ width: '150px' }}>%</th><th>Amount ({currency})</th><th style={{ width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {stakeholders.map((stakeholder) => {
                            const value = (dealValue * stakeholder.percentage) / 100;
                            return (
                                <tr key={stakeholder.id}>
                                    <td>
                                        <input className="stage-input" value={stakeholder.name} onChange={(e) => updateStakeholder(stakeholder.id, 'name', e.target.value)} placeholder="e.g. Lead / Investor" />
                                    </td>
                                    <td>
                                        <input type="number" className="stage-input" value={stakeholder.percentage} onChange={(e) => updateStakeholder(stakeholder.id, 'percentage', e.target.value)} />
                                    </td>
                                    <td className="font-monospace">{currency} {value.toLocaleString()}</td>
                                    <td className="text-center">
                                        <button className="btn-icon text-danger" onClick={() => removeStakeholder(stakeholder.id)}><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            );
                        })}
                        {stakeholders.length === 0 && <tr><td colSpan="4" className="text-center text-muted p-3">No parties added.</td></tr>}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>Total</th><th>{totalPct.toFixed(2)}%</th><th>{currency} {totalAmt.toLocaleString()}</th><th></th>
                        </tr>
                    </tfoot>
                </table>

                {/* Finance Charges Section */}
                <h6 className="fw-bold mb-3 text-muted border-top pt-4">Finance Charges</h6>
                <table className="stage-table">
                    <thead><tr><th>Charge Name</th><th style={{ width: '150px' }}>%</th><th>Amount ({currency})</th><th style={{ width: '50px' }}></th></tr></thead>
                    <tbody>
                        {charges && charges.map(c => (
                            <tr key={c.id}>
                                <td><input className="stage-input" value={c.name} onChange={(e) => updateCharge(c.id, 'name', e.target.value)} /></td>
                                <td><input type="number" className="stage-input" value={c.percentage} onChange={(e) => updateCharge(c.id, 'percentage', e.target.value)} /></td>
                                <td className="font-monospace">{currency} {(dealValue * c.percentage / 100).toLocaleString()}</td>
                                <td><button className="btn-link text-danger" onClick={() => removeCharge(c.id)}><Trash2 size={16} /></button></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>Total Expense</th>
                            <th>{totalChargePct.toFixed(2)}%</th>
                            <th>{currency} {totalChargeAmt.toLocaleString()}</th>
                            <th></th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

const PaymentMilestones = ({ milestones, addMilestone, removeMilestone, updateMilestone, dealValue, details, taxes }) => {
    const paidMilestones = milestones.filter(m => m.status === 'Paid');
    const totalPaid = paidMilestones.reduce((sum, m) => sum + ((dealValue * m.percentage) / 100), 0);
    const paidPct = dealValue ? ((totalPaid / dealValue) * 100) : 0;

    const [projectTypes, setProjectTypes] = useState([
        localStorage.getItem('app_product_label') || 'Products',
        localStorage.getItem('app_service_label') || 'Services'
    ]);
    const [activeTypeIndex, setActiveTypeIndex] = useState(0);

    useEffect(() => {
        const handleStorageChange = () => {
            setProjectTypes([
                localStorage.getItem('app_product_label') || 'Products',
                localStorage.getItem('app_service_label') || 'Services'
            ]);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const calculateAgeing = (invoiceDate, paidDate) => {
        if (!invoiceDate) return '-';
        const start = new Date(invoiceDate);
        const end = paidDate ? new Date(paidDate) : new Date();
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="stage">
            <div className="bar">
                <span>Stage 3 — Invoice Cycle</span>
                <button className="btn btn-sm btn-white d-flex align-items-center gap-1" onClick={addMilestone}>
                    <Plus size={14} /> Add Payment
                </button>
            </div>
            <div className="stage-p">
                <div className="stage-kpi">
                    <div className="stage-card">
                        <div className="stage-muted">Total Paid</div>
                        <div className="kpi-value">{details.currency} {totalPaid.toLocaleString()}</div>
                    </div>
                    <div className="stage-card">
                        <div className="stage-muted">Status (Paid %)</div>
                        <div className="kpi-value">{paidPct.toFixed(2)}%</div>
                    </div>
                </div>

                <table className="stage-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Payment</th>
                            <th style={{ width: '80px' }}>%</th>
                            <th>Invoice Date</th>
                            <th>Raised ({details.currency})</th>
                            <th>Paid Date</th>
                            <th>Paid ({details.currency})</th>
                            <th>Ageing (days)</th>
                            <th>Status</th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {milestones.map((milestone, index) => {
                            const raisedAmount = (dealValue * milestone.percentage) / 100;
                            return (
                                <tr key={milestone.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <input className="stage-input" value={milestone.name} onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)} placeholder="Description" />
                                    </td>
                                    <td>
                                        <input type="number" className="stage-input text-end" value={milestone.percentage} onChange={(e) => updateMilestone(milestone.id, 'percentage', e.target.value)} />
                                    </td>
                                    <td>
                                        <input type="date" className="stage-input" value={milestone.invoiceDate || ''} onChange={(e) => updateMilestone(milestone.id, 'invoiceDate', e.target.value)} />
                                    </td>
                                    <td className="font-monospace" style={{ whiteSpace: 'nowrap' }}>{details.currency} {raisedAmount.toLocaleString()}</td>
                                    <td>
                                        <input type="date" className="stage-input" value={milestone.paidDate || ''} onChange={(e) => updateMilestone(milestone.id, 'paidDate', e.target.value)} />
                                    </td>
                                    <td className="font-monospace text-success fw-bold" style={{ whiteSpace: 'nowrap' }}>{details.currency} {raisedAmount.toLocaleString()}</td>
                                    <td className="text-center font-monospace">
                                        {calculateAgeing(milestone.invoiceDate, milestone.paidDate)}
                                    </td>
                                    <td>
                                        <select
                                            className="stage-select"
                                            value={milestone.status || 'Pending'}
                                            onChange={(e) => updateMilestone(milestone.id, 'status', e.target.value)}
                                            style={{
                                                borderColor: milestone.status === 'Paid' ? '#198754' : '#ccc',
                                                color: milestone.status === 'Paid' ? '#198754' : '#000'
                                            }}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Raised">Raised</option>
                                            <option value="Paid">Paid</option>
                                            <option value="Overdue">Overdue</option>
                                        </select>
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex bg-white rounded border p-1 gap-1" style={{ height: '38px', alignItems: 'center' }}>
                                            {projectTypes.map((label, index) => (
                                                <button
                                                    key={index}
                                                    className={`btn btn-sm ${activeTypeIndex === index ? 'btn-success' : 'btn-white text-muted'} border-0 rounded`}
                                                    onClick={() => setActiveTypeIndex(index)}
                                                    style={{ fontWeight: activeTypeIndex === index ? 'bold' : 'normal' }}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="d-flex justify-content-center gap-2">
                                            <button className="btn-icon text-success" onClick={() => generateInvoicePDF(milestone, details, taxes)} title="Download Invoice">
                                                <FileDown size={18} />
                                            </button>
                                            <button className="btn-icon text-danger" onClick={() => removeMilestone(milestone.id)} title="Delete Item">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {milestones.length === 0 && <tr><td colSpan="10" className="text-center text-muted p-3">No payments added.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const InvoiceMain = ({ details, updateDetails, stakeholders, addStakeholder, removeStakeholder, updateStakeholder, milestones, addMilestone, removeMilestone, updateMilestone, charges, addCharge, removeCharge, updateCharge }) => {
    const dVal = parseFloat(details.dealValue) || 0;
    const totalChargePct = charges ? charges.reduce((sum, c) => sum + (parseFloat(c.percentage) || 0), 0) : 0;
    const totalChargeAmt = charges ? charges.reduce((sum, c) => sum + ((dVal * (parseFloat(c.percentage) || 0)) / 100), 0) : 0;

    return (
        <div className="invoice-view">
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded shadow-sm border">
                <div className="d-flex align-items-center gap-3">
                    <div className="p-2 bg-primary bg-opacity-10 rounded-circle"><LayoutDashboard size={24} className="text-primary" /></div>
                    <div><h4 className="m-0 fw-bold">Deal Finance Tracker</h4><span className="text-muted small">Professional Financial Management</span></div>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-danger" onClick={() => generateProjectReportPDF(details, stakeholders, milestones, charges)}>PDF Report</button>
                    <button className="btn btn-sm btn-outline-success" onClick={() => exportProjectReport(details, stakeholders, milestones, charges)}>Excel Export</button>
                </div>
            </div>

            {/* Stage 1 */}
            <BusinessDetails details={details} updateDetails={updateDetails} />

            {/* Stage 2: Project Splits & Finance Charges */}
            <StageTwoCombined
                stakeholders={stakeholders}
                addStakeholder={addStakeholder}
                removeStakeholder={removeStakeholder}
                updateStakeholder={updateStakeholder}
                charges={charges}
                addCharge={addCharge}
                removeCharge={removeCharge}
                updateCharge={updateCharge}
                dealValue={dVal}
                currency={details.currency}
            />

            {/* Stage 3: Invoice Cycle */}
            <PaymentMilestones milestones={milestones} addMilestone={addMilestone} removeMilestone={removeMilestone} updateMilestone={updateMilestone} dealValue={dVal} details={details} taxes={charges} />

            {/* Stage 4: Payment Process */}
            <div className="stage">
                <div className="bar">Stage 4 — Payment Process</div>
                <div className="stage-p">
                    <table className="stage-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Party</th>
                                <th>Value %</th>
                                <th>Pay ({details.currency})</th>
                                <th>Tax %</th>
                                <th>Tax Amt</th>
                                <th>Paid Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stakeholders && stakeholders.map((s, idx) => {
                                const payAmt = (dVal * s.percentage) / 100;
                                const taxRate = parseFloat(s.payoutTax) || 0;
                                const taxAmt = (payAmt * taxRate) / 100;

                                return (
                                    <tr key={s.id}>
                                        <td>{idx + 1}</td>
                                        <td><span className="fw-bold">{s.name}</span></td>
                                        <td>
                                            <input type="number" className="stage-input text-center p-1" style={{ width: '80px' }} value={s.percentage} onChange={(e) => updateStakeholder(s.id, 'percentage', e.target.value)} />
                                        </td>
                                        <td className="font-monospace fw-bold">{details.currency} {payAmt.toLocaleString()}</td>
                                        <td>
                                            <input type="number" className="stage-input p-1 text-center" style={{ width: '60px' }} value={s.payoutTax || 0} onChange={(e) => updateStakeholder(s.id, 'payoutTax', e.target.value)} />
                                        </td>
                                        <td className="font-monospace text-danger">{details.currency} {taxAmt.toLocaleString()}</td>
                                        <td>
                                            <input type="date" className="stage-input p-1" value={s.paidDate || ''} onChange={(e) => updateStakeholder(s.id, 'paidDate', e.target.value)} />
                                        </td>
                                        <td>
                                            <select
                                                className="stage-select p-1"
                                                value={s.payoutStatus || 'Pending'}
                                                onChange={(e) => updateStakeholder(s.id, 'payoutStatus', e.target.value)}
                                                style={{
                                                    borderColor: s.payoutStatus === 'Paid Successfully' ? '#198754' : '#ccc',
                                                    color: s.payoutStatus === 'Paid Successfully' ? '#198754' : '#000'
                                                }}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Paid Successfully">Paid Successfully</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" title="Download Invoice" onClick={() => generatePaymentInvoicePDF(s, details, dVal)}>
                                                <FileDown size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 4. MAIN COMPONENT (App Logic)
// ==========================================

const ProjectTrackerComplete = () => {
    const location = useLocation();

    const [view, setView] = useState('dashboard');
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [projects, setProjects] = useState([
        {
            id: 1, projectId: 'ABC123', dateCreated: new Date().toISOString(), clientName: 'ABC Company', delivery: 'Ambot365',
            dealValue: 100000, currency: 'AED', location: 'Dubai',
            stakeholders: [{ id: 1, name: 'Lead', percentage: 2, payoutTax: 10, payoutStatus: 'Pending', paidDate: '' }],
            milestones: [{ id: 1, name: 'Initiate Invoice', percentage: 20, status: 'Completed', invoiceDate: new Date().toISOString().split('T')[0], paidDate: '' }],
            charges: [{ id: 1, name: 'GST', percentage: 18 }]
        }
    ]);

    useEffect(() => {
        if (location.state && location.state.project) {
            const receivedProject = location.state.project;
            // Check if already exists to avoid duplicates (though local state resets on mount, this is good practice)
            setProjects(prevProjects => {
                const exists = prevProjects.find(p => p.id === receivedProject.id);
                if (exists) {
                    setActiveProjectId(receivedProject.id);
                    setView('invoice');
                    return prevProjects;
                }

                // Map Sales data to Invoice structure
                const newProject = {
                    id: receivedProject.id,
                    projectId: receivedProject.customId || `PROJ-${receivedProject.id}`,
                    dateCreated: new Date().toISOString(),
                    clientName: receivedProject.clientName || 'Unknown Client',
                    delivery: receivedProject.brandingName || '',
                    dealValue: 0,
                    currency: 'AED',
                    location: 'Dubai',
                    stakeholders: [],
                    milestones: [],
                    charges: [{ id: 1, name: 'GST', percentage: 0 }]
                };

                setActiveProjectId(newProject.id);
                setView('invoice');
                return [...prevProjects, newProject];
            });
        }
    }, [location.state]);

    const activeProject = projects.find(p => p.id === activeProjectId);

    const handleCreateProject = () => {
        const newProj = {
            id: Date.now(), projectId: `PROJ-${Math.floor(Math.random() * 999)}`, dateCreated: new Date().toISOString(),
            clientName: 'New Client', delivery: '', dealValue: 0, currency: 'AED', location: '',
            stakeholders: [], milestones: [], charges: [{ id: 1, name: 'GST', percentage: 0 }]
        };
        setProjects([...projects, newProj]);
        setActiveProjectId(newProj.id);
        setView('invoice');
    };

    const updateProject = (fn) => setProjects(projects.map(p => p.id === activeProjectId ? fn(p) : p));
    const updateDetails = (f, v) => updateProject(p => ({ ...p, [f]: v }));

    // Stakeholders logic
    const addStakeholder = () => updateProject(p => ({ ...p, stakeholders: [...p.stakeholders, { id: Date.now(), name: 'New', percentage: 0, payoutTax: 0, payoutStatus: 'Pending', paidDate: '' }] }));
    const removeStakeholder = (id) => updateProject(p => ({ ...p, stakeholders: p.stakeholders.filter(s => s.id !== id) }));
    const updateStakeholder = (id, f, v) => updateProject(p => ({ ...p, stakeholders: p.stakeholders.map(s => s.id === id ? { ...s, [f]: v } : s) }));

    // Milestones logic
    const addMilestone = () => updateProject(p => ({ ...p, milestones: [...p.milestones, { id: Date.now(), name: 'New Stage', percentage: 0, status: 'Pending', invoiceDate: '', paidDate: '' }] }));
    const removeMilestone = (id) => updateProject(p => ({ ...p, milestones: p.milestones.filter(m => m.id !== id) }));
    const updateMilestone = (id, f, v) => updateProject(p => ({ ...p, milestones: p.milestones.map(m => m.id === id ? { ...m, [f]: v } : m) }));

    // Charges logic
    const addCharge = () => updateProject(p => ({ ...p, charges: [...p.charges, { id: Date.now(), name: 'New', percentage: 0 }] }));
    const removeCharge = (id) => updateProject(p => ({ ...p, charges: p.charges.filter(c => c.id !== id) }));
    const updateCharge = (id, f, v) => updateProject(p => ({ ...p, charges: p.charges.map(c => c.id === id ? { ...c, [f]: v } : c) }));

    return (
        <div className="tracker-wrapper">
            <TrackerStyles />
            {view === 'invoice' && activeProject && (
                <div className="mb-4 container">
                    <button className="btn btn-outline-dark" onClick={() => { setView('dashboard'); setActiveProjectId(null); }}>
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                </div>
            )}

            {view === 'dashboard' ? (
                <Dashboard projects={projects} onOpenProject={(id) => { setActiveProjectId(id); setView('invoice'); }} onCreateProject={handleCreateProject} />
            ) : activeProject ? (
                <InvoiceMain
                    details={activeProject} updateDetails={updateDetails}
                    stakeholders={activeProject.stakeholders} addStakeholder={addStakeholder} removeStakeholder={removeStakeholder} updateStakeholder={updateStakeholder}
                    milestones={activeProject.milestones} addMilestone={addMilestone} removeMilestone={removeMilestone} updateMilestone={updateMilestone}
                    charges={activeProject.charges} addCharge={addCharge} removeCharge={removeCharge} updateCharge={updateCharge}
                />
            ) : (
                <div className="text-white text-center">Project not found.</div>
            )}
        </div>
    );
};

export default ProjectTrackerComplete;
