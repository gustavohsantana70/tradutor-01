import React from 'react';
import { ComplianceReport } from '../types';
import { CheckCircle, AlertTriangle, XCircle, ShieldCheck, Heading, Table, Quote, Hash, Type } from 'lucide-react';

interface CompliancePanelProps {
  report: ComplianceReport;
  onClose: () => void;
}

const CompliancePanel: React.FC<CompliancePanelProps> = ({ report, onClose }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle size={16} className="text-green-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'fail': return <XCircle size={16} className="text-red-500" />;
      default: return <CheckCircle size={16} className="text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Headings': return <Heading size={14} />;
      case 'Tables': return <Table size={14} />;
      case 'Footnotes': return <Quote size={14} />;
      case 'Numbers': return <Hash size={14} />;
      case 'Terminology': return <Type size={14} />;
      default: return <ShieldCheck size={14} />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-green-400" />
            <h2 className="font-bold text-lg">Integrity & Compliance Report</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>

        {/* Score & Summary */}
        <div className="p-6 border-b border-gray-100 flex flex-col items-center text-center bg-slate-50">
          <div className={`text-5xl font-bold mb-2 ${getScoreColor(report.score)}`}>
            {report.score}%
          </div>
          <div className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3">Confidence Score</div>
          <p className="text-sm text-gray-700">{report.summary}</p>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 bg-white custom-scrollbar">
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 px-2 flex justify-between">
             <span>Audit Checklist</span>
             <span className="text-gray-400 font-normal">{report.items.length} checks</span>
          </h3>
          <div className="space-y-3">
            {report.items.map((item, index) => (
              <div key={index} className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:bg-slate-50 transition-colors">
                <div className="mt-0.5 shrink-0">
                  {getStatusIcon(item.status)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 flex items-center gap-1">
                      {getCategoryIcon(item.category)}
                      {item.category}
                    </span>
                    <span className={`text-xs font-semibold capitalize ${
                      item.status === 'pass' ? 'text-green-600' : 
                      item.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-snug">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
           <button 
             onClick={onClose}
             className="w-full bg-slate-800 text-white py-2 rounded font-medium hover:bg-slate-700 transition-colors"
           >
             Close Report
           </button>
        </div>
      </div>
    </div>
  );
};

export default CompliancePanel;