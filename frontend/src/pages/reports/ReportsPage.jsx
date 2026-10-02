import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, FileText, Filter, RefreshCw, Calendar } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/Toast';
import { exportReportToPDF, exportReportToCSV } from '../../utils/pdfGenerator';

export const ReportsPage = () => {
  const { addToast } = useToast();
  const [reportType, setReportType] = useState('inventory');
  const [dateRange, setDateRange] = useState('30days');
  const [reportData, setReportData] = useState([]);
  const [reportTitle, setReportTitle] = useState('Inventory Report');
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/analytics/reports', {
        params: { reportType, dateRange }
      });
      if (res.success) {
        setReportData(res.data || []);
        setReportTitle(res.title || 'Supply Chain Report');
      }
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to generate report', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  // Dynamically extract columns based on returned dataset keys
  const getColumns = () => {
    if (!reportData || reportData.length === 0) return [];
    const firstRow = reportData[0];
    return Object.keys(firstRow).map((key) => ({
      header: key.replace(/([A-Z])/g, ' $1').trim(),
      accessor: key,
      key
    }));
  };

  const handleExportPDF = () => {
    if (reportData.length === 0) return;
    const cols = getColumns();
    exportReportToPDF(reportTitle, cols, reportData, reportType);
    addToast({ title: 'PDF Exported', message: `${reportTitle} downloaded!`, type: 'success' });
  };

  const handleExportCSV = () => {
    if (reportData.length === 0) return;
    const cols = getColumns();
    exportReportToCSV(cols, reportData, reportType);
    addToast({ title: 'CSV Exported', message: `${reportTitle} downloaded!`, type: 'success' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Intelligence</span>
            <span>/</span>
            <span className="text-blue-600">Reports</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Enterprise Reporting & Data Export Engine
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            icon={Download}
            onClick={handleExportCSV}
            disabled={reportData.length === 0}
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={FileText}
            onClick={handleExportPDF}
            disabled={reportData.length === 0}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Report Controls Panel */}
      <Card
        title="Report Parameters"
        subtitle="Select dataset type and scope to generate backend aggregation"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Select
            label="Report Category"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { value: 'inventory', label: '📦 Inventory Valuation & Stock Report' },
              { value: 'purchases', label: '📋 Procurement & Purchase Orders' },
              { value: 'sales', label: '🛒 Sales Orders & Dispatch Performance' },
              { value: 'suppliers', label: '🏢 Supplier Directory & Performance' },
              { value: 'warehouses', label: '🏭 Warehouse Capacity & Logistics' }
            ]}
            className="flex-1"
          />

          <Select
            label="Date Scope"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: '30days', label: 'Last 30 Days' },
              { value: 'quarter', label: 'Current Quarter (Q3)' },
              { value: 'year', label: 'Full Financial Year' }
            ]}
            className="w-56"
          />

          <div className="pt-5">
            <Button variant="primary" size="md" icon={RefreshCw} onClick={fetchReport} loading={loading}>
              Generate
            </Button>
          </div>
        </div>
      </Card>

      {/* Generated Report Data Table */}
      <Card
        title={reportTitle}
        subtitle={`Aggregated dataset containing ${reportData.length} entries`}
      >
        {loading ? (
          <LoadingSpinner text="Computing aggregation report..." />
        ) : (
          <Table
            columns={getColumns()}
            data={reportData}
            emptyMessage="No records available for the selected parameters."
          />
        )}
      </Card>
    </div>
  );
};
