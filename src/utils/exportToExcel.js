import * as XLSX from 'xlsx';

/**
 * Generic utility to export data to an Excel file.
 * @param {Array<Object>} data - Array of objects to export
 * @param {string} sheetName - Name of the sheet
 * @param {string} fileName - Name of the output file (without .xlsx)
 * @param {Array<{header: string, key: string, width?: number}>} [columnConfig] - Optional column configuration
 */
export const exportToExcel = (data, sheetName, fileName, columnConfig) => {
    if (!data || data.length === 0) {
        alert('No data to export.');
        return;
    }

    let sheetData;
    let colWidths;

    if (columnConfig && columnConfig.length > 0) {
        // Use column config to shape the data
        const headers = columnConfig.map(c => c.header);
        const rows = data.map(item =>
            columnConfig.map(c => {
                const val = typeof c.key === 'function' ? c.key(item) : getNestedValue(item, c.key);
                return val !== undefined && val !== null ? val : '';
            })
        );
        sheetData = [headers, ...rows];
        colWidths = columnConfig.map(c => ({ wch: c.width || 20 }));
    } else {
        // Auto-generate from object keys
        const keys = [...new Set(data.flatMap(item => Object.keys(item)))];
        const headers = keys.map(k => k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1'));
        const rows = data.map(item => keys.map(k => {
            const val = item[k];
            if (val === undefined || val === null) return '';
            if (typeof val === 'object') return JSON.stringify(val);
            return val;
        }));
        sheetData = [headers, ...rows];
        colWidths = keys.map(() => ({ wch: 20 }));
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = colWidths;
    XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31)); // Sheet name max 31 chars

    XLSX.writeFile(wb, `${fileName}.xlsx`);
};

/**
 * Export multiple sheets to a single Excel file.
 * @param {Array<{data: Array, sheetName: string, columnConfig?: Array}>} sheets
 * @param {string} fileName
 */
export const exportMultiSheetExcel = (sheets, fileName) => {
    const wb = XLSX.utils.book_new();

    sheets.forEach(({ data, sheetName, columnConfig }) => {
        if (!data || data.length === 0) return;

        let sheetData;
        let colWidths;

        if (columnConfig && columnConfig.length > 0) {
            const headers = columnConfig.map(c => c.header);
            const rows = data.map(item =>
                columnConfig.map(c => {
                    const val = typeof c.key === 'function' ? c.key(item) : getNestedValue(item, c.key);
                    return val !== undefined && val !== null ? val : '';
                })
            );
            sheetData = [headers, ...rows];
            colWidths = columnConfig.map(c => ({ wch: c.width || 20 }));
        } else {
            const keys = [...new Set(data.flatMap(item => Object.keys(item)))];
            const headers = keys.map(k => k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1'));
            const rows = data.map(item => keys.map(k => {
                const val = item[k];
                if (val === undefined || val === null) return '';
                if (typeof val === 'object') return JSON.stringify(val);
                return val;
            }));
            sheetData = [headers, ...rows];
            colWidths = keys.map(() => ({ wch: 20 }));
        }

        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        ws['!cols'] = colWidths;
        XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
    });

    XLSX.writeFile(wb, `${fileName}.xlsx`);
};

// Helper to get nested values like "contact.email"
const getNestedValue = (obj, path) => {
    if (typeof path === 'function') return path(obj);
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};
