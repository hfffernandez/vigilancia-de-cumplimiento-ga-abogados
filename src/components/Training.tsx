import React, { useState, useMemo } from 'react';
import { 
  Users, 
  CheckCircle, 
  Award, 
  Search, 
  LayoutGrid, 
  List, 
  ChevronRight, 
  ArrowRight,
  Clock,
  Building2,
  GraduationCap,
  ArrowLeft,
  Plus,
  Calendar,
  MapPin,
  FileText,
  Upload,
  Trash2,
  MoreVertical,
  Download,
  ExternalLink,
  Save,
  X,
  Check,
  AlertCircle,
  Globe,
  Lock,
  ShieldAlert,
  Shield
} from 'lucide-react';
import { trainingService, companyService } from '../services/db';
import { Company, TrainingModule, ViewState, Trainee, Evidence } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ value, size = 64, strokeWidth = 6, color = "text-brand-secondary" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-gray-100"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-gray-900 leading-none">{value}%</span>
      </div>
    </div>
  );
};

export const Training: React.FC<{ 
  context: string; 
  companyId?: string; 
  isGAAbogados?: boolean;
  onNavigate?: (view: ViewState, itemId?: string, companyId?: string) => void 
}> = ({ context, companyId, isGAAbogados, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  
  const allTrainings = trainingService.getAll();
  const allCompanies = companyService.getAll();

  const filteredByContext = useMemo(() => {
    return allTrainings.filter(t => t.practiceArea === context);
  }, [allTrainings, context]);

  const selectedTraining = useMemo(() => 
    selectedTrainingId ? filteredByContext.find(t => t.id === selectedTrainingId) : null
  , [selectedTrainingId, filteredByContext]);

  const selectedCompany = useMemo(() => 
    companyId ? allCompanies.find(c => c.id === companyId) : null
  , [companyId, allCompanies]);

  // Calculate KPIs
  const stats = useMemo(() => {
    const relevantTrainings = companyId 
      ? filteredByContext.filter(t => t.companyId === companyId || t.scope === 'GLOBAL')
      : filteredByContext;
    
    const avgCompletion = relevantTrainings.length > 0
      ? Math.round(relevantTrainings.reduce((acc, curr) => acc + curr.completionRate, 0) / relevantTrainings.length)
      : 0;
    
    const totalAttendees = relevantTrainings.reduce((acc, curr) => acc + (curr.assignedTo || 0), 0);
    const activeCourses = relevantTrainings.filter(t => t.status === 'Activo').length;

    return {
      avgCompletion,
      totalAttendees,
      activeCourses
    };
  }, [filteredByContext, companyId]);

  const filteredTrainings = useMemo(() => {
    let trainings = filteredByContext;
    if (companyId) {
      trainings = trainings.filter(t => t.companyId === companyId || t.scope === 'GLOBAL');
    }
    if (searchTerm) {
      trainings = trainings.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return trainings;
  }, [filteredByContext, companyId, searchTerm]);

  const handleBack = () => {
    if (selectedTrainingId) {
      setSelectedTrainingId(null);
    }
  };

  if (!companyId && !context.includes('DATA_PROTECTION')) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Building2 className="text-gray-300" size={40} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Seleccione una empresa</h3>
        <p className="text-gray-500 max-w-xs mx-auto mt-2 mb-6">
          Debe seleccionar una empresa desde el directorio de clientes para gestionar sus programas de capacitación.
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

  // --- DETAIL VIEW ---
  if (selectedTraining) {
    const hasCertificate = selectedTraining.evidence.some(e => 
      e.type === 'Certificado' || (e.name && e.name.toLowerCase().includes('certificado'))
    );

    const canComplete = !selectedTraining.isSence || hasCertificate;

    return (
      <div className="p-8 animate-fade-in max-w-5xl mx-auto pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Expediente: {selectedTraining.id}
              </p>
              <h1 className="text-3xl font-black text-gray-900">{selectedTraining.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-6 py-2.5 bg-white border border-gray-100 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all">
              Cancelar
            </button>
            <button className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2">
              <Save size={18} /> Guardar Cambios
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* General Information */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <FileText size={14} /> Información General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo de Capacitación</label>
                <input 
                  type="text" 
                  value={selectedTraining.category} 
                  readOnly 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</label>
                <select 
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  defaultValue={selectedTraining.status}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Activo">Activo</option>
                  <option value="Cerrado" disabled={!canComplete}>
                    Cerrado {selectedTraining.isSence && !hasCertificate ? '(Requiere Certificado)' : ''}
                  </option>
                </select>
                {selectedTraining.isSence && !hasCertificate && (
                  <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
                    <ShieldAlert size={10} /> Certificado SENCE Obligatorio para cerrar
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha de Inicio</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="date" 
                    defaultValue={selectedTraining.startDate}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha de Finalización</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="date" 
                    defaultValue={selectedTraining.deadline}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instructor / Entidad</label>
                <input 
                  type="text" 
                  placeholder="Ej: Nombre Apellido, Empresa X"
                  defaultValue={selectedTraining.instructor}
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Departamento(s) Dirigido(s)</label>
                <input 
                  type="text" 
                  placeholder="Ej: Ventas, Operaciones, Todos"
                  defaultValue={selectedTraining.targetDepartments}
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duración (Horas)</label>
                <input 
                  type="number" 
                  placeholder="Ej: 4"
                  defaultValue={selectedTraining.durationHours}
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ubicación / Plataforma</label>
                <input 
                  type="text" 
                  placeholder="Ej: Sala de conferencias, Zoom"
                  defaultValue={selectedTraining.location}
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium outline-none"
                />
              </div>
              {selectedTraining.isSence && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Código SENCE</label>
                  <input 
                    type="text" 
                    defaultValue={selectedTraining.senceCode}
                    placeholder="Ingrese código SENCE..."
                    className="w-full px-4 py-3 bg-brand-primary/5 border border-brand-primary/20 rounded-xl text-sm font-bold text-brand-primary outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Description & Objectives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción Breve</h3>
                <textarea 
                  rows={3}
                  className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all resize-none"
                  placeholder="Describa brevemente el contenido de la capacitación..."
                  defaultValue={selectedTraining.description}
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Objetivos de Aprendizaje</h3>
                <textarea 
                  rows={3}
                  className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all resize-none"
                  placeholder="Enumere los principales objetivos que se buscan alcanzar..."
                  defaultValue={selectedTraining.objectives}
                />
              </div>
            </section>

            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Rendimiento de Evaluaciones</h3>
              <div className="space-y-6">
                <div className="flex items-end justify-between h-40 gap-2 px-4">
                  {[65, 82, 45, 91, 74, 88].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-50 rounded-t-lg relative group">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${val}%` }}
                          className={`w-full rounded-t-lg ${val > 80 ? 'bg-green-500' : val > 60 ? 'bg-brand-secondary' : 'bg-brand-primary'}`}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {val}%
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-gray-400">P{i+1}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Promedio General</p>
                    <p className="text-xl font-black text-gray-900">74.2%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aprobación</p>
                    <p className="text-xl font-black text-green-600">92%</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Evidence Repository */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Material de Apoyo (Adjuntos)</h3>
              {selectedTraining.isSence && (
                <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-lg text-[10px] font-black uppercase tracking-widest">
                  <AlertCircle size={12} />
                  Certificado SENCE Obligatorio
                </div>
              )}
            </div>
            
            {selectedTraining.isSence && (
              <div className="mb-6 p-6 bg-brand-primary/5 border border-brand-primary/10 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-primary shadow-sm">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Acreditación de Debida Diligencia</h4>
                    <p className="text-xs text-gray-500">Cargue el certificado SENCE oficial para validar este entrenamiento ante terceros.</p>
                  </div>
                </div>
                <button className="px-6 py-3 bg-brand-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-primaryLight transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2">
                  <Upload size={16} /> Subir Certificado
                </button>
              </div>
            )}

            <div className="border-2 border-dashed border-blue-100 rounded-3xl p-10 flex flex-col items-center justify-center bg-blue-50/20 group hover:bg-blue-50/40 transition-all cursor-pointer mb-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 text-blue-500 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <p className="text-sm font-bold text-gray-900">Haga clic para cargar o arrastre y suelte</p>
              <p className="text-xs text-gray-400 mt-1">PDF, Excel, Word, JPG (Máx. 10MB por archivo)</p>
            </div>

            <div className="space-y-3">
              {selectedTraining.evidence.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-xl text-gray-400">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{ev.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{ev.type} • {ev.uploadDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                      <Download size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Participants Table */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Participantes: {selectedCompany?.name || 'Corporación Alpha Chile'}</h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">Filtre por área o estado</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Nombre del asistente..."
                      className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-primary/10 w-64"
                    />
                  </div>
                  <button className="p-2 bg-gray-900 text-white rounded-xl hover:bg-black transition-all">
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                      <th className="text-left pb-4 font-black">Participante</th>
                      <th className="text-center pb-4 font-black">Estado</th>
                      <th className="text-center pb-4 font-black">Nota</th>
                      <th className="text-right pb-4 font-black">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedTraining.attendees.map((attendee) => (
                      <tr key={attendee.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-primary/5 rounded-full flex items-center justify-center text-brand-primary font-bold text-sm">
                              {attendee.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{attendee.name || 'Participante'}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{attendee.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <select 
                            defaultValue={attendee.status}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none border-none cursor-pointer ${
                              attendee.status === 'Presente' ? 'bg-green-50 text-green-600' : 
                              attendee.status === 'Ausente' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                            }`}
                          >
                            <option value="Presente">Presente</option>
                            <option value="Ausente">Ausente</option>
                            <option value="Justificado">Justificado</option>
                          </select>
                        </td>
                        <td className="py-4 text-center">
                          <input 
                            type="number" 
                            defaultValue={attendee.score}
                            className="w-12 px-2 py-1 bg-white border border-gray-100 rounded-lg text-xs font-bold text-center outline-none focus:ring-2 focus:ring-brand-primary/10"
                          />
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {attendee.certificateUrl && (
                              <button 
                                className="p-2 text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"
                                title="Descargar Certificado SENCE"
                              >
                                <Download size={14} /> SENCE
                              </button>
                            )}
                            <button className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            <span>Capacitación</span>
            <ChevronRight size={12} />
            <span className="text-gray-900">{selectedCompany?.name || 'Plan de Formación'}</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {context === 'DATA_PROTECTION' ? 'Gestión de Capacitación en Privacidad' : 'Gestión de Capacitación'}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-primary/5 w-72 shadow-sm transition-all"
            />
          </div>
          <div className="flex items-center bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-brand-primary/10 text-brand-primary shadow-inner' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid size={22} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-brand-primary/10 text-brand-primary shadow-inner' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List size={22} />
            </button>
          </div>
          <button 
            onClick={() => setIsAssigning(true)}
            className="bg-gray-900 text-white px-6 py-3.5 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-lg shadow-gray-900/10 flex items-center gap-2"
          >
            <Plus size={20} /> Asignar Curso
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-gray-900 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-gray-900/20 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-gray-400 font-black text-xs uppercase tracking-[0.2em] mb-3">Cumplimiento Global</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-6xl font-black tracking-tighter">{stats.avgCompletion}%</h2>
              <div className="w-3 h-3 bg-brand-secondary rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 p-6 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 group-hover:scale-110 transition-transform duration-500">
            <Award size={48} className="text-brand-secondary" />
          </div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-8 group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
          <div className="p-6 bg-blue-50 text-blue-500 rounded-[2rem] group-hover:scale-110 transition-transform duration-500">
            <Users size={40} />
          </div>
          <div>
            <p className="text-gray-400 font-black text-xs uppercase tracking-[0.2em] mb-2">Total Asistentes</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">{stats.totalAttendees.toLocaleString()}</h2>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-8 group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
          <div className="p-6 bg-green-50 text-green-500 rounded-[2rem] group-hover:scale-110 transition-transform duration-500">
            <CheckCircle size={40} />
          </div>
          <div>
            <p className="text-gray-400 font-black text-xs uppercase tracking-[0.2em] mb-2">Cursos Activos</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">{stats.activeCourses}</h2>
          </div>
        </div>
      </div>

      {/* Training Gaps / Alerts */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="text-brand-primary" size={24} />
          <h2 className="text-2xl font-black text-gray-900">
            {context === 'DATA_PROTECTION' ? 'Alertas de Brechas en Privacidad' : 'Alertas de Brechas de Capacitación'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {context === 'DATA_PROTECTION' ? (
            <>
              <div className="bg-red-50/50 border border-red-100 p-6 rounded-3xl flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl text-red-500 shadow-sm">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Ley 21.719: Personal Crítico Pendiente</h4>
                  <p className="text-sm text-gray-500 mt-1">Se detectaron 12 colaboradores con acceso a datos sensibles que no han completado el módulo de la nueva ley.</p>
                  <button className="mt-3 text-xs font-black text-red-600 uppercase tracking-widest hover:underline">Asignar Urgente</button>
                </div>
              </div>
              <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-3xl flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl text-orange-500 shadow-sm">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Certificaciones DP por vencer</h4>
                  <p className="text-sm text-gray-500 mt-1">5 certificados de "EIPD Avanzado" vencerán en los próximos 15 días.</p>
                  <button className="mt-3 text-xs font-black text-orange-600 uppercase tracking-widest hover:underline">Notificar a colaboradores</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-red-50/50 border border-red-100 p-6 rounded-3xl flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl text-red-500 shadow-sm">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Personal no entrenado: Ley Karin</h4>
                  <p className="text-sm text-gray-500 mt-1">Se detectaron 15 colaboradores del área de Operaciones que aún no completan la capacitación obligatoria.</p>
                  <button className="mt-3 text-xs font-black text-red-600 uppercase tracking-widest hover:underline">Asignar ahora</button>
                </div>
              </div>
              <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-3xl flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl text-orange-500 shadow-sm">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Certificaciones por vencer</h4>
                  <p className="text-sm text-gray-500 mt-1">8 certificados de "Ciberseguridad Básica" vencerán en los próximos 30 días.</p>
                  <button className="mt-3 text-xs font-black text-orange-600 uppercase tracking-widest hover:underline">Notificar a colaboradores</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Training Grid or Company Breakdown (Only for GA Abogados Partners) */}
      {!companyId && context === 'DATA_PROTECTION' && isGAAbogados ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-gray-50">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Desglose por Empresa Cliente</h3>
            <p className="text-gray-400 font-medium">Cumplimiento promedio en Protección de Datos por organización.</p>
          </div>
          <div className="divide-y divide-gray-50">
            {allCompanies.map(company => {
              const companyTrainings = allTrainings.filter(t => (t.companyId === company.id || t.scope === 'GLOBAL') && t.practiceArea === 'DATA_PROTECTION');
              const avgComp = companyTrainings.length > 0 
                ? Math.round(companyTrainings.reduce((acc, curr) => acc + curr.completionRate, 0) / companyTrainings.length)
                : 0;
              
              return (
                <div key={company.id} className="p-8 flex items-center justify-between hover:bg-gray-50/50 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-brand-primary/5 rounded-2xl flex items-center justify-center text-brand-primary font-black text-xl">
                      {company?.name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-gray-900 group-hover:text-brand-primary transition-colors">{company?.name}</h4>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{companyTrainings.length} Cursos Asignados</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-12">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avance Promedio</p>
                      <div className="flex items-center gap-3">
                        <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-secondary rounded-full" style={{ width: `${avgComp}%` }} />
                        </div>
                        <span className="text-sm font-black text-gray-900">{avgComp}%</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => onNavigate?.(ViewState.TRAINING, undefined, company.id)}
                      className="p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredTrainings.map((training) => (
            <div 
              key={training.id} 
              onClick={() => setSelectedTrainingId(training.id)}
              className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden group cursor-pointer"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${training.practiceArea === 'DATA_PROTECTION' ? 'bg-blue-50 text-blue-500' : 'bg-brand-primary/5 text-brand-primary'}`}>
                      {training.practiceArea === 'DATA_PROTECTION' ? <Lock size={16} /> : <Globe size={16} />}
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{training.practiceArea}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    training.status === 'Activo' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {training.status}
                  </div>
                </div>

                <h3 className="text-xl font-black text-gray-900 mb-6 group-hover:text-brand-primary transition-colors leading-tight">
                  {training.title}
                </h3>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-400">Progreso</span>
                    <span className="text-gray-900">{training.completionRate}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${training.completionRate}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        training.completionRate > 90 ? 'bg-green-500' : 
                        training.completionRate > 50 ? 'bg-brand-secondary' : 'bg-brand-primary'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-brand-primary" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Deadline</span>
                      <span className="text-xs font-bold text-gray-900">{training.deadline}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest block">{training.scope}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Curso / Área</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Progreso</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTrainings.map((training) => (
                <tr 
                  key={training.id} 
                  onClick={() => setSelectedTrainingId(training.id)}
                  className="hover:bg-gray-50/30 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${training.practiceArea === 'DATA_PROTECTION' ? 'bg-blue-50 text-blue-500' : 'bg-brand-primary/5 text-brand-primary'}`}>
                        {training.practiceArea === 'DATA_PROTECTION' ? <Lock size={20} /> : <Globe size={20} />}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{training.practiceArea}</p>
                        <p className="font-black text-gray-900 group-hover:text-brand-primary transition-colors">{training.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      training.status === 'Activo' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {training.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            training.completionRate > 90 ? 'bg-green-500' : 
                            training.completionRate > 50 ? 'bg-brand-secondary' : 'bg-brand-primary'
                          }`}
                          style={{ width: `${training.completionRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-900">{training.completionRate}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-xs font-bold text-gray-500 tabular-nums">{training.deadline}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Course Modal */}
      <AnimatePresence>
        {isAssigning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssigning(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-gray-900">Asignar Nuevo Curso</h3>
                  <button onClick={() => setIsAssigning(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={24} className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seleccionar Curso</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-primary/20">
                      <option>Ley Karin - Capacitación Mandatoria</option>
                      <option>Modelo de Prevención de Delitos</option>
                      <option>Ciberseguridad Básica</option>
                      <option>Protección de Datos Personales</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Departamento(s)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Ventas', 'Operaciones', 'RRHH', 'TI', 'Finanzas', 'Legal'].map(dept => (
                        <label key={dept} className="flex items-center gap-2 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                          <input type="checkbox" className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                          <span className="text-xs font-bold text-gray-700">{dept}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha Límite</label>
                    <input type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-primary/20" />
                  </div>
                </div>

                <div className="mt-10 flex gap-3">
                  <button 
                    onClick={() => setIsAssigning(false)}
                    className="flex-1 px-6 py-3.5 bg-gray-50 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => setIsAssigning(false)}
                    className="flex-1 px-6 py-3.5 bg-brand-primary text-white rounded-2xl font-black text-sm hover:bg-brand-primaryLight transition-all shadow-lg shadow-brand-primary/20"
                  >
                    Confirmar Asignación
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {filteredTrainings.length === 0 && (
        <div className="py-32 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="text-gray-200" size={48} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">No se encontraron programas</h3>
          <p className="text-gray-400 font-medium">Intenta ajustando los filtros o el término de búsqueda.</p>
        </div>
      )}
    </div>
  );
};
