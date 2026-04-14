import React, { useMemo, useState } from 'react';
import { incidentService, companyService } from '../services/db';
import { Incident, ViewState, Severity } from '../types';
import { 
  Clock, 
  User, 
  ChevronRight, 
  Columns, 
  LayoutGrid,
  Search,
  Plus,
  Building2,
  ArrowLeft,
  List,
  AlertTriangle,
  Shield,
  FileText,
  History,
  Users,
  BadgeAlert,
  Gavel,
  CheckCircle2,
  ExternalLink,
  Lock,
  Download,
  Filter,
  MoreVertical,
  Activity,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface IncidentsProps {
  initialId?: string;
  companyId?: string;
  context?: 'COMPLIANCE' | 'DATA_PROTECTION';
  onNavigate?: (view: ViewState, itemId?: string, companyId?: string) => void;
}

export const Incidents: React.FC<IncidentsProps> = ({ initialId, companyId, context, onNavigate }) => {
  const [searchTermIncident, setSearchTermIncident] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'grid' | 'list'>('kanban');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(initialId || null);
  const [activeTab, setActiveTab] = useState<'details' | 'evidence' | 'custody'>('details');

  const allIncidents = incidentService.getAll(context);
  const companies = companyService.getAll();

  const filteredIncidents = useMemo(() => {
    let incidents = allIncidents;
    if (companyId) {
      incidents = incidents.filter(i => i.companyId === companyId);
    }
    if (searchTermIncident) {
      incidents = incidents.filter(i => 
        i.title.toLowerCase().includes(searchTermIncident.toLowerCase()) ||
        i.description.toLowerCase().includes(searchTermIncident.toLowerCase()) ||
        i.id.toLowerCase().includes(searchTermIncident.toLowerCase()) ||
        (i.tags && i.tags.some(t => t.toLowerCase().includes(searchTermIncident.toLowerCase())))
      );
    }
    return incidents;
  }, [allIncidents, companyId, searchTermIncident]);

  const selectedIncident = useMemo(() => 
    selectedIncidentId ? allIncidents.find(i => i.id === selectedIncidentId) : null
  , [selectedIncidentId, allIncidents]);

  const selectedCompany = useMemo(() => 
    companyId ? companies.find(c => c.id === companyId) : null
  , [companyId, companies]);

  // --- Sub-components ---

  const SeverityBadge = ({ severity }: { severity: Severity | string }) => {
    const config = {
      [Severity.CRITICAL]: 'bg-red-500/10 text-red-600 border-red-500/20',
      [Severity.HIGH]: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      [Severity.MEDIUM]: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      [Severity.LOW]: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    };
    const style = config[severity as Severity] || 'bg-gray-100 text-gray-600 border-gray-200';
    return (
      <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border", style)}>
        {severity}
      </span>
    );
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const isClosed = status === 'Cerrada';
    return (
      <span className={cn(
        "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
        isClosed ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-gray-500/10 text-gray-600 border-gray-500/20"
      )}>
        {status}
      </span>
    );
  };

  // --- View: Dashboard (Phase 1) ---

  const renderDashboard = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-8 max-w-[1600px] mx-auto"
    >
      {/* Header Macro */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
              <Shield size={24} />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Tablero de Vigilancia</h1>
          </div>
          <p className="text-gray-500 font-medium">
            Supervisión macro de incidentes para <span className="text-brand-primary font-bold">{selectedCompany?.name || 'la Organización'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group/search">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/search:text-brand-primary transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Búsqueda semántica (ID, categoría, etiquetas)..."
              value={searchTermIncident}
              onChange={(e) => setSearchTermIncident(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-primary/5 w-80 shadow-sm transition-all placeholder:text-gray-300 font-medium"
            />
          </div>

          <div className="flex items-center bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50 backdrop-blur-sm">
            {[
              { id: 'kanban', icon: Columns, label: 'Board' },
              { id: 'grid', icon: LayoutGrid, label: 'Grid' },
              { id: 'list', icon: List, label: 'Table' }
            ].map((mode) => (
              <button 
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all",
                  viewMode === mode.id ? "bg-white text-brand-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <mode.icon size={16} />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 bg-brand-primary text-white px-8 py-4 rounded-2xl font-black hover:shadow-2xl hover:shadow-brand-primary/30 transition-all active:scale-95 group">
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            Reportar Incidente
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <AnimatePresence mode="wait">
        {viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {['Nueva', 'En Investigación', 'Escalada', 'Cerrada'].map((status, idx) => {
              const statusIncidents = filteredIncidents.filter(i => i.status === status);
              const colors = [
                'from-blue-500 to-indigo-600',
                'from-amber-400 to-orange-500',
                'from-rose-500 to-red-600',
                'from-emerald-500 to-teal-600'
              ];

              return (
                <div key={status} className="flex flex-col min-h-[700px]">
                  <div className="flex items-center justify-between mb-6 px-2">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-1.5 h-6 rounded-full bg-gradient-to-b", colors[idx])} />
                      <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">{status}</h3>
                    </div>
                    <span className="bg-white px-3 py-1 rounded-lg border border-gray-100 text-[10px] font-black text-gray-500 shadow-sm">
                      {statusIncidents.length}
                    </span>
                  </div>

                  <div className="bg-gray-50/50 rounded-[2.5rem] p-4 flex-1 border border-gray-200/50 shadow-inner space-y-4">
                    {statusIncidents.map((incident) => (
                      <motion.div
                        layoutId={incident.id}
                        key={incident.id}
                        onClick={() => setSelectedIncidentId(incident.id)}
                        className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand-primary/20 transition-all cursor-pointer group/card relative overflow-hidden"
                      >
                        {/* Severity Line */}
                        <div className={cn(
                          "absolute top-0 left-0 right-0 h-1.5",
                          incident.severity === Severity.CRITICAL ? "bg-red-500" :
                          incident.severity === Severity.HIGH ? "bg-orange-500" :
                          incident.severity === Severity.MEDIUM ? "bg-yellow-500" : "bg-blue-500"
                        )} />

                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-mono font-bold text-gray-300 tracking-tighter">#{incident.id}</span>
                          <SeverityBadge severity={incident.severity} />
                        </div>
                        
                        <h4 className="font-black text-gray-900 mb-3 group-hover/card:text-brand-primary transition-colors leading-tight line-clamp-2">
                          {incident.title}
                        </h4>
                        
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {incident.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-gray-50 text-[9px] font-bold text-gray-400 rounded-md border border-gray-100">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-100 to-gray-50 flex items-center justify-center border border-gray-200">
                              <User size={12} className="text-gray-400" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500">{incident.assignedTo}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-300">
                            <Clock size={10} />
                            <span className="text-[10px] font-bold tabular-nums">{incident.date.split(' ')[0]}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden min-h-[600px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-24">ID</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Incidente / Título</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Área</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Estado</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Severidad</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredIncidents.map((incident) => (
                  <tr 
                    key={incident.id} 
                    onClick={() => setSelectedIncidentId(incident.id)}
                    className="hover:bg-brand-primary/[0.02] transition-colors cursor-pointer group"
                  >
                    <td className="px-10 py-8 text-center">
                      <span className="text-[11px] font-mono font-bold text-gray-400 whitespace-nowrap">
                        {incident.id}
                      </span>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-primary/5 text-brand-primary rounded-2xl group-hover:scale-110 transition-transform">
                          <BadgeAlert size={20} />
                        </div>
                        <div>
                          <p className="font-black text-gray-900 group-hover:text-brand-primary transition-colors text-base">{incident.title}</p>
                          <p className="text-xs text-gray-400 font-medium line-clamp-1 max-w-sm mt-0.5">{incident.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <span className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-500 border border-gray-100">
                        {incident.category}
                      </span>
                    </td>
                    <td className="px-8 py-8 text-center">
                      <StatusBadge status={incident.status} />
                    </td>
                    <td className="px-8 py-8 text-center">
                      <SeverityBadge severity={incident.severity} />
                    </td>
                    <td className="px-8 py-8 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-[11px] font-black text-gray-800 tabular-nums">{incident.date}</span>
                        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">Última actualización</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // --- View: Dossier (Phase 2) ---

  const renderDossier = () => {
    if (!selectedIncident) return null;

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gray-50/50"
      >
        {/* Dossier Header */}
        <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40 backdrop-blur-md bg-white/80">
          <div className="max-w-[1600px] mx-auto px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setSelectedIncidentId(null)}
                className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all active:scale-90"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] bg-brand-primary/10 px-2 py-0.5 rounded-md">
                    Expediente de Investigación
                  </span>
                  <span className="text-[10px] font-mono font-bold text-gray-300">ID: {selectedIncident.id}</span>
                </div>
                <h1 className="text-2xl font-black text-gray-900 leading-none">{selectedIncident.title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 gap-2">
                <CheckCircle2 size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Integridad Probatoria Certificada</span>
              </div>
              <button className="p-3.5 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-200 transition-all">
                <Download size={20} />
              </button>
              <button className="px-6 py-3.5 bg-brand-primary text-white rounded-2xl font-black hover:bg-brand-primaryLight shadow-lg shadow-brand-primary/20 transition-all flex items-center gap-2">
                <Gavel size={20} />
                Emitir Dictamen
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-24">
          
          {/* Main Content Area (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Tabs Selector */}
            <div className="flex items-center gap-1 bg-white p-1.5 rounded-[2rem] border border-gray-100 shadow-sm w-fit">
              {[
                { id: 'details', label: 'Resumen Investigativo', icon: FileText },
                { id: 'evidence', label: 'Cuerpo de Evidencia', icon: Shield },
                { id: 'custody', label: 'Cadena de Custodia', icon: History }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-xs font-black transition-all",
                    activeTab === tab.id ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'details' && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                  {/* Executive Narrative */}
                  <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-gray-50 opacity-10">
                      <FileText size={120} />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                        <Activity className="text-brand-primary" size={24} />
                        Narrativa del Incidente
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed font-medium mb-10">
                        {selectedIncident.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-gray-50">
                        <div>
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Medidas Correctivas Adoptadas</h4>
                          <div className="p-6 bg-emerald-50/30 border border-emerald-100 rounded-3xl">
                            <p className="text-sm font-bold text-gray-700 leading-relaxed italic">
                              "{selectedIncident.correctiveMeasures || 'No definidas aún.'}"
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Marco de Cumplimiento / Certificación</h4>
                          <div className="flex items-center gap-4 p-6 bg-brand-primary/[0.03] border border-brand-primary/10 rounded-3xl">
                            <div className="p-3 bg-brand-primary text-white rounded-2xl shadow-lg shadow-brand-primary/20">
                              <BadgeAlert size={24} />
                            </div>
                            <div>
                              <p className="text-lg font-black text-brand-primary">{selectedIncident.certificationFrame || 'Estándar Corporativo'}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Protocolo de Verificación Validado</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Impact & Risk Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Riesgo Residual</p>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                          selectedIncident.residualRisk === Severity.CRITICAL ? "bg-red-500 shadow-red-500/20" :
                          selectedIncident.residualRisk === Severity.HIGH ? "bg-orange-500 shadow-orange-500/20" :
                          selectedIncident.residualRisk === Severity.MEDIUM ? "bg-yellow-500 shadow-yellow-500/20" : "bg-emerald-500 shadow-emerald-500/20"
                        )}>
                          <Zap size={24} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xl font-black text-gray-900">{selectedIncident.residualRisk || Severity.LOW}</p>
                          <p className="text-[10px] font-bold text-gray-400">Post-Mitigación</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm md:col-span-2">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Resumen de Seguimiento</p>
                       <div className="flex items-center gap-8">
                          <div className="flex flex-col">
                             <span className="text-2xl font-black text-gray-900">{selectedIncident.evidence.length}</span>
                             <span className="text-[10px] font-bold text-gray-400">Archivos Probatorios</span>
                          </div>
                          <div className="w-px h-10 bg-gray-100" />
                          <div className="flex flex-col">
                             <span className="text-2xl font-black text-gray-900">{selectedIncident.chainOfCustody.length}</span>
                             <span className="text-[10px] font-bold text-gray-400">Eventos en Cadena</span>
                          </div>
                          <div className="w-px h-10 bg-gray-100" />
                          <div className="flex flex-col">
                             <span className="text-2xl font-black text-gray-900">{selectedIncident.involvedParties.length}</span>
                             <span className="text-[10px] font-bold text-gray-400">Sujetos de Interés</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'evidence' && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                >
                  {selectedIncident.evidence.map((ev) => (
                    <div key={ev.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-lg overflow-hidden group hover:shadow-2xl transition-all border-b-4 border-b-brand-primary">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                        {ev.type === 'PDF' && <FileText size={48} className="text-red-400" />}
                        {ev.type === 'IMG' && <BadgeAlert size={48} className="text-blue-400" />}
                        {ev.type === 'DOC' && <FileText size={48} className="text-indigo-400" />}
                        <div className="absolute inset-0 bg-brand-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button className="p-3 bg-white text-brand-primary rounded-2xl shadow-xl active:scale-90 transition-all">
                            <Download size={20} />
                          </button>
                          <button className="p-3 bg-white text-brand-primary rounded-2xl shadow-xl active:scale-90 transition-all">
                            <ExternalLink size={20} />
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[9px] font-black px-2 py-0.5 bg-gray-50 text-gray-500 rounded border border-gray-100 uppercase">{ev.type}</span>
                          <span className="text-[9px] font-mono font-bold text-gray-300">#{ev.id}</span>
                        </div>
                        <h4 className="font-black text-gray-900 group-hover:text-brand-primary transition-colors text-sm truncate mb-4">{ev.name}</h4>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                          <div className="flex items-center gap-2">
                             <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                               <User size={10} className="text-gray-400" />
                             </div>
                             <span className="text-[10px] font-bold text-gray-400">{ev.uploadedBy}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-300 tabular-nums">{ev.uploadDate}</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[9px] font-mono text-emerald-500 bg-emerald-50 p-2 rounded-lg border border-emerald-100 overflow-hidden">
                           <Lock size={12} />
                           <span className="truncate">HASH: SHA256:{ev.hash || 'b45c2...'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Empty Slate Evidence */}
                  <div className="bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center group cursor-pointer hover:border-brand-primary/40 transition-colors">
                     <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="text-gray-300" size={32} />
                     </div>
                     <p className="text-sm font-black text-gray-400">Incorporar Nueva Prueba</p>
                     <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1">Estándar Forense</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'custody' && (
                <motion.div 
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 10 }}
                   className="bg-white rounded-[3rem] border border-gray-100 shadow-xl p-12"
                >
                   <div className="flex items-center justify-between mb-12">
                      <div>
                         <h3 className="text-xl font-black text-gray-900 mb-1">Trazabilidad Inalterable</h3>
                         <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Registros Cronológicos Firmados Digitalmente</p>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sincronizado</span>
                      </div>
                   </div>

                   <div className="relative space-y-12 before:absolute before:left-[1.625rem] before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-100">
                      {selectedIncident.chainOfCustody.map((event, i) => (
                        <div key={event.id} className="relative flex gap-8 pl-12 group">
                           {/* Timeline dot */}
                           <div className={cn(
                             "absolute left-0 top-1 w-14 h-14 rounded-full border-4 border-white shadow-xl flex items-center justify-center z-10 transition-transform group-hover:scale-110",
                             event.verified ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
                           )}>
                              {event.verified ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                           </div>

                           <div className="flex-1 pb-1">
                              <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
                                 <div>
                                    <h4 className="text-lg font-black text-gray-900 group-hover:text-brand-primary transition-colors">{event.action}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                       <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                                          <User size={12} /> {event.performer}
                                       </span>
                                       <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                       <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                                          <Clock size={12} /> {event.timestamp}
                                       </span>
                                    </div>
                                 </div>
                                 <div className="px-3 py-1 bg-gray-50 text-[10px] font-mono font-bold text-gray-400 rounded-full border border-gray-100">
                                    UUID: {event.id}
                                 </div>
                              </div>
                              <p className="text-sm text-gray-500 leading-relaxed max-w-2xl bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                                 {event.notes || 'Sin observaciones adicionales registradas.'}
                              </p>
                           </div>
                        </div>
                      ))}
                      
                      {/* Interactive Entry Point */}
                      <div className="relative flex gap-8 pl-12">
                         <div className="absolute left-0 top-1 w-14 h-14 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center z-10 text-gray-200">
                            <Plus size={24} />
                         </div>
                         <div className="flex-1 py-4">
                            <button className="text-sm font-black text-gray-300 uppercase tracking-widest hover:text-brand-primary transition-colors">
                               Añadir Evento a la Cadena...
                            </button>
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Side Panel Area (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Status & Severity Card */}
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl">
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Administración Legal</h3>
               
               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-2">Estado de la Investigación</label>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                       <StatusBadge status={selectedIncident.status} />
                       <MoreVertical size={16} className="text-gray-300" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-2">Estatus Legal</label>
                    <div className="p-4 bg-brand-primary/[0.02] rounded-2xl border border-brand-primary/10 flex items-center gap-3">
                       <Gavel className="text-brand-primary" size={20} />
                       <span className="text-sm font-black text-gray-800">{selectedIncident.legalStatus || 'Pendiente de Calificación'}</span>
                    </div>
                  </div>

                  <div>
                     <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-3">Sujetos Involucrados</label>
                     <div className="space-y-3">
                        {selectedIncident.involvedParties.map((party) => (
                          <div key={party.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-xl text-gray-500">
                                   <Users size={16} />
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-xs font-black text-gray-800 leading-none mb-1">{party.name}</span>
                                   <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{party.department}</span>
                                </div>
                             </div>
                             <span className={cn(
                               "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                               party.role === 'Investigado' ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-blue-50 text-blue-600 border-blue-100"
                             )}>
                               {party.role}
                             </span>
                          </div>
                        ))}
                        <button className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black text-gray-300 uppercase hover:bg-gray-50 hover:border-gray-200 transition-all">
                           <Plus size={14} /> Incorporar Sujeto
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            {/* AI Insights Card */}
            <div className="bg-gradient-to-br from-brand-primary to-brand-primaryLight p-8 rounded-[3.5rem] text-white shadow-2xl shadow-brand-primary/30 relative overflow-hidden group">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
                       <Zap size={24} className="text-yellow-300" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Asistente Judicial AI</span>
                  </div>
                  <h4 className="text-xl font-black mb-4 leading-tight">Análisis de Riesgo Residual</h4>
                  <p className="text-sm font-medium opacity-80 leading-relaxed mb-6">
                     Basado en incidentes similares en el sector <span className="underline decoration-yellow-300/50">{selectedCompany?.industry}</span>, existe una probabilidad del <span className="text-yellow-300 font-black">15%</span> de reactivación si no se refuerza el protocolo de acceso.
                  </p>
                  <button className="w-full py-3.5 bg-white text-brand-primary rounded-[1.5rem] text-xs font-black shadow-xl hover:scale-105 transition-all active:scale-95">
                     Generar Plan Proactivo
                  </button>
               </div>
            </div>

            {/* Reporting Date Card */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
               <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Reportado el</span>
                     <span className="text-sm font-black text-gray-900 tracking-tight">{selectedIncident.date}</span>
                  </div>
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                     <Clock size={20} className="text-gray-300" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (!companyId) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center font-sans">
        <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
          <Building2 className="text-gray-200" size={48} />
        </div>
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Acceso Restringido</h3>
        <p className="text-gray-400 max-w-xs mx-auto mt-2 mb-8 font-medium">
          Debe autenticar el acceso a una entidad corporativa para desplegar el tablero de vigilancia y peritaje.
        </p>
        <button 
          onClick={() => onNavigate?.(ViewState.CLIENTS)}
          className="bg-brand-primary text-white px-10 py-4 rounded-2xl font-black hover:bg-brand-primaryLight shadow-xl shadow-brand-primary/20 transition-all active:scale-95"
        >
          Ir al Directorio de Clientes
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfe] relative overflow-hidden font-sans selection:bg-brand-primary/10 selection:text-brand-primary">
      <AnimatePresence mode="wait">
        {selectedIncidentId ? renderDossier() : renderDashboard()}
      </AnimatePresence>
    </div>
  );
};
