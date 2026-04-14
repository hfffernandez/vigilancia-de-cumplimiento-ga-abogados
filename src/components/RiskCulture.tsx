import React, { useState, useMemo, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  ChevronRight, 
  ArrowRight,
  Building2,
  Users,
  Target,
  TrendingUp,
  FileText,
  Filter,
  ArrowLeft,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
  Bell,
  Globe,
  MoreHorizontal,
  Download,
  Share2,
  MessageSquare
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { assessmentService, companyService } from '../services/db';
import { Company, RiskAssessment, ViewState, Severity } from '../types';

export const RiskCulture: React.FC<{ context: string; companyId?: string; onNavigate?: (view: ViewState, itemId?: string, companyId?: string) => void }> = ({ context, companyId, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'DIRECTORY' | 'DASHBOARD' | 'HISTORY'>(companyId ? 'DASHBOARD' : 'DIRECTORY');
  
  // Sincronizar vista activa cuando cambia la empresa desde el padre
  useEffect(() => {
    if (companyId) {
      setActiveView('DASHBOARD');
      setSelectedAssessmentId(null); // Reset to latest
    } else {
      setActiveView('DIRECTORY');
    }
  }, [companyId]);
  
  const allAssessments = assessmentService.getAll(context as any);
  const allCompanies = companyService.getAll();

  const currentCompany = useMemo(() => 
    companyId ? allCompanies.find(c => c.id === companyId) : null
  , [companyId, allCompanies]);

  const filteredCompanies = useMemo(() => {
    return allCompanies.filter(c => 
      c && (
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [allCompanies, searchTerm]);

  const companyAssessments = useMemo(() => {
    if (companyId) {
      return allAssessments.filter(a => a.companyId === companyId);
    }
    return [];
  }, [allAssessments, companyId]);

  const selectedAssessment = useMemo(() => {
    if (selectedAssessmentId) {
      return allAssessments.find(a => a.id === selectedAssessmentId);
    }
    // Default to the most recent one if in dashboard view
    if (activeView === 'DASHBOARD' && companyAssessments.length > 0) {
      return companyAssessments[0];
    }
    return null;
  }, [selectedAssessmentId, allAssessments, activeView, companyAssessments]);

  // --- UI COMPONENTS ---

  const DonutChart = ({ score }: { score: number }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center w-48 h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background Circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            className="text-gray-100"
          />
          {/* Progress Circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-brand-secondary transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black text-brand-secondary">{score}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Score</span>
        </div>
      </div>
    );
  };

  // --- VISTAS ---

  // Dashboard Principal de la Empresa
  const renderDashboard = () => {
    if (!selectedAssessment) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <div className="p-6 bg-gray-100 text-gray-400 rounded-full">
            <FileText size={48} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Sin Evaluaciones</h3>
            <p className="text-gray-500 max-w-xs mx-auto">No se han encontrado evaluaciones de cultura para {currentCompany?.name} en este periodo.</p>
          </div>
        </div>
      );
    }

    const radarData = selectedAssessment.dimensions.map(d => ({
      subject: d.name,
      A: d.score,
      fullMark: 100,
    }));

    return (
      <div className="animate-fade-in space-y-8">
        {/* Header with Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {selectedAssessment.title}
                {selectedAssessmentId === null && <span className="ml-3 text-xs bg-brand-secondary/10 text-brand-secondary px-2 py-1 rounded-lg uppercase tracking-widest">Última</span>}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveView('HISTORY')}
              className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
            >
              <List size={18} />
              Historial
            </button>
            <button className="px-4 py-2 bg-brand-secondary text-white rounded-xl text-sm font-bold hover:bg-brand-secondaryDark transition-all shadow-lg shadow-brand-secondary/20 flex items-center gap-2">
              <Download size={18} />
              Exportar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna Izquierda: KPIs Principales y Gráficos */}
          <div className="lg:col-span-5 space-y-8">
            {/* Tarjeta Índice Global */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Índice Global</h3>
              <DonutChart score={selectedAssessment.score} />
              <p className="text-sm font-medium text-gray-500 mt-4">Nivel de madurez organizacional</p>
            </div>

            {/* Tarjeta Participación */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Participación</h3>
                <Users size={20} className="text-brand-secondary opacity-20" />
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-black text-brand-secondary">{selectedAssessment.participation}%</span>
                <span className="text-xs font-bold text-gray-400">de la base</span>
              </div>
              <div className="h-2 bg-gray-50 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-brand-secondary rounded-full transition-all duration-1000"
                  style={{ width: `${selectedAssessment.participation}%` }}
                />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Base: Total colaboradores encuestados</p>
            </div>

            {/* Tarjeta Mapa de Calor (Radar) */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Mapa de Calor</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#f3f4f6" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 9, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Score"
                      dataKey="A"
                      stroke="#f17551"
                      fill="#f17551"
                      fillOpacity={0.5}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Desglose y Hallazgos */}
          <div className="lg:col-span-7 space-y-8">
            {/* Desglose por Dimensión */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Desglose por Dimensión</h3>
              <div className="space-y-8">
                {selectedAssessment.dimensions.map((d, idx) => {
                  const diff = d.score - d.benchmark;
                  return (
                    <div key={idx} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">{d.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold text-gray-400">Benchmark: {d.benchmark}</span>
                          <span className="text-lg font-black text-brand-secondary">{d.score}</span>
                        </div>
                      </div>
                      <div className="relative h-4 bg-gray-50 rounded-full overflow-hidden">
                        {/* Benchmark Line */}
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 bg-gray-200 z-10"
                          style={{ left: `${d.benchmark}%` }}
                        />
                        {/* Progress Bar */}
                        <div 
                          className="h-full bg-brand-secondary rounded-full transition-all duration-1000"
                          style={{ width: `${d.score}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] text-gray-400 font-medium italic">{d.description}</p>
                        {diff !== 0 && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${diff > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {diff > 0 ? `+${diff}` : diff} vs Benchmark
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hallazgos Clave */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Target size={18} className="text-brand-secondary" />
                  Hallazgos Clave
                </h3>
                <button className="text-[10px] font-bold text-brand-secondary hover:underline flex items-center gap-1">
                  <MessageSquare size={12} />
                  Ver Comentarios Anónimos
                </button>
              </div>
              <div className="space-y-4">
                {selectedAssessment.keyFindings?.map((finding, idx) => (
                  <div key={idx} className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100/50 hover:border-brand-secondary/20 transition-colors">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-brand-secondary font-black shadow-sm shrink-0 text-sm">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">{finding}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Vista C: Listado de Evaluaciones
  const renderHistory = () => (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Historial de Evaluaciones</h1>
        </div>
        <button className="flex items-center gap-2 bg-brand-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-secondaryDark transition-all shadow-lg shadow-brand-secondary/20">
          <Activity size={20} />
          Nueva Evaluación
        </button>
      </div>

      <div className="space-y-4">
        {companyAssessments.map((a) => (
          <div 
            key={a.id}
            onClick={() => {
              setSelectedAssessmentId(a.id);
              setActiveView('DASHBOARD');
            }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-brand-light text-brand-secondary rounded-2xl group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{a.title}</h3>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    a.status === 'Finalizada' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {a.status === 'Finalizada' ? 'COMPLETADA' : 'ACTIVA'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                  <span className="flex items-center gap-1"><TrendingUp size={12} /> {a.date}</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {a.participation}% Participación</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Score Global</p>
                <span className="text-3xl font-black text-brand-secondary">{a.score}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-secondary group-hover:text-white transition-all">
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] relative overflow-hidden font-sans">
      {/* Background Silhouettes Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-brand-secondaryDark/40 to-transparent"></div>
        <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <path d="M0,1000 L0,800 L50,800 L50,700 L100,700 L100,850 L150,850 L150,750 L200,750 L200,900 L250,900 L250,600 L300,600 L300,800 L350,800 L350,700 L400,700 L400,950 L450,950 L450,800 L500,800 L500,650 L550,650 L550,850 L600,850 L600,750 L650,750 L650,900 L700,900 L700,600 L750,600 L750,800 L800,800 L800,700 L850,700 L850,950 L900,950 L900,800 L950,800 L950,700 L1000,700 L1000,1000 Z" fill="currentColor" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8 max-w-7xl mx-auto pb-24">
        {!companyId ? (
          <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Building2 className="text-gray-300" size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Seleccione una empresa</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2 mb-6">
              Debe seleccionar una empresa desde el directorio de clientes para ver su cultura de riesgos.
            </p>
            <button 
              onClick={() => onNavigate?.(ViewState.CLIENTS)}
              className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-primaryLight transition-all"
            >
              Ir a Clientes
            </button>
          </div>
        ) : (
          <>
            {activeView === 'DASHBOARD' && renderDashboard()}
            {activeView === 'HISTORY' && renderHistory()}
          </>
        )}
      </div>
    </div>
  );
};

