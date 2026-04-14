import React, { useState, useMemo } from 'react';
import { 
  FileCheck, 
  Clock, 
  Calendar, 
  Search, 
  LayoutGrid, 
  List, 
  ChevronRight, 
  ArrowRight,
  Building2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  X,
  FileUp
} from 'lucide-react';
import { auditService, companyService } from '../services/db';
import { Company, Audit, ViewState, Severity, AuditFinding, Evidence } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export const Audits: React.FC<{ context: string; companyId?: string; isGAAbogados?: boolean; onNavigate?: (view: ViewState, itemId?: string, companyId?: string) => void }> = ({ context, companyId, isGAAbogados, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form State for New Audit
  const [newAudit, setNewAudit] = useState<Partial<Audit>>({
    title: '',
    type: 'Interna',
    status: 'Planificada',
    auditor: '',
    startDate: new Date().toISOString().split('T')[0],
    scope: '',
    description: '',
    companyId: companyId || '',
    practiceArea: context as any
  });

  // Form State for New Finding
  const [showFindingForm, setShowFindingForm] = useState(false);
  const [newFinding, setNewFinding] = useState<Partial<AuditFinding>>({
    description: '',
    severity: Severity.MEDIUM,
    status: 'Abierto'
  });
  
  const allAudits = auditService.getAll(context as any);
  const allCompanies = companyService.getAll();

  const selectedAudit = useMemo(() => 
    selectedAuditId ? allAudits.find(a => a.id === selectedAuditId) : null
  , [selectedAuditId, allAudits]);

  const stats = useMemo(() => {
    const relevantAudits = companyId 
      ? allAudits.filter(a => a.companyId === companyId)
      : allAudits;
    
    const completed = relevantAudits.filter(a => a.status === 'Finalizada').length;
    const inProgress = relevantAudits.filter(a => a.status === 'En Progreso').length;
    const upcoming = relevantAudits.filter(a => a.status === 'Planificada').length;

    return {
      completed,
      inProgress,
      upcoming
    };
  }, [allAudits, companyId]);

  const filteredAudits = useMemo(() => {
    let audits = allAudits;
    if (companyId) {
      audits = audits.filter(a => a.companyId === companyId);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      audits = audits.filter(a => 
        a.title.toLowerCase().includes(term) ||
        a.auditor.toLowerCase().includes(term) ||
        (allCompanies.find(c => c.id === a.companyId)?.name.toLowerCase().includes(term))
      );
    }
    return audits;
  }, [allAudits, companyId, searchTerm, allCompanies]);

  const getCompanyName = (cId?: string) => {
    if (!cId) return 'N/A';
    return allCompanies.find(c => c.id === cId)?.name || 'Desconocida';
  };

  const handleCreateAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAudit.title || !newAudit.auditor || !newAudit.companyId) return;

    const auditToSave: Audit = {
      ...newAudit as Audit,
      id: `AUD-${Date.now()}`,
      evidence: [],
      findings: [],
      practiceArea: context as any
    };

    auditService.add(auditToSave);
    setShowCreateModal(false);
    setNewAudit({
      title: '',
      type: 'Interna',
      status: 'Planificada',
      auditor: '',
      startDate: new Date().toISOString().split('T')[0],
      scope: '',
      description: '',
      companyId: companyId || '',
      practiceArea: context as any
    });
  };

  const handleAddFinding = () => {
    if (!selectedAudit || !newFinding.description) return;

    const finding: AuditFinding = {
      ...newFinding as AuditFinding,
      id: `FIND-${Date.now()}`
    };

    const updatedFindings = [...selectedAudit.findings, finding];
    auditService.update(selectedAudit.id, { findings: updatedFindings });
    setShowFindingForm(false);
    setNewFinding({ description: '', severity: Severity.MEDIUM, status: 'Abierto' });
  };

  const handleDeleteFinding = (findingId: string) => {
    if (!selectedAudit) return;
    const updatedFindings = selectedAudit.findings.filter(f => f.id !== findingId);
    auditService.update(selectedAudit.id, { findings: updatedFindings });
  };

  const handleAddEvidence = () => {
    if (!selectedAudit) return;
    const evidence: Evidence = {
      id: `EV-${Date.now()}`,
      name: 'Nuevo Documento de Evidencia',
      type: 'PDF',
      url: '#',
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: 'Sistema'
    };
    const updatedEvidence = [...selectedAudit.evidence, evidence];
    auditService.update(selectedAudit.id, { evidence: updatedEvidence });
  };

  const handleUpdateStatus = (status: Audit['status']) => {
    if (!selectedAudit) return;
    auditService.update(selectedAudit.id, { status });
  };

  // Render Audit Detail
  if (selectedAudit) {
    return (
      <div className="p-8 animate-fade-in max-w-7xl mx-auto pb-24">
        <button 
          onClick={() => setSelectedAuditId(null)}
          className="flex items-center gap-2 text-gray-500 hover:text-brand-primary mb-6 font-bold transition-colors"
        >
          <ArrowLeft size={20} /> Volver al Listado
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Info & Findings */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      selectedAudit.status === 'Finalizada' ? 'bg-green-50 text-green-600' : 
                      selectedAudit.status === 'En Progreso' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {selectedAudit.status}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedAudit.type}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">{selectedAudit.title}</h1>
                  <p className="text-gray-500 mt-2">{selectedAudit.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Empresa Auditada</p>
                  <p className="font-bold text-brand-primary">{getCompanyName(selectedAudit.companyId)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-gray-50">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Auditor</p>
                  <p className="text-sm font-bold text-gray-800">{selectedAudit.auditor}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Fecha Inicio</p>
                  <p className="text-sm font-bold text-gray-800">{selectedAudit.startDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Alcance</p>
                  <p className="text-sm font-bold text-gray-800">{selectedAudit.scope}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hallazgos</p>
                  <p className="text-sm font-bold text-gray-800">{selectedAudit.findings.length}</p>
                </div>
              </div>

              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <AlertCircle size={20} className="text-brand-secondary" />
                    Hallazgos Identificados
                  </h3>
                  {isGAAbogados && (
                    <button 
                      onClick={() => setShowFindingForm(true)}
                      className="text-xs font-bold text-brand-primary hover:bg-brand-primary/5 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                    >
                      <Plus size={14} /> Agregar Hallazgo
                    </button>
                  )}
                </div>

                {showFindingForm && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-brand-primary/20 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Descripción del Hallazgo</label>
                        <input 
                          type="text"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
                          placeholder="Ej: Falta de control en accesos..."
                          value={newFinding.description}
                          onChange={(e) => setNewFinding({...newFinding, description: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Severidad</label>
                        <select 
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
                          value={newFinding.severity}
                          onChange={(e) => setNewFinding({...newFinding, severity: e.target.value as Severity})}
                        >
                          <option value={Severity.LOW}>Baja</option>
                          <option value={Severity.MEDIUM}>Media</option>
                          <option value={Severity.HIGH}>Alta</option>
                          <option value={Severity.CRITICAL}>Crítica</option>
                        </select>
                      </div>
                      <div className="flex items-end gap-2">
                        <button 
                          onClick={handleAddFinding}
                          className="flex-1 py-2 bg-brand-primary text-white rounded-xl font-bold text-xs hover:bg-brand-primaryLight transition-all"
                        >
                          Guardar Hallazgo
                        </button>
                        <button 
                          onClick={() => setShowFindingForm(false)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {selectedAudit.findings.length > 0 ? (
                    selectedAudit.findings.map((finding) => (
                      <div key={finding.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${
                            finding.severity === 'HIGH' || finding.severity === 'CRITICAL' ? 'bg-red-500' : 
                            finding.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{finding.description}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">Severidad: {finding.severity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            finding.status === 'Cerrado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {finding.status}
                          </span>
                          {isGAAbogados && (
                            <button 
                              onClick={() => handleDeleteFinding(finding.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No se han registrado hallazgos en esta auditoría.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Evidence & Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileCheck size={20} className="text-brand-primary" />
                Evidencia y Documentos
              </h3>
              <div className="space-y-3">
                {selectedAudit.evidence.map((ev) => (
                  <a 
                    key={ev.id} 
                    href={ev.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-brand-primary/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg text-gray-400 group-hover:text-brand-primary">
                        <FileCheck size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{ev.name}</p>
                        <p className="text-[10px] text-gray-400">{ev.type} • {ev.uploadDate}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-brand-primary" />
                  </a>
                ))}
                {selectedAudit.evidence.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-4">Sin documentos adjuntos.</p>
                )}
              </div>
              <button 
                onClick={handleAddEvidence}
                className="w-full mt-4 py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-400 hover:border-brand-primary hover:text-brand-primary transition-all flex items-center justify-center gap-2"
              >
                <FileUp size={14} /> + Cargar Evidencia
              </button>
            </div>

            <div className="bg-brand-primary rounded-3xl p-6 text-white shadow-lg shadow-brand-primary/20">
              <h4 className="font-bold mb-2">Acciones de Auditoría</h4>
              <p className="text-xs text-white/70 mb-4">Gestione el ciclo de vida de esta auditoría y sus seguimientos.</p>
              <div className="space-y-2">
                <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">
                  Generar Informe PDF
                </button>
                <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">
                  Notificar Hallazgos
                </button>
                {selectedAudit.status !== 'Finalizada' ? (
                  <button 
                    onClick={() => handleUpdateStatus('Finalizada')}
                    className="w-full py-2 bg-brand-secondary text-brand-primary rounded-xl text-xs font-bold transition-all"
                  >
                    Finalizar Auditoría
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUpdateStatus('En Progreso')}
                    className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all"
                  >
                    Reabrir Auditoría
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If GA Abogados user and no company selected, show Global Dashboard
  if (isGAAbogados && !companyId) {
    return (
      <div className="p-8 animate-fade-in max-w-7xl mx-auto pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              {context === 'DATA_PROTECTION' ? 'Vigilancia de Privacidad Global' : 'Vigilancia de Cumplimiento Global'}
            </h1>
            <p className="text-gray-500 mt-1">Vista consolidada de auditorías para toda la cartera de clientes.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vista Cuadrícula"
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vista Lista"
              >
                <List size={18} />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Buscar auditoría o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 w-64 shadow-sm"
              />
            </div>
            <button 
              onClick={() => onNavigate?.(ViewState.CLIENTS)}
              className="bg-white text-gray-700 border border-gray-100 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <Building2 size={18} /> Seleccionar Empresa
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-brand-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-primaryLight transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20"
            >
              <Plus size={18} /> Nueva Auditoría
            </button>
          </div>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
            <div className="p-4 bg-green-50 text-green-500 rounded-2xl">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900">{stats.completed}</h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Auditorías Finalizadas</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
            <div className="p-4 bg-yellow-50 text-yellow-500 rounded-2xl">
              <Clock size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900">{stats.inProgress}</h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">En Ejecución</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
            <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl">
              <Calendar size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900">{stats.upcoming}</h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Planificadas</p>
            </div>
          </div>
        </div>

        {/* Global List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Empresa</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Auditoría</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Hallazgos</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAudits.map((audit) => (
                <tr key={audit.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="font-bold text-gray-900">{getCompanyName(audit.companyId)}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-primary/5 text-brand-primary rounded-lg">
                        <FileCheck size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 group-hover:text-brand-primary transition-colors">{audit.title}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{audit.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      audit.status === 'Finalizada' ? 'bg-green-50 text-green-600' : 
                      audit.status === 'En Progreso' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {audit.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`font-bold ${audit.findings.length > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {audit.findings.length}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => setSelectedAuditId(audit.id)}
                      className="text-brand-primary font-bold text-xs hover:underline flex items-center gap-1 ml-auto"
                    >
                      Ver Detalles <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Fallback for non-GA Abogados users without companyId (should not happen normally)
  if (!companyId) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Building2 className="text-gray-300" size={40} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Seleccione una empresa</h3>
        <p className="text-gray-500 max-w-xs mx-auto mt-2 mb-6">
          Debe seleccionar una empresa desde el directorio de clientes para gestionar sus auditorías.
        </p>
        <button 
          onClick={() => onNavigate?.(ViewState.CLIENTS)}
          className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-primaryLight transition-all"
        >
          Ir a Clientes
        </button>
      </div>
    );
  }

  const currentCompany = allCompanies.find(c => c.id === companyId);

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-primary font-bold text-xs uppercase tracking-widest mb-1">
            <Building2 size={14} />
            {currentCompany?.name}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            {context === 'DATA_PROTECTION' ? 'Auditorías de Privacidad' : 'Plan de Auditoría'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}
              title="Vista Cuadrícula"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}
              title="Vista Lista"
            >
              <List size={18} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar auditoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 w-64 shadow-sm"
            />
          </div>
          {isGAAbogados && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-brand-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-primaryLight transition-all flex items-center gap-2"
            >
              + Nueva Auditoría
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
          <div className="p-4 bg-green-50 text-green-500 rounded-2xl group-hover:scale-110 transition-transform">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900">{stats.completed}</h2>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Completadas</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
          <div className="p-4 bg-yellow-50 text-yellow-500 rounded-2xl group-hover:scale-110 transition-transform">
            <Clock size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900">{stats.inProgress}</h2>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">En Ejecución</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
          <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
            <Calendar size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900">{stats.upcoming}</h2>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Planificadas</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAudits.map((audit) => (
            <div key={audit.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    audit.type === 'Interna' ? 'bg-blue-50 text-blue-600' : 
                    audit.type === 'Externa' ? 'bg-brand-light text-brand-secondary' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {audit.type}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-gray-400">{audit.id}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-primary transition-colors leading-tight">
                  {audit.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-4 text-gray-500">
                  <Building2 size={14} />
                  <span className="text-xs font-bold">{getCompanyName(audit.companyId)}</span>
                </div>

                <p className="text-sm text-gray-500 line-clamp-3 mb-6 leading-relaxed">
                  {audit.description || 'Sin descripción disponible.'}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estado</p>
                    <span className={`flex items-center gap-1.5 text-xs font-bold ${
                      audit.status === 'Finalizada' ? 'text-green-600' : 
                      audit.status === 'En Progreso' ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        audit.status === 'Finalizada' ? 'bg-green-500' : 
                        audit.status === 'En Progreso' ? 'bg-blue-500' : 'bg-orange-500'
                      }`} />
                      {audit.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Auditor</p>
                    <span className="text-xs font-bold text-gray-700 truncate block">
                      {audit.auditor}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between group-hover:bg-brand-primary/5 transition-colors">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={14} />
                  <span className="text-[10px] font-bold">{audit.startDate}</span>
                </div>
                <button 
                  onClick={() => setSelectedAuditId(audit.id)}
                  className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline"
                >
                  Ver Detalle <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Título / Tipo</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Auditor</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Fecha</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAudits.map((audit) => (
                <tr key={audit.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-primary/5 text-brand-primary rounded-lg">
                        <FileCheck size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-brand-primary transition-colors">{audit.title}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{audit.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-medium text-gray-600">{audit.auditor}</p>
                  </td>
                  <td className="px-8 py-5 text-center text-sm text-gray-500">
                    {audit.startDate}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      audit.status === 'Finalizada' ? 'bg-green-50 text-green-600' : 
                      audit.status === 'En Progreso' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {audit.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => setSelectedAuditId(audit.id)}
                      className="text-brand-primary font-bold text-xs hover:underline flex items-center gap-1 ml-auto"
                    >
                      Ver Detalles <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredAudits.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileCheck className="text-gray-300" size={40} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No se encontraron auditorías</h3>
          <p className="text-gray-500">No hay registros para los criterios seleccionados.</p>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Nueva Auditoría</h3>
                  <p className="text-xs text-gray-500">Planifique una nueva revisión para {currentCompany?.name}</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateAudit} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Empresa</label>
                    {companyId ? (
                      <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700">
                        {currentCompany?.name}
                      </div>
                    ) : (
                      <select 
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
                        value={newAudit.companyId}
                        onChange={(e) => setNewAudit({...newAudit, companyId: e.target.value})}
                      >
                        <option value="">Seleccionar empresa...</option>
                        {allCompanies.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Título de la Auditoría</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                      placeholder="Ej: Auditoría Anual de Protección de Datos 2026"
                      value={newAudit.title}
                      onChange={(e) => setNewAudit({...newAudit, title: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Tipo</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
                      value={newAudit.type}
                      onChange={(e) => setNewAudit({...newAudit, type: e.target.value as any})}
                    >
                      <option value="Interna">Interna</option>
                      <option value="Externa">Externa</option>
                      <option value="Certificación">Certificación</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Auditor / Entidad</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
                      placeholder="Ej: Deloitte, KPMG, Interno..."
                      value={newAudit.auditor}
                      onChange={(e) => setNewAudit({...newAudit, auditor: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Fecha de Inicio</label>
                    <input 
                      required
                      type="date"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
                      value={newAudit.startDate}
                      onChange={(e) => setNewAudit({...newAudit, startDate: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Alcance</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
                      placeholder="Ej: Procesos de TI, RRHH, Casa Matriz..."
                      value={newAudit.scope}
                      onChange={(e) => setNewAudit({...newAudit, scope: e.target.value})}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Descripción / Objetivos</label>
                    <textarea 
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none"
                      placeholder="Describa los objetivos principales de la auditoría..."
                      value={newAudit.description}
                      onChange={(e) => setNewAudit({...newAudit, description: e.target.value})}
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primaryLight transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={18} /> Crear Auditoría
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
