import React, { useMemo, useState } from 'react';
import { ViewState, Company } from '../types';
import { companyService, alertService, incidentService, dataInventoryService, arcoRequestService, dpiaService, calendarService, userService, trainingService } from '../services/db';
import { useUser } from '../contexts/UserContext';
import { 
  AlertCircle, 
  FileCheck, 
  Shield, 
  Users, 
  Scale, 
  Activity, 
  Calendar, 
  MessageSquare,
  ChevronRight,
  ArrowUpRight,
  Clock,
  Download,
  Filter,
  ArrowRight,
  TrendingUp,
  Globe,
  Briefcase,
  BarChart,
  Database,
  Building2,
  Plus,
  ExternalLink,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart as ReBarChart, 
  Bar,
  AreaChart,
  Area
} from 'recharts';

interface DashboardProps {
  onNavigate: (view: ViewState, itemId?: string, companyId?: string, tab?: string) => void;
  context: 'COMPLIANCE' | 'DATA_PROTECTION';
  userRole?: string;
  companyId?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, context, userRole, companyId }) => {
  const isDP = context === 'DATA_PROTECTION';
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'INVENTORY' | 'ARCO' | 'DPIA' | 'RAP' | 'EIPD' | 'PROCESSORS'>('OVERVIEW');
  const allCompanies = companyService.getAll();
  const { user } = useUser();
  
  if (!user) return null;
  
  const upcomingEvents = useMemo(() => {
    return calendarService.getAll(context).slice(0, 5);
  }, [context]);

  const allAlerts = useMemo(() => {
    const alerts = alertService.getAll();
    return alerts.filter(a => {
      if (isDP) return a.targetView === ViewState.DATA_PROTECTION;
      return a.targetView !== ViewState.DATA_PROTECTION;
    });
  }, [isDP]);

  const allIncidents = useMemo(() => {
    return incidentService.getAll(context);
  }, [context]);
  
  // Get company name dynamically
  const companyName = useMemo(() => {
    if (!companyId) return null;
    const company = allCompanies.find(c => c.id === companyId);
    return company ? company.name : null;
  }, [companyId, allCompanies]);

  // --- GLOBAL DASHBOARD DATA CALCULATIONS ---
  
  const stats = useMemo(() => {
    const total = allCompanies.length;
    const avgRisk = Math.round(allCompanies.reduce((acc, c) => acc + c.riskScore, 0) / total) || 0;
    const criticalFoci = allCompanies.filter(c => c.riskScore > 80).length;
    const activeAlerts = allAlerts.length;

    return {
      total,
      avgRisk,
      criticalFoci,
      activeAlerts
    };
  }, [allCompanies, allAlerts]);

  const riskDistribution = useMemo(() => {
    const counts = {
      Bajo: 0,
      Medio: 0,
      Alto: 0,
      Crítico: 0
    };

    allCompanies.forEach(c => {
      if (!c) return;
      if (c.riskScore < 30) counts.Bajo++;
      else if (c.riskScore < 60) counts.Medio++;
      else if (c.riskScore < 80) counts.Alto++;
      else counts.Crítico++;
    });

    return [
      { name: 'Bajo', value: counts.Bajo, color: '#10B981', percentage: Math.round((counts.Bajo / allCompanies.length) * 100) },
      { name: 'Medio', value: counts.Medio, color: '#F59E0B', percentage: Math.round((counts.Medio / allCompanies.length) * 100) },
      { name: 'Alto', value: counts.Alto, color: '#EF4444', percentage: Math.round((counts.Alto / allCompanies.length) * 100) },
      { name: 'Crítico', value: counts.Crítico, color: '#7f1d1d', percentage: Math.round((counts.Crítico / allCompanies.length) * 100) },
    ];
  }, [allCompanies]);

  const riskByIndustry = useMemo(() => {
    const industries: Record<string, { total: number, count: number }> = {};
    allCompanies.forEach(c => {
      if (!c || !c.industry) return;
      if (!industries[c.industry]) industries[c.industry] = { total: 0, count: 0 };
      industries[c.industry].total += c.riskScore;
      industries[c.industry].count++;
    });

    return Object.entries(industries)
      .map(([name, data]) => ({
        name,
        risk: Math.round(data.total / data.count)
      }))
      .sort((a, b) => b.risk - a.risk)
      .slice(0, 8);
  }, [allCompanies]);

  const topRiskCompanies = useMemo(() => {
    return [...allCompanies]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);
  }, [allCompanies]);

  const evolutionData = useMemo(() => {
    const months = ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'];
    const data = months.map((month, index) => {
      // Filter incidents for this month (simplified logic for mock)
      // In a real app, we'd use the actual dates.
      // Here we'll just use the index to vary the data.
      const monthIncidents = allIncidents.filter(i => {
        const incidentDate = new Date(i.date);
        return incidentDate.getMonth() === (index + 9) % 12; // Oct is 9
      }).length;

      // Base risk on average but add some variation
      const baseRisk = stats.avgRisk;
      const variation = Math.sin(index) * 5;
      
      return {
        name: month,
        incidentes: monthIncidents || (index * 2 + 5), // Fallback to some numbers if no incidents
        riesgo: Math.round(baseRisk + variation)
      };
    });
    return data;
  }, [allIncidents, stats.avgRisk]);

  // --- RENDER HELPERS ---

  const renderGlobalDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {isDP ? 'Visión General de Cartera - Privacidad' : 'Visión General de Cartera'}
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <TrendingUp size={16} className="text-brand-primary" />
            {isDP 
              ? 'Monitoreo agregado de cumplimiento de privacidad y gestión de brechas de datos.' 
              : 'Monitoreo agregado de cumplimiento normativo y gestión de riesgos.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm">
            <Download size={18} />
            Descargar Reporte Anual
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-primaryLight transition-all shadow-lg shadow-brand-primary/20">
            <Filter size={18} />
            Filtros Avanzados
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
              <Briefcase size={20} />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Cartera Total</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-gray-900">{stats.total}</span>
            <span className="text-xs font-bold text-green-500 flex items-center gap-0.5">
              <ArrowUpRight size={12} /> +3 este mes
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">47 clientes con servicios activos</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
            <div className="p-2 bg-brand-light text-brand-secondary rounded-xl">
              <Activity size={20} />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Riesgo Promedio</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-gray-900">{stats.avgRisk}</span>
            <span className="text-xs font-bold text-green-500 flex items-center gap-0.5">
              <TrendingUp size={12} className="rotate-180" /> -2% vs m.a.
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Puntaje agregado de cumplimiento</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
            <div className="p-2 bg-red-50 text-red-500 rounded-xl">
              <AlertCircle size={20} />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Foco Crítico</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-gray-900">{stats.criticalFoci}</span>
            <span className="text-xs font-bold text-red-500 flex items-center gap-0.5">
              <ArrowUpRight size={12} /> +1 hoy
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {isDP ? 'Clientes que requieren DPIA o auditoría inmediata' : 'Clientes que requieren auditoría inmediata'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-xl">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Alertas Activas</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-gray-900">{stats.activeAlerts}</span>
            <span className="text-xs font-bold text-orange-500">Nueva reglamentación</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Incidentes pendientes de resolución</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Evolution Chart */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-brand-primary" />
              Evolución de Riesgo de Cartera
            </h3>
            <select className="text-xs font-bold text-gray-400 bg-transparent border-none outline-none cursor-pointer hover:text-gray-600 transition-colors">
              <option>Últimos 6 meses</option>
              <option>Último año</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="riesgo" 
                  stroke="#f17551" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#f17551', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="incidentes" 
                  stroke="#F59E0B" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-400" />
              <span className="text-xs font-bold text-gray-500">Incidentes Activos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-brand-primary" />
              <span className="text-xs font-bold text-gray-500">Puntaje de Riesgo</span>
            </div>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-8">
            <Activity size={20} className="text-brand-primary" />
            Distribución de Riesgo
          </h3>
          <div className="h-[240px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-gray-900">{allCompanies.length}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clientes</span>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            {riskDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold text-gray-500">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-gray-900">{item.value}</span>
                  <span className="text-xs text-gray-400 w-10 text-right">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Risk Companies */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              Empresas con Mayor Exposición
            </h3>
            <button 
              onClick={() => onNavigate(ViewState.CLIENTS)}
              className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
            >
              Ver Todas <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {topRiskCompanies.map((company) => (
              <div 
                key={company.id}
                onClick={() => onNavigate(ViewState.DASHBOARD, undefined, company.id)}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                    {company?.name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-brand-primary transition-colors">{company?.name}</h4>
                    <p className="text-xs text-gray-400">{company?.industry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Riesgo</p>
                    <p className={`text-xl font-black ${company.riskScore > 80 ? 'text-red-600' : 'text-orange-500'}`}>
                      {company.riskScore}
                    </p>
                  </div>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-brand-primary transition-all group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk by Industry */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-8">
            <BarChart size={20} className="text-brand-primary" />
            Riesgo Promedio por Industria
          </h3>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={riskByIndustry} layout="vertical" margin={{ left: 40, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#4b5563' }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="risk" 
                  radius={[0, 8, 8, 0]} 
                  barSize={12}
                >
                  {riskByIndustry.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.risk > 75 ? '#ef4444' : entry.risk > 50 ? '#f59e0b' : '#10b981'} 
                    />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Surveillance Milestones */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Calendar size={20} className="text-brand-primary" />
              Hitos de Vigilancia Próximos
            </h3>
            <button 
              onClick={() => onNavigate(ViewState.CALENDAR, undefined, companyId)}
              className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
            >
              Ver Agenda <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div 
                key={event.id}
                onClick={() => onNavigate(ViewState.CALENDAR, undefined, event.companyId)}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer group"
              >
                <div className="flex flex-col items-center justify-center min-w-[50px] text-center border-r border-gray-100 pr-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {new Date(event.date).toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
                  </span>
                  <span className="text-xl font-black text-gray-900 leading-none mt-1">
                    {new Date(event.date).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 group-hover:text-brand-primary transition-colors truncate text-sm">
                    {event.title}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {user.isGAAbogados ? allCompanies.find(c => c.id === event.companyId)?.name : event.category}
                  </p>
                </div>
                <div className={`p-2 rounded-xl ${
                  event.status === 'Completado' ? 'bg-green-50 text-green-500' : 'bg-gray-50 text-gray-400'
                }`}>
                  {event.status === 'Completado' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompanyDashboard = () => {
    const companyTrainings = trainingService.getAll().filter(t => t.companyId === companyId && t.practiceArea === context);
    const avgTrainingCompletion = companyTrainings.length > 0 
      ? Math.round(companyTrainings.reduce((acc, t) => acc + t.completionRate, 0) / companyTrainings.length)
      : 84; // Fallback to 84 if no trainings

    if (isDP) {
      const companyInventory = dataInventoryService.getAll().filter(i => i.companyId === companyId);
      const companyArco = arcoRequestService.getAll().filter(a => a.companyId === companyId);
      const companyDpia = dpiaService.getAll().filter(d => d.companyId === companyId);
      const companyIncidents = allIncidents.filter(i => i.companyId === companyId);
      
      const company = allCompanies.find(c => c.id === companyId);
      const riskLevel = company?.riskScore ? (company.riskScore < 30 ? 'Bajo' : company.riskScore < 60 ? 'Medio' : 'Alto') : 'Bajo';

      return (
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                <div className="p-2 bg-brand-primary/10 rounded-lg">
                  <Shield className="text-brand-primary" size={24} />
                </div>
                Dashboard - Vigilancia Protección de datos
              </h1>
              <p className="text-gray-500 mt-1">
                Gestionando privacidad para <span className="font-bold text-brand-primary">{companyName}</span>.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm">
                <Download size={18} />
                Exportar RAT
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-primaryLight transition-all shadow-lg shadow-brand-primary/20">
                <Plus size={18} />
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
                  if (tab.id === 'OVERVIEW') setActiveTab('OVERVIEW');
                  else onNavigate(ViewState.DATA_PROTECTION, undefined, companyId, tab.id);
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

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-4 right-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">KPI</div>
              <div className="p-3 bg-blue-500 text-white rounded-xl w-fit mb-4">
                <Database size={24} />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Sistemas Registrados</p>
              <p className="text-4xl font-black text-gray-900">{companyInventory.length}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-4 right-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">KPI</div>
              <div className="p-3 bg-brand-secondary text-white rounded-xl w-fit mb-4">
                <Users size={24} />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Solicitudes ARCO</p>
              <p className="text-4xl font-black text-gray-900">{companyArco.length}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-4 right-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">KPI</div>
              <div className="p-3 bg-green-500 text-white rounded-xl w-fit mb-4">
                <Shield size={24} />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Brechas Reportadas</p>
              <p className="text-4xl font-black text-gray-900">{companyIncidents.length}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-4 right-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">KPI</div>
              <div className="p-3 bg-orange-500 text-white rounded-xl w-fit mb-4">
                <AlertCircle size={24} />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Riesgo General</p>
              <p className={`text-3xl font-black ${
                riskLevel === 'Bajo' ? 'text-green-500' : riskLevel === 'Medio' ? 'text-orange-500' : 'text-red-600'
              }`}>{riskLevel}</p>
            </div>
          </div>

          {/* Integrated Modules */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
              <div className="p-1.5 bg-brand-primary/10 rounded-lg">
                <Globe className="text-brand-primary" size={20} />
              </div>
              Módulos de Cumplimiento Integrados
            </h2>
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
                  onClick={() => onNavigate(mod.id, undefined, companyId)}
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

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* GDPR Compliance Status */}
            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Scale size={20} className="text-brand-primary" />
                  Estado de Cumplimiento GDPR / LOPDGDD
                </h3>
                <button className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-1">
                  Ver Reporte Completo <ExternalLink size={12} />
                </button>
              </div>
              <div className="space-y-8">
                {[
                  { label: 'Registro de Actividades de Tratamiento (RAT)', progress: 100, status: 'Completado', color: 'bg-green-500' },
                  { label: 'Evaluaciones de Impacto (DPIA)', progress: 75, status: 'En Proceso', color: 'bg-blue-500' },
                  { label: 'Contratos con Encargados del Tratamiento', progress: 85, status: 'Revisión', color: 'bg-blue-400' },
                  { label: 'Política de Privacidad y Cookies', progress: 100, status: 'Vigente', color: 'bg-green-500' },
                  { label: 'Protocolo de Brechas de Seguridad', progress: 100, status: 'Vigente', color: 'bg-green-500' },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-700">{item.label}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'Completado' || item.status === 'Vigente' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                      }`}>{item.status}</span>
                    </div>
                    <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent ARCO Requests */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-8">
                <Users size={20} className="text-brand-primary" />
                Solicitudes ARCO Recientes
              </h3>
              {companyArco.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400">
                  <Users size={48} className="opacity-10 mb-4" />
                  <p className="text-sm">No hay solicitudes recientes</p>
                  <button 
                    onClick={() => onNavigate(ViewState.DATA_PROTECTION, undefined, companyId)}
                    className="mt-4 text-xs font-bold text-brand-primary hover:underline"
                  >
                    Ver Todas las Solicitudes
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {companyArco.slice(0, 5).map((arco) => (
                    <div key={arco.id} className="p-4 rounded-2xl bg-gray-50/50 border border-gray-50 hover:border-brand-primary/20 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-gray-900">{arco.requesterName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          arco.status === 'Resuelto' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                        }`}>{arco.status}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 line-clamp-2">{arco.description}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{arco.requestType}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={10} /> {arco.requestDate}</span>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => onNavigate(ViewState.DATA_PROTECTION, undefined, companyId)}
                    className="w-full py-3 text-xs font-bold text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all border border-transparent hover:border-brand-primary/20"
                  >
                    Ver Todas las Solicitudes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Dashboard - Vigilancia Cumplimiento
          </h1>
          <p className="text-gray-500">
            Viendo datos específicos de <span className="font-bold text-brand-primary">{companyName}</span>.
          </p>
        </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-700">Estado General</h3>
              <p className="text-xs text-gray-400">Nivel de cumplimiento</p>
            </div>
          </div>
          <p className="text-4xl font-bold text-brand-primary">{avgTrainingCompletion}%</p>
          <div className="mt-4 h-2 bg-gray-50 rounded-full overflow-hidden">
            <div className="h-full bg-brand-primary rounded-full" style={{ width: `${avgTrainingCompletion}%` }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-brand-secondary/10 text-brand-secondary rounded-xl">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-700">Alertas Críticas</h3>
              <p className="text-xs text-gray-400">Requieren acción</p>
            </div>
          </div>
          <p className="text-4xl font-bold text-brand-secondary">12</p>
          <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
            <ArrowUpRight size={14} /> +2 desde ayer
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-700">Próximos Hitos</h3>
              <p className="text-xs text-gray-400">Próximos 7 días</p>
            </div>
          </div>
          <p className="text-4xl font-bold text-blue-500">5</p>
          <p className="text-sm text-gray-500 mt-2">Vencimiento más cercano: 48h</p>
        </div>
      </div>

      {/* Navigation Hub */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <div className="w-2 h-8 bg-brand-primary rounded-full" />
          Módulos de Gestión
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(isDP ? [
            { id: ViewState.DATA_PROTECTION, label: 'Inventario de Datos', desc: 'Gestión de activos y RAT', icon: <Shield size={24} />, color: 'bg-blue-500' },
            { id: ViewState.AUDITS, label: 'Auditorías de Privacidad', desc: 'Control y seguimiento', icon: <FileCheck size={24} />, color: 'bg-brand-secondary' },
            { id: ViewState.REGULATIONS, label: 'Normativa Privacidad', desc: 'LOPDGDD / GDPR', icon: <Scale size={24} />, color: 'bg-indigo-500' },
            { id: ViewState.CALENDAR, label: 'Agenda Privacidad', desc: 'Hitos y vencimientos', icon: <Calendar size={24} />, color: 'bg-green-500' },
          ] : [
            { id: ViewState.INCIDENTS, label: 'Gestión de Incidentes', desc: 'Reporte y seguimiento', icon: <AlertCircle size={24} />, color: 'bg-red-500' },
            { id: ViewState.AUDITS, label: 'Plan de Auditoría', desc: 'Ejecución y hallazgos', icon: <FileCheck size={24} />, color: 'bg-brand-secondary' },
            { id: ViewState.REGULATIONS, label: 'Biblioteca Normativa', desc: 'Regulaciones vigentes', icon: <Scale size={24} />, color: 'bg-indigo-500' },
            { id: ViewState.TRAINING, label: 'Capacitación', desc: 'Módulos y progreso', icon: <Users size={24} />, color: 'bg-orange-500' },
            { id: ViewState.RISK_CULTURE, label: 'Cultura y Riesgo', desc: 'Evaluaciones de madurez', icon: <Activity size={24} />, color: 'bg-emerald-500' },
            { id: ViewState.CALENDAR, label: 'Agenda Cumplimiento', desc: 'Calendario corporativo', icon: <Calendar size={24} />, color: 'bg-blue-500' },
          ]).map((mod) => (
            <button
              key={mod.id}
              onClick={() => onNavigate(mod.id, undefined, companyId)}
              className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-brand-primary hover:shadow-xl hover:-translate-y-1 transition-all text-left"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl text-white ${mod.color} shadow-lg group-hover:scale-110 transition-transform`}>
                  {mod.icon}
                </div>
                <div className="p-2 bg-gray-50 rounded-full text-gray-300 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                  <ChevronRight size={20} />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-brand-primary transition-colors">{mod.label}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{mod.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions / AI */}
      <div className="bg-brand-primary rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-brand-primary/20">
        <div className="max-w-xl">
          <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <MessageSquare className="text-brand-secondary" />
            Asistente NextLaw AI
          </h3>
          <p className="text-white/80">
            ¿Necesita ayuda con una normativa o el análisis de un incidente? Nuestro asistente inteligente está listo para ayudarle.
          </p>
        </div>
        <button 
          onClick={() => onNavigate(ViewState.AI_RECOMMENDATIONS, undefined, companyId)}
          className="bg-white text-brand-primary px-8 py-3 rounded-xl font-bold hover:bg-brand-secondary hover:text-white transition-all shadow-lg whitespace-nowrap"
        >
          Consultar a NextLaw AI
        </button>
      </div>
    </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {companyId ? renderCompanyDashboard() : renderGlobalDashboard()}
    </div>
  );
};
