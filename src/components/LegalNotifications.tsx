import React, { useState } from 'react';
import { 
  Newspaper, 
  Search, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Scale,
  ExternalLink,
  ChevronRight,
  Bookmark,
  Share2,
  LayoutGrid,
  List,
  Clock
} from 'lucide-react';

export const LegalNotifications: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'COMPLIANCE' | 'DATA_PROTECTION'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const newsletters = [
    {
      id: '1',
      title: 'Nueva Ley de Protección de Datos Personales en Chile: Avances 2026',
      category: 'DATA_PROTECTION',
      date: '12 Abr 2026',
      summary: 'Análisis detallado sobre las nuevas facultades de la Agencia de Protección de Datos y el régimen de sanciones agravadas que entrará en vigencia próximamente.',
      readTime: '7 min',
      image: 'https://picsum.photos/seed/privacy-chile/800/400'
    },
    {
      id: '2',
      title: 'Actualización Ley 20.393: Nuevos Delitos Económicos y Responsabilidad Penal',
      category: 'COMPLIANCE',
      date: '10 Abr 2026',
      summary: 'Guía para la actualización de Modelos de Prevención de Delitos ante la inclusión de delitos ambientales y contra el mercado en el marco de la Ley de Delitos Económicos.',
      readTime: '10 min',
      image: 'https://picsum.photos/seed/compliance-law/800/400'
    },
    {
      id: '3',
      title: 'Estándares Globales de Privacidad: Impacto del AI Act en Latinoamérica',
      category: 'DATA_PROTECTION',
      date: '05 Abr 2026',
      summary: 'Cómo la regulación europea de Inteligencia Artificial está moldeando las exigencias de cumplimiento en la región y qué deben esperar las empresas chilenas.',
      readTime: '15 min',
      image: 'https://picsum.photos/seed/ai-privacy/800/400'
    },
    {
      id: '4',
      title: 'Ciberseguridad y Cumplimiento: Nuevas Exigencias de la CMF para 2026',
      category: 'COMPLIANCE',
      date: '01 Abr 2026',
      summary: 'Revisión de las circulares recientes sobre gestión de riesgos operacionales y seguridad de la información para entidades financieras y emisores de valores.',
      readTime: '9 min',
      image: 'https://picsum.photos/seed/cyber-compliance/800/400'
    },
    {
      id: '5',
      title: 'Ley Marco de Ciberseguridad: Obligaciones para Operadores de Servicios Esenciales',
      category: 'COMPLIANCE',
      date: '28 Mar 2026',
      summary: 'Análisis de la nueva institucionalidad de ciberseguridad en Chile y las obligaciones de reporte de incidentes para el sector público y privado.',
      readTime: '12 min',
      image: 'https://picsum.photos/seed/security-law/800/400'
    },
    {
      id: '6',
      title: 'Transferencias Internacionales de Datos: Nuevas Cláusulas Contractuales Tipo',
      category: 'DATA_PROTECTION',
      date: '20 Mar 2026',
      summary: 'Recomendaciones para la actualización de contratos de servicios en la nube y flujos transfronterizos de información personal bajo estándares OCDE.',
      readTime: '8 min',
      image: 'https://picsum.photos/seed/data-transfer/800/400'
    }
  ];

  const filteredNewsletters = activeCategory === 'ALL' 
    ? newsletters 
    : newsletters.filter(n => n.category === activeCategory);

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Newspaper className="text-brand-primary" size={36} />
            Portal Legal & Boletines
          </h1>
          <p className="text-gray-500 mt-1">Actualizaciones legislativas y noticias relevantes del sector.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
            <button 
              onClick={() => setActiveCategory('ALL')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === 'ALL' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setActiveCategory('COMPLIANCE')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === 'COMPLIANCE' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Cumplimiento
            </button>
            <button 
              onClick={() => setActiveCategory('DATA_PROTECTION')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === 'DATA_PROTECTION' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Protección de Datos
            </button>
          </div>

          <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-300 hover:text-gray-500'}`}
              title="Vista Cuadrícula"
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-300 hover:text-gray-500'}`}
              title="Vista Lista"
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Featured Article */}
        <div className="lg:col-span-2 space-y-8">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredNewsletters.map((item) => (
                <div key={item.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                        item.category === 'DATA_PROTECTION' ? 'bg-blue-500 text-white' : 'bg-brand-secondary text-brand-primary'
                      }`}>
                        {item.category === 'DATA_PROTECTION' ? 'Protección de Datos' : 'Cumplimiento'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      <Calendar size={12} />
                      {item.date}
                      <span className="mx-1">•</span>
                      {item.readTime} de lectura
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-primary transition-colors leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed">
                      {item.summary}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <button className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline">
                        Leer más <ChevronRight size={16} />
                      </button>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-300 hover:text-brand-primary transition-colors">
                          <Bookmark size={16} />
                        </button>
                        <button className="p-2 text-gray-300 hover:text-brand-primary transition-colors">
                          <Share2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNewsletters.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group flex items-center p-4 gap-6">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                        item.category === 'DATA_PROTECTION' ? 'bg-blue-50 text-blue-600' : 'bg-brand-secondary/20 text-brand-primary'
                      }`}>
                        {item.category === 'DATA_PROTECTION' ? 'Protección de Datos' : 'Cumplimiento'}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">{item.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-primary transition-colors leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1 mb-4">
                      {item.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {item.date}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {item.readTime}</span>
                      </div>
                      <button className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline">
                        Leer <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Recent Updates & Resources */}
        <div className="space-y-8">
          <div className="bg-brand-primary rounded-[2.5rem] p-8 text-white shadow-xl shadow-brand-primary/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Newsletter Semanal</h3>
              <p className="text-white/70 text-sm mb-6 leading-relaxed">
                Suscríbase para recibir las actualizaciones legales más críticas directamente en su bandeja de entrada.
              </p>
              <div className="space-y-3">
                <input 
                  type="email" 
                  placeholder="su@email.com"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
                />
                <button className="w-full py-3 bg-brand-secondary text-brand-primary rounded-xl font-bold text-sm hover:bg-white transition-all shadow-lg">
                  Suscribirme ahora
                </button>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-10">
              <Scale size={180} />
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
            <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ShieldCheck className="text-brand-primary" size={20} />
              Recursos Destacados
            </h4>
            <div className="space-y-4">
              {[
                'Guía de Implementación GDPR',
                'Checklist de Auditoría Interna',
                'Manual de Prevención de Delitos',
                'Plantilla de Registro de Actividades'
              ].map((resource, i) => (
                <a key={i} href="#" className="flex items-center justify-between group p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-all">
                  <span className="text-sm text-gray-600 group-hover:text-brand-primary transition-colors">{resource}</span>
                  <ExternalLink size={14} className="text-gray-300 group-hover:text-brand-primary transition-all" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
