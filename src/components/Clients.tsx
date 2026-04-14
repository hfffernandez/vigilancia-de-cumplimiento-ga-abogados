import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  LayoutGrid, 
  List, 
  ChevronRight, 
  Building2, 
  AlertCircle, 
  GraduationCap, 
  Trash2,
  MoreVertical,
  Globe,
  ArrowLeft,
  Columns,
  Clock,
  User,
  ShieldAlert,
  FileText,
  Scale,
  Users,
  Activity,
  Calendar,
  Edit2,
  X,
  Mail,
  Phone,
  MapPin,
  FileCheck,
  Info,
  CheckCircle2,
  AlertTriangle,
  Camera
} from 'lucide-react';
import { companyService, trainingService, alertService, incidentService, generateId } from '../services/db';
import { Company, ViewState, Incident } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ClientsProps {
  context: string;
  onNavigate?: (view: ViewState, itemId?: string, companyId?: string) => void;
  selectedCompanyId: string | null;
  onSelectCompany: (id: string | null) => void;
}

export const Clients: React.FC<ClientsProps> = ({ context, onNavigate, selectedCompanyId, onSelectCompany }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState<'MANAGEMENT' | 'PROFILE'>('MANAGEMENT');
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState<Partial<Company>>({
    name: '',
    industry: '',
    status: 'Activo',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    description: '',
    logo: ''
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          logo: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const loadCompanies = useCallback(() => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setCompanies(companyService.getAll());
      setIsLoading(false);
    }, 600);
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);
  const allTrainings = trainingService.getAll(context as any);
  const allAlerts = alertService.getAll();

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => 
      c && (
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [companies, searchQuery]);

  const selectedCompany = useMemo(() => 
    selectedCompanyId ? companies.find(c => c.id === selectedCompanyId) : null
  , [selectedCompanyId, companies]);

  // Helper to get stats for a company
  const getCompanyStats = (companyId: string) => {
    const companyTrainings = allTrainings.filter(t => t.companyId === companyId);
    const avgCompletion = companyTrainings.length > 0 
      ? Math.round(companyTrainings.reduce((acc, t) => acc + t.completionRate, 0) / companyTrainings.length)
      : 0;
    
    const companyName = companies.find(c => c.id === companyId)?.name;
    const companyAlerts = allAlerts.filter(a => a.company === companyName).length;

    return {
      avgCompletion,
      alertCount: companyAlerts
    };
  };

  const handleOpenModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setFormData(company);
    } else {
      setEditingCompany(null);
      setFormData({
        name: '',
        industry: '',
        status: 'Activo',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        description: '',
        logo: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.industry) return;

    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      if (editingCompany) {
        companyService.update(editingCompany.id, formData);
      } else {
        companyService.add({
          ...formData,
          id: generateId('COMP'),
          riskScore: 0,
          activeAlerts: 0
        } as Company);
      }
      setCompanies(companyService.getAll());
      setIsLoading(false);
      setIsModalOpen(false);
    }, 800);
  };

  const handleDelete = () => {
    if (companyToDelete) {
      setIsLoading(true);
      // Simulate API delay
      setTimeout(() => {
        companyService.delete(companyToDelete.id);
        setCompanies(companyService.getAll());
        setIsLoading(false);
        setIsDeleteModalOpen(false);
        setCompanyToDelete(null);
        if (selectedCompanyId === companyToDelete.id) {
          onSelectCompany(null);
        }
      }, 800);
    }
  };

  if (selectedCompanyId && selectedCompany) {
    const managementModules = [
      { id: ViewState.INCIDENTS, title: 'Gestión de Incidentes', desc: 'Reporte y seguimiento', icon: <AlertCircle size={24} />, color: 'bg-red-500' },
      { id: ViewState.AUDITS, title: 'Plan de Auditoría', desc: 'Ejecución y hallazgos', icon: <FileText size={24} />, color: 'bg-brand-secondary' },
      { id: ViewState.REGULATIONS, title: 'Biblioteca Normativa', desc: 'Regulaciones vigentes', icon: <Scale size={24} />, color: 'bg-blue-600' },
      { id: ViewState.TRAINING, title: 'Capacitación', desc: 'Módulos y progreso', icon: <Users size={24} />, color: 'bg-orange-500' },
      { id: ViewState.RISK_CULTURE, title: 'Cultura y Riesgo', desc: 'Evaluaciones de madurez', icon: <Activity size={24} />, color: 'bg-emerald-500' },
      { id: ViewState.CALENDAR, title: 'Agenda Cumplimiento', desc: 'Calendario corporativo', icon: <Calendar size={24} />, color: 'bg-blue-500' },
    ];

    return (
      <div className="p-8 animate-fade-in max-w-7xl mx-auto">
        {/* Detail Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden">
                {selectedCompany.logo ? (
                  <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Building2 className="text-brand-primary/20" size={40} />
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{selectedCompany.name}</h1>
                <p className="text-gray-500 font-medium">{selectedCompany.industry}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl border border-gray-100">
            <button 
              onClick={() => setActiveTab('MANAGEMENT')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'MANAGEMENT' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Gestión
            </button>
            <button 
              onClick={() => setActiveTab('PROFILE')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'PROFILE' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Perfil de Empresa
            </button>
          </div>
        </div>

        {activeTab === 'MANAGEMENT' ? (
          <div className="bg-gray-50/50 rounded-[32px] p-10 border border-gray-100">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-1.5 h-8 bg-brand-secondary rounded-full" />
              <h2 className="text-2xl font-bold text-gray-800">Módulos de Gestión</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {managementModules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => onNavigate?.(mod.id, undefined, selectedCompanyId)}
                  className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-50 hover:shadow-xl hover:-translate-y-1 transition-all text-left flex flex-col group relative"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className={`p-4 rounded-2xl text-white ${mod.color} shadow-lg group-hover:scale-110 transition-transform`}>
                      {mod.icon}
                    </div>
                    <div className="p-2 rounded-full bg-gray-50 text-gray-300 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-primary transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-gray-400 font-medium">
                    {mod.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Info className="text-brand-primary" size={20} />
                    Información General
                  </h3>
                  <button 
                    onClick={() => handleOpenModal(selectedCompany)}
                    className="flex items-center gap-2 text-brand-primary font-bold hover:underline"
                  >
                    <Edit2 size={16} />
                    Editar Perfil
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Razón Social</p>
                    <p className="text-lg font-bold text-gray-900">{selectedCompany.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">RUT / Tax ID</p>
                    <p className="text-lg font-bold text-gray-900">{selectedCompany.taxId || 'No registrado'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Industria</p>
                    <p className="text-lg font-bold text-gray-900">{selectedCompany.industry}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estado</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedCompany.status === 'Activo' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {selectedCompany.status}
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Descripción</p>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedCompany.description || 'Sin descripción disponible.'}
                  </p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                  <MapPin className="text-brand-primary" size={20} />
                  Contacto y Ubicación
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Persona de Contacto</p>
                      <p className="font-bold text-gray-900">{selectedCompany.contactPerson}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Correo Electrónico</p>
                      <p className="font-bold text-gray-900">{selectedCompany.email || 'No registrado'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Teléfono</p>
                      <p className="font-bold text-gray-900">{selectedCompany.phone || 'No registrado'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dirección</p>
                      <p className="font-bold text-gray-900">{selectedCompany.address || 'No registrado'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-brand-primary rounded-[2.5rem] p-8 text-white shadow-xl shadow-brand-primary/20">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-4">Puntaje de Riesgo</p>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-6xl font-black">{selectedCompany.riskScore}</span>
                  <span className="text-xl font-bold mb-2 opacity-60">/ 100</span>
                </div>
                <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-brand-secondary h-full transition-all duration-1000" 
                    style={{ width: `${selectedCompany.riskScore}%` }}
                  />
                </div>
                <p className="mt-4 text-sm text-white/80 leading-relaxed">
                  Basado en incidentes reportados, brechas de cumplimiento y resultados de auditoría.
                </p>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Acciones de Cuenta</h3>
                <button 
                  onClick={() => {
                    setCompanyToDelete(selectedCompany);
                    setIsDeleteModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-red-50 text-red-500 font-bold hover:bg-red-50 transition-all"
                >
                  <Trash2 size={20} />
                  Eliminar Empresa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <span>Resumen</span>
            <ChevronRight size={14} />
            <span className="font-medium text-brand-primary">Empresas Cliente</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Directorio de Empresas</h1>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-primaryLight transition-all shadow-lg shadow-brand-primary/20 self-start md:self-center"
        >
          <Plus size={20} />
          Agregar Empresa
        </button>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar empresa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
          />
        </div>

        <div className="flex items-center bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <LayoutGrid size={20} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCompanies.map((company) => {
            const stats = getCompanyStats(company.id);
            return (
              <div key={company.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                {/* Status Indicator Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${company.status === 'Activo' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-brand-primary/5 text-brand-primary rounded-2xl group-hover:scale-110 transition-transform flex items-center justify-center overflow-hidden">
                      {company.logo ? (
                        <img src={company.logo} alt={company?.name || 'Empresa'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Building2 size={28} />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        company.status === 'Activo' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                      }`}>
                        {company.status}
                      </span>
                      <div className="relative group/menu">
                        <button className="text-gray-300 hover:text-gray-600 transition-colors p-1">
                          <MoreVertical size={18} />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                          <button 
                            onClick={() => handleOpenModal(company)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit2 size={14} /> Editar
                          </button>
                          <button 
                            onClick={() => {
                              setCompanyToDelete(company);
                              setIsDeleteModalOpen(true);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-brand-primary transition-colors truncate">
                      {company?.name}
                    </h3>
                    <p className="text-gray-400 font-medium">{company.industry}</p>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nivel de Riesgo</p>
                      <div className="flex items-center gap-2">
                        <ActivityIcon score={company.riskScore} />
                        <span className="text-2xl font-bold text-gray-700">{company.riskScore}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-red-50/50 p-2 rounded-xl border border-red-50">
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertCircle size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Alertas</span>
                        </div>
                        <span className="font-bold text-red-600">{stats.alertCount}</span>
                      </div>
                      <div className="flex items-center justify-between bg-blue-50/50 p-2 rounded-xl border border-blue-50">
                        <div className="flex items-center gap-2 text-blue-600">
                          <GraduationCap size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Training</span>
                        </div>
                        <span className="font-bold text-blue-600">{stats.avgCompletion}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold">
                        {company.contactPerson?.split(' ').map(n => n[0]).join('') || '?'}
                      </div>
                      <span className="text-xs font-medium">{company.contactPerson || 'Sin contacto'}</span>
                    </div>
                    <button 
                      onClick={() => onNavigate?.(ViewState.DASHBOARD, undefined, company.id)}
                      className="text-brand-primary font-bold text-sm hover:underline flex items-center gap-1"
                    >
                      Ver Dashboard
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-bottom border-gray-100">
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Empresa</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Industria</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Riesgo</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Alertas</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Training</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCompanies.map((company) => {
                const stats = getCompanyStats(company.id);
                return (
                  <tr key={company.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-primary/5 text-brand-primary rounded-lg flex items-center justify-center overflow-hidden">
                          {company.logo ? (
                            <img src={company.logo} alt={company?.name || 'Empresa'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <Building2 size={18} />
                          )}
                        </div>
                        <span className="font-bold text-gray-900 group-hover:text-brand-primary transition-colors">{company?.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-500">{company.industry}</td>
                    <td className="px-8 py-5 text-center">
                      <span className={`font-bold ${company.riskScore > 70 ? 'text-red-500' : company.riskScore > 40 ? 'text-yellow-500' : 'text-green-500'}`}>
                        {company.riskScore}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${stats.alertCount > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
                        {stats.alertCount}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                        {stats.avgCompletion}%
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        company.status === 'Activo' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                      }`}>
                        {company.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onNavigate?.(ViewState.DASHBOARD, undefined, company.id)}
                          className="p-2 text-gray-400 hover:text-brand-primary transition-colors"
                          title="Ver Dashboard"
                        >
                          <Activity size={20} />
                        </button>
                        <button 
                          onClick={() => handleOpenModal(company)}
                          className="p-2 text-gray-400 hover:text-brand-primary transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button 
                          onClick={() => {
                            setCompanyToDelete(company);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-[2px] z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
            <p className="text-brand-primary font-bold animate-pulse">Procesando...</p>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-brand-primary/10 rounded-lg">
                    <Building2 className="text-brand-primary" size={24} />
                  </div>
                  {editingCompany ? 'Editar Empresa' : 'Nueva Empresa'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group-hover:border-brand-primary transition-colors">
                      {formData.logo ? (
                        <img src={formData.logo} alt="Logo preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Building2 className="text-gray-300" size={32} />
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="text-white" size={24} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                      </label>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 text-center">Logo Empresa</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nombre de la Empresa / Razón Social</label>
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                      placeholder="Ej: Corporación Alpha S.A."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Industria</label>
                    <input 
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                      placeholder="Ej: Tecnología, Retail..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">RUT / Tax ID</label>
                    <input 
                      type="text"
                      value={formData.taxId}
                      onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                      placeholder="Ej: 76.123.456-7"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Persona de Contacto</label>
                    <input 
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                      placeholder="Nombre del responsable"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Estado</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                      <option value="Onboarding">Onboarding</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Correo Electrónico</label>
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                      placeholder="contacto@empresa.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Teléfono</label>
                    <input 
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                      placeholder="+56 9 ..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Dirección</label>
                    <input 
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                      placeholder="Dirección comercial"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Descripción de la Empresa</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all h-32 resize-none"
                      placeholder="Breve descripción de la actividad comercial..."
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-white transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  className="px-8 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primaryLight transition-all shadow-lg shadow-brand-primary/20"
                >
                  {editingCompany ? 'Guardar Cambios' : 'Crear Empresa'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Eliminar Empresa?</h3>
                <p className="text-gray-500 leading-relaxed mb-8">
                  Esta acción eliminará permanentemente a <span className="font-bold text-gray-900">{companyToDelete?.name}</span> y todos sus datos asociados. Esta acción no se puede deshacer.
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleDelete}
                    className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                  >
                    Sí, eliminar permanentemente
                  </button>
                  <button 
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setCompanyToDelete(null);
                    }}
                    className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ActivityIcon: React.FC<{ score: number }> = ({ score }) => {
  const color = score > 70 ? 'text-red-500' : score > 40 ? 'text-yellow-500' : 'text-green-500';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={color}>
      <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};
