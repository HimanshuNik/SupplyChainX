import React, { useState, useEffect } from 'react';
import { History, Search, Shield, Filter, Eye, Clock, Terminal } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate, formatDateTime } from '../../utils/formatters';

export const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/audit-logs', {
        params: { module, search }
      });
      if (res.success) setLogs(res.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [module]);

  const columns = [
    {
      header: 'Timestamp',
      render: (l) => (
        <span className="text-xs text-slate-500 font-mono">
          {formatDateTime(l.timestamp)}
        </span>
      )
    },
    {
      header: 'Staff Member',
      render: (l) => (
        <div>
          <span className="font-bold text-slate-900 text-xs">{l.user}</span>
          <div className="text-[10px] text-slate-400">{l.role || 'Staff'}</div>
        </div>
      )
    },
    {
      header: 'Module',
      render: (l) => (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {l.module}
        </span>
      )
    },
    {
      header: 'Action Taken',
      render: (l) => (
        <div className="font-semibold text-slate-800 text-xs">
          {l.action}
        </div>
      )
    },
    {
      header: 'Client IP',
      accessor: 'ipAddress',
      className: 'font-mono text-xs text-slate-400'
    },
    {
      header: 'Details',
      align: 'right',
      render: (l) => (
        <Button
          variant="ghost"
          size="sm"
          icon={Eye}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLog(l);
          }}
          className="text-xs py-1 px-2"
        >
          Inspect
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Security & Compliance</span>
            <span>/</span>
            <span className="text-blue-600">Audit Trail</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Enterprise Activity & Mutation Audit Ledger
          </h1>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search action or user name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
            icon={Search}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            options={[
              { value: 'All', label: 'All Modules' },
              { value: 'INVENTORY', label: 'Inventory Movements' },
              { value: 'PROCUREMENT', label: 'Procurement & POs' },
              { value: 'SALES', label: 'Sales & Invoicing' },
              { value: 'WAREHOUSE', label: 'Warehousing' },
              { value: 'AUTH', label: 'Authentication & Access' }
            ]}
            className="w-56"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Reading immutable audit trail..." />
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
          <Table
            columns={columns}
            data={logs}
            onRowClick={(l) => setSelectedLog(l)}
            emptyMessage="No audit logs found for this filter."
          />
        </div>
      )}

      {/* Action Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={Boolean(selectedLog)}
          onClose={() => setSelectedLog(null)}
          title="Audit Log Event Inspection"
          subtitle={`Event ID: ${selectedLog._id}`}
          maxWidth="max-w-lg"
          footer={
            <Button variant="secondary" size="sm" onClick={() => setSelectedLog(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Actor / User:</span>
                <span className="font-bold text-slate-900">{selectedLog.user} ({selectedLog.role || 'Staff'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Action:</span>
                <span className="font-bold text-blue-600">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Module:</span>
                <span className="font-semibold text-slate-800">{selectedLog.module}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Timestamp:</span>
                <span className="font-mono text-slate-700">{formatDateTime(selectedLog.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Origin IP:</span>
                <span className="font-mono text-slate-700">{selectedLog.ipAddress}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                Raw Payload State
              </h4>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto">
                {JSON.stringify(selectedLog.details || {}, null, 2)}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
