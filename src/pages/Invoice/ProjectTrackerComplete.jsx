import React, { useState, useEffect } from 'react';
import { FaFilePdf } from "react-icons/fa6";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { useLocation } from 'react-router-dom';
import {
    LayoutDashboard, FileDown, Briefcase, MapPin, Globe, CreditCard, Building, Users,
    Plus, Trash2, ArrowLeft, DollarSign, FileText, ArrowRight, Filter, Wallet, CheckCircle, X, Save
} from 'lucide-react';
import ambotLogo from '../../assets/images/ambot logo.png';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { db } from '../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { projectService } from '../../services/api';
import { contactService } from '../../services/contactService';

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
            max-width: 100%;
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

// Helper to add the standard AmBot 365 Header
const addPDFHeader = (doc, title, details) => {
    const pageWidth = doc.internal.pageSize.width;

    // 1. Add Logo (Top Left)
    try {
        doc.addImage(ambotLogo, 'PNG', 14, 10, 50, 12); // Adjusted aspect ratio (approx 4:1)
    } catch (e) {
        doc.setFontSize(20); doc.setTextColor(0, 84, 166); doc.text("AmBot 365", 14, 25);
    }

    // 2. Add Company Details (Top Right)
    doc.setFontSize(10); doc.setTextColor(0); doc.setFont(undefined, 'bold');
    doc.text("AMBOT365 RPA & IT SOLUTIONS (OPC) PVT.LTD", pageWidth - 14, 18, { align: 'right' });

    doc.setFontSize(8); doc.setFont(undefined, 'normal'); doc.setTextColor(60);
    doc.text("BLOCK A , DOOR NO 105, MOTHERS VILLAGE ,", pageWidth - 14, 23, { align: 'right' });
    doc.text("NESAVALAR COLONY ROAD, ONDIPUDUR, Coimbatore-", pageWidth - 14, 27, { align: 'right' });
    doc.text("641016, Tamil Nadu", pageWidth - 14, 31, { align: 'right' });
    doc.text("GSTIN: 33AAYCA8731D1ZH", pageWidth - 14, 35, { align: 'right' });
    doc.text("Email: finance@ambot365.in", pageWidth - 14, 39, { align: 'right' });

    // 3. Decorative Lines (Header)
    doc.setDrawColor(0, 84, 166); // Blue
    doc.setLineWidth(1.5);
    doc.line(14, 45, pageWidth - 14, 45);

    doc.setDrawColor(140, 198, 63); // Green
    doc.setLineWidth(1.5);
    doc.line(40, 47, pageWidth - 14, 47); // Slightly offset start as per style

    // 4. Title (Centered)
    doc.setFontSize(24); doc.setTextColor(15, 36, 86); // Dark Navy Blue
    doc.setFont(undefined, 'bold');
    doc.text(title, pageWidth / 2, 60, { align: 'center' });

    // 5. Title Underline (Green)
    doc.setDrawColor(140, 198, 63);
    doc.setLineWidth(1);
    doc.line(pageWidth / 2 - 30, 62, pageWidth / 2 + 30, 62);
};

