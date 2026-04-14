import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Shield, 
  Lock,
  ChevronLeft,
  Filter,
  Download,
  Plus,
  MoreVertical,
  Paperclip,
  GraduationCap
} from 'lucide-react';
import { ViewState, CalendarEvent, Company, Severity } from '../types';
import { companyService, calendarService, userService } from '../services/db';
import { motion, AnimatePresence } from 'motion/react';

export const ComplianceCalendar: React.FC<{ 
  context: string; 
  companyId?: string; 
  onNavigate?: (view: ViewState, itemId?: string, companyId?: string) => void 
}> = ({ context, companyId, onNavigate }) => {
  const TODAY = new Date('2026-04-10');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState(new Date(2026, 3, 1)); // Start at April 2026
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'DEADLINE' as any,
    category: 'Vigilancia',
    description: '',
    assignedTo: '',
    practiceArea: context as any
  });
  
  const user = userService.get();
  const allEvents = calendarService.getAll(context as any);
  const allCompanies = companyService.getAll();

  // Execute reorganization directive on mount
  React.useEffect(() => {
    calendarService.reorganizeTasks();
  }, []);

  const overdueTasksForEstudio = useMemo(() => {
    if (!user.isGAAbogados) return [];
    
    // Tasks that were redistributed or are still pending from the past
    return allEvents.filter(e => e.isRedistributed || (e.status === 'Pendiente' && new Date(e.date) < TODAY))
      .sort((a, b) => {
        // 1. Original date (oldest first)
        const dateA = new Date(a.originalDate || a.date).getTime();
        const dateB = new Date(b.originalDate || b.date).getTime();
        if (dateA !== dateB) return dateA - dateB;
        
        // 2. Company/Client (alphabetical)
        const compA = allCompanies.find(c => c.id === a.companyId)?.name || '';
        const compB = allCompanies.find(c => c.id === b.companyId)?.name || '';
        if (compA !== compB) return compA.localeCompare(compB);
        
        // 3. Name
        if (a.title !== b.title) return a.title.localeCompare(b.title);
        
        // 4. Type
        return a.type.localeCompare(b.type);
      });
  }, [allEvents, user.isGAAbogados, allCompanies]);

  const processedEvents = useMemo(() => {
    const todayStr = TODAY.toISOString().split('T')[0];
    
    let events = allEvents.map(e => {
      const eventDate = new Date(e.date);
      const normalizedEventDate = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      const normalizedToday = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
      
      const isOverdue = normalizedEventDate < normalizedToday && e.status !== 'Completado';
      
      return {
        ...e,
        isOverdue,
        displayDate: isOverdue ? todayStr : e.date
      };
    });

    // Sort by date ascending (Oldest -> Newest)
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Filter by company if provided (Client view)
    if (companyId) {
      events = events.filter(e => e.companyId === companyId);
    }

    // Filter out past completed events
    events = events.filter(e => {
      const eventDate = new Date(e.date);
      const normalizedEventDate = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      const normalizedToday = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
      
      const isPast = normalizedEventDate < normalizedToday;
      if (isPast && e.status === 'Completado') return false;
      return true;
    });

    // Filter by selected date from mini-calendar
    if (selectedDate) {
      const selDateStr = selectedDate.toISOString().split('T')[0];
      events = events.filter(e => e.date === selDateStr);
    }

    // Filter by search term (title, description, company, category, date)
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      events = events.filter(e => {
        const company = allCompanies.find(c => c.id === e.companyId);
        const eventDate = new Date(e.date);
        const dateStr = eventDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        return (
          e.title.toLowerCase().includes(lowerSearch) ||
          e.category.toLowerCase().includes(lowerSearch) ||
          (e.description && e.description.toLowerCase().includes(lowerSearch)) ||
          (company && company.name.toLowerCase().includes(lowerSearch)) ||
          (e.assignedTo && e.assignedTo.toLowerCase().includes(lowerSearch)) ||
          dateStr.includes(lowerSearch)
        );
      });
    }

    return events;
  }, [allEvents, searchTerm, companyId, selectedDate, allCompanies]);

  const groupedEvents = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    processedEvents.forEach(event => {
      const dateKey = (event as any).displayDate;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
    });

    const todayStr = TODAY.toISOString().split('T')[0];
    const currentMonth = TODAY.getMonth();
    const currentYear = TODAY.getFullYear();

    // Sort dates with priority: Today, then Current Month, then others
    return Object.keys(groups).sort((a, b) => {
      if (a === todayStr) return -1;
      if (b === todayStr) return 1;

      const dateA = new Date(a);
      const dateB = new Date(b);

      const isAMonth = dateA.getMonth() === currentMonth && dateA.getFullYear() === currentYear;
      const isBMonth = dateB.getMonth() === currentMonth && dateB.getFullYear() === currentYear;

      if (isAMonth && !isBMonth) return -1;
      if (!isAMonth && isBMonth) return 1;

      return dateA.getTime() - dateB.getTime();
    }).map(date => ({
      date,
      events: groups[date]
    }));
  }, [processedEvents]);

  const selectedEvent = useMemo(() => 
    selectedEventId ? allEvents.find(e => e.id === selectedEventId) : null
  , [selectedEventId, allEvents]);

  // Stats for the summary (Based on viewed month in mini-calendar)
  const stats = useMemo(() => {
    const viewMonth = viewDate.getMonth();
    const viewYear = viewDate.getFullYear();

    const monthEvents = allEvents.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    });

    const audits = monthEvents.filter(e => e.type === 'AUDIT').length;
    const deadlines = monthEvents.filter(e => e.type === 'DEADLINE' || e.type === 'ARCO').length;
    const trainings = monthEvents.filter(e => e.type === 'TRAINING').length;

    return { audits, deadlines, trainings };
  }, [allEvents, viewDate]);

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (selectedDate && selectedDate.getTime() === newDate.getTime()) {
      setSelectedDate(null); // Toggle off
    } else {
      setSelectedDate(newDate);
    }
  };

  const renderMiniCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthName = viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    
    // Days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // First day of month (0 = Sunday, 1 = Monday...)
    // Adjust to Monday-start (L, M, M, J, V, S, D)
    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1;

    return (
      <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-gray-900/20">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-black text-lg capitalize">{monthName}</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center mb-4">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <span key={`${d}-${i}`} className="text-[10px] font-black text-gray-500">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateObj = new Date(year, month, day);
            const dateStr = dateObj.toISOString().split('T')[0];
            
            const hasEvent = allEvents.some(e => e.date === dateStr);
            const isSelected = selectedDate && selectedDate.getTime() === dateObj.getTime();
            const isToday = dateStr === TODAY.toISOString().split('T')[0];

            return (
              <div 
                key={i} 
                onClick={() => handleDateClick(day)}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold cursor-pointer transition-all relative
                  ${isSelected ? 'bg-brand-secondary text-white shadow-lg shadow-brand-secondary/20' : 
                    isToday ? 'bg-white/10 text-brand-secondary' : 'hover:bg-white/5 text-gray-400'}
                `}
              >
                {day}
                {hasEvent && !isSelected && (
                  <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isToday ? 'bg-brand-secondary' : 'bg-brand-secondary/60'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEventList = () => (
    <div className="space-y-12">
      {groupedEvents.length > 0 ? (
        groupedEvents.map((group) => {
          const groupDate = new Date(group.date);
          const isToday = group.date === TODAY.toISOString().split('T')[0];

          return (
            <div key={group.date} className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className={`h-1 flex-1 ${isToday ? 'bg-brand-primary/20' : 'bg-gray-100'}`} />
                <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${isToday ? 'text-brand-primary' : 'text-gray-400'}`}>
                  {isToday ? 'Hoy' : groupDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <div className={`h-1 flex-1 ${isToday ? 'bg-brand-primary/20' : 'bg-gray-100'}`} />
              </div>

              <div className="space-y-4">
                {group.events.map((event) => {
                  const company = allCompanies.find(c => c.id === event.companyId);
                  const isOverdue = (event as any).isOverdue;
                  const originalDate = new Date(event.date);

                  return (
                    <motion.div 
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedEventId(event.id)}
                      className={`bg-white p-6 rounded-[2rem] border transition-all cursor-pointer group flex items-center gap-6 relative
                        ${isOverdue ? 'border-red-100 shadow-sm hover:border-red-200' : 'border-gray-100 hover:border-brand-primary/20 shadow-sm hover:shadow-md'}
                      `}
                    >
                      <div className={`flex flex-col items-center justify-center min-w-[70px] h-[70px] rounded-2xl border-2 transition-colors ${
                        isOverdue ? 'bg-red-50 border-red-100 text-red-600' : 
                        isToday ? 'bg-brand-primary border-brand-primary text-white' : 'bg-gray-50 border-gray-100 text-gray-400'
                      }`}>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-white/70' : 'opacity-70'}`}>
                          {originalDate.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
                        </span>
                        <span className="text-2xl font-black leading-none mt-0.5">
                          {originalDate.getDate()}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          {isOverdue && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">
                              <AlertCircle size={10} /> Atrasado
                            </div>
                          )}
                          <h4 className="font-bold text-gray-900 group-hover:text-brand-primary transition-colors truncate text-base">
                            {event.title}
                          </h4>
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            event.practiceArea === 'DATA_PROTECTION' ? 'bg-blue-50 text-blue-600' : 'bg-brand-primary/5 text-brand-primary'
                          }`}>
                            {event.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400 font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <Clock size={14} className="text-gray-300" /> {originalDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon size={14} className="text-gray-300" /> {originalDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                          {user.isGAAbogados && (
                            <span className="flex items-center gap-1 text-brand-primary/60">
                              <Building2 size={14} /> {company?.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl transition-all ${
                          event.status === 'Completado' ? 'bg-green-50 text-green-500' : 
                          isOverdue ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'
                        }`}>
                          {event.status === 'Completado' ? <CheckCircle2 size={24} /> : (isOverdue ? <AlertCircle size={24} /> : <Clock size={24} />)}
                        </div>
                        <ChevronRight size={20} className="text-gray-300 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
          <CalendarIcon className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-900">No hay eventos programados</h3>
          <p className="text-gray-500 text-sm mt-1">No se encontraron hitos de vigilancia para los criterios seleccionados.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-primary font-black text-[10px] uppercase tracking-widest mb-2">
            <CalendarIcon size={14} />
            <span>Agenda de Vigilancia</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {context === 'DATA_PROTECTION' ? 'Agenda de Privacidad' : 'Agenda de Cumplimiento'}
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            {user.isGAAbogados ? 'Vista unificada de hitos normativos, auditorías y vencimientos multi-cliente.' : `Hitos y tareas de cumplimiento para ${allCompanies.find(c => c.id === companyId)?.name}.`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2">
            <span className="text-xs font-black text-gray-900">{processedEvents.length} Eventos Próximos</span>
          </div>
          <button 
            onClick={() => setIsNewTaskModalOpen(true)}
            className="p-3 bg-brand-primary text-white rounded-2xl hover:bg-brand-primaryLight transition-all shadow-lg shadow-brand-primary/20"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Removed Overdue Tasks Block per Protocol */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: List & Search */}
        <div className="lg:col-span-8 space-y-8">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Buscar por hito, empresa, responsable o fecha (DD/MM/AAAA)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border-2 border-gray-100 rounded-[2rem] focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none shadow-sm transition-all font-medium text-gray-900"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="h-6 w-px bg-gray-100 mx-2" />
              <CalendarIcon size={20} className="text-brand-primary animate-bounce" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900">Próximos Vencimientos</h2>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-brand-primary transition-colors"><Filter size={18} /></button>
              <button className="p-2 text-gray-400 hover:text-brand-primary transition-colors"><Download size={18} /></button>
            </div>
          </div>

          {renderEventList()}
        </div>

        {/* Right Column: Calendar & Summary */}
        <div className="lg:col-span-4 space-y-8">
          {renderMiniCalendar()}

          {/* Summary Cards */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 space-y-6">
            <h3 className="text-lg font-black text-gray-900 mb-2">Resumen del Mes</h3>
            
            <button 
              onClick={() => onNavigate?.(ViewState.AUDITS)}
              className="w-full p-6 bg-blue-50/50 rounded-3xl flex items-center justify-between group hover:bg-blue-50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl text-blue-500 shadow-sm">
                  <Shield size={20} />
                </div>
                <span className="font-black text-blue-900">Auditorías</span>
              </div>
              <span className="text-xl font-black text-blue-600">{stats.audits}</span>
            </button>

            <button 
              onClick={() => onNavigate?.(ViewState.ALERTS)}
              className="w-full p-6 bg-red-50/50 rounded-3xl flex items-center justify-between group hover:bg-red-50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl text-red-500 shadow-sm">
                  <Clock size={20} />
                </div>
                <span className="font-black text-red-900">Vencimientos</span>
              </div>
              <span className="text-xl font-black text-red-600">{stats.deadlines}</span>
            </button>

            <button 
              onClick={() => onNavigate?.(ViewState.TRAINING)}
              className="w-full p-6 bg-green-50/50 rounded-3xl flex items-center justify-between group hover:bg-green-50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl text-green-500 shadow-sm">
                  <GraduationCap size={20} />
                </div>
                <span className="font-black text-green-900">Capacitaciones</span>
              </div>
              <span className="text-xl font-black text-green-600">{stats.trainings}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEventId && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEventId(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div className={`p-4 rounded-3xl ${
                    selectedEvent.practiceArea === 'DATA_PROTECTION' ? 'bg-blue-50 text-blue-600' : 'bg-brand-primary/5 text-brand-primary'
                  }`}>
                    {selectedEvent.practiceArea === 'DATA_PROTECTION' ? <Lock size={32} /> : <Shield size={32} />}
                  </div>
                  <button 
                    onClick={() => setSelectedEventId(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Plus size={24} className="rotate-45 text-gray-400" />
                  </button>
                </div>

                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{selectedEvent.category}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedEvent.status}</span>
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 leading-tight">{selectedEvent.title}</h2>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha y Hora</p>
                    <p className="font-bold text-gray-900">{new Date(selectedEvent.date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Responsable</p>
                    <p className="font-bold text-gray-900">{selectedEvent.assignedTo || 'No asignado'}</p>
                  </div>
                </div>

                <div className="space-y-6 mb-10">
                  <div className="p-6 bg-gray-50 rounded-3xl">
                    <p className="text-sm text-gray-600 leading-relaxed">{selectedEvent.description}</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Evidencia de Debida Diligencia</h4>
                    {selectedEvent.status === 'Completado' ? (
                      <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">Acta_Cumplimiento_V1.pdf</p>
                            <p className="text-[10px] text-gray-400 font-medium">Subido el 10/04/2026 por DPO</p>
                          </div>
                        </div>
                        <button className="text-brand-primary hover:text-brand-primaryLight transition-colors">
                          <Download size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-100 rounded-[2rem] p-8 text-center">
                        <Paperclip className="mx-auto text-gray-300 mb-3" size={32} />
                        <p className="text-sm font-bold text-gray-900">Adjuntar Evidencia</p>
                        <p className="text-xs text-gray-400 mt-1">Arrastre archivos o haga clic para subir actas o registros.</p>
                        <button className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all">
                          Subir Archivo
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-primaryLight transition-all shadow-lg shadow-brand-primary/20">
                    Marcar como Completado
                  </button>
                  <button className="p-4 bg-gray-100 text-gray-400 rounded-2xl hover:bg-gray-200 transition-all">
                    <MoreVertical size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Task Modal */}
      <AnimatePresence>
        {isNewTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewTaskModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-gray-900">Programar Nuevo Hito</h2>
                  <button 
                    onClick={() => setIsNewTaskModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Plus size={24} className="rotate-45 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Título del Evento</label>
                    <input 
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Ej: Auditoría Anual de Privacidad"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Fecha</label>
                      <input 
                        type="date"
                        value={newTask.date}
                        onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tipo</label>
                      <select 
                        value={newTask.type}
                        onChange={(e) => setNewTask({ ...newTask, type: e.target.value as any })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all appearance-none"
                      >
                        <option value="DEADLINE">Vencimiento</option>
                        <option value="AUDIT">Auditoría</option>
                        <option value="TRAINING">Capacitación</option>
                        <option value="REVIEW">Revisión</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descripción</label>
                    <textarea 
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Responsable</label>
                    <input 
                      type="text"
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                      placeholder="Nombre del responsable"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                  </div>

                  <button 
                    onClick={() => {
                      calendarService.add({
                        ...newTask,
                        id: `EV-${Math.random().toString(36).substr(2, 9)}`,
                        companyId: companyId || 'COMP-1',
                        status: 'Pendiente',
                        category: newTask.type === 'AUDIT' ? 'Auditoría' : newTask.type === 'TRAINING' ? 'Capacitación' : 'Vigilancia'
                      });
                      setIsNewTaskModalOpen(false);
                      setNewTask({
                        title: '',
                        date: new Date().toISOString().split('T')[0],
                        type: 'DEADLINE',
                        category: 'Vigilancia',
                        description: '',
                        assignedTo: '',
                        practiceArea: context as any
                      });
                    }}
                    className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-primaryLight transition-all shadow-lg shadow-brand-primary/20"
                  >
                    Programar Evento
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
