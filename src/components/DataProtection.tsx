
import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Lock, Eye, FileCheck, AlertCircle, Users, Database, Globe, Scale, ExternalLink, Search, Filter, Download, Plus, Trash2, Edit2, ChevronRight, CheckCircle2, Clock, Activity, Building2, X, Calendar } from 'lucide-react';
import { DataInventory } from './DataInventory';
import { RapManagement } from './RapManagement';
import { ViewState, DataInventory as DataInventoryType, ArcoRequest, DpiaAssessment, Company, Evidence, RatEntry, EipdAssessment, DataProcessor } from '../types';
import { dataInventoryService, arcoRequestService, dpiaService, companyService, generateId, ratService, eipdService, dataProcessorService } from '../services/db';

interface DataProtectionProps {
  onNavigate?: (view: ViewState, itemId?: string, companyId?: string, tab?: string) => void;
  companyId?: string;
  initialTab?: 'OVERVIEW' | 'INVENTORY' | 'ARCO' | 'DPIA' | 'RAT' | 'EIPD' | 'PROCESSORS';
}

export const DataProtection: React.FC<DataProtectionProps> = ({ onNavigate, companyId, initialTab }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'INVENTORY' | 'ARCO' | 'DPIA' | 'RAP' | 'EIPD' | 'PROCESSORS'>(initialTab === 'RAT' ? 'RAP' : (initialTab || 'OVERVIEW'));
  const [inventory, setInventory] = useState<DataInventoryType[]>([]);
  const [arcoRequests, setArcoRequests] = useState<ArcoRequest[]>([]);
  const [dpiaAssessments, setDpiaAssessments] = useState<DpiaAssessment[]>([]);
  const [ratEntries, setRatEntries] = useState<RatEntry[]>([]);
  const [eipdAssessments, setEipdAssessments] = useState<EipdAssessment[]>([]);
  const [dataProcessors, setDataProcessors] = useState<DataProcessor[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArco, setSelectedArco] = useState<ArcoRequest | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<ArcoRequest>>({
    requesterName: '',
    requestType: 'Acceso',
    status: 'Pendiente',
    description: '',
    requestDate: new Date().toISOString().split('T')[0],
    deadlineDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const loadData = () => {
    let allInventory = dataInventoryService.getAll();
    let allArco = arcoRequestService.getAll();
    let allDpia = dpiaService.getAll();
    let allRat = ratService.getAll();
    let allEipd = eipdService.getAll();
    let allProcessors = dataProcessorService.getAll();
    
    if (companyId) {
      allInventory = allInventory.filter(i => i.companyId === companyId);
      allArco = allArco.filter(a => a.companyId === companyId);
      allDpia = allDpia.filter(d => d.companyId === companyId);
      allRat = allRat.filter(r => r.companyId === companyId);
      allEipd = allEipd.filter(e => e.companyId === companyId);
      allProcessors = allProcessors.filter(p => p.companyId === companyId);
    }

    setInventory(allInventory);
    setArcoRequests(allArco);
    setDpiaAssessments(allDpia);
    setRatEntries(allRat);
    setEipdAssessments(allEipd);
    setDataProcessors(allProcessors);
    setCompanies(companyService.getAll());
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name || 'Desconocida';

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => 
      c && (
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [companies, searchTerm]);

  const stats = [
    { label: 'Sistemas Registrados', value: inventory.length.toString(), icon: <Database size={20} />, color: 'bg-blue-500' },
    { label: 'Solicitudes ARCO', value: arcoRequests.length.toString(), icon: <Users size={20} />, color: 'bg-brand-secondary' },
    { label: 'Brechas Reportadas', value: '0', icon: <Shield size={20} />, color: 'bg-green-500' },
    { label: 'Riesgo General', value: 'Bajo', icon: <AlertCircle size={20} />, color: 'bg-yellow-500' },
  ];

  const renderDirectory = () => (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Vigilancia Protección de Datos</h1>
          <p className="text-gray-500 mt-1">Seleccione una empresa para gestionar su cumplimiento de privacidad.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => {
          const companyInventory = dataInventoryService.getAll().filter(i => i.companyId === company.id);
          const companyArco = arcoRequestService.getAll().filter(a => a.companyId === company.id);
          const pendingArco = companyArco.filter(a => a.status !== 'Resuelto').length;

          return (
            <div 
              key={company.id}
              onClick={() => onNavigate?.(ViewState.DATA_PROTECTION, undefined, company.id)}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-brand-primary/10 text-brand-primary rounded-2xl group-hover:scale-110 transition-transform">
                    <Shield size={24} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estado LOPD</span>
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[10px] font-bold">Vigente</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-brand-primary transition-colors">{company?.name}</h3>
                <p className="text-xs text-gray-500 mb-6 flex items-center gap-1">
                  <Globe size={12} /> {company?.industry}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-center">Sistemas</p>
                    <p className="text-lg font-bold text-gray-900 text-center">{companyInventory.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-center">ARCO Pend.</p>
                    <p className="text-lg font-bold text-brand-secondary text-center">{pendingArco}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 flex justify-between items-center group-hover:bg-brand-primary/5 transition-colors">
                <span className="text-xs font-bold text-brand-primary">Gestionar Privacidad</span>
                <ChevronRight size={16} className="text-brand-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (!companyId) {
    return renderDirectory();
  }

  const renderOverview = () => (
    <div className="space-y-8 animate-fade-in">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl text-white ${stat.color} shadow-lg group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">KPI</span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Integrated Modules Section - Only show if company context is selected */}
      {companyId && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-6">
            <Globe size={20} className="text-brand-primary" />
            Módulos de Cumplimiento Integrados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { id: ViewState.INCIDENTS, label: 'Incidentes', desc: 'Gestión de Brechas', icon: <AlertCircle size={20} />, color: 'bg-red-50 text-red-500' },
              { id: ViewState.TRAINING, label: 'Capacitaciones', desc: 'Formación en Privacidad', icon: <Users size={20} />, color: 'bg-blue-50 text-blue-500' },
              { id: ViewState.REGULATIONS, label: 'Normativas', desc: 'Biblioteca LOPD/GDPR', icon: <Scale size={20} />, color: 'bg-brand-light text-brand-secondary' },
              { id: ViewState.AUDITS, label: 'Auditorías', desc: 'Control de Privacidad', icon: <FileCheck size={20} />, color: 'bg-green-50 text-green-500' },
              { id: ViewState.RISK_CULTURE, label: 'Cultura', desc: 'Madurez de Privacidad', icon: <Activity size={20} />, color: 'bg-orange-50 text-orange-500' },
              { id: ViewState.CALENDAR, label: 'Agenda', desc: 'Calendario Privacidad', icon: <Calendar size={20} />, color: 'bg-blue-50 text-blue-600' },
            ].map((mod) => (
              <button
                key={mod.id}
                onClick={() => onNavigate?.(mod.id, undefined, companyId)}
                className="flex flex-col items-center justify-center p-5 rounded-2xl border border-gray-50 hover:border-brand-primary/20 hover:bg-gray-50/50 transition-all group text-center"
              >
                <div className={`p-3 rounded-xl ${mod.color} mb-3 group-hover:scale-110 transition-transform`}>
                  {mod.icon}
                </div>
                <h4 className="font-bold text-gray-900 group-hover:text-brand-primary transition-colors text-xs">{mod.label}</h4>
                <p className="text-[10px] text-gray-400 font-medium mt-1">{mod.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compliance Status */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Scale size={20} className="text-brand-primary" />
              Estado de Cumplimiento GDPR / LOPDGDD
            </h3>
            <button className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1">
              Ver Reporte Completo <ExternalLink size={12} />
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {[
                { label: 'Registro de Actividades de Tratamiento (RAT)', progress: 100, status: 'Completado' },
                { label: 'Evaluaciones de Impacto (DPIA)', progress: 85, status: 'En Proceso' },
                { label: 'Contratos con Encargados del Tratamiento', progress: 92, status: 'Revisión' },
                { label: 'Política de Privacidad y Cookies', progress: 100, status: 'Vigente' },
                { label: 'Protocolo de Brechas de Seguridad', progress: 100, status: 'Vigente' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'Completado' || item.status === 'Vigente' 
                        ? 'bg-green-50 text-green-600' 
                        : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        item.progress === 100 ? 'bg-green-500' : 'bg-brand-secondary'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent ARCO Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Users size={20} className="text-brand-primary" />
              Solicitudes ARCO Recientes
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {arcoRequests.slice(0, 3).map((req, i) => (
              <div key={i} className="p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-gray-800 group-hover:text-brand-primary transition-colors">{req.requesterName}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    req.status === 'Pendiente' ? 'bg-red-50 text-red-500' : 
                    req.status === 'En Trámite' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'
                  }`}>
                    {req.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-400">
                  <span>Derecho de {req.requestType}</span>
                  <span>{req.requestDate}</span>
                </div>
              </div>
            ))}
            <button 
              onClick={() => setActiveTab('ARCO')}
              className="w-full py-2 text-xs font-bold text-gray-500 hover:text-brand-primary transition-colors border-t border-gray-50 mt-2"
            >
              Ver Todas las Solicitudes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInventory = () => <DataInventory companyId={companyId} />;

  const renderArco = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
        <h3 className="font-bold text-gray-800">Gestión de Derechos ARCO</h3>
        <button 
          onClick={() => {
            setIsAdding(true);
            setSelectedArco(null);
            setFormData({
              requesterName: '',
              requestType: 'Acceso',
              status: 'Pendiente',
              description: '',
              requestDate: new Date().toISOString().split('T')[0],
              deadlineDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              companyId: companyId || companies[0]?.id
            });
            setIsModalOpen(true);
          }}
          className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
        >
          <Plus size={16} /> Nueva Solicitud
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Solicitante / Empresa</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Fecha Solicitud</th>
              <th className="px-6 py-4">Vencimiento</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {arcoRequests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{req.requesterName}</div>
                  <div className="text-xs text-gray-500">{getCompanyName(req.companyId)}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-brand-light text-brand-secondary rounded-lg text-[10px] font-bold">
                    {req.requestType}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{req.requestDate}</td>
                <td className="px-6 py-4 text-gray-600">{req.deadlineDate}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                    req.status === 'Resuelto' ? 'bg-green-50 text-green-600' : 
                    req.status === 'Pendiente' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => {
                      setSelectedArco(req);
                      setIsAdding(false);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-brand-primary transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDpia = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {dpiaAssessments.map((dpia) => (
        <div key={dpia.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl text-white ${
              dpia.riskLevel === 'Crítica' || dpia.riskLevel === 'Alta' ? 'bg-red-500' : 'bg-blue-500'
            } shadow-lg group-hover:scale-110 transition-transform`}>
              <FileCheck size={20} />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              dpia.status === 'Completado' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
            }`}>
              {dpia.status}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">{dpia.title}</h3>
          <p className="text-xs text-gray-500 mb-4">{getCompanyName(dpia.companyId)}</p>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Riesgo:</span>
              <span className={`font-bold ${
                dpia.riskLevel === 'Crítica' || dpia.riskLevel === 'Alta' ? 'text-red-500' : 'text-blue-500'
              }`}>{dpia.riskLevel}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Iniciado:</span>
              <span className="text-gray-600">{dpia.startDate}</span>
            </div>
          </div>
          <button className="w-full py-2 bg-gray-50 hover:bg-brand-primary hover:text-white text-gray-600 rounded-xl text-xs font-bold transition-all">
            Ver Evaluación
          </button>
        </div>
      ))}
      <button className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-brand-primary hover:text-brand-primary transition-all group">
        <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-sm">Nueva Evaluación (DPIA)</span>
      </button>
    </div>
  );

  const renderRap = () => (
    <RapManagement companyId={companyId} />
  );

  const renderEipd = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {eipdAssessments.map((eipd) => (
        <div key={eipd.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl text-white ${
              eipd.impact * eipd.probability > 15 ? 'bg-red-500' : 'bg-blue-500'
            } shadow-lg group-hover:scale-110 transition-transform`}>
              <Activity size={20} />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              eipd.approvalStatus === 'Aprobado' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
            }`}>
              {eipd.approvalStatus}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">{eipd.identifiedRisk}</h3>
          <p className="text-xs text-gray-500 mb-4">Sistema: {inventory.find(i => i.id === eipd.systemId)?.systemName || 'Desconocido'}</p>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Probabilidad:</span>
              <span className="font-bold text-gray-700">{eipd.probability}/5</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Impacto:</span>
              <span className="font-bold text-gray-700">{eipd.impact}/5</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Riesgo Inherente:</span>
              <span className={`font-bold ${eipd.impact * eipd.probability > 15 ? 'text-red-500' : 'text-orange-500'}`}>
                {eipd.impact * eipd.probability}
              </span>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl text-[10px] text-gray-500 mb-4 border border-gray-100">
            <span className="font-bold block mb-1">Mitigación:</span>
            {eipd.mitigationMeasure}
          </div>
          <button className="w-full py-2 bg-gray-50 hover:bg-brand-primary hover:text-white text-gray-600 rounded-xl text-xs font-bold transition-all">
            Ver EIPD Completa
          </button>
        </div>
      ))}
      <button className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-brand-primary hover:text-brand-primary transition-all group">
        <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-sm">Nueva EIPD</span>
      </button>
    </div>
  );

  const renderProcessors = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
        <h3 className="font-bold text-gray-800">Terceros Encargados del Tratamiento</h3>
        <button className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
          <Plus size={16} /> Nuevo Encargado
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Razón Social</th>
              <th className="px-6 py-4">Servicio</th>
              <th className="px-6 py-4">DPA Firmado</th>
              <th className="px-6 py-4">Transf. Internacional</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {dataProcessors.map((proc) => (
              <tr key={proc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{proc.businessName}</td>
                <td className="px-6 py-4 text-gray-600">{proc.service}</td>
                <td className="px-6 py-4">
                  {proc.dpaSigned ? (
                    <span className="flex items-center gap-1 text-green-600 font-bold text-[10px]">
                      <CheckCircle2 size={14} /> SÍ
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600 font-bold text-[10px]">
                      <X size={14} /> NO
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {proc.internationalTransfer ? (
                    <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-bold">REQUERIDA</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-bold">NO</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-gray-400 hover:text-brand-primary transition-colors">
                    <Edit2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-8 pb-20 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-brand-primary text-white rounded-xl shadow-lg">
              <Shield size={28} />
            </div>
            Dashboard - Vigilancia Protección de datos
          </h1>
          <p className="text-gray-500 mt-1">
            {companyId ? `Gestionando privacidad para ${getCompanyName(companyId)}.` : 'Gestión integral de privacidad y cumplimiento normativo (GDPR/LOPDGDD).'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm">
            <Download size={16} />
            Exportar RAT
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-primaryLight transition-all shadow-lg shadow-brand-primary/20">
            <Plus size={16} />
            Nueva Evaluación
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl mb-8 w-fit border border-gray-100 overflow-x-auto max-w-full">
        {[
          { id: 'OVERVIEW', label: 'Vista General', icon: <Globe size={16} /> },
          { id: 'INVENTORY', label: 'Inventario', icon: <Database size={16} /> },
          { id: 'RAP', label: 'RAP', icon: <Scale size={16} /> },
          { id: 'ARCO', label: 'ARCO', icon: <Users size={16} /> },
          { id: 'EIPD', label: 'EIPD', icon: <Activity size={16} /> },
          { id: 'DPIA', label: 'DPIA', icon: <FileCheck size={16} /> },
          { id: 'PROCESSORS', label: 'Encargados', icon: <Building2 size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              onNavigate?.(ViewState.DATA_PROTECTION, undefined, companyId, tab.id);
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white text-brand-primary shadow-sm' 
                : 'text-gray-500 hover:text-brand-primary hover:bg-white/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'OVERVIEW' && renderOverview()}
      {activeTab === 'INVENTORY' && renderInventory()}
      {activeTab === 'RAP' && renderRap()}
      {activeTab === 'ARCO' && renderArco()}
      {activeTab === 'EIPD' && renderEipd()}
      {activeTab === 'DPIA' && renderDpia()}
      {activeTab === 'PROCESSORS' && renderProcessors()}

      {/* ARCO Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="text-brand-primary" size={24} />
                {isAdding ? 'Nueva Solicitud ARCO' : 'Detalle de Solicitud ARCO'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {isAdding ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nombre del Solicitante</label>
                      <input 
                        type="text"
                        value={formData.requesterName}
                        onChange={(e) => setFormData({...formData, requesterName: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Empresa</label>
                      <select 
                        value={formData.companyId}
                        onChange={(e) => setFormData({...formData, companyId: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                        disabled={!!companyId}
                      >
                        {companies.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tipo de Derecho</label>
                      <select 
                        value={formData.requestType}
                        onChange={(e) => setFormData({...formData, requestType: e.target.value as any})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                      >
                        <option value="Acceso">Acceso</option>
                        <option value="Rectificación">Rectificación</option>
                        <option value="Cancelación">Cancelación</option>
                        <option value="Oposición">Oposición</option>
                        <option value="Portabilidad">Portabilidad</option>
                        <option value="Limitación">Limitación</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Estado</label>
                      <select 
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Trámite">En Trámite</option>
                        <option value="Resuelto">Resuelto</option>
                        <option value="Rechazado">Rechazado</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fecha de Solicitud</label>
                      <input 
                        type="date"
                        value={formData.requestDate}
                        onChange={(e) => setFormData({...formData, requestDate: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fecha Límite</label>
                      <input 
                        type="date"
                        value={formData.deadlineDate}
                        onChange={(e) => setFormData({...formData, deadlineDate: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Descripción de la Solicitud</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all h-32 resize-none"
                      placeholder="Detalle los requerimientos del titular..."
                    />
                  </div>
                </div>
              ) : selectedArco && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Solicitante</p>
                      <p className="text-lg font-bold text-gray-900">{selectedArco.requesterName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Empresa</p>
                      <p className="text-lg font-bold text-gray-900">{getCompanyName(selectedArco.companyId)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-8">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tipo de Derecho</p>
                      <span className="px-3 py-1 bg-brand-light text-brand-secondary rounded-full text-xs font-bold">
                        {selectedArco.requestType}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estado</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        selectedArco.status === 'Resuelto' ? 'bg-green-50 text-green-600' : 
                        selectedArco.status === 'Pendiente' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {selectedArco.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vencimiento</p>
                      <p className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        <Clock size={14} className="text-brand-secondary" />
                        {selectedArco.deadlineDate}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Descripción</p>
                    <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-600 leading-relaxed border border-gray-100">
                      {selectedArco.description}
                    </div>
                  </div>

                  {selectedArco.resolution && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Resolución</p>
                      <div className="p-4 bg-green-50/30 rounded-2xl text-sm text-gray-700 leading-relaxed border border-green-100">
                        {selectedArco.resolution}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-white transition-all border border-transparent hover:border-gray-200"
              >
                {isAdding ? 'Cancelar' : 'Cerrar'}
              </button>
              {isAdding && (
                <button 
                  onClick={() => {
                    if (!formData.requesterName || !formData.description) return;
                    const newRequest: ArcoRequest = {
                      ...formData as ArcoRequest,
                      id: generateId('ARCO'),
                      companyId: formData.companyId || companyId || companies[0]?.id || ''
                    };
                    arcoRequestService.add(newRequest);
                    loadData();
                    setIsModalOpen(false);
                  }}
                  className="px-8 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primaryLight transition-all shadow-lg shadow-brand-primary/20"
                >
                  Guardar Solicitud
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
