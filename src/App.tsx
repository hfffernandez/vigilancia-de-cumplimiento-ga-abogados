
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Building2, 
  Scale, 
  FileText, 
  GraduationCap, 
  Calendar, 
  Settings, 
  Bell, 
  Sparkles,
  Users,
  ShieldAlert,
  Shield,
  Search,
  ChevronRight,
  ChevronLeft,
  Globe,
  X,
  Clock,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { ViewState, Notification, UserRole } from './types';
import { Dashboard } from './components/Dashboard';
import { Incidents } from './components/Incidents';
import { Regulations } from './components/Regulations';
import { AIRecommendations } from './components/AIRecommendations';
import { RiskCulture } from './components/RiskCulture';
import { LegalNotifications } from './components/LegalNotifications';
import { Audits } from './components/Audits';
import { Clients } from './components/Clients';
import { Training } from './components/Training';
import { ComplianceCalendar } from './components/ComplianceCalendar';
import { DataProtection } from './components/DataProtection';
import { Settings as SettingsView } from './components/Settings';
import { Breadcrumbs } from './components/Breadcrumbs';
import { companyService, notificationService, supabaseService, isSupabaseConfigured } from './services/db';
import { useUser } from './contexts/UserContext';

// --- Sidebar Component ---
const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  onClick: () => void;
  isCollapsed: boolean;
}> = ({ icon, label, active, onClick, isCollapsed }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center px-3 py-3 my-1 rounded-none transition-all duration-200 group relative overflow-hidden border-l-4
      ${active 
        ? 'bg-white/10 text-white border-brand-secondary font-medium' 
        : 'text-gray-300 hover:bg-white/5 hover:text-white border-transparent'
      }
      ${isCollapsed ? 'justify-center' : 'justify-start space-x-3'}
    `}
    title={isCollapsed ? label : undefined}
  >
    <div className={`transition-transform duration-200 ${active ? 'scale-110 text-brand-secondary' : 'text-gray-400 group-hover:text-white'}`}>
      {icon}
    </div>
    {!isCollapsed && <span className="truncate">{label}</span>}
  </button>
);

// --- Main App ---
function App() {
  const { user: userProfile, isLoggedIn, login: handleUserLogin, logout: handleLogout, allUsers } = useUser();
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [currentContext, setCurrentContext] = useState<'COMPLIANCE' | 'DATA_PROTECTION'>('COMPLIANCE');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string | undefined>(undefined);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Navigation State (Deep Linking)
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);

  // Load Notifications on Mount & Sync context with user
  useEffect(() => {
    const initData = async () => {
        const connection = await supabaseService.checkConnection();
        console.log('Supabase Status:', connection.message);

        if (isSupabaseConfigured) {
            try {
                const notes = await supabaseService.notifications.getAll();
                setNotifications(notes);
            } catch (error) {
                console.error('Error loading notifications from Supabase:', error);
                setNotifications(notificationService.getAll());
            }
        } else {
            setNotifications(notificationService.getAll());
        }
    };

    initData();

    // Close notifications when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sync context and company when user changes (e.g. login/logout/refresh)
  useEffect(() => {
    if (userProfile) {
      setSelectedCompanyId(userProfile.companyId || null);
      setCurrentContext(userProfile.practiceArea);
    }
  }, [userProfile]);

  const getBreadcrumbs = () => {
    const items = [];
    const isGAAbogados = userProfile?.isGAAbogados;
    const serviceLabel = currentContext === 'DATA_PROTECTION' ? 'Vigilancia Protección de Datos' : 'Vigilancia de Cumplimiento';
    
    // First breadcrumb: Global for GA Abogados, Company-specific for Clients
    items.push({ 
      label: serviceLabel, 
      view: ViewState.DASHBOARD, 
      companyId: isGAAbogados ? null : userProfile?.companyId,
      context: currentContext 
    });

    if (selectedCompanyId && isGAAbogados) {
      const company = companyService.getAll().find(c => c.id === selectedCompanyId);
      items.push({ 
        label: `Dashboard - ${serviceLabel} (${company?.name})`, 
        view: ViewState.DASHBOARD, 
        companyId: selectedCompanyId,
        context: currentContext
      });
    }

    if (currentView !== ViewState.DASHBOARD) {
      let viewLabel = '';
      switch (currentView) {
        case ViewState.INCIDENTS: viewLabel = 'Gestión de Incidentes'; break;
        case ViewState.REGULATIONS: viewLabel = 'Biblioteca Normativa'; break;
        case ViewState.AUDITS: viewLabel = 'Plan de Auditoría'; break;
        case ViewState.TRAINING: viewLabel = 'Capacitación'; break;
        case ViewState.RISK_CULTURE: viewLabel = 'Cultura de Riesgo'; break;
        case ViewState.CALENDAR: viewLabel = 'Agenda Cumplimiento'; break;
        case ViewState.CLIENTS: 
          viewLabel = isGAAbogados ? 'Directorio de Clientes' : 'Acceso Restringido'; 
          break;
        case ViewState.DATA_PROTECTION: 
          if (selectedTab === 'INVENTORY') viewLabel = 'Inventario de Datos';
          else if (selectedTab === 'RAP' || selectedTab === 'RAT') viewLabel = 'RAP';
          else if (selectedTab === 'ARCO') viewLabel = 'Derechos ARCO';
          else if (selectedTab === 'EIPD') viewLabel = 'Evaluaciones (EIPD)';
          else if (selectedTab === 'DPIA') viewLabel = 'Evaluaciones (DPIA)';
          else if (selectedTab === 'PROCESSORS') viewLabel = 'Encargados del Tratamiento';
          else viewLabel = 'Dashboard Protección de Datos'; 
          break;
        case ViewState.AI_RECOMMENDATIONS: viewLabel = 'NextLaw AI'; break;
        case ViewState.LEGAL_NOTIFICATIONS: viewLabel = 'Portal Legal'; break;
        case ViewState.SETTINGS: viewLabel = 'Configuración'; break;
      }
      if (viewLabel) {
        items.push({ label: viewLabel, view: currentView, companyId: selectedCompanyId });
      }
    }

    return items;
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationSelect = (note: Notification) => {
      if (note.targetView && note.targetId) {
          setCurrentView(note.targetView);
          setSelectedItemId(note.targetId);
      } else {
          // Fallback
          setCurrentView(ViewState.LEGAL_NOTIFICATIONS);
      }
      setShowNotifications(false);
  };

  const handleViewAllNotifications = () => {
    setCurrentView(ViewState.LEGAL_NOTIFICATIONS);
    setShowNotifications(false);
  };

  const handleNavigation = (view: ViewState, itemId?: string, companyId?: string, tab?: string) => {
      // Redirect global Data Protection dashboard to Clients view as requested, but ONLY for GA Abogados Partners
      if (view === ViewState.DASHBOARD && !companyId && currentContext === 'DATA_PROTECTION') {
          if (userProfile?.isGAAbogados) {
              setCurrentView(ViewState.CLIENTS);
              setSelectedCompanyId(null);
              setSelectedTab(null);
              return;
          } else {
              // Client users should always see their own company dashboard
              setCurrentView(ViewState.DASHBOARD);
              setSelectedCompanyId(userProfile?.companyId || null);
              setSelectedTab(null);
              return;
          }
      }

      setCurrentView(view);
      setSelectedItemId(itemId);
      setSelectedTab(tab === 'RAT' ? 'RAP' : tab);
      
      // Si se provee companyId, lo usamos. Si no se provee y es una navegación de sidebar, limpiamos
      // para que los socios GA Abogados puedan ver el directorio global.
      if (companyId !== undefined) {
          setSelectedCompanyId(companyId);
      } else if (userProfile?.isGAAbogados) {
          setSelectedCompanyId(null);
      }
      
      // Reset context if navigating from sidebar, unless it's Data Protection module
      if (view === ViewState.DATA_PROTECTION) {
          setCurrentContext('DATA_PROTECTION');
      } else if (view === ViewState.REGULATIONS || view === ViewState.INCIDENTS || view === ViewState.AUDITS) {
          // Keep current context for these shared views if the user is GA Abogados (they can switch)
          // or if they are already in that context.
          if (!userProfile?.isGAAbogados && userProfile?.practiceArea !== currentContext) {
              setCurrentContext(userProfile?.practiceArea || 'COMPLIANCE');
          }
      } else {
          // For other views, default to user's practice area
          if (userProfile?.practiceArea !== 'DATA_PROTECTION') {
              setCurrentContext('COMPLIANCE');
          } else {
              setCurrentContext('DATA_PROTECTION');
          }
      }
  };

  const renderContent = () => {
    // Access Control
    const isCompliance = userProfile?.practiceArea === 'COMPLIANCE';
    const isDataProtection = userProfile?.practiceArea === 'DATA_PROTECTION';

    // Views restricted to Compliance
    const complianceOnlyViews = [ViewState.RISK_CULTURE];
    // Views restricted to Data Protection
    const dataProtectionOnlyViews = [ViewState.DATA_PROTECTION];
    // Views restricted to GA Abogados Partners (Legal Studio) - Directorio completo
    const dentonsOnlyViews = [ViewState.CLIENTS];

    // CLIENTS view: GA Abogados ve directorio completo, clientes ven solo su empresa
    if (currentView === ViewState.CLIENTS && !userProfile?.isGAAbogados) {
        // Client users should see their own company dashboard instead of the client directory
        return (
            <div className="p-12 flex flex-col items-center justify-center h-full text-center text-gray-500 animate-fade-in">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <Building2 className="w-10 h-10 text-brand-primary" />
                </div>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Acceso a Empresa</h2>
                <p className="max-w-md text-gray-400 mb-6">Como cliente, tienes acceso al dashboard de tu empresa.</p>
                <button
                    onClick={() => handleNavigation(ViewState.DASHBOARD, undefined, userProfile?.companyId || undefined)}
                    className="px-6 py-3 bg-brand-primary text-white rounded-lg font-bold hover:bg-brand-primary/90 transition-colors"
                >
                    Ir a mi Dashboard
                </button>
            </div>
        );
    }

    if (complianceOnlyViews.includes(currentView) && !isCompliance) {
        return (
            <div className="p-12 flex flex-col items-center justify-center h-full text-center text-gray-500 animate-fade-in">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <ShieldAlert className="w-10 h-10 text-red-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Acceso Restringido</h2>
                <p className="max-w-md text-gray-400">Este módulo es exclusivo para el área de Cumplimiento Normativo.</p>
                <button 
                    onClick={() => handleNavigation(ViewState.DASHBOARD)}
                    className="mt-6 text-brand-primary font-bold hover:underline"
                >
                    Volver al Dashboard
                </button>
            </div>
        );
    }

    if (dataProtectionOnlyViews.includes(currentView) && !isDataProtection) {
        return (
            <div className="p-12 flex flex-col items-center justify-center h-full text-center text-gray-500 animate-fade-in">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <ShieldAlert className="w-10 h-10 text-red-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Acceso Restringido</h2>
                <p className="max-w-md text-gray-400">Este módulo es exclusivo para el área de Protección de Datos.</p>
                <button 
                    onClick={() => handleNavigation(ViewState.DASHBOARD)}
                    className="mt-6 text-brand-primary font-bold hover:underline"
                >
                    Volver al Dashboard
                </button>
            </div>
        );
    }

    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard onNavigate={handleNavigation} context={currentContext} companyId={selectedCompanyId || undefined} />;
      case ViewState.INCIDENTS:
        return <Incidents initialId={selectedItemId} context={currentContext} companyId={selectedCompanyId || undefined} onNavigate={handleNavigation} />;
      case ViewState.REGULATIONS:
        return <Regulations initialId={selectedItemId} context={currentContext} companyId={selectedCompanyId || undefined} onNavigate={handleNavigation} />;
      case ViewState.RISK_CULTURE:
        return <RiskCulture context={currentContext} companyId={selectedCompanyId || undefined} onNavigate={handleNavigation} />;
      case ViewState.LEGAL_NOTIFICATIONS:
        return <LegalNotifications />;
      case ViewState.AI_RECOMMENDATIONS:
        return <AIRecommendations />;
      case ViewState.AUDITS:
        return <Audits context={currentContext} companyId={selectedCompanyId || undefined} isGAAbogados={userProfile?.isGAAbogados} onNavigate={handleNavigation} />;
      case ViewState.CLIENTS:
        return <Clients 
          context={currentContext} 
          onNavigate={handleNavigation} 
          selectedCompanyId={selectedCompanyId}
          onSelectCompany={setSelectedCompanyId}
        />;
      case ViewState.TRAINING:
        return <Training 
          context={currentContext} 
          companyId={selectedCompanyId || undefined} 
          isGAAbogados={userProfile?.isGAAbogados}
          onNavigate={handleNavigation} 
        />;
      case ViewState.CALENDAR:
        return <ComplianceCalendar context={currentContext} companyId={selectedCompanyId || undefined} onNavigate={handleNavigation} />;
      case ViewState.DATA_PROTECTION:
        return <DataProtection onNavigate={handleNavigation} companyId={selectedCompanyId || undefined} initialTab={selectedTab as any} />;
      case ViewState.SETTINGS:
        return <SettingsView />;
      default:
        return (
          <div className="p-12 flex flex-col items-center justify-center h-full text-center text-gray-500 animate-fade-in">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Settings className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Módulo en Construcción</h2>
            <p className="max-w-md text-gray-400">Estamos trabajando duro para traerte la funcionalidad de {currentView} muy pronto.</p>
          </div>
        );
    }
  };

  const gaAbogadosUsers = (allUsers || []).filter(u => u && u.isGAAbogados);
  const clientUsers = (allUsers || []).filter(u => u && !u.isGAAbogados);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative z-10 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left side - Branding */}
            <div className="bg-brand-primary p-12 text-white flex flex-col justify-between">
              <div>
                {/* vc-logo: contenedor generoso para el logo en el panel de login/hub */}
                <div style={{
                  width: '280px',
                  height: '110px',
                  marginBottom: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                  <img 
                    src="/assets/brand/ga-logo.png"
                    alt="GA Abogados"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block',
                      filter: 'brightness(0) invert(1)',
                    }}
                    className="animate-fade-in"
                  />
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Vigilancia de Cumplimiento</h1>
                <p className="text-white text-lg leading-relaxed opacity-90">
                  Plataforma integral de gestión de riesgos y cumplimiento normativo para Clientes de GA Abogados.
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-brand-primaryLight">
                <Globe size={18} />
                <span>Red GA Abogados</span>
              </div>
            </div>

            {/* Right side - User Selection */}
            <div className="p-12 overflow-y-auto max-h-[600px]">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Seleccionar Sesión</h2>
                <p className="text-gray-500">Por favor, elija su perfil para acceder a la plataforma.</p>
              </div>

              <div className="space-y-8">
                {/* Partners Section */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 tracking-widest mb-6 flex items-center gap-2">
                    <div className="h-px flex-1 bg-gray-100"></div>
                    Socio GA Abogados
                    <div className="h-px flex-1 bg-gray-100"></div>
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    {gaAbogadosUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleUserLogin(user.id)}
                        className="flex flex-col items-center p-6 rounded-3xl border border-gray-100 hover:border-brand-primary hover:bg-brand-primary/5 hover:shadow-xl hover:shadow-brand-primary/10 transition-all group text-center"
                      >
                        <div className="relative mb-4">
                          <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
                          <img 
                            src={user.avatar} 
                            alt={user?.name || 'Usuario'} 
                            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-110 transition-transform relative z-10"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full z-20"></div>
                        </div>
                        <div className="relative z-10">
                          <h4 className="font-bold text-gray-900 group-hover:text-brand-primary transition-colors text-base mb-1">{user?.name}</h4>
                          <p className="text-[10px] font-medium text-gray-500 tracking-wider">
                            Socio GA Abogados
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clients Section */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <div className="h-px flex-1 bg-gray-100"></div>
                    Clientes
                    <div className="h-px flex-1 bg-gray-100"></div>
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    {clientUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleUserLogin(user.id)}
                        className="flex flex-col items-center p-6 rounded-3xl border border-gray-100 hover:border-brand-secondary hover:bg-brand-secondary/5 hover:shadow-xl hover:shadow-brand-secondary/10 transition-all group text-center"
                      >
                        <div className="relative mb-4">
                          <div className="absolute inset-0 bg-brand-secondary/20 rounded-full blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
                          <img 
                            src={user.avatar} 
                            alt={user?.name || 'Usuario'} 
                            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-110 transition-transform relative z-10"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute bottom-1 right-1 w-6 h-6 bg-blue-500 border-4 border-white rounded-full z-20"></div>
                        </div>
                        <div className="relative z-10">
                          <h4 className="font-bold text-gray-900 group-hover:text-brand-secondary transition-colors text-base mb-1">{user?.name}</h4>
                          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                            {user.role === UserRole.CLIENT_COMPLIANCE_OFFICER ? 'Compliance Officer' : 'Data Protection Officer'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-[10px] text-gray-400">
                  © {new Date().getFullYear()} GA Abogados. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-transparent overflow-hidden font-sans selection:bg-brand-secondary/30">
      
      {/* Sidebar */}
      <aside 
        className={`bg-brand-primary text-white flex flex-col transition-all duration-300 ease-in-out relative z-30 shadow-2xl
          ${sidebarOpen ? 'w-72' : 'w-20'}
        `}
      >
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-28 bg-white text-brand-primary border border-gray-100 shadow-md rounded-full p-1.5 z-50 hover:bg-gray-50 focus:outline-none transition-transform hover:scale-110"
          title={sidebarOpen ? "Contraer menú" : "Expandir menú"}
        >
          <ChevronLeft size={16} className={`transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Logo Area - vc-sidebar-logo: bloque de marca claro en la parte superior del sidebar */}
        <div
          style={{
            width: '100%',
            height: sidebarOpen ? '96px' : '72px',
            padding: sidebarOpen ? '12px 20px' : '12px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0,
            transition: 'all 0.3s ease-in-out',
          }}
        >
          {sidebarOpen ? (
            <img
              src="/assets/brand/ga-logo.png"
              alt="GA Abogados"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
                filter: 'brightness(0) invert(1)',
              }}
              className="animate-fade-in transition-all duration-500"
            />
          ) : (
            <div style={{
              width: '44px',
              height: '44px',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.1)',
              flexShrink: 0,
              cursor: 'default',
            }}>
              <span style={{ color: '#f17551', fontWeight: 900, fontSize: '18px', lineHeight: 1 }}>GA</span>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto py-6 px-0 space-y-0.5 custom-scrollbar">
          <div className={`text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-6 ${!sidebarOpen && 'hidden'}`}>
            Operaciones
          </div>
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label={currentContext === 'DATA_PROTECTION' ? "Vigilancia Protección de Datos" : "Vigilancia de Cumplimiento"} 
            active={currentView === ViewState.DASHBOARD}
            onClick={() => handleNavigation(ViewState.DASHBOARD)}
            isCollapsed={!sidebarOpen}
          />
          
          {userProfile?.isGAAbogados && (
            <SidebarItem 
              icon={<Building2 size={20} />} 
              label="Clientes / Empresas" 
              active={currentView === ViewState.CLIENTS}
              onClick={() => handleNavigation(ViewState.CLIENTS)}
              isCollapsed={!sidebarOpen}
            />
          )}

          <SidebarItem 
            icon={<Calendar size={20} />} 
            label="Mi Calendario" 
            active={currentView === ViewState.CALENDAR}
            onClick={() => handleNavigation(ViewState.CALENDAR)}
            isCollapsed={!sidebarOpen}
          />

          <div className="my-6 border-t border-white/10 mx-4" />

          <div className={`text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-6 ${!sidebarOpen && 'hidden'}`}>
            Legal Tech
          </div>
          <SidebarItem 
            icon={<ShieldAlert size={20} />} 
            label="Portal Legal" 
            active={currentView === ViewState.LEGAL_NOTIFICATIONS}
            onClick={() => handleNavigation(ViewState.LEGAL_NOTIFICATIONS)}
            isCollapsed={!sidebarOpen}
          />
           <SidebarItem 
            icon={<Sparkles size={20} />} 
            label="NextLaw AI" 
            active={currentView === ViewState.AI_RECOMMENDATIONS}
            onClick={() => handleNavigation(ViewState.AI_RECOMMENDATIONS)}
            isCollapsed={!sidebarOpen}
          />
        </div>

        {/* User Profile in Sidebar Bottom */}
        <div className="p-4 bg-black/20 border-t border-white/5">
          <div className="flex flex-col gap-3">
            <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
              <div className="relative">
                <img 
                  src={userProfile?.avatar} 
                  alt={userProfile?.name || 'Usuario'}
                  className="w-9 h-9 rounded-full object-cover border border-white/10"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-brand-secondary border-2 border-brand-primary rounded-full"></span>
              </div>
              {sidebarOpen && (
                <div className="overflow-hidden flex-1">
                  <p className="text-sm font-medium text-white truncate">{userProfile?.name || 'Cargando...'}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {userProfile?.isGAAbogados ? 'Socio GA Abogados' : (
                      userProfile?.role === 'CLIENT_COMPLIANCE_OFFICER' ? 'Compliance Officer' :
                      userProfile?.role === 'CLIENT_DPO' ? 'Data Protection Officer' :
                      (userProfile?.role || '...')
                    )}
                  </p>
                </div>
              )}
              {sidebarOpen && (
                 <div className="flex items-center gap-1">
                   <button 
                     onClick={() => handleNavigation(ViewState.SETTINGS)}
                     className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                     title="Configuración"
                   >
                      <Settings size={18} />
                   </button>
                   <button 
                     onClick={handleLogout}
                     className="text-gray-400 hover:text-red-400 transition-colors p-1 hover:bg-white/10 rounded"
                     title="Cerrar Sesión"
                   >
                      <LogOut size={18} />
                   </button>
                 </div>
              )}
            </div>
            {!sidebarOpen && (
              <button 
                onClick={handleLogout}
                className="flex justify-center text-gray-400 hover:text-red-400 transition-colors p-1 hover:bg-white/10 rounded"
                title="Cerrar Sesión"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <header className="h-24 bg-white/90 backdrop-blur-md border-b border-red-500 flex justify-between items-center px-8 absolute top-0 left-0 right-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Header Title */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-brand-primary text-xl tracking-tight">
                 {currentView === ViewState.DASHBOARD ? (currentContext === 'DATA_PROTECTION' ? 'Dashboard - Vigilancia Protección de datos' : 'Dashboard - Vigilancia Cumplimiento') : 
                  currentView === ViewState.INCIDENTS ? (currentContext === 'DATA_PROTECTION' ? 'Incidentes de Privacidad' : 'Gestión de Incidentes') :
                  currentView === ViewState.REGULATIONS ? (currentContext === 'DATA_PROTECTION' ? 'Biblioteca de Protección de Datos' : 'Biblioteca Normativa') :
                  currentView === ViewState.AI_RECOMMENDATIONS ? 'NextLaw AI' :
                  currentView === ViewState.RISK_CULTURE ? 'Evaluación de Cultura y Riesgo' :
                  currentView === ViewState.LEGAL_NOTIFICATIONS ? 'Portal Legal' :
                  currentView === ViewState.AUDITS ? (currentContext === 'DATA_PROTECTION' ? 'Auditorías de Privacidad' : 'Plan de Auditoría') :
                  currentView === ViewState.CLIENTS ? 'Empresas Cliente' :
                  currentView === ViewState.TRAINING ? (currentContext === 'DATA_PROTECTION' ? 'Capacitación en Privacidad' : 'Capacitación y Training') :
                  currentView === ViewState.CALENDAR ? 'Agenda de Cumplimiento' : 
                  currentView === ViewState.DATA_PROTECTION ? 'Dashboard - Vigilancia Protección de datos' :
                  currentView === ViewState.SETTINGS ? 'Perfil y Configuración' : currentView}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
             {/* Search Bar */}
             <div className="hidden md:flex items-center bg-gray-50/50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-brand-secondary focus-within:bg-white focus-within:ring-1 focus-within:ring-brand-secondary transition-all w-64">
                <Search size={16} className="text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Buscar en GA Abogados..." 
                  className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                />
             </div>

            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={handleNotificationClick}
                className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-brand-primary/10 text-brand-primary' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <Bell size={20} className={showNotifications ? "text-brand-primary" : ""} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 ring-2 ring-white text-[10px] font-bold text-white">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {/* Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 origin-top-right animate-fade-in">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Notificaciones</h3>
                    <span className="text-xs font-medium bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">
                      {notifications.length} Nuevas
                    </span>
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">
                        <Bell size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No tienes notificaciones nuevas.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {notifications.slice(0, 5).map((note) => (
                          <div 
                            key={note.id} 
                            onClick={() => handleNotificationSelect(note)}
                            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 items-start group"
                          >
                            <div className={`mt-1 p-2 rounded-full shrink-0 ${note.type === 'CRITICAL' ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-600'}`}>
                              {note.type === 'CRITICAL' ? <ShieldAlert size={16} /> : <FileText size={16} />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-800 leading-tight mb-1 group-hover:text-brand-primary transition-colors">{note.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-2 mb-1.5">{note.description}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{note.company}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={10} /> {note.date}</span>
                                    {note.targetId && (
                                        <ArrowRight size={12} className="text-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 border-t border-gray-100 bg-gray-50">
                    <button 
                      onClick={handleViewAllNotifications}
                      className="w-full py-2 text-sm font-medium text-brand-primary hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 shadow-sm"
                    >
                      Ver todas las notificaciones
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-gray-200 mx-2"></div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all text-sm font-bold"
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
              <span className="hidden lg:inline">Cerrar Sesión</span>
            </button>

          </div>
        </header>

        {/* Content Area - Added padding top to account for fixed header */}
        <main className="flex-1 overflow-y-auto pt-24 bg-transparent relative custom-scrollbar">
          <div className="max-w-7xl mx-auto p-8">
             <Breadcrumbs items={getBreadcrumbs()} onNavigate={handleNavigation} />
             {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
