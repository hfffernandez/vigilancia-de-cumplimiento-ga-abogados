import React, { useState, useMemo } from 'react';
import { 
  Library, 
  Search, 
  Filter, 
  ChevronRight, 
  ArrowRight,
  FileText,
  Scale,
  Building2,
  Calendar,
  AlertCircle,
  Download,
  ExternalLink,
  Tag,
  Globe,
  ArrowLeft,
  LayoutGrid,
  List
} from 'lucide-react';
import { regulationService, companyService } from '../services/db';
import { Regulation, RegulationType, Severity, ViewState } from '../types';

export const Regulations: React.FC<{ initialId?: string; context: string; companyId?: string; onNavigate?: (view: ViewState, itemId?: string, companyId?: string) => void }> = ({ initialId, context, companyId, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<RegulationType | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Vigente' | 'Derogada' | 'En Revisión'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const allRegulations = regulationService.getAll(context as any);
  const allCompanies = companyService.getAll();

  const filteredRegulations = useMemo(() => {
    return allRegulations.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'All' || r.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      const matchesCompany = !companyId || r.companyId === companyId || !r.companyId;
      return matchesSearch && matchesType && matchesStatus && matchesCompany;
    });
  }, [allRegulations, searchTerm, typeFilter, statusFilter, companyId]);

  const filteredCompanies = useMemo(() => {
    return allCompanies.filter(c => 
      c && (
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [allCompanies, searchTerm]);

  const selectedCompany = useMemo(() => 
    companyId ? allCompanies.find(c => c.id === companyId) : null
  , [companyId, allCompanies]);

  const renderDirectory = () => (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            {context === 'DATA_PROTECTION' ? 'Biblioteca de Protección de Datos' : 'Biblioteca Normativa'}
          </h1>
          <p className="text-gray-500 mt-1">
            Seleccione una empresa para ver su repositorio de {context === 'DATA_PROTECTION' ? 'privacidad y datos' : 'leyes y reglamentos'}.
          </p>
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
          const companyRegs = allRegulations.filter(r => r.companyId === company.id || !r.companyId);
          const criticalRegs = companyRegs.filter(r => r.criticality === Severity.CRITICAL).length;

          return (
            <div 
              key={company.id}
              onClick={() => onNavigate?.(ViewState.REGULATIONS, undefined, company.id)}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-brand-primary/10 text-brand-primary rounded-2xl group-hover:scale-110 transition-transform">
                    <Scale size={24} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Normativas</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">{companyRegs.length}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-brand-primary transition-colors">{company.name}</h3>
                <p className="text-xs text-gray-500 mb-6 flex items-center gap-1">
                  <Globe size={12} /> {company.industry}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-center">Críticas</p>
                    <p className="text-lg font-bold text-red-500 text-center">{criticalRegs}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-center">Vigentes</p>
                    <p className="text-lg font-bold text-green-600 text-center">{companyRegs.filter(r => r.status === 'Vigente').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 flex justify-between items-center group-hover:bg-brand-primary/5 transition-colors">
                <span className="text-xs font-bold text-brand-primary">Ver Biblioteca</span>
                <ChevronRight size={16} className="text-brand-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (!companyId) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Building2 className="text-gray-300" size={40} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Seleccione una empresa</h3>
        <p className="text-gray-500 max-w-xs mx-auto mt-2 mb-6">
          Debe seleccionar una empresa desde el directorio de clientes para acceder a su biblioteca normativa.
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

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto pb-24">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              {context === 'DATA_PROTECTION' ? 'Biblioteca de Protección de Datos' : 'Biblioteca Normativa'}
            </h1>
          </div>
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
          <button className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            <Download size={18} />
            Exportar
          </button>
          <button className="flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-primaryLight transition-all shadow-lg shadow-brand-primary/20">
            <Scale size={20} />
            Nueva Norma
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por título, código o palabra clave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none cursor-pointer"
            >
              <option value="All">Todos los tipos</option>
              <option value="Ley">Leyes</option>
              <option value="Reglamento">Reglamentos</option>
              <option value="Política Interna">Políticas Internas</option>
              <option value="Circular">Circulares</option>
            </select>
          </div>

          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none cursor-pointer"
            >
              <option value="All">Todos los estados</option>
              <option value="Vigente">Vigente</option>
              <option value="En Revisión">En Revisión</option>
              <option value="Derogada">Derogada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Regulations Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRegulations.map((reg) => (
            <div key={reg.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    reg.type === 'Ley' ? 'bg-blue-50 text-blue-600' : 
                    reg.type === 'Reglamento' ? 'bg-brand-light text-brand-secondary' : 
                    reg.type === 'Política Interna' ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-600'
                  }`}>
                    {reg.type}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-gray-400">{reg.code}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-primary transition-colors leading-tight">
                  {reg.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-4">
                  <Building2 size={14} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-500">{reg.agency}</span>
                </div>

                <p className="text-sm text-gray-500 line-clamp-3 mb-6 leading-relaxed">
                  {reg.summary || 'Sin resumen disponible para esta normativa.'}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estado</p>
                    <span className={`flex items-center gap-1.5 text-xs font-bold ${
                      reg.status === 'Vigente' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${reg.status === 'Vigente' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      {reg.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Criticidad</p>
                    <span className={`text-xs font-bold ${
                      reg.criticality === Severity.CRITICAL ? 'text-red-600' : 
                      reg.criticality === Severity.HIGH ? 'text-orange-600' : 'text-blue-600'
                    }`}>
                      {reg.criticality}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between group-hover:bg-brand-primary/5 transition-colors">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={14} />
                  <span className="text-[10px] font-bold">Rev: {reg.nextReview}</span>
                </div>
                <button className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline">
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
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Código / Título</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tipo</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Criticidad</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRegulations.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-primary/5 text-brand-primary rounded-lg">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono font-bold text-gray-400">{reg.code}</p>
                        <p className="font-bold text-gray-900 group-hover:text-brand-primary transition-colors">{reg.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-gray-600">{reg.type}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      reg.status === 'Vigente' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`text-xs font-bold ${
                      reg.criticality === Severity.CRITICAL ? 'text-red-600' : 
                      reg.criticality === Severity.HIGH ? 'text-orange-600' : 'text-blue-600'
                    }`}>
                      {reg.criticality}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-brand-primary font-bold text-xs hover:underline flex items-center gap-1 ml-auto">
                      Ver <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredRegulations.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Library className="text-gray-300" size={40} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No se encontraron normativas</h3>
          <p className="text-gray-500">Intenta con otros filtros o términos de búsqueda.</p>
        </div>
      )}
    </div>
  );
};