const generatePaymentInvoicePDF = (stakeholder, details, dealValue) => {
    const doc = new jsPDF();
    const currency = details.currency || 'AED';
    const payAmt = (dealValue * (parseFloat(stakeholder.percentage) || 0)) / 100;
    const taxRate = parseFloat(stakeholder.payoutTax) || 18;
    const taxAmt = (payAmt * taxRate) / 100;
    const netPay = payAmt - taxAmt;

    // Use Helper
    addPDFHeader(doc, "PAYMENT VOUCHER", details);

    // Invoice Details
    doc.setFontSize(10); doc.setTextColor(0); doc.setFont(undefined, 'bold');
    doc.text("To:", 14, 85);
    doc.setFont(undefined, 'normal');
    doc.text(stakeholder.name || "Stakeholder", 14, 90);
    doc.text(`Project: ${details.projectId}`, 14, 95);

    doc.setFont(undefined, 'bold');
    doc.text("Voucher No:", 140, 85);
    doc.text("Date:", 140, 90);

    doc.setFont(undefined, 'normal');
    doc.text(`PAY-${stakeholder.id}-${Date.now().toString().slice(-4)}`, 170, 85);
    doc.text(new Date().toLocaleDateString(), 170, 90);

    autoTable(doc, {
        startY: 105,
        head: [['#', 'Item & Description', 'Share %', `Amount (${currency})`]],
        body: [[1, `Payment Disbursement - ${stakeholder.name}`, `${stakeholder.percentage}%`, `${currency} ${payAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}`]],
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }, // Blue Header
        styles: { halign: 'left' },
        columnStyles: { 0: { halign: 'center', width: 10 }, 3: { halign: 'right' } }
    });

    let finalY = doc.lastAutoTable.finalY + 10;

    // Summary
    doc.setFontSize(10);
    doc.text(`Subtotal:`, 140, finalY);
    doc.text(`${currency} ${payAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, finalY, { align: 'right' });

    if (taxRate > 0) {
        finalY += 6;
        doc.text(`Less GST (${taxRate}%):`, 140, finalY);
        doc.text(`- ${currency} ${taxAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, finalY, { align: 'right' });
    }

    doc.setDrawColor(200); doc.line(140, finalY + 4, 200, finalY + 4);
    finalY += 10;

    // Green Background for Net Amount (mimicking the Excel/Image style)
    doc.setFillColor(39, 174, 96);
    doc.rect(135, finalY - 6, 65, 10, 'F');
    doc.setTextColor(255); doc.setFont(undefined, 'bold');
    doc.text(`Net Pay:`, 140, finalY);
    doc.text(`${currency} ${netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, finalY, { align: 'right' });

    // Footer Signatures
    doc.setTextColor(0); doc.setFont(undefined, 'normal');
    finalY += 30;
    doc.text("For AMBOT365 RPA & IT SOLUTIONS", 195, finalY, { align: 'right' });
    doc.text("(Authorized Signatory)", 195, finalY + 15, { align: 'right' });

    doc.save(`Payment_Voucher_${(stakeholder.name || 'stakeholder').replace(/[^a-z0-9]/gi, '_')}.pdf`);
};

const generateInvoicePDF = (milestone, details, taxes) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const currency = details.currency || 'INR';
    const baseAmount = (details.dealValue * (parseFloat(milestone.percentage) || 0)) / 100;

    // Tax Calculation
    const chargesList = Array.isArray(taxes) && taxes.length > 0 ? taxes : [{ name: 'GST', percentage: 18, taxType: 'Standard' }];
    const isIntraState = chargesList.some(t => t.taxType === 'Intra-State (CGST + SGST)');
    const totalTaxRate = chargesList.reduce((sum, c) => sum + (parseFloat(c.percentage) || 0), 0);
    const totalTaxAmount = (baseAmount * totalTaxRate) / 100;
    const finalAmount = baseAmount + totalTaxAmount;

    // ═══ HEADER ═══
    addPDFHeader(doc, "CLIENT INVOICE", details);

    let y = 72;

    // ═══ COMPANY INFO ═══
    doc.setFontSize(9); doc.setTextColor(0); doc.setFont(undefined, 'bold');
    doc.text("AMBOT365 RPA & IT SOLUTIONS (OPC) PVT.LTD", 14, y);
    doc.setFont(undefined, 'normal'); doc.setFontSize(8); doc.setTextColor(60);
    doc.text("BLOCK A, DOOR NO 105, MOTHERS VILLAGE, NESAVALAR COLONY ROAD, ONDIPUDUR, Coimbatore-641016, Tamil Nadu", 14, y + 4);
    doc.text("GSTIN: 33AAYCA8731D1ZH  |  CIN: U72900TZ2021OPC038831", 14, y + 8);

    y += 14;
    doc.setDrawColor(200); doc.setLineWidth(0.3);
    doc.line(14, y, pageWidth - 14, y);
    y += 5;

    // ═══ BILL TO & INVOICE INFO ═══
    doc.setFontSize(9); doc.setTextColor(0); doc.setFont(undefined, 'bold');
    doc.text("BILL TO:", 14, y);
    doc.setFont(undefined, 'normal');
    doc.text(details.clientName || "Client Name", 14, y + 5);
    if (details.clientAddress) doc.text(details.clientAddress, 14, y + 9);
    if (details.clientGstin) {
        doc.setFont(undefined, 'bold');
        doc.text(`GSTIN: ${details.clientGstin}`, 14, y + (details.clientAddress ? 13 : 9));
        doc.setFont(undefined, 'normal');
    }

    const placeY = y + (details.clientAddress ? 17 : 13);
    doc.setFont(undefined, 'bold');
    doc.text("Place of Supply:", 14, placeY);
    doc.setFont(undefined, 'normal');
    doc.text(details.location || 'Tamil Nadu', 50, placeY);

    // Right Side
    doc.setFont(undefined, 'bold');
    doc.text("Invoice No:", 130, y);
    doc.text("Invoice Date:", 130, y + 6);
    doc.setFont(undefined, 'normal');
    doc.text(`INV-${milestone.id}-${Date.now().toString().slice(-4)}`, 160, y);
    doc.text(milestone.invoiceDate ? new Date(milestone.invoiceDate).toLocaleDateString() : new Date().toLocaleDateString(), 160, y + 6);

    y = placeY + 5;
    doc.setDrawColor(200); doc.line(14, y, pageWidth - 14, y);
    y += 3;

    // ═══ ITEMS TABLE ═══
    autoTable(doc, {
        startY: y,
        head: [['Sno', 'Item & Description', 'HSN/SAC', 'Qty', `Rate (${currency})`, `Amount (${currency})`]],
        body: [[
            1,
            milestone.name || 'IT Consulting & Support Services',
            '998313',
            '1',
            baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }),
            baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })
        ]],
        theme: 'grid',
        headStyles: { fillColor: [91, 190, 184], textColor: 255, fontStyle: 'bold', fontSize: 8, halign: 'center' },
        styles: { halign: 'center', cellPadding: 3, fontSize: 8, lineColor: [200, 200, 200], lineWidth: 0.2 },
        columnStyles: {
            0: { halign: 'center', cellWidth: 12 },
            1: { halign: 'left', cellWidth: 65 },
            2: { halign: 'center', cellWidth: 22 },
            3: { halign: 'center', cellWidth: 15 },
            4: { halign: 'right', cellWidth: 35 },
            5: { halign: 'right', cellWidth: 35 }
        }
    });

    let finalY = doc.lastAutoTable.finalY + 5;
    const fmt = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2 });

    // ═══ TOTALS ═══
    let rightX = pageWidth - 75;
    doc.setFontSize(9); doc.setTextColor(0);
    doc.setFont(undefined, 'normal');
    doc.text("SubTotal:", rightX, finalY);
    doc.text(`${currency} ${fmt(baseAmount)}`, pageWidth - 14, finalY, { align: 'right' });

    if (isIntraState) {
        const halfRate = totalTaxRate / 2;
        const halfTax = totalTaxAmount / 2;
        finalY += 6;
        doc.text(`CGST @ ${halfRate}%:`, rightX, finalY);
        doc.text(`${currency} ${fmt(halfTax)}`, pageWidth - 14, finalY, { align: 'right' });
        finalY += 6;
        doc.text(`SGST @ ${halfRate}%:`, rightX, finalY);
        doc.text(`${currency} ${fmt(halfTax)}`, pageWidth - 14, finalY, { align: 'right' });
    } else {
        finalY += 6;
        doc.text(`IGST @ ${totalTaxRate}%:`, rightX, finalY);
        doc.text(`${currency} ${fmt(totalTaxAmount)}`, pageWidth - 14, finalY, { align: 'right' });
    }

    finalY += 4;
    doc.setDrawColor(91, 190, 184); doc.setLineWidth(0.5);
    doc.line(rightX - 2, finalY, pageWidth - 14, finalY);
    finalY += 7;

    // Grand Total Box
    doc.setFillColor(91, 190, 184);
    doc.rect(rightX - 4, finalY - 5, pageWidth - rightX + 4 - 10, 11, 'F');
    doc.setTextColor(255); doc.setFont(undefined, 'bold'); doc.setFontSize(10);
    doc.text("TOTAL:", rightX, finalY + 2);
    doc.text(`${currency} ${fmt(finalAmount)}`, pageWidth - 14, finalY + 2, { align: 'right' });

    // Total in Words
    finalY += 12;
    doc.setTextColor(0); doc.setFontSize(8); doc.setFont(undefined, 'bold');
    doc.text("Total in Words:", 14, finalY);
    doc.setFont(undefined, 'normal');
    const currLabel = currency === 'INR' ? 'Rupees' : currency === 'AED' ? 'Dirhams' : currency === 'USD' ? 'Dollars' : currency;
    doc.text(`${currLabel} ${numberToWords(finalAmount)}`, 14, finalY + 5);

    // ═══ COMPANY DETAILS FOOTER ═══
    finalY += 15;
    doc.setDrawColor(0, 84, 166); doc.setLineWidth(0.5);
    doc.line(14, finalY, pageWidth - 14, finalY);

    finalY += 6;
    doc.setFontSize(8); doc.setTextColor(0); doc.setFont(undefined, 'bold');
    doc.text("Ambot PAN:", 14, finalY);
    doc.setFont(undefined, 'normal');
    doc.text("AAYCA8731D", 42, finalY);

    finalY += 5;
    doc.setFont(undefined, 'bold');
    doc.text("CIN:", 14, finalY);
    doc.setFont(undefined, 'normal');
    doc.text("U72900TZ2021OPC038831", 27, finalY);

    // Bank Details
    finalY += 7;
    doc.setFont(undefined, 'bold'); doc.setFontSize(9);
    doc.text("Bank Details:", 14, finalY);
    doc.setFont(undefined, 'normal'); doc.setFontSize(8);
    finalY += 5;
    doc.text("Bank Name: HDFC BANK LTD", 14, finalY);
    doc.text("IFSC Code: HDFC0000031", 120, finalY);
    finalY += 4;
    doc.text("Account Name: AMBOT365 RPA AND IT SOLUTIONS OPC P LTD", 14, finalY);
    doc.text("Branch code: 000031", 120, finalY);
    finalY += 4;
    doc.text("Account Number: 50200084112410", 14, finalY);
    doc.text("MICR: 641240002", 120, finalY);

    // Authorized Signatory
    doc.setFont(undefined, 'normal'); doc.setFontSize(8);
    doc.text("For AMBOT365 RPA & IT SOLUTIONS", pageWidth - 14, finalY - 8, { align: 'right' });
    doc.text("(Authorized Signatory)", pageWidth - 14, finalY + 2, { align: 'right' });

    // ═══ NOTE & HSN/SAC ═══
    finalY += 10;
    doc.setDrawColor(200); doc.setLineWidth(0.3);
    doc.line(14, finalY, pageWidth - 14, finalY);
    finalY += 5;
    doc.setFont(undefined, 'bold'); doc.setFontSize(8); doc.setTextColor(0);
    doc.text("NOTE:", 14, finalY);
    finalY += 5;
    doc.text("HSN/SAC:", 14, finalY);
    finalY += 5;
    doc.setFillColor(91, 190, 184);
    doc.rect(14, finalY - 3, pageWidth - 28, 7, 'F');
    doc.setTextColor(255); doc.setFont(undefined, 'bold');
    doc.text("998313  Information technology consulting and support services", pageWidth / 2, finalY + 1, { align: 'center' });

    // ═══ BOTTOM FOOTER ═══
    let bottomY = pageHeight - 10;
    doc.setDrawColor(0, 84, 166); doc.setLineWidth(0.5);
    doc.line(14, bottomY - 6, pageWidth - 14, bottomY - 6);
    doc.setDrawColor(140, 198, 63); doc.setLineWidth(0.5);
    doc.line(14, bottomY - 5, pageWidth - 14, bottomY - 5);
    doc.setFontSize(7); doc.setTextColor(80); doc.setFont(undefined, 'normal');
    doc.text("AMBOT365 RPA & IT SOLUTIONS (OPC) PVT.LTD", pageWidth / 2, bottomY, { align: 'center' });
    doc.text("BLOCK A , DOOR NO 105, MOTHERS VILLAGE , NESAVALAR COLONY ROAD, ONDIPUDUR , COIMBATORE 641016,TAMILNADU", pageWidth / 2, bottomY + 4, { align: 'center' });

    doc.save(`Invoice_${milestone.id}_${(milestone.name || 'milestone').replace(/[^a-z0-9]/gi, '_')}.pdf`);
};

// ── Invoice Format 2: Payment to Investor ──
const generateInvestorPaymentPDF = (milestone, details, taxes) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const currency = details.currency || 'INR';
    const baseAmount = (details.dealValue * (parseFloat(milestone.percentage) || 0)) / 100;

    // TDS Calculation (Section 194J — Professional/Technical Services @ 10%)
    const tdsRate = 10;
    const tdsAmount = (baseAmount * tdsRate) / 100;
    const netPay = baseAmount - tdsAmount;

    // ═══ HEADER ═══
    addPDFHeader(doc, "PAYMENT TO INVESTOR", details);

    let y = 72;

    // ═══ COMPANY INFO ═══
    doc.setFontSize(9); doc.setTextColor(0); doc.setFont(undefined, 'bold');
    doc.text("AMBOT365 RPA & IT SOLUTIONS (OPC) PVT.LTD", 14, y);
    doc.setFont(undefined, 'normal'); doc.setFontSize(8); doc.setTextColor(60);
    doc.text("BLOCK A, DOOR NO 105, MOTHERS VILLAGE, NESAVALAR COLONY ROAD, ONDIPUDUR, Coimbatore-641016, Tamil Nadu", 14, y + 4);
    doc.text("GSTIN: 33AAYCA8731D1ZH  |  CIN: U72900TZ2021OPC038831", 14, y + 8);

    y += 14;
    doc.setDrawColor(200); doc.setLineWidth(0.3);
    doc.line(14, y, pageWidth - 14, y);
    y += 5;

    // ═══ PAY TO & VOUCHER INFO ═══
    doc.setFontSize(9); doc.setTextColor(0); doc.setFont(undefined, 'bold');
    doc.text("PAY TO:", 14, y);
    doc.setFont(undefined, 'normal');
    doc.text(details.clientName || "Investor / Lead", 14, y + 5);
    if (details.clientAddress) doc.text(details.clientAddress, 14, y + 9);
    if (details.clientGstin) {
        doc.setFont(undefined, 'bold');
        doc.text(`PAN/GSTIN: ${details.clientGstin}`, 14, y + (details.clientAddress ? 13 : 9));
        doc.setFont(undefined, 'normal');
    }

    const placeY = y + (details.clientAddress ? 17 : 13);
    doc.setFont(undefined, 'bold');
    doc.text("Place of Supply:", 14, placeY);
    doc.setFont(undefined, 'normal');
    doc.text(details.location || 'Tamil Nadu', 50, placeY);

    // Right Side: Voucher Info
    doc.setFont(undefined, 'bold');
    doc.text("Voucher No:", 130, y);
    doc.text("Date:", 130, y + 6);
    doc.text("Payment For:", 130, y + 12);
    doc.setFont(undefined, 'normal');
    doc.text(`PV-${milestone.id}-${Date.now().toString().slice(-4)}`, 160, y);
    doc.text(milestone.invoiceDate ? new Date(milestone.invoiceDate).toLocaleDateString() : new Date().toLocaleDateString(), 160, y + 6);
    doc.text(milestone.name || 'Milestone', 160, y + 12);

    y = placeY + 5;
    doc.setDrawColor(200); doc.line(14, y, pageWidth - 14, y);
    y += 3;

    // ═══ ITEMS TABLE ═══
    autoTable(doc, {
        startY: y,
        head: [['Sno', 'Description', 'Share %', `Gross Amt (${currency})`, `TDS @ ${tdsRate}%`, `Net Pay (${currency})`]],
        body: [[
            1,
            `${milestone.name || 'Investor Payout'} — Revenue Share Disbursement`,
            `${milestone.percentage}%`,
            baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }),
            tdsAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }),
            netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })
        ]],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold', fontSize: 8, halign: 'center' },
        styles: { halign: 'center', cellPadding: 3, fontSize: 8, lineColor: [200, 200, 200], lineWidth: 0.2 },
        columnStyles: {
            0: { halign: 'center', cellWidth: 12 },
            1: { halign: 'left', cellWidth: 65 },
            2: { halign: 'center', cellWidth: 18 },
            3: { halign: 'right', cellWidth: 30 },
            4: { halign: 'right', cellWidth: 28 },
            5: { halign: 'right', cellWidth: 30 }
        }
    });

    let finalY = doc.lastAutoTable.finalY + 5;
    const fmt = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2 });

    // ═══ TOTALS ═══
    let rightX = pageWidth - 75;
    doc.setFontSize(9); doc.setTextColor(0);
    doc.setFont(undefined, 'normal');
    doc.text("Gross Payout:", rightX, finalY);
    doc.text(`${currency} ${fmt(baseAmount)}`, pageWidth - 14, finalY, { align: 'right' });

    finalY += 6;
    doc.text(`Less: TDS u/s 194J @ ${tdsRate}%:`, rightX, finalY);
    doc.text(`- ${currency} ${fmt(tdsAmount)}`, pageWidth - 14, finalY, { align: 'right' });

    finalY += 4;
    doc.setDrawColor(41, 128, 185); doc.setLineWidth(0.5);
    doc.line(rightX - 2, finalY, pageWidth - 14, finalY);
    finalY += 7;

    // Net Pay Box (Green)
    doc.setFillColor(39, 174, 96);
    doc.rect(rightX - 4, finalY - 5, pageWidth - rightX + 4 - 10, 11, 'F');
    doc.setTextColor(255); doc.setFont(undefined, 'bold'); doc.setFontSize(10);
    doc.text("NET PAY:", rightX, finalY + 2);
    doc.text(`${currency} ${fmt(netPay)}`, pageWidth - 14, finalY + 2, { align: 'right' });

    // Total in Words
    finalY += 12;
    doc.setTextColor(0); doc.setFontSize(8); doc.setFont(undefined, 'bold');
    doc.text("Net Pay in Words:", 14, finalY);
    doc.setFont(undefined, 'normal');
    const currLabel = currency === 'INR' ? 'Rupees' : currency === 'AED' ? 'Dirhams' : currency === 'USD' ? 'Dollars' : currency;
    doc.text(`${currLabel} ${numberToWords(netPay)}`, 14, finalY + 5);

    // ═══ COMPANY DETAILS FOOTER ═══
    finalY += 15;
    doc.setDrawColor(0, 84, 166); doc.setLineWidth(0.5);
    doc.line(14, finalY, pageWidth - 14, finalY);

    finalY += 6;
    doc.setFontSize(8); doc.setTextColor(0); doc.setFont(undefined, 'bold');
    doc.text("Ambot PAN:", 14, finalY);
    doc.setFont(undefined, 'normal');
    doc.text("AAYCA8731D", 42, finalY);

    finalY += 5;
    doc.setFont(undefined, 'bold');
    doc.text("CIN:", 14, finalY);
    doc.setFont(undefined, 'normal');
    doc.text("U72900TZ2021OPC038831", 27, finalY);

    // Bank Details
    finalY += 7;
    doc.setFont(undefined, 'bold'); doc.setFontSize(9);
    doc.text("Bank Details:", 14, finalY);
    doc.setFont(undefined, 'normal'); doc.setFontSize(8);
    finalY += 5;
    doc.text("Bank Name: HDFC BANK LTD", 14, finalY);
    doc.text("IFSC Code: HDFC0000031", 120, finalY);
    finalY += 4;
    doc.text("Account Name: AMBOT365 RPA AND IT SOLUTIONS OPC P LTD", 14, finalY);
    doc.text("Branch code: 000031", 120, finalY);
    finalY += 4;
    doc.text("Account Number: 50200084112410", 14, finalY);
    doc.text("MICR: 641240002", 120, finalY);

    // Authorized Signatory
    doc.setFont(undefined, 'normal'); doc.setFontSize(8);
    doc.text("For AMBOT365 RPA & IT SOLUTIONS", pageWidth - 14, finalY - 8, { align: 'right' });
    doc.text("(Authorized Signatory)", pageWidth - 14, finalY + 2, { align: 'right' });

    // ═══ NOTE ═══
    finalY += 10;
    doc.setDrawColor(200); doc.setLineWidth(0.3);
    doc.line(14, finalY, pageWidth - 14, finalY);
    finalY += 5;
    doc.setFont(undefined, 'bold'); doc.setFontSize(8); doc.setTextColor(0);
    doc.text("NOTE:", 14, finalY);
    doc.setFont(undefined, 'normal');
    finalY += 5;
    doc.text("TDS deducted under Section 194J of the Income Tax Act, 1961.", 14, finalY);
    finalY += 5;
    doc.text("This is a revenue share disbursement, not a supply of goods/services. GST is not applicable.", 14, finalY);

    // ═══ BOTTOM FOOTER ═══
    let bottomY = pageHeight - 10;
    doc.setDrawColor(0, 84, 166); doc.setLineWidth(0.5);
    doc.line(14, bottomY - 6, pageWidth - 14, bottomY - 6);
    doc.setDrawColor(140, 198, 63); doc.setLineWidth(0.5);
    doc.line(14, bottomY - 5, pageWidth - 14, bottomY - 5);
    doc.setFontSize(7); doc.setTextColor(80); doc.setFont(undefined, 'normal');
    doc.text("AMBOT365 RPA & IT SOLUTIONS (OPC) PVT.LTD", pageWidth / 2, bottomY, { align: 'center' });
    doc.text("BLOCK A , DOOR NO 105, MOTHERS VILLAGE , NESAVALAR COLONY ROAD, ONDIPUDUR , COIMBATORE 641016,TAMILNADU", pageWidth / 2, bottomY + 4, { align: 'center' });

    doc.save(`Investor_Payment_${milestone.id}_${(milestone.name || 'milestone').replace(/[^a-z0-9]/gi, '_')}.pdf`);
};

// ── Number to Words Helper ──
const numberToWords = (num) => {
    if (num === 0) return 'Zero';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertLessThanThousand = (n) => {
        if (n === 0) return '';
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertLessThanThousand(n % 100) : '');
    };

    const absNum = Math.abs(Math.round(num * 100) / 100);
    const intPart = Math.floor(absNum);
    const decPart = Math.round((absNum - intPart) * 100);

    // Indian numbering: Crore, Lakh, Thousand, Hundred
    let result = '';
    if (intPart >= 10000000) {
        result += convertLessThanThousand(Math.floor(intPart / 10000000)) + ' Crore ';
        const rem = intPart % 10000000;
        if (rem >= 100000) result += convertLessThanThousand(Math.floor(rem / 100000)) + ' Lakh ';
        const rem2 = rem % 100000;
        if (rem2 >= 1000) result += convertLessThanThousand(Math.floor(rem2 / 1000)) + ' Thousand ';
        const rem3 = rem2 % 1000;
        if (rem3 > 0) result += convertLessThanThousand(rem3);
    } else if (intPart >= 100000) {
        result += convertLessThanThousand(Math.floor(intPart / 100000)) + ' Lakh ';
        const rem = intPart % 100000;
        if (rem >= 1000) result += convertLessThanThousand(Math.floor(rem / 1000)) + ' Thousand ';
        const rem2 = rem % 1000;
        if (rem2 > 0) result += convertLessThanThousand(rem2);
    } else if (intPart >= 1000) {
        result += convertLessThanThousand(Math.floor(intPart / 1000)) + ' Thousand ';
        const rem = intPart % 1000;
        if (rem > 0) result += convertLessThanThousand(rem);
    } else {
        result = convertLessThanThousand(intPart);
    }

    result = result.trim();
    if (decPart > 0) {
        result += ' and ' + convertLessThanThousand(decPart) + ' Paise';
    }
    return result + ' Only';
};

// ── Invoice Format 3: Tax Invoice (with all mandatory fields) ──
const generateTaxInvoicePDF = (milestone, details, taxes) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const currency = details.currency || 'INR';
    const baseAmount = (details.dealValue * (parseFloat(milestone.percentage) || 0)) / 100;

    const chargesList = Array.isArray(taxes) && taxes.length > 0 ? taxes : [{ name: 'GST', percentage: 18, taxType: 'Standard' }];
    const isIntraState = chargesList.some(t => t.taxType === 'Intra-State (CGST + SGST)');
    const totalTaxRate = chargesList.reduce((sum, c) => sum + (parseFloat(c.percentage) || 0), 0);
    const totalTaxAmount = (baseAmount * totalTaxRate) / 100;
    const finalAmount = baseAmount + totalTaxAmount;

    // ═══ HEADER: Company Details ═══
    addPDFHeader(doc, "TAX INVOICE", details);

    let y = 72;

    // ═══ COMPANY INFO (Top Left) ═══
    doc.setFontSize(9); doc.setTextColor(0); doc.setFont(undefined, 'bold');
    doc.text("AMBOT365 RPA & IT SOLUTIONS (OPC) PVT.LTD", 14, y);
    doc.setFont(undefined, 'normal'); doc.setFontSize(8); doc.setTextColor(60);
    doc.text("BLOCK A, DOOR NO 105, MOTHERS VILLAGE,", 14, y + 4);
    doc.text("NESAVALAR COLONY ROAD, ONDIPUDUR, Coimbatore-641016, Tamil Nadu", 14, y + 8);
    doc.text("GSTIN: 33AAYCA8731D1ZH", 14, y + 12);
    doc.text("CIN: U72900TZ2021OPC038831", 14, y + 16);

    y += 22;

    // ═══ BILL TO (Left) & INVOICE INFO (Right) ═══
    doc.setDrawColor(200); doc.setLineWidth(0.3);
    doc.line(14, y, pageWidth - 14, y);
    y += 5;

    // Bill To
    doc.setFontSize(9); doc.setTextColor(0); doc.setFont(undefined, 'bold');
    doc.text("BILL TO:", 14, y);
    doc.setFont(undefined, 'normal'); doc.setFontSize(9);
    doc.text(details.clientName || "Client Name", 14, y + 5);
    if (details.clientAddress) doc.text(details.clientAddress, 14, y + 9);
    if (details.clientGstin) {
        doc.setFont(undefined, 'bold');
        doc.text(`GSTIN: ${details.clientGstin}`, 14, y + (details.clientAddress ? 13 : 9));
        doc.setFont(undefined, 'normal');
    }

    // Place of Supply
    const placeY = y + (details.clientAddress ? 17 : 13);
    doc.setFont(undefined, 'bold');
    doc.text("Place of Supply:", 14, placeY);
    doc.setFont(undefined, 'normal');
    doc.text(details.location || 'Tamil Nadu', 50, placeY);

    // Right Side: Invoice Details
    doc.setFont(undefined, 'bold');
    doc.text("Invoice No:", 130, y);
    doc.text("Invoice Date:", 130, y + 6);
    doc.setFont(undefined, 'normal');
    doc.text(`TAX-INV-${milestone.id}-${Date.now().toString().slice(-4)}`, 160, y);
    doc.text(milestone.invoiceDate ? new Date(milestone.invoiceDate).toLocaleDateString() : new Date().toLocaleDateString(), 160, y + 6);

    y = placeY + 5;
    doc.setDrawColor(200); doc.line(14, y, pageWidth - 14, y);
    y += 3;

    // ═══ ITEMS TABLE (Sno, Item & Description, HSN/SAC, Qty, Rate, Amount) ═══
    autoTable(doc, {
        startY: y,
        head: [['Sno', 'Item & Description', 'HSN/SAC', 'Qty', `Rate (${currency})`, `Amount (${currency})`]],
        body: [[
            1,
            milestone.name || 'IT Consulting & Support Services',
            '998313',
            '1',
            baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }),
            baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })
        ]],
        theme: 'grid',
        headStyles: {
            fillColor: [0, 84, 166],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 8,
            halign: 'center'
        },
        styles: {
            halign: 'center',
            cellPadding: 3,
            fontSize: 8,
            lineColor: [200, 200, 200],
            lineWidth: 0.2
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 12 },
            1: { halign: 'left', cellWidth: 65 },
            2: { halign: 'center', cellWidth: 22 },
            3: { halign: 'center', cellWidth: 15 },
            4: { halign: 'right', cellWidth: 35 },
            5: { halign: 'right', cellWidth: 35 }
        }
    });

    let finalY = doc.lastAutoTable.finalY + 5;

    // ═══ TOTALS SECTION (Right Side) ═══
    let rightX = pageWidth - 75;
    const fmt = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2 });

    doc.setFontSize(9); doc.setTextColor(0);

    // SubTotal
    doc.setFont(undefined, 'normal');
    doc.text("SubTotal:", rightX, finalY);
    doc.text(`${currency} ${fmt(baseAmount)}`, pageWidth - 14, finalY, { align: 'right' });

    // Tax breakdown
    if (isIntraState) {
        const halfRate = totalTaxRate / 2;
        const halfTax = totalTaxAmount / 2;

        finalY += 6;
        doc.text(`CGST @ ${halfRate}%:`, rightX, finalY);
        doc.text(`${currency} ${fmt(halfTax)}`, pageWidth - 14, finalY, { align: 'right' });

        finalY += 6;
        doc.text(`SGST @ ${halfRate}%:`, rightX, finalY);
        doc.text(`${currency} ${fmt(halfTax)}`, pageWidth - 14, finalY, { align: 'right' });
    } else {
        finalY += 6;
        doc.text(`IGST @ ${totalTaxRate}%:`, rightX, finalY);
        doc.text(`${currency} ${fmt(totalTaxAmount)}`, pageWidth - 14, finalY, { align: 'right' });
    }

    // Divider
    finalY += 4;
    doc.setDrawColor(0, 84, 166); doc.setLineWidth(0.5);
    doc.line(rightX - 2, finalY, pageWidth - 14, finalY);
    finalY += 7;

    // TOTAL RS (Grand Total Box)
    doc.setFillColor(0, 84, 166);
    doc.rect(rightX - 4, finalY - 5, pageWidth - rightX + 4 - 10, 11, 'F');
    doc.setTextColor(255); doc.setFont(undefined, 'bold'); doc.setFontSize(10);
    doc.text("TOTAL:", rightX, finalY + 2);
    doc.text(`${currency} ${fmt(finalAmount)}`, pageWidth - 14, finalY + 2, { align: 'right' });

    // TOTAL IN WORDS
    finalY += 12;
    doc.setTextColor(0); doc.setFontSize(8); doc.setFont(undefined, 'bold');
    doc.text("Total in Words:", 14, finalY);
    doc.setFont(undefined, 'normal');
    const currLabel = currency === 'INR' ? 'Rupees' : currency === 'AED' ? 'Dirhams' : currency === 'USD' ? 'Dollars' : currency;
    doc.text(`${currLabel} ${numberToWords(finalAmount)}`, 14, finalY + 5);

    // ═══ COMPANY DETAILS FOOTER ═══
    finalY += 15;
    doc.setDrawColor(0, 84, 166); doc.setLineWidth(0.5);
    doc.line(14, finalY, pageWidth - 14, finalY);

    finalY += 6;
    doc.setFontSize(8); doc.setTextColor(0); doc.setFont(undefined, 'bold');
    doc.text("Ambot PAN:", 14, finalY);
    doc.setFont(undefined, 'normal');
    doc.text("AAYCA8731D", 42, finalY);

    finalY += 5;
    doc.setFont(undefined, 'bold');
    doc.text("CIN:", 14, finalY);
    doc.setFont(undefined, 'normal');
    doc.text("U72900TZ2021OPC038831", 27, finalY);

    // Bank Details
    finalY += 7;
    doc.setFont(undefined, 'bold'); doc.setFontSize(9);
    doc.text("Bank Details:", 14, finalY);
    doc.setFont(undefined, 'normal'); doc.setFontSize(8);

    finalY += 5;
    doc.text("Bank Name: HDFC BANK LTD", 14, finalY);
    doc.text("IFSC Code: HDFC0000031", 120, finalY);
    finalY += 4;
    doc.text("Account Name: AMBOT365 RPA AND IT SOLUTIONS OPC P LTD", 14, finalY);
    doc.text("Branch code: 000031", 120, finalY);
    finalY += 4;
    doc.text("Account Number: 50200084112410", 14, finalY);
    doc.text("MICR: 641240002", 120, finalY);

    // Authorized Signatory (Right Side)
    doc.setFont(undefined, 'normal'); doc.setFontSize(8);
    doc.text("For AMBOT365 RPA & IT SOLUTIONS", pageWidth - 14, finalY - 8, { align: 'right' });
    doc.text("(Authorized Signatory)", pageWidth - 14, finalY + 2, { align: 'right' });

    // ═══ NOTE & HSN/SAC SECTION ═══
    finalY += 10;
    doc.setDrawColor(200); doc.setLineWidth(0.3);
    doc.line(14, finalY, pageWidth - 14, finalY);

    finalY += 5;
    doc.setFont(undefined, 'bold'); doc.setFontSize(8); doc.setTextColor(0);
    doc.text("NOTE:", 14, finalY);
    doc.setFont(undefined, 'normal');

    finalY += 5;
    doc.setFont(undefined, 'bold');
    doc.text("HSN/SAC:", 14, finalY);
    doc.setFont(undefined, 'normal');

    finalY += 5;
    doc.setFillColor(0, 84, 166);
    doc.rect(14, finalY - 3, pageWidth - 28, 7, 'F');
    doc.setTextColor(255); doc.setFontSize(8); doc.setFont(undefined, 'bold');
    doc.text("998313  Information technology consulting and support services", pageWidth / 2, finalY + 1, { align: 'center' });

    // ═══ BOTTOM FOOTER ═══
    let bottomY = pageHeight - 10;
    doc.setDrawColor(0, 84, 166); doc.setLineWidth(0.5);
    doc.line(14, bottomY - 6, pageWidth - 14, bottomY - 6);
    doc.setDrawColor(140, 198, 63); doc.setLineWidth(0.5);
    doc.line(14, bottomY - 5, pageWidth - 14, bottomY - 5);
    doc.setFontSize(7); doc.setTextColor(80); doc.setFont(undefined, 'normal');
    doc.text("AMBOT365 RPA & IT SOLUTIONS (OPC) PVT.LTD", pageWidth / 2, bottomY, { align: 'center' });
    doc.text("BLOCK A , DOOR NO 105, MOTHERS VILLAGE , NESAVALAR COLONY ROAD, ONDIPUDUR , COIMBATORE 641016,TAMILNADU", pageWidth / 2, bottomY + 4, { align: 'center' });

    doc.save(`Tax_Invoice_${milestone.id}_${(milestone.name || 'milestone').replace(/[^a-z0-9]/gi, '_')}.pdf`);
};

const generateProjectReportPDF = (details, stakeholders, milestones, taxes) => {
    const doc = new jsPDF();
    const currency = details.currency || 'AED';
    const totalDistributed = stakeholders.reduce((sum, s) => sum + (details.dealValue * s.percentage) / 100, 0);
    const netProfit = details.dealValue - totalDistributed;
    const chargesList = Array.isArray(taxes) ? taxes : (taxes.gst ? [{ name: 'GST', percentage: taxes.gst }] : []);

    const totalChargesString = chargesList.map(c => {
        if (c.taxType === 'Intra-State (CGST + SGST)') return `CGST ${(c.percentage / 2)}% + SGST ${(c.percentage / 2)}%`;
        return `${c.name || c.taxType}: ${c.percentage}%`;
    }).join(', ');

    // Use Helper
    addPDFHeader(doc, "PROJECT FINANCIAL REPORT", details);

    // Context Info
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 85);
    doc.text(`Project ID: ${details.projectId}`, 14, 90);

    doc.setFontSize(14); doc.setTextColor(0); doc.text("Executive Summary", 14, 105);

    const summaryData = [
        ["Deal Value", `${currency} ${details.dealValue.toLocaleString()}`],
        ["Total Distributed", `${currency} ${totalDistributed.toLocaleString()}`],
        ["Net Profit (Projected)", `${currency} ${netProfit.toLocaleString()}`],
        ["Tax Configuration", totalChargesString || "None"]
    ];

    autoTable(doc, {
        startY: 110,
        body: summaryData,
        theme: 'plain',
        styles: { fontSize: 11, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', width: 80 } }
    });

    let finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14); doc.text("Stakeholder Distribution", 14, finalY);

    const stakeholderBody = stakeholders.map(s => [
        s.name, `${s.percentage}%`, `${currency} ${(details.dealValue * s.percentage / 100).toLocaleString()}`
    ]);

    autoTable(doc, {
        startY: finalY + 5,
        head: [['Name / Role', 'Share %', 'Amount']],
        body: stakeholderBody,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }
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

    // Footer Signatures
    const footerY = doc.internal.pageSize.height - 30;
    doc.setFontSize(10);
    doc.text("For AMBOT365 RPA & IT SOLUTIONS", 195, footerY, { align: 'right' });
    doc.text("(Authorized Signatory)", 195, footerY + 20, { align: 'right' });

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

const Dashboard = ({ projects, onOpenProject, onCreateProject, onStatusChange }) => {
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

    // Currency Conversion
    const [dashboardCurrency, setDashboardCurrency] = useState('AED');
    const [exchangeRates, setExchangeRates] = useState({
        'AED': 1,
        'USD': 0.2722, // Fallback
        'INR': 22.6    // Fallback
    });

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await fetch('https://api.exchangerate-api.com/v4/latest/AED');
                if (!response.ok) throw new Error('Failed to fetch rates');
                const data = await response.json();
                setExchangeRates(prev => ({ ...prev, ...data.rates }));
            } catch (error) {
                console.error('Error fetching exchange rates:', error);
            }
        };
        fetchRates();
    }, []);

    const convertToAED = (amount, currency) => {
        const rate = exchangeRates[currency];
        if (!rate) return amount;
        return amount / rate;
    };

    const convertFromAED = (amountInAED, targetCurrency) => {
        const rate = exchangeRates[targetCurrency] || 1;
        return amountInAED * rate;
    };

    const convertCurrency = (amount, fromCurrency, toCurrency) => {
        if (!amount) return 0;
        if (fromCurrency === toCurrency) return amount;

        // 1. Normalize to Base (AED)
        const inAED = fromCurrency === 'AED' ? amount : convertToAED(amount, fromCurrency);

        // 2. Convert to Target
        return toCurrency === 'AED' ? inAED : convertFromAED(inAED, toCurrency);
    };

    // Filter Logic
    const filteredProjects = projects.filter(p => {
        if (filter === 'All') return true;
        const pDate = new Date(p.dateCreated);
        const now = new Date();
        if (filter === 'Yearly') return pDate.getFullYear() === now.getFullYear();
        if (filter === 'Monthly') return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
        if (filter === 'Weekly') {
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(now.getDate() - 7);
            return pDate >= sevenDaysAgo && pDate <= now;
        }
        return true;
    });

    // KPI Calcs (Converted)
    const totalRevenue = filteredProjects.reduce((sum, p) => sum + convertCurrency((parseFloat(p.dealValue) || 0), p.currency, dashboardCurrency), 0);
    const activeProjects = filteredProjects.filter(p => !p.isArchived).length;

    // Splits (Calculated per stakeholder and converted)
    const totalSplits = filteredProjects.reduce((sum, p) => {
        const projectSplits = p.stakeholders.reduce((sSum, s) => sSum + ((parseFloat(p.dealValue) || 0) * s.percentage) / 100, 0);
        return sum + convertCurrency(projectSplits, p.currency, dashboardCurrency);
    }, 0);

    // Collected (Calculated per milestone and converted)
    const totalCollected = filteredProjects.reduce((sum, p) => {
        const projectCollected = p.milestones.reduce((mSum, m) => m.status === 'Paid' ? mSum + ((p.dealValue * m.percentage) / 100) : mSum, 0);
        return sum + convertCurrency(projectCollected, p.currency, dashboardCurrency);
    }, 0);

    // Tax (Calculated per project and converted)
    const totalTax = filteredProjects.reduce((sum, p) => {
        const tRate = p.charges ? p.charges.reduce((cSum, c) => cSum + (parseFloat(c.percentage) || 0), 0) : 0;
        const projectTax = (parseFloat(p.dealValue) || 0) * tRate / 100;
        return sum + convertCurrency(projectTax, p.currency, dashboardCurrency);
    }, 0);

    const chartData = filteredProjects.map(p => {
        // Safe helpers
        const dVal = parseFloat(p.dealValue) || 0;
        const convertedDVal = convertCurrency(dVal, p.currency, dashboardCurrency);
        const totalTaxRate = p.charges ? p.charges.reduce((sum, c) => sum + (parseFloat(c.percentage) || 0), 0) : 0;

        let val = 0;
        if (chartMetric === 'Revenue') val = convertedDVal;
        else if (chartMetric === 'Splits') val = p.stakeholders.reduce((sSum, s) => sSum + ((convertedDVal * s.percentage) / 100), 0);
        else if (chartMetric === 'Collected') val = p.milestones.reduce((mSum, m) => m.status === 'Paid' ? mSum + ((convertedDVal * m.percentage) / 100) : mSum, 0);
        else if (chartMetric === 'Tax') val = (convertedDVal * totalTaxRate) / 100;

        return {
            name: p.projectId,
            value: val
        };
    });

    const statusData = [{ name: 'Active', value: activeProjects }, { name: 'Completed', value: filteredProjects.length - activeProjects }];
    const COLORS = ['#0d6efd', '#198754', '#ffc107', '#dc3545'];

    return (
        <div className="container-fluid px-5 py-4">
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-5 gap-3">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Project Dashboard</h2>
                    <p className="text-muted m-0">Overview of all financial projects</p>
                </div>
                <div className="d-flex flex-wrap gap-2 align-items-center">
                    {/* Date Filter Dropdown */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #dee2e6', borderRadius: '8px', padding: '6px 14px', height: '38px', whiteSpace: 'nowrap' }}>
                        <Filter size={16} style={{ color: '#6c757d', flexShrink: 0 }} />
                        <select
                            style={{ border: 'none', background: 'transparent', fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer', outline: 'none', appearance: 'auto', color: '#212529', paddingRight: '4px' }}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="All">All Time</option>
                            <option value="Yearly">This Year</option>
                            <option value="Monthly">This Month</option>
                            <option value="Weekly">This Week</option>
                        </select>
                    </div>

                    {/* Currency Dropdown */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', background: '#fff', border: '1px solid #dee2e6', borderRadius: '8px', padding: '6px 14px', height: '38px', whiteSpace: 'nowrap' }}>
                        <select
                            style={{ border: 'none', background: 'transparent', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', outline: 'none', appearance: 'auto', color: '#212529', paddingRight: '4px' }}
                            value={dashboardCurrency}
                            onChange={(e) => setDashboardCurrency(e.target.value)}
                        >
                            <option value="AED">AED</option>
                            <option value="USD">USD</option>
                            <option value="INR">INR</option>
                        </select>
                    </div>

                    <button className="btn btn-primary" onClick={onCreateProject} style={{ whiteSpace: 'nowrap' }}><Plus size={18} /> New Project</button>
                    <button className="btn btn-outline-success" onClick={() => exportDashboardExcel(filteredProjects, filter)} style={{ whiteSpace: 'nowrap' }}><FileDown size={16} /> Export</button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="row mb-5">
                <div className="dashboard-card col-md-3">
                    <div className="dashboard-card-body">
                        <div className="d-flex justify-content-between mb-3">
                            <div><p className="text-muted small mb-1">Total Revenue</p><h3 className="text-dark fw-bold m-0">{dashboardCurrency} {totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3></div>
                            <div className="p-2 bg-success bg-opacity-10 rounded"><DollarSign className="text-success" size={24} /></div>
                        </div>
                    </div>
                </div>
                {/* Total Tax Card */}
                <div className="dashboard-card col-md-3">
                    <div className="dashboard-card-body">
                        <div className="d-flex justify-content-between mb-3">
                            <div><p className="text-muted small mb-1">Project Tax</p><h3 className="text-dark fw-bold m-0">{dashboardCurrency} {totalTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3></div>
                            <div className="p-2 bg-warning bg-opacity-10 rounded"><Building className="text-warning" size={24} /></div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card col-md-3">
                    <div className="dashboard-card-body">
                        <div className="d-flex justify-content-between mb-3">
                            <div><p className="text-muted small mb-1">Total Splits</p><h3 className="text-dark fw-bold m-0">{dashboardCurrency} {totalSplits.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3></div>
                            <div className="p-2 bg-danger bg-opacity-10 rounded"><Users className="text-danger" size={24} /></div>
                        </div>
                    </div>
                </div>
                <div className="dashboard-card col-md-3">
                    <div className="dashboard-card-body">
                        <div className="d-flex justify-content-between mb-3">
                            <div><p className="text-muted small mb-1">Total Collected</p><h3 className="text-dark fw-bold m-0">{dashboardCurrency} {totalCollected.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3></div>
                            <div className="p-2 bg-primary bg-opacity-10 rounded"><Wallet className="text-primary" size={24} /></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="row mb-5">
                <div className="col-md-8 mb-4">
                    <div className="dashboard-card">
                        <div className="dashboard-card-header d-flex justify-content-between align-items-center">
                            <h5 className="text-dark m-0">{chartMetric} by Project</h5>
                            <select
                                className="form-select form-select-sm"
                                style={{ width: 'auto', border: '1px solid #ced4da' }}
                                value={chartMetric}
                                onChange={(e) => setChartMetric(e.target.value)}
                            >
                                <option value="Revenue">Deal Value</option>
                                <option value="Tax">Tax</option>
                                <option value="Splits">Split</option>
                                <option value="Collected">Collected</option>
                            </select>
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
                                <th>Project Name</th><th>Client</th><th>Deal Value</th><th>Tax Paid</th><th>Collected</th><th>Status</th><th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProjects.map(project => {
                                const collected = project.milestones.reduce((sum, m) => m.status === 'Paid' ? sum + ((project.dealValue * m.percentage) / 100) : sum, 0);
                                const totalTaxRate = project.charges ? project.charges.reduce((cSum, c) => cSum + (parseFloat(c.percentage) || 0), 0) : 0;
                                const taxPaid = project.milestones.reduce((sum, m) => m.status === 'Paid' ? sum + (((project.dealValue * m.percentage) / 100) * totalTaxRate / 100) : sum, 0);

                                return (
                                    <tr key={project.id} onClick={() => onOpenProject(project.id)}>
                                        <td><div className="fw-bold text-dark">{project.projectId}</div></td>
                                        <td>{project.clientName}</td>
                                        <td className="font-monospace text-dark fw-bold">{project.currency} {parseFloat(project.dealValue).toLocaleString()}</td>
                                        <td className="font-monospace text-muted">{project.currency} {taxPaid.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                                        <td className="font-monospace text-warning">{project.currency} {collected.toLocaleString()}</td>
                                        <td>
                                            <select
                                                className="form-select form-select-sm"
                                                style={{ width: 'auto', minWidth: '110px', cursor: 'pointer', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '0.85rem' }}
                                                value={project.status || 'Active'}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    onStatusChange(project.id, e.target.value);
                                                }}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Completed">Completed</option>
                                                <option value="On Hold">Hold</option>
                                                <option value="Archived">Archived</option>
                                            </select>
                                        </td>
                                        <td><button className="btn btn-sm btn-outline-primary rounded-circle"><ArrowRight size={14} /></button></td>
                                    </tr>
                                );
                            })}
                            {filteredProjects.length === 0 && <tr><td colSpan="7" className="text-center py-4 text-muted">No projects found.</td></tr>}
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
                <label className="stage-label">Client Address</label>
                <input className="stage-input" value={details.clientAddress || ''} onChange={(e) => updateDetails('clientAddress', e.target.value)} placeholder="Client billing address" />
                <label className="stage-label">Client GSTIN</label>
                <input className="stage-input" value={details.clientGstin || ''} onChange={(e) => updateDetails('clientGstin', e.target.value)} placeholder="e.g. 29ABCDE1234F1Z5" />
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

const STAKEHOLDERS_CONSTANTS = {
    COUNTRIES: ['India', 'Other'],
    INDIAN_STATES: [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
        'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
        'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
        'Lakshadweep', 'Puducherry'
    ]
};

const StageTwoCombined = ({ stakeholders, addStakeholder, removeStakeholder, updateStakeholder, charges, addCharge, removeCharge, updateCharge, dealValue, currency }) => {
    const totalPct = stakeholders.reduce((sum, s) => sum + (parseFloat(s.percentage) || 0), 0);
    const totalAmt = stakeholders.reduce((sum, s) => sum + ((dealValue * (parseFloat(s.percentage) || 0)) / 100), 0);

    const totalChargePct = charges ? charges.reduce((sum, c) => sum + (parseFloat(c.percentage) || 0), 0) : 0;
    const totalChargeAmt = charges ? charges.reduce((sum, c) => sum + ((dealValue * (parseFloat(c.percentage) || 0)) / 100), 0) : 0;

    // Tax Calculation Logic
    const handleTaxChange = (id, field, value, currentCharge) => {
        let updates = { [field]: value };

        let currentCountry = field === 'country' ? value : (currentCharge.country || 'India');
        let currentState = field === 'state' ? value : (currentCharge.state || '');

        // 1. Handle Country Change
        if (field === 'country') {
            if (value === 'Other') {
                updates.country = ''; // Clear country to trigger input mode based on UI logic
                updates.state = '';

                // Export Nil Rate only if received in convertible foreign exchange (i.e., NOT INR)
                if (currency !== 'INR') {
                    updates.taxType = 'Export (Nil Rate)';
                    updates.percentage = 0;
                    updates.name = 'Export (Nil)';
                } else {
                    // Fallback for INR Export (likely treated as Inter-State/IGST or effective tax)
                    updates.taxType = 'Inter-State (IGST)';
                    updates.percentage = 18;
                    updates.name = 'IGST';
                }
            } else if (value === 'India') {
                updates.country = 'India';
            } else {
                // Manual input case
                if (value !== 'India') {
                    updates.state = '';
                    if (currency !== 'INR') {
                        updates.taxType = 'Export (Nil Rate)';
                        updates.percentage = 0;
                        updates.name = 'Export (Nil)';
                    } else {
                        updates.taxType = 'Inter-State (IGST)';
                        updates.percentage = 18;
                        updates.name = 'IGST';
                    }
                }
            }
        }

        // 2. Handle State Change (Only if Country is India)
        if (field === 'state' && (currentCountry === 'India' || !currentCountry)) { // Default to India logic if undefined
            if (value === 'Tamil Nadu') {
                updates.taxType = 'Intra-State (CGST + SGST)';
                updates.percentage = 18;
                updates.name = 'GST (Intra)';
            } else if (value) {
                updates.taxType = 'Inter-State (IGST)';
                updates.percentage = 18;
                updates.name = 'IGST';
            }
        }

        // 3. Handle Tax Type Change (Manual Override or Reset)
        if (field === 'taxType') {
            if (value === '') {
                // Reset logic: Recalculate based on existing Country/State
                if (currentCountry === 'Other' || (currentCountry && currentCountry !== 'India')) {
                    if (currency !== 'INR') {
                        updates.taxType = 'Export (Nil Rate)';
                        updates.percentage = 0;
                        updates.name = 'Export (Nil)';
                    } else {
                        updates.taxType = 'Inter-State (IGST)';
                        updates.percentage = 18;
                        updates.name = 'IGST';
                    }
                } else if (currentCountry === 'India') {
                    if (currentState === 'Tamil Nadu') { // Use currentState which is grounded in currentCharge
                        updates.taxType = 'Intra-State (CGST + SGST)';
                        updates.percentage = 18;
                        updates.name = 'GST (Intra)';
                    } else if (currentState) {
                        updates.taxType = 'Inter-State (IGST)';
                        updates.percentage = 18;
                        updates.name = 'IGST';
                    } else {
                        updates.taxType = ''; // No state selected? Reset.
                        updates.percentage = 0;
                        updates.name = 'Tax';
                    }
                }
            } else if (value === 'Export (Nil Rate)') {
                updates.percentage = 0;
                updates.country = 'International';
                updates.state = '';
                updates.name = 'Export (Nil)';
            } else if (value === 'Intra-State (CGST + SGST)') {
                updates.percentage = 18;
                updates.country = 'India';
                updates.state = 'Tamil Nadu';
                updates.name = 'GST (Intra)';
            } else if (value === 'Inter-State (IGST)') {
                updates.percentage = 18;
                updates.country = 'India';
                updates.name = 'IGST';
            } else if (value === 'Other') {
                updates.name = 'Tax';
            }
        }

        // Apply all updates
        updateCharge(id, updates);
    };

    return (
        <div className="stage">
            <div className="bar">
                <span>Stage 2 — Project Splits & Finance Charges</span>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-white d-flex align-items-center gap-1" onClick={addStakeholder}>
                        <Plus size={14} />Splits
                    </button>
                    <button className="btn btn-sm btn-white d-flex align-items-center gap-1" onClick={addCharge}>
                        <Plus size={14} /> Tax
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
                <h6 className="fw-bold mb-3 text-muted border-top pt-4">Finance Charges (GST / Tax)</h6>
                <table className="stage-table">
                    <thead>
                        <tr>
                            <th style={{ width: '200px' }}>Tax Type</th>
                            <th>Country</th>
                            <th>State</th>
                            <th style={{ width: '100px' }}>%</th>
                            <th>Amount ({currency})</th>
                            <th style={{ width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {charges && charges.map(c => (
                            <tr key={c.id}>
                                <td>
                                    {c.taxType === 'Other' ? (
                                        <div className="d-flex gap-1 align-items-center">
                                            <input
                                                className="stage-input"
                                                value={c.name}
                                                onChange={(e) => updateCharge(c.id, 'name', e.target.value)}
                                                placeholder="Tax Name"
                                                autoFocus
                                            />
                                            <button
                                                className="btn btn-sm btn-light border d-flex align-items-center justify-content-center"
                                                onClick={() => handleTaxChange(c.id, 'taxType', '', c)}
                                                title="Reset"
                                                style={{ width: '30px', height: '30px', padding: 0 }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <select
                                            className="stage-select"
                                            value={c.taxType || ''}
                                            onChange={(e) => handleTaxChange(c.id, 'taxType', e.target.value, c)}
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Intra-State (CGST + SGST)">Intra-State (CGST + SGST)</option>
                                            <option value="Inter-State (IGST)">Inter-State (IGST)</option>
                                            <option value="Export (Nil Rate)">Export (Nil Rate)</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    )}
                                </td>
                                <td>
                                    {c.country !== 'India' && c.country !== undefined ? (
                                        <div className="d-flex gap-1 align-items-center">
                                            <input
                                                className="stage-input"
                                                value={c.country}
                                                onChange={(e) => handleTaxChange(c.id, 'country', e.target.value, c)}
                                                placeholder="Country Name"
                                                autoFocus
                                            />
                                            <button
                                                className="btn btn-sm btn-light border d-flex align-items-center justify-content-center"
                                                onClick={() => handleTaxChange(c.id, 'country', 'India', c)}
                                                title="Reset to India"
                                                style={{ width: '30px', height: '30px', padding: 0 }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <select
                                            className="stage-select"
                                            value={c.country || 'India'}
                                            onChange={(e) => {
                                                if (e.target.value === 'Other') {
                                                    handleTaxChange(c.id, 'country', 'Other', c);
                                                } else {
                                                    handleTaxChange(c.id, 'country', e.target.value, c);
                                                }
                                            }}
                                            disabled={c.taxType === 'Other'}
                                        >
                                            {STAKEHOLDERS_CONSTANTS.COUNTRIES.map(country => (
                                                <option key={country} value={country}>{country}</option>
                                            ))}
                                        </select>
                                    )}
                                </td>
                                <td>
                                    <select
                                        className="stage-select"
                                        value={c.state || ''}
                                        onChange={(e) => handleTaxChange(c.id, 'state', e.target.value, c)}
                                        disabled={(c.country || 'India') !== 'India' || c.taxType === 'Other'}
                                    >
                                        <option value="">Select State</option>
                                        {STAKEHOLDERS_CONSTANTS.INDIAN_STATES.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="stage-input"
                                        value={c.percentage}
                                        onChange={(e) => handleTaxChange(c.id, 'percentage', e.target.value, c)}
                                        disabled={c.taxType !== 'Other'}
                                    />
                                </td>
                                <td className="font-monospace">{currency} {(dealValue * c.percentage / 100).toLocaleString()}</td>
                                <td><button className="btn-link text-danger" onClick={() => removeCharge(c.id)}><Trash2 size={16} /></button></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colSpan="3">Total Tax Liability</th>
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
    const [openInvoiceMenu, setOpenInvoiceMenu] = useState(null);

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

    // Determine Tax Type (Intra vs Inter)
    const isIntraState = taxes && taxes.some(t => t.taxType === 'Intra-State (CGST + SGST)');
    const totalTaxRate = taxes && taxes.length > 0 ? taxes.reduce((sum, t) => sum + (parseFloat(t.percentage) || 0), 0) : 18;

    return (
        <div className="stage">
            <div className="bar">
                <span>Stage 3 — Invoice Cycle</span>
                <button className="btn btn-sm btn-white d-flex align-items-center gap-1" onClick={addMilestone}>
                    <Plus size={14} />Payment
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

                <div className="table-responsive">
                    <table className="stage-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th style={{ width: '180px' }}>Payment</th>
                                <th>Value %</th>
                                <th style={{ width: '140px' }}>Inv Date</th>
                                <th>Base ({details.currency})</th>

                                {isIntraState ? (
                                    <>
                                        <th>CGST</th>
                                        <th>SGST</th>
                                    </>
                                ) : (
                                    <th>GST</th>
                                )}

                                <th>Total ({details.currency})</th>
                                <th style={{ width: '140px' }}>Paid Date</th>
                                <th>Paid ({details.currency})</th>
                                <th>Ageing</th>
                                <th style={{ width: '120px' }}>Status</th>
                                <th style={{ width: '200px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {milestones.map((milestone, index) => {
                                const raisedAmount = (dealValue * milestone.percentage) / 100;
                                const taxAmount = (raisedAmount * totalTaxRate) / 100;
                                const totalAmount = raisedAmount + taxAmount;

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
                                            <input type="date" className="stage-input p-1" value={milestone.invoiceDate || ''} onChange={(e) => updateMilestone(milestone.id, 'invoiceDate', e.target.value)} />
                                        </td>
                                        <td className="text-end">{raisedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>

                                        {isIntraState ? (
                                            <>
                                                <td className="text-end">{(taxAmount / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td className="text-end">{(taxAmount / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            </>
                                        ) : (
                                            <td className="text-end">{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        )}

                                        <td className="text-end">{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>

                                        <td>
                                            <input type="date" className="stage-input p-1" value={milestone.paidDate || ''} onChange={(e) => updateMilestone(milestone.id, 'paidDate', e.target.value)} />
                                        </td>
                                        <td className="text-end">{raisedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="text-center">
                                            {calculateAgeing(milestone.invoiceDate, milestone.paidDate)}
                                        </td>
                                        <td>
                                            <select
                                                className="stage-select p-1"
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
                                            <div className="d-flex justify-content-center gap-1">
                                                <select
                                                    className="stage-select p-1"
                                                    style={{ fontSize: '12px', width: 'auto', minWidth: '130px', cursor: 'pointer' }}
                                                    value=""
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === 'investor') generateInvestorPaymentPDF(milestone, details, taxes);
                                                        else if (val === 'client') generateInvoicePDF(milestone, details, taxes);
                                                        else if (val === 'tax') generateTaxInvoicePDF(milestone, details, taxes);
                                                        e.target.value = '';
                                                    }}
                                                >
                                                    <option value="">Download</option>
                                                    <option value="investor">Payment to Investor</option>
                                                    <option value="client">Client Invoice</option>
                                                    <option value="tax">Tax Invoice</option>
                                                </select>
                                                <button className="btn-icon text-danger" onClick={() => removeMilestone(milestone.id)} title="Delete Item">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {milestones.length === 0 && <tr><td colSpan={isIntraState ? "13" : "12"} className="text-center text-muted p-3">No payments added.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};



const InvoiceMain = ({ details, updateDetails, stakeholders, addStakeholder, removeStakeholder, updateStakeholder, milestones, addMilestone, removeMilestone, updateMilestone, charges, addCharge, removeCharge, updateCharge, onSave }) => {
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
                    <button className="btn btn-sm btn-primary d-flex align-items-center gap-2" onClick={onSave} title="Save Project">
                        <Save size={18} /> Save
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => generateProjectReportPDF(details, stakeholders, milestones, charges)} title="Download PDF Report"><FaFilePdf size={20} /></button>
                    <button className="btn btn-sm btn-outline-success" onClick={() => exportProjectReport(details, stakeholders, milestones, charges)} title="Export to Excel"><PiMicrosoftExcelLogoFill size={20} /></button>
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
                    <div className="table-responsive">
                        <table className="stage-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Party</th>
                                    <th>Value %</th>
                                    <th>Pay ({details.currency})</th>
                                    <th>GST %</th>
                                    <th>GST Amt</th>
                                    <th>Net Pay</th>
                                    <th>Paid Date</th>
                                    <th style={{ width: '120px' }}>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stakeholders && stakeholders.map((s, idx) => {
                                    const payAmt = (dVal * s.percentage) / 100;
                                    const taxRate = parseFloat(s.payoutTax) || 18;
                                    const taxAmt = (payAmt * taxRate) / 100;
                                    const netPay = payAmt - taxAmt;

                                    return (
                                        <tr key={s.id}>
                                            <td>{idx + 1}</td>
                                            <td>{s.name}</td>
                                            <td>
                                                <input type="number" className="stage-input text-center p-1" style={{ width: '80px' }} value={s.percentage} onChange={(e) => updateStakeholder(s.id, 'percentage', e.target.value)} />
                                            </td>
                                            <td>{details.currency} {payAmt.toLocaleString()}</td>
                                            <td>
                                                <input type="number" className="stage-input p-1 text-center" style={{ width: '60px' }} value={s.payoutTax ?? 18} onChange={(e) => updateStakeholder(s.id, 'payoutTax', e.target.value)} />
                                            </td>
                                            <td>{details.currency} {taxAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td>{details.currency} {netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td>
                                                <input type="date" className="stage-input p-1" value={s.paidDate || ''} onChange={(e) => updateStakeholder(s.id, 'paidDate', e.target.value)} />
                                            </td>
                                            <td>
                                                <select
                                                    className="stage-select p-1"
                                                    value={s.status || 'Pending'}
                                                    onChange={(e) => updateStakeholder(s.id, 'status', e.target.value)}
                                                    style={{
                                                        borderColor: s.status === 'Paid' ? '#198754' : '#ccc',
                                                        color: s.status === 'Paid' ? '#198754' : '#000'
                                                    }}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processed">Processed</option>
                                                    <option value="Paid">Paid</option>
                                                </select>
                                            </td>
                                            <td className="text-center">
                                                <button className="btn-icon text-success" onClick={() => generatePaymentInvoicePDF(s, details, dVal)} title="Download Voucher">
                                                    <FileDown size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {(!stakeholders || stakeholders.length === 0) && <tr><td colSpan="10" className="text-center text-muted p-3">No stakeholders added.</td></tr>}
                            </tbody>
                        </table>
                    </div>
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
            id: 1, projectId: 'ABC123', dateCreated: new Date().toISOString(), clientName: 'ABC Company', clientAddress: '', clientGstin: '', delivery: 'Ambot365', status: 'Active',
            dealValue: 100000, currency: 'AED', location: 'Dubai',
            stakeholders: [{ id: 1, name: 'Lead', percentage: 2, payoutTax: 10, payoutStatus: 'Pending', paidDate: '' }],
            milestones: [{ id: 1, name: 'Initiate Invoice', percentage: 20, status: 'Completed', invoiceDate: new Date().toISOString().split('T')[0], paidDate: '' }],
            charges: [{ id: 1, name: 'IGST', taxType: 'Inter-State (IGST)', country: 'India', state: '', percentage: 18 }]
        }
    ]);

    useEffect(() => {
        const initProject = async () => {
            if (location.state && location.state.project) {
                const receivedProject = location.state.project;

                // Fetch contacts to find address/country
                let retrievedAddress = '';
                let retrievedCountry = 'India'; // Default fallback

                try {
                    const contacts = await contactService.getContacts();
                    const searchName = (receivedProject.clientName || '').toLowerCase().trim();

                    console.log('Searching for contact:', searchName);

                    // Try to match by Exact Name or Company
                    const matchedContact = contacts.find(c => {
                        const cName = (c.name || '').toLowerCase().trim();
                        const cCompany = (c.company || '').toLowerCase().trim();
                        return cName === searchName || cCompany === searchName;
                    });

                    if (matchedContact) {
                        console.log('Matched Contact:', matchedContact);
                        retrievedAddress = matchedContact.address || matchedContact.location || '';

                        const lowerLoc = retrievedAddress.toLowerCase();

                        if (lowerLoc.includes('india')) {
                            retrievedCountry = 'India';
                        } else if (lowerLoc.includes('uae') || lowerLoc.includes('united arab emirates') || lowerLoc.includes('dubai')) {
                            retrievedCountry = 'UAE';
                        } else if (retrievedAddress) {
                            // If address is present but doesn't match India/UAE, try to extract the country
                            const parts = retrievedAddress.split(',');
                            const lastPart = parts[parts.length - 1].trim();
                            // If we have a valid last part, use it. Otherwise use India (or maybe 'Other'?)
                            // Let's use the last part if it looks like a word, effectively treating it as the country.
                            if (lastPart.length > 2) {
                                retrievedCountry = lastPart;
                            }
                        }
                    } else {
                        console.log('No contact matched for client:', receivedProject.clientName);
                    }
                } catch (err) {
                    console.error("Error fetching contacts for invoice init:", err);
                }

                setProjects(prevProjects => {
                    const exists = prevProjects.find(p => p.id === receivedProject.id);
                    if (exists) {
                        setActiveProjectId(receivedProject.id);
                        setView('invoice');
                        return prevProjects;
                    }

                    // Map Sales data to Invoice structure with fetched Location
                    const newProject = {
                        id: receivedProject.id,
                        projectId: receivedProject.customId || `PROJ-${receivedProject.id}`,
                        dateCreated: new Date().toISOString(),
                        clientName: receivedProject.clientName || 'Unknown Client',
                        delivery: receivedProject.brandingName || '',
                        dealValue: 0,
                        currency: retrievedCountry === 'UAE' ? 'AED' : 'INR',
                        location: retrievedAddress || 'India',
                        stakeholders: [],
                        milestones: [],
                        charges: [{
                            id: 1,
                            name: retrievedCountry === 'India' ? 'IGST' : 'Tax',
                            taxType: retrievedCountry === 'India' ? 'Inter-State (IGST)' : 'Export (Nil Rate)',
                            country: retrievedCountry,
                            state: '',
                            percentage: retrievedCountry === 'India' ? 18 : 0
                        }]
                    };

                    setActiveProjectId(newProject.id);
                    setView('invoice');
                    return [...prevProjects, newProject];
                });
            }
        };

        initProject();
    }, [location.state]);

    const activeProject = projects.find(p => p.id === activeProjectId);

    const handleCreateProject = () => {
        const newProj = {
            id: Date.now(), projectId: `PROJ-${Math.floor(Math.random() * 999)}`, dateCreated: new Date().toISOString(),
            clientName: 'New Client', clientAddress: '', clientGstin: '', delivery: '', dealValue: 0, currency: 'AED', location: '', status: 'Active',
            stakeholders: [], milestones: [], charges: [{ id: 1, name: 'GST', taxType: 'Inter-State (IGST)', country: 'India', state: '', percentage: 18 }]
        };
        setProjects([...projects, newProj]);
        setActiveProjectId(newProj.id);
        setView('invoice');
    };

    const handleSaveProject = async () => {
        if (!activeProject) return;
        try {
            // We can resolve the ID to a string if it's not already
            const docId = String(activeProject.id);
            // Save to 'invoices' or update the 'projects' collection? 
            // The user request is "Sales to Invoice". Usually invoices are separate. 
            // But here the "ProjectTracker" seems to be the Invoice manager. 
            // Let's assume we update the project with finance details OR save to a separate collection.
            // Given the existing code uses `projectService`, let's try to update the project with these details
            // OR create a new "invoice_tracker" document.
            // For now, I will save it to a collection named 'invoice_projects' to avoid overwriting the Sales Project data structure entirely if they are different,
            // OR if `projectService` is the same, I should merge.
            // Let's use setDoc to a specific collection for these trackers.

            await setDoc(doc(db, 'project_finances', docId), activeProject);
            alert('Project finance details saved successfully!');
        } catch (error) {
            console.error("Error saving project:", error);
            alert('Failed to save project.');
        }
    };

    const updateProject = (fn) => setProjects(projects.map(p => p.id === activeProjectId ? fn(p) : p));
    const updateDetails = (f, v) => updateProject(p => ({ ...p, [f]: v }));

    // Stakeholders logic
    const addStakeholder = () => updateProject(p => ({ ...p, stakeholders: [...p.stakeholders, { id: Date.now(), name: 'New', percentage: 0, payoutTax: 18, payoutStatus: 'Pending', paidDate: '' }] }));
    const removeStakeholder = (id) => updateProject(p => ({ ...p, stakeholders: p.stakeholders.filter(s => s.id !== id) }));
    const updateStakeholder = (id, f, v) => updateProject(p => ({ ...p, stakeholders: p.stakeholders.map(s => s.id === id ? { ...s, [f]: v } : s) }));

    // Milestones logic
    const addMilestone = () => updateProject(p => ({ ...p, milestones: [...p.milestones, { id: Date.now(), name: 'New Stage', percentage: 0, status: 'Pending', invoiceDate: '', paidDate: '' }] }));
    const removeMilestone = (id) => updateProject(p => ({ ...p, milestones: p.milestones.filter(m => m.id !== id) }));
    const updateMilestone = (id, f, v) => updateProject(p => ({ ...p, milestones: p.milestones.map(m => m.id === id ? { ...m, [f]: v } : m) }));

    // Charges logic
    const addCharge = () => updateProject(p => ({ ...p, charges: [...p.charges, { id: Date.now(), name: 'Tax', taxType: 'Other', country: 'India', state: '', percentage: 0 }] }));
    const removeCharge = (id) => updateProject(p => ({ ...p, charges: p.charges.filter(c => c.id !== id) }));
    const updateCharge = (id, field, value) => updateProject(p => ({
        ...p,
        charges: p.charges.map(c => c.id === id ? { ...c, ...(typeof field === 'object' ? field : { [field]: value }) } : c)
    }));

    return (
        <div className="tracker-wrapper" style={{ fontFamily: "'Inter', sans-serif" }}>
            <TrackerStyles />
            {view === 'invoice' && activeProject && (
                <div className="mb-4" style={{ paddingLeft: '0.5rem' }}>
                    <button className="btn btn-outline-dark" onClick={() => { setView('dashboard'); setActiveProjectId(null); }}>
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                </div>
            )}

            {view === 'dashboard' ? (
                <Dashboard
                    projects={projects}
                    onOpenProject={(id) => { setActiveProjectId(id); setView('invoice'); }}
                    onCreateProject={handleCreateProject}
                    onStatusChange={(id, status) => {
                        setProjects(prev => prev.map(p => p.id === id ? { ...p, status: status, isArchived: status === 'Archived' } : p));
                    }}
                />
            ) : activeProject ? (
                <InvoiceMain
                    details={activeProject} updateDetails={updateDetails}
                    stakeholders={activeProject.stakeholders} addStakeholder={addStakeholder} removeStakeholder={removeStakeholder} updateStakeholder={updateStakeholder}
                    milestones={activeProject.milestones} addMilestone={addMilestone} removeMilestone={removeMilestone} updateMilestone={updateMilestone}
                    charges={activeProject.charges} addCharge={addCharge} removeCharge={removeCharge} updateCharge={updateCharge}
                    onSave={handleSaveProject}
                />
            ) : (
                <div className="text-white text-center">Project not found.</div>
            )}
        </div>
    );
};

export default ProjectTrackerComplete;
