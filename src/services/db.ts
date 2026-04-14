
import { Alert, Audit, Regulation, Severity, Status, Incident, RiskAssessment, Notification, Company, TrainingModule, CalendarEvent, UserProfile, UserRole, Trainee, Evidence, InvolvedParty, AuditFinding, ViewState, DataInventory, ArcoRequest, DpiaAssessment, RatEntry, EipdAssessment, DataProcessor } from '../types';

// --- CONFIG ---
const DB_VERSION = 'v18_compliance_calendar_v2'; // Force reset for calendar module
const COMPANY_COUNT = 50;

// --- GENERATOR HELPERS ---

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// Data Pools
const INDUSTRIES = ['Minería', 'Finanzas', 'Tecnología', 'Retail', 'Energía', 'Salud', 'Logística', 'Manufactura', 'Construcción', 'Servicios Legales', 'Agroindustria', 'Pesca', 'Transporte', 'Inmobiliaria', 'Educación'];
const COMPANY_PREFIXES = ['Grupo', 'Corporación', 'Inversiones', 'Servicios', 'Holding', 'Minera', 'Banco', 'Clínica', 'Transportes', 'Constructora', 'Agrícola', 'Tecnologías', 'Asesorías'];
const COMPANY_SUFFIXES = ['S.A.', 'SpA', 'Ltda.', 'Global', 'Chile', 'International', 'Group', 'Andina', 'del Sur', 'Norte', 'Pacific', 'Latam'];

const INCIDENT_TITLES = [
  'Fuga de datos sensibles', 'Conflicto de interés no declarado', 'Accidente laboral grave', 'Error en cálculo de finiquitos',
  'Denuncia por Acoso (Ley Karin)', 'Sospecha de Cohecho', 'Incumplimiento ambiental', 'Falla crítica en servidores',
  'Pérdida de inventario', 'Auditoría fallida', 'Retraso en reporte CMF', 'Vulneración de ciberseguridad',
  'Multa Inspección del Trabajo', 'Reclamo Cliente VIP', 'Filtración a Prensa', 'Robo de Equipos'
];

const DATA_PROTECTION_TOPICS = [
  'Inventario de Activos de Datos',
  'Evaluación de Impacto (DPIA) - Biometría',
  'Protocolo de Respuesta ante Brechas',
  'Auditoría de Cookies y Rastreadores',
  'Revisión de Cláusulas de Transferencia Internacional',
  'Mapeo de Flujos de Datos Transfronterizos'
];

const ARCO_DESCRIPTIONS = [
  'Solicitud de acceso a datos de navegación y perfilamiento.',
  'Rectificación de domicilio legal y datos de contacto.',
  'Oposición al tratamiento de datos para fines de marketing directo.',
  'Cancelación de cuenta y supresión de datos históricos.',
  'Portabilidad de historial de transacciones en formato estructurado.'
];

const DPIA_TITLES = [
  'DPIA - Implementación de Reconocimiento Facial en Accesos',
  'DPIA - Migración de Core Bancario a Nube Pública',
  'DPIA - Nuevo Sistema de Monitoreo de Empleados',
  'DPIA - Plataforma de Telemedicina con Datos Sensibles'
];

const NAMES = ['Carlos', 'Ana', 'Roberto', 'María', 'Juan', 'Luis', 'Elena', 'Patricia', 'Jorge', 'Claudia', 'Pedro', 'Sofía', 'Andrés', 'Carolina', 'Diego', 'Valentina', 'Javier', 'Camila'];
const LASTNAMES = ['Pérez', 'González', 'Muñoz', 'Rojas', 'Díaz', 'Soto', 'Contreras', 'Silva', 'Martínez', 'Sepúlveda', 'Morales', 'Rodríguez', 'López', 'Fuentes', 'Torres', 'Vargas'];

// --- ID GENERATOR ---
export const generateId = (prefix: string) => `${prefix}-${getRandomInt(1000, 9999)}-${String.fromCharCode(65+getRandomInt(0,25))}${String.fromCharCode(65+getRandomInt(0,25))}`;

// --- GENERATORS ---

const generateCompanies = (count: number): Company[] => {
  const companies: Company[] = [];
  
  // Specific requested companies
  const specificCompanies = [
    { name: 'Retail S.A.', industry: 'Retail' },
    { name: 'Banco Futuro', industry: 'Finanzas' },
    { name: 'Logística Transp', industry: 'Logística' },
    { name: 'Minería Norte', industry: 'Minería' },
    { name: 'Holding Alpha Ltda.', industry: 'Manufactura' }
  ];

  specificCompanies.forEach((sc, i) => {
    companies.push({
      id: `COMP-${i + 1}`,
      name: sc.name,
      industry: sc.industry,
      riskScore: getRandomInt(10, 95),
      activeAlerts: 0,
      status: 'Activo',
      contactPerson: `${getRandomItem(NAMES)} ${getRandomItem(LASTNAMES)}`,
      email: `contacto@${sc.name.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `+56 9 ${getRandomInt(1000, 9999)} ${getRandomInt(1000, 9999)}`,
      address: `${getRandomItem(['Av. Apoquindo', 'Calle Nueva York', 'Isidora Goyenechea', 'Av. Providencia'])} ${getRandomInt(100, 9999)}, Santiago`,
      taxId: `${getRandomInt(70, 99)}.${getRandomInt(100, 999)}.${getRandomInt(100, 999)}-${getRandomInt(0, 9)}`,
      description: `Empresa líder en el sector de ${sc.industry.toLowerCase()}, comprometida con los más altos estándares de cumplimiento y protección de datos.`,
      importance: 5 - i // Assign importance 5 to 1 for specific companies
    });
  });

  for (let i = specificCompanies.length; i < count; i++) {
    const industry = getRandomItem(INDUSTRIES);
    const name = `${getRandomItem(COMPANY_PREFIXES)} ${getRandomItem(['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Terra', 'Nova', 'Magna', 'Prime', 'Star', 'Blue', 'Red', 'Green', 'Iron', 'Copper', 'Silver'])} ${getRandomItem(COMPANY_SUFFIXES)}`;
    companies.push({
      id: `COMP-${i + 1}`,
      name: name,
      industry: industry,
      riskScore: getRandomInt(10, 95),
      activeAlerts: 0, // Will be calculated later
      status: Math.random() > 0.1 ? 'Activo' : (Math.random() > 0.5 ? 'Onboarding' : 'Inactivo'),
      contactPerson: `${getRandomItem(NAMES)} ${getRandomItem(LASTNAMES)}`,
      email: `contacto@${name.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `+56 9 ${getRandomInt(1000, 9999)} ${getRandomInt(1000, 9999)}`,
      address: `${getRandomItem(['Av. Apoquindo', 'Calle Nueva York', 'Isidora Goyenechea', 'Av. Providencia'])} ${getRandomInt(100, 9999)}, Santiago`,
      taxId: `${getRandomInt(70, 99)}.${getRandomInt(100, 999)}.${getRandomInt(100, 999)}-${getRandomInt(0, 9)}`,
      description: `Empresa líder en el sector de ${industry.toLowerCase()}, comprometida con los más altos estándares de cumplimiento y protección de datos.`,
      importance: getRandomInt(1, 3)
    });
  }
  return companies;
};

const generateEvidence = (count: number, typePrefix: string): Evidence[] => {
    const evs: Evidence[] = [];
    for(let i=0; i<count; i++) {
        const type = getRandomItem(['PDF', 'DOC', 'IMG']);
        evs.push({
            id: generateId('EV'),
            name: `${typePrefix} - Respaldo ${i+1}.${type.toLowerCase()}`,
            type: type as any,
            url: '#',
            uploadDate: new Date().toISOString().split('T')[0],
            uploadedBy: 'Sistema Automático'
        });
    }
    return evs;
};

const generateIncidents = (companies: Company[]): Incident[] => {
  const incidents: Incident[] = [];
  const today = new Date();
  const sixMonthsAgo = new Date(today); sixMonthsAgo.setMonth(today.getMonth() - 6);
  
  companies.forEach(company => {
    // Generate 0 to 3 incidents per company on average
    const count = Math.random() > 0.5 ? getRandomInt(1, 4) : 0;
    for (let i = 0; i < count; i++) {
      const severity = getRandomItem([Severity.LOW, Severity.MEDIUM, Severity.HIGH, Severity.CRITICAL]);
      const status = getRandomItem(['Nueva', 'En Investigación', 'Escalada', 'Cerrada']);
      const date = getRandomDate(sixMonthsAgo, today); 
      
      // Generate involved parties
      const involved: InvolvedParty[] = [];
      if (Math.random() > 0.3) {
          involved.push({
              id: generateId('PRT'),
              name: `${getRandomItem(NAMES)} ${getRandomItem(LASTNAMES)}`,
              role: 'Investigado',
              department: 'Operaciones'
          });
      }

      const category = getRandomItem(['Compliance', 'Laboral', 'TI', 'Operacional', 'Financiero', 'Protección de Datos']);
      const isDP = category === 'Protección de Datos' || category === 'TI';

      // Chain of Custody Samples
      const chain: ChainOfCustody[] = [
        {
          id: generateId('COC'),
          action: 'Reporte Inicial Recibido',
          performer: 'Sistema de Denuncias',
          timestamp: date,
          notes: 'Ingreso automático vía portal web.',
          verified: true
        },
        {
          id: generateId('COC'),
          action: 'Asignación de Investigador',
          performer: 'Socio Director',
          timestamp: new Date(new Date(date).getTime() + 3600000).toISOString(),
          notes: 'Asignado para revisión preliminar.',
          verified: true
        }
      ];

      if (status === 'Cerrada' || status === 'En Investigación') {
        chain.push({
          id: generateId('COC'),
          action: 'Recolección de Evidencia Digital',
          performer: 'Oficial de Seguridad',
          timestamp: new Date(new Date(date).getTime() + 86400000).toISOString(),
          notes: 'Hash verificado contra estándar SHA-256.',
          verified: true
        });
      }

      incidents.push({
        id: generateId('INC'),
        companyId: company.id,
        practiceArea: isDP ? 'DATA_PROTECTION' : 'COMPLIANCE',
        title: getRandomItem(INCIDENT_TITLES),
        severity: severity,
        status: status,
        date: date.split('T')[0] + ' ' + date.split('T')[1].substring(0,5),
        reportedBy: `${getRandomItem(NAMES)} ${getRandomItem(LASTNAMES)}`,
        category: category,
        assignedTo: isDP ? 'DPO / TI' : (Math.random() > 0.3 ? 'Fiscalía' : 'Comité de Ética'),
        description: 'Descripción técnica y legal del incidente. Se requiere análisis forense de la brecha detectada y evaluación del impacto en la continuidad operacional y el cumplimiento regulatorio.',
        evidence: generateEvidence(getRandomInt(1, 4), 'Evidencia Investigación'),
        involvedParties: involved,
        chainOfCustody: chain,
        tags: ['Evidencia Digital', 'Investigación Activa', category],
        legalStatus: status === 'Cerrada' ? 'Cerrado Administrativamente' : 'En Etapa de Investigación',
        residualRisk: status === 'Cerrada' ? Severity.LOW : severity,
        correctiveMeasures: 'Implementación de parches de seguridad, revisión de protocolos de acceso y capacitación reforzada al personal involucrado.',
        certificationFrame: isDP ? 'GDPR / Ley 19.628' : 'ISO 37001 / Ley 20.393'
      });
    }
  });
  return incidents;
};

const generateRegulations = (companies: Company[]): Regulation[] => {
  const regulations: Regulation[] = [];
  
  // 1. Global Laws (Apply to everyone)
  const globalLaws = [
    { code: 'LEY-20393', title: 'Responsabilidad Penal Personas Jurídicas', tags: ['Compliance', 'Delitos'], area: 'COMPLIANCE' },
    { code: 'LEY-21643', title: 'Ley Karin (Acoso Laboral)', tags: ['RRHH', 'Laboral'], area: 'COMPLIANCE' },
    { code: 'LEY-19628', title: 'Protección de la Vida Privada', tags: ['Datos', 'Privacidad'], area: 'DATA_PROTECTION' },
    { code: 'LEY-21000', title: 'Comisión para el Mercado Financiero', tags: ['Financiero'], area: 'COMPLIANCE' },
    { code: 'DS-594', title: 'Condiciones Sanitarias y Ambientales', tags: ['Seguridad', 'Salud'], area: 'COMPLIANCE' },
    { code: 'LEY-21595', title: 'Ley de Delitos Económicos', tags: ['Penal', 'Directorio'], area: 'COMPLIANCE' },
    { 
      code: 'GDPR (UE) 2016/679', 
      title: 'Reglamento General de Protección de Datos (GDPR)', 
      tags: ['UE', 'Privacidad', 'Estándar Internacional'], 
      area: 'DATA_PROTECTION',
      agency: 'Parlamento Europeo / Consejo de la UE',
      summary: 'Reglamento de la Unión Europea que establece el estándar global de privacidad y sirve como base fundamental para la modernización de la Ley de Protección de Datos en Chile.'
    }
  ];

  globalLaws.forEach(l => {
    regulations.push({
      id: generateId('REG'),
      code: l.code,
      title: l.title,
      practiceArea: l.area as any,
      type: 'Ley',
      status: 'Vigente',
      criticality: Severity.HIGH,
      agency: (l as any).agency || 'Congreso Nacional',
      nextReview: getRandomDate(new Date(), new Date(new Date().setFullYear(new Date().getFullYear() + 1))).split('T')[0],
      scope: (l.code.includes('GDPR')) ? 'Internacional' : 'Nacional',
      summary: (l as any).summary || 'Ley de aplicación general para todas las industrias.',
      keywords: l.tags,
      tags: l.tags,
      sectors: ['Transversal'],
      attachments: generateEvidence(1, 'Texto Legal')
    });
  });

  // 2. Internal Policies per Company (Random selection of companies to have specific policies)
  companies.slice(0, 15).forEach(company => {
    const count = getRandomInt(2, 4);
    for(let i=0; i<count; i++) {
       const depts = ['RRHH', 'Finanzas', 'TI', 'Legal', 'Operaciones'];
       const dept = getRandomItem(depts);
       
       // Define policy pools by area
       const compliancePolicies = ['Gastos y Viáticos', 'Prevención del Delito', 'Gestión de Proveedores', 'Vacaciones', 'Uso de Vehículos', 'Regalos e Invitaciones', 'Código de Ética'];
       const dpPolicies = ['Ciberseguridad', 'Protección de Datos Personales', 'Gestión de Activos de Información', 'Respuesta a Incidentes de Datos', 'Privacidad desde el Diseño'];
       
       // Logic to decide area based on department or chance
       const isDP = dept === 'TI' || Math.random() > 0.7;
       const title = isDP ? getRandomItem(dpPolicies) : getRandomItem(compliancePolicies);
       
       regulations.push({
        id: generateId('POL'),
        code: `POL-${company.name.substring(0,3).toUpperCase()}-0${i+1}`,
        title: `Política Interna de ${title}`,
        practiceArea: isDP ? 'DATA_PROTECTION' : 'COMPLIANCE',
        companyId: company.id,
        type: 'Política Interna',
        status: getRandomItem(['Vigente', 'Vigente', 'Vigente', 'En Revisión']),
        criticality: getRandomItem([Severity.MEDIUM, Severity.HIGH]),
        agency: 'Directorio',
        department: dept,
        nextReview: getRandomDate(new Date(), new Date(new Date().setMonth(new Date().getMonth() + 6))).split('T')[0],
        scope: 'Interno',
        summary: `Política específica para ${company.name}, área ${dept}.`,
        keywords: ['Interno', company.name, title],
        tags: ['Política Interna', dept, isDP ? 'Privacidad' : 'Compliance'],
        sectors: ['Interno'],
        linkedPolicies: [],
        attachments: generateEvidence(1, 'Política PDF')
       });
    }
  });

  return regulations;
};

const generateAudits = (companies: Company[]): Audit[] => {
  const audits: Audit[] = [];
  const today = new Date();
  const startRange = new Date(today); startRange.setMonth(today.getMonth() - 6);
  const endRange = new Date(today); endRange.setMonth(today.getMonth() + 8);

  companies.slice(0, 25).forEach(company => {
     // 1 to 3 audits per company
     const count = getRandomInt(1, 3);
     for(let i=0; i<count; i++) {
        const date = getRandomDate(startRange, endRange).split('T')[0];
        const isPast = new Date(date) < today;
        const status = isPast ? 'Finalizada' : (new Date(date) < new Date(today.getTime() + 86400000*7) ? 'En Progreso' : 'Planificada');
        
        // Generate findings if audit is done or in progress
        const findings: AuditFinding[] = [];
        if (status !== 'Planificada') {
            const fCount = getRandomInt(0, 5);
            for(let j=0; j<fCount; j++) {
                findings.push({
                    id: generateId('FIND'),
                    description: `Hallazgo #${j+1}: ${getRandomItem(['Falta de firma en contrato', 'Acceso no revocado a ex-empleado', 'Diferencia en conciliación bancaria', 'No conformidad en EPP'])}`,
                    severity: getRandomItem([Severity.LOW, Severity.MEDIUM, Severity.HIGH]),
                    status: Math.random() > 0.5 ? 'Abierto' : 'Cerrado'
                });
            }
        }

        const title = `Auditoría ${getRandomItem(['ISO 27001', 'ISO 9001', 'Estados Financieros', 'Laboral', 'Ley 20.393', 'Ciberseguridad', 'Procesos', 'Protección de Datos'])}`;
        const isDP = title.includes('Protección de Datos') || title.includes('Ciberseguridad') || title.includes('ISO 27001');

        audits.push({
            id: generateId('AUD'),
            companyId: company.id,
            practiceArea: isDP ? 'DATA_PROTECTION' : 'COMPLIANCE',
            title: title,
            type: getRandomItem(['Interna', 'Externa', 'Certificación']),
            status: status as any,
            auditor: getRandomItem(['Deloitte', 'KPMG', 'EY', 'PWC', 'Interno: Riesgos', 'Interno: Contraloría']),
            startDate: date,
            scope: getRandomItem(['Casa Matriz', 'Sucursales', 'Procesos Críticos', 'TI', 'RRHH']),
            description: 'Revisión programada de controles y cumplimiento normativo.',
            evidence: status === 'Finalizada' ? generateEvidence(getRandomInt(1, 3), 'Informe Auditoría') : [],
            findings: findings
        });
     }
  });
  return audits;
};

const generateAttendees = (companyId: string | undefined): Trainee[] => {
    const attendees: Trainee[] = [];
    const count = getRandomInt(5, 25);
    for(let i=0; i<count; i++) {
        attendees.push({
            id: generateId('ATT'),
            name: `${getRandomItem(NAMES)} ${getRandomItem(LASTNAMES)}`,
            department: getRandomItem(['Ventas', 'Operaciones', 'RRHH', 'TI', 'Finanzas', 'Gerencia']),
            companyId: companyId || 'Unknown',
            status: Math.random() > 0.1 ? 'Presente' : (Math.random() > 0.5 ? 'Ausente' : 'Justificado'),
            score: getRandomInt(50, 100),
            certificateUrl: Math.random() > 0.3 ? '#' : undefined
        });
    }
    return attendees;
};

const generateTrainings = (companies: Company[]): TrainingModule[] => {
  const trainings: TrainingModule[] = [];
  const globalTopics = ['Ley Karin', 'Modelo de Prevención de Delitos', 'Ciberseguridad Básica', 'Protección de Datos', 'Lavado de Activos'];
  
  // 1. Global Trainings (Shared)
  globalTopics.forEach(topic => {
     const trId = generateId('TR-GL');
     const isDP = topic === 'Protección de Datos' || topic === 'Ciberseguridad Básica';
     // Generate a mix of attendees from different companies
     let allAttendees: Trainee[] = [];
     companies.slice(0, 10).forEach(c => {
         allAttendees = [...allAttendees, ...generateAttendees(c.id)];
     });

     const isPast = Math.random() > 0.3;
     const startDate = isPast 
        ? getRandomDate(new Date('2024-01-01'), new Date()).split('T')[0] 
        : getRandomDate(new Date(), new Date('2025-12-31')).split('T')[0];

     trainings.push({
        id: trId,
        practiceArea: isDP ? 'DATA_PROTECTION' : 'COMPLIANCE',
        title: `Curso Global: ${topic}`,
        startDate: startDate,
        deadline: new Date(new Date(startDate).getTime() + 86400000*30).toISOString().split('T')[0],
        completionRate: getRandomInt(40, 98),
        assignedTo: allAttendees.length,
        status: isPast ? 'Cerrado' : 'Activo',
        category: isDP ? 'Privacidad' : 'Compliance',
        modality: getRandomItem(['Online', 'Presencial', 'Híbrido']),
        isSence: Math.random() > 0.7,
        senceCode: Math.random() > 0.7 ? `SENCE-${getRandomInt(1000, 9999)}` : undefined,
        scope: 'GLOBAL',
        attendees: allAttendees,
        evidence: generateEvidence(1, 'Material Curso'),
        description: 'Capacitación mandatoria para todos los empleados.',
        objectives: 'Comprender los fundamentos normativos y aplicar mejores prácticas.',
        instructor: `${getRandomItem(NAMES)} ${getRandomItem(LASTNAMES)}`,
        location: isDP ? 'Plataforma E-learning' : 'Sala de Conferencias',
        durationHours: getRandomInt(2, 8),
        targetDepartments: 'Ventas, Operaciones, Todos',
        evaluationMethod: 'Examen Online'
     });
  });

  // 2. Specific Trainings
  companies.slice(0, 10).forEach(c => {
      const count = getRandomInt(1, 2);
      for(let i=0; i<count; i++) {
          const attendees = generateAttendees(c.id);
          const isPast = Math.random() > 0.5;
          const startDate = getRandomDate(new Date('2024-01-01'), new Date('2025-12-31')).split('T')[0];
          
          trainings.push({
            id: generateId('TR-SP'),
            practiceArea: 'COMPLIANCE', // Default for specific inductions
            title: `Inducción Específica: ${c.industry}`,
            startDate: startDate,
            deadline: new Date(new Date(startDate).getTime() + 86400000*15).toISOString().split('T')[0],
            completionRate: getRandomInt(10, 100),
            assignedTo: attendees.length,
            status: isPast ? 'Cerrado' : 'Activo',
            category: 'Inducción',
            modality: 'Presencial',
            isSence: false,
            scope: 'SPECIFIC',
            companyId: c.id,
            attendees: attendees,
            evidence: [],
            description: `Capacitación focalizada en procesos de ${c.industry}.`,
            objectives: 'Alinear al personal con estándares de la industria.',
            instructor: 'Consultor Senior',
            location: 'Oficinas Cliente',
            durationHours: 4,
            targetDepartments: 'Nuevos Ingresos',
            evaluationMethod: 'Práctica'
          });
      }
  });

  return trainings;
};

const generateAlerts = (incidents: Incident[]): Alert[] => {
    // Convert recent/critical incidents into Dashboard Alerts
    return incidents
        .filter(i => i.status !== 'Cerrada')
        .map(i => ({
            id: generateId('ALT'),
            code: `ALT-${getRandomInt(100,999)}`,
            title: `Alerta: ${i.title}`,
            severity: i.severity,
            status: i.status === 'Nueva' ? Status.NEW : (i.status === 'Escalada' ? Status.ESCALATED : Status.IN_PROGRESS),
            date: i.date.split(' ')[0],
            company: i.companyId, // Note: In real app we would lookup name
            description: `Incidente reportado en ${i.category} requiere atención.`,
            targetView: i.category === 'Protección de Datos' ? ViewState.DATA_PROTECTION : ViewState.INCIDENTS,
            targetId: i.id
        }))
        .slice(0, 20); // Limit to 20 alerts
};

const generateRiskAssessments = (companies: Company[]): RiskAssessment[] => {
    const assessments: RiskAssessment[] = [];
    // Generate assessments for all companies to ensure consistency
    companies.forEach(c => {
        // Generate 1-2 assessments per practice area for each company
        ['COMPLIANCE', 'DATA_PROTECTION'].forEach(area => {
            const count = getRandomInt(1, 2);
            for(let i=0; i<count; i++) {
                const year = 2025 - i;
                const score = getRandomInt(40, 98);
                assessments.push({
                    id: generateId('ASM'),
                    companyId: c.id,
                    practiceArea: area as any,
                    title: `Evaluación de Cultura ${area === 'DATA_PROTECTION' ? 'Privacidad' : 'Ética'} ${year}`,
                    date: `${year}-11-${getRandomInt(10, 28)}`,
                    status: i === 0 ? (Math.random() > 0.2 ? 'Finalizada' : 'Activa') : 'Finalizada',
                    participation: getRandomInt(30, 95),
                    score: score,
                    dimensions: [
                        { 
                            name: area === 'DATA_PROTECTION' ? 'Liderazgo en Privacidad' : 'Liderazgo Ético', 
                            score: Math.min(100, score + getRandomInt(-10, 10)), 
                            benchmark: 75, 
                            description: area === 'DATA_PROTECTION' ? 'Compromiso de la alta dirección con la protección de datos.' : 'Percepción del tono desde la cima.' 
                        },
                        { 
                            name: area === 'DATA_PROTECTION' ? 'Transparencia' : 'Seguridad Psicológica', 
                            score: Math.min(100, score + getRandomInt(-15, 5)), 
                            benchmark: 70, 
                            description: area === 'DATA_PROTECTION' ? 'Claridad en la comunicación de procesos de datos.' : 'Libertad para reportar sin miedo.' 
                        },
                        { 
                            name: area === 'DATA_PROTECTION' ? 'Derechos de Titulares' : 'Justicia Organizacional', 
                            score: Math.min(100, score + getRandomInt(-5, 15)), 
                            benchmark: 72, 
                            description: area === 'DATA_PROTECTION' ? 'Eficacia en la atención de derechos ARCO.' : 'Equidad en consecuencias.' 
                        },
                        { 
                            name: area === 'DATA_PROTECTION' ? 'Conciencia de Riesgos' : 'Conocimiento Normativo', 
                            score: Math.min(100, score + getRandomInt(-20, 10)), 
                            benchmark: 80, 
                            description: area === 'DATA_PROTECTION' ? 'Entendimiento de riesgos de privacidad.' : 'Entendimiento de reglas.' 
                        }
                    ],
                    keyFindings: area === 'DATA_PROTECTION' ? [
                        'Alta conciencia sobre la importancia de la privacidad.',
                        'Necesidad de reforzar la capacitación en respuesta a incidentes.'
                    ] : [
                        'Alta percepción de compromiso directivo.',
                        'Brechas en conocimiento de canales de denuncia en áreas operativas.'
                    ]
                });
            }
        });
    });
    // Sort by date descending so the first one is the latest
    return assessments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const generateNotifications = (companies: Company[]): Notification[] => {
    const notes: Notification[] = [];
    for(let i=0; i<5; i++) {
        const c = getRandomItem(companies);
        notes.push({
            id: generateId('NOT'),
            title: getRandomItem(['Cambio en Ley 20.393', 'Vencimiento de Plazo CMF', 'Alerta de Integridad', 'Actualización Política Corporativa']),
            description: 'Se ha detectado un evento que requiere revisión por parte del equipo legal.',
            type: Math.random() > 0.5 ? 'CRITICAL' : 'WARNING',
            date: new Date().toISOString().split('T')[0],
            company: c.name,
            relatedTo: 'Compliance',
            targetView: ViewState.LEGAL_NOTIFICATIONS
        });
    }
    return notes;
};

const generateDataInventory = (companies: Company[]): DataInventory[] => {
    const inventory: DataInventory[] = [];
    companies.forEach(c => {
        const count = getRandomInt(2, 5);
        for(let i=0; i<count; i++) {
            inventory.push({
                id: generateId('INV'),
                companyId: c.id,
                practiceArea: 'DATA_PROTECTION',
                systemName: getRandomItem(['ERP SAP', 'Salesforce CRM', 'Google Workspace', 'AWS S3 Bucket', 'Azure Active Directory', 'Payroll System']),
                description: 'Sistema central de gestión de datos corporativos.',
                dataCategory: [getRandomItem(['Personal', 'Sensible', 'Financiero']), getRandomItem(['Identificación', 'Contacto'])],
                dataSubjects: [getRandomItem(['Empleados', 'Clientes', 'Proveedores'])],
                storageLocation: getRandomItem(['Cloud (AWS)', 'Cloud (Azure)', 'On-premise', 'SaaS']),
                retentionPeriod: getRandomItem(['5 años', '10 años', 'Indefinido', 'Hasta fin de contrato']),
                securityMeasures: [getRandomItem(['Cifrado AES-256', 'MFA', 'Control de Acceso RBAC', 'Logs de Auditoría'])],
                status: getRandomItem(['Activo', 'En Revisión'])
            });
        }
    });
    return inventory;
};

const generateArcoRequests = (companies: Company[]): ArcoRequest[] => {
    const requests: ArcoRequest[] = [];
    companies.forEach(c => {
        const count = getRandomInt(1, 3);
        for(let i=0; i<count; i++) {
            const date = getRandomDate(new Date(2025, 0, 1), new Date()).split('T')[0];
            requests.push({
                id: generateId('ARCO'),
                companyId: c.id,
                practiceArea: 'DATA_PROTECTION',
                requesterName: `${getRandomItem(NAMES)} ${getRandomItem(LASTNAMES)}`,
                requestType: getRandomItem(['Acceso', 'Rectificación', 'Cancelación', 'Oposición']),
                requestDate: date,
                deadlineDate: new Date(new Date(date).getTime() + 86400000*15).toISOString().split('T')[0],
                status: getRandomItem(['Pendiente', 'En Trámite', 'Resuelto']),
                description: 'Solicitud de ejercicio de derechos sobre datos personales.'
            });
        }
    });
    return requests;
};

const generateDpiaAssessments = (companies: Company[]): DpiaAssessment[] => {
    const assessments: DpiaAssessment[] = [];
    companies.forEach(c => {
        const count = getRandomInt(1, 2);
        for(let i=0; i<count; i++) {
            assessments.push({
                id: generateId('DPIA'),
                companyId: c.id,
                practiceArea: 'DATA_PROTECTION',
                title: `DPIA - ${getRandomItem(['Nuevo CRM', 'Migración a la Nube', 'App Móvil Clientes'])}`,
                startDate: getRandomDate(new Date(2025, 0, 1), new Date()).split('T')[0],
                status: getRandomItem(['En Progreso', 'Completado', 'Requiere Mitigación']),
                riskLevel: getRandomItem([Severity.LOW, Severity.MEDIUM, Severity.HIGH]),
                description: 'Evaluación de impacto en la protección de datos para nuevos tratamientos de alto riesgo.'
            });
        }
    });
    return assessments;
};

const generateRatEntries = (companies: Company[]): RatEntry[] => {
    const entries: RatEntry[] = [];
    companies.forEach(c => {
        entries.push({
            id: generateId('RAT'),
            companyId: c.id,
            practiceArea: 'DATA_PROTECTION',
            process: 'Gestión de Nóminas y Recursos Humanos',
            purpose: 'Gestión administrativa de la relación laboral, pago de salarios y cumplimiento de obligaciones previsionales.',
            legalBase: 'Obligación Legal / Contrato',
            dataSubjectCategory: 'Empleados y Ex-empleados',
            dataCategory: 'Identificativos, Financieros, Seguridad Social',
            recipients: 'Bancos, Organismos de Seguridad Social, Autoridades Tributarias',
            internationalTransfers: 'No previstas',
            retentionPeriod: '10 años (Plazo legal prescripción)',
            securityMeasures: 'Cifrado de archivos, Control de acceso físico y lógico, Copias de seguridad'
        });
        entries.push({
            id: generateId('RAT'),
            companyId: c.id,
            practiceArea: 'DATA_PROTECTION',
            process: 'Fidelización y Marketing de Clientes',
            purpose: 'Envío de comunicaciones comerciales, ofertas personalizadas y análisis de perfiles de consumo.',
            legalBase: 'Consentimiento Explícito',
            dataSubjectCategory: 'Clientes y Prospectos',
            dataCategory: 'Hábitos de Consumo, Preferencias, Contacto',
            recipients: 'Plataformas de Email Marketing (Encargados)',
            internationalTransfers: 'EE.UU. (Standard Contractual Clauses)',
            retentionPeriod: '5 años desde última interacción',
            securityMeasures: 'Seudonimización, MFA en plataformas de terceros'
        });
        entries.push({
            id: generateId('RAT'),
            companyId: c.id,
            practiceArea: 'DATA_PROTECTION',
            process: 'Videovigilancia y Seguridad Física',
            purpose: 'Garantizar la seguridad de las personas, bienes e instalaciones de la compañía.',
            legalBase: 'Interés Legítimo (Seguridad)',
            dataSubjectCategory: 'Visitas, Empleados, Público',
            dataCategory: 'Imagen (Video), Fecha/Hora de Acceso',
            recipients: 'Fuerzas y Cuerpos de Seguridad (Bajo requerimiento)',
            internationalTransfers: 'No previstas',
            retentionPeriod: '30 días (Salvo incidente)',
            securityMeasures: 'Grabación en circuito cerrado, Acceso restringido a personal de seguridad'
        });
    });
    return entries;
};

const generateEipdAssessments = (companies: Company[], inventory: DataInventory[]): EipdAssessment[] => {
    const assessments: EipdAssessment[] = [];
    companies.forEach(c => {
        const companyInventory = inventory.filter(i => i.companyId === c.id);
        if (companyInventory.length > 0) {
            assessments.push({
                id: generateId('EIPD'),
                companyId: c.id,
                practiceArea: 'DATA_PROTECTION',
                systemId: companyInventory[0].id,
                identifiedRisk: 'Acceso no autorizado a datos sensibles de salud por terceros',
                probability: 2,
                impact: 5,
                mitigationMeasure: 'Cifrado de base de datos en reposo, MFA obligatorio y auditoría de accesos mensual.',
                approvalStatus: 'Aprobado'
            });
            if (companyInventory.length > 1) {
                assessments.push({
                    id: generateId('EIPD'),
                    companyId: c.id,
                    practiceArea: 'DATA_PROTECTION',
                    systemId: companyInventory[1].id,
                    identifiedRisk: 'Suplantación de identidad en portal web de clientes',
                    probability: 3,
                    impact: 4,
                    mitigationMeasure: 'Implementación de reCAPTCHA Enterprise, monitoreo de IPs y auditoría de sesiones activas.',
                    approvalStatus: 'En Revisión'
                });
            }
            assessments.push({
                id: generateId('EIPD'),
                companyId: c.id,
                practiceArea: 'DATA_PROTECTION',
                systemId: companyInventory[0].id,
                identifiedRisk: 'Fuga de datos por error humano en exportación masiva de reportes',
                probability: 4,
                impact: 3,
                mitigationMeasure: 'DLP (Data Loss Prevention) a nivel de endpoint y capacitación trimestral en manejo de datos.',
                approvalStatus: 'Pendiente'
            });
        }
    });
    return assessments;
};

const generateCalendarEvents = (
  companies: Company[],
  audits: Audit[],
  trainings: TrainingModule[],
  regulations: Regulation[],
  arcoRequests: ArcoRequest[],
  dpiaAssessments: DpiaAssessment[]
): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  // 1. From Audits
  audits.forEach(a => {
    events.push({
      id: generateId('EV-AUD'),
      companyId: a.companyId || '',
      practiceArea: a.practiceArea,
      title: `Auditoría: ${a.title}`,
      date: a.startDate,
      type: 'AUDIT',
      category: 'Auditoría',
      description: a.description || 'Auditoría programada de cumplimiento.',
      status: a.status === 'Finalizada' ? 'Completado' : (new Date(a.startDate) < new Date() ? 'Atrasado' : 'Pendiente'),
      assignedTo: a.auditor
    });
  });

  // 2. From Trainings
  trainings.forEach(t => {
    events.push({
      id: generateId('EV-TR'),
      companyId: t.companyId || '',
      practiceArea: t.practiceArea,
      title: `Capacitación: ${t.title}`,
      date: t.startDate || t.deadline,
      type: 'TRAINING',
      category: 'Capacitación',
      description: t.description || 'Sesión de formación obligatoria.',
      status: t.status === 'Cerrado' ? 'Completado' : (new Date(t.deadline) < new Date() ? 'Atrasado' : 'Pendiente'),
      assignedTo: t.instructor
    });
  });

  // 3. From Regulations (Reviews)
  regulations.forEach(r => {
    events.push({
      id: generateId('EV-REG'),
      companyId: r.companyId || '',
      practiceArea: r.practiceArea,
      title: `Revisión: ${r.code}`,
      date: r.nextReview,
      type: 'REVIEW',
      category: 'Normativa',
      description: `Revisión periódica de cumplimiento para ${r.title}.`,
      status: new Date(r.nextReview) < new Date() ? 'Atrasado' : 'Pendiente',
      assignedTo: 'Legal / Compliance'
    });
  });

  // 4. From ARCO Requests
  arcoRequests.forEach(arco => {
    events.push({
      id: generateId('EV-ARCO'),
      companyId: arco.companyId,
      practiceArea: 'DATA_PROTECTION',
      title: `Derechos ARCO: ${arco.requesterName}`,
      date: arco.deadlineDate,
      type: 'ARCO',
      category: 'Privacidad',
      description: `Vencimiento legal para responder solicitud de ${arco.requestType}.`,
      status: arco.status === 'Resuelto' ? 'Completado' : (new Date(arco.deadlineDate) < new Date() ? 'Atrasado' : 'Pendiente'),
      assignedTo: 'DPO'
    });
  });

  // 5. From DPIA
  dpiaAssessments.forEach(dpia => {
    events.push({
      id: generateId('EV-DPIA'),
      companyId: dpia.companyId,
      practiceArea: 'DATA_PROTECTION',
      title: dpia.title,
      date: dpia.startDate,
      type: 'DPIA',
      category: 'Evaluación de Impacto',
      description: dpia.description,
      status: dpia.status === 'Completado' ? 'Completado' : (new Date(dpia.startDate) < new Date() ? 'Atrasado' : 'Pendiente'),
      assignedTo: 'DPO / TI'
    });
  });

  // 6. Manual High-Density Events for March, April and May 2026
  const months = [
    { month: 2, year: 2026, days: 31 }, // March
    { month: 3, year: 2026, days: 30 }, // April
    { month: 4, year: 2026, days: 31 }  // May
  ];

  const taskPools = {
    COMPLIANCE: [
      'Revisión de Matriz de Riesgos',
      'Monitoreo Canales de Denuncia',
      'Capacitación SENCE: Ley Karin',
      'Auditoría de Prevención de Delitos',
      'Revisión de Debida Diligencia Proveedores',
      'Actualización de Código de Ética'
    ],
    DATA_PROTECTION: [
      'Auditoría de Inventario de Datos',
      'Atención de Derechos ARCO',
      'Revisión de Cláusulas de Privacidad',
      'Evaluación de Impacto (DPIA)',
      'Control de Encargados de Tratamiento',
      'Prueba de Respuesta ante Brechas'
    ]
  };

  months.forEach(m => {
    for (let day = 1; day <= m.days; day++) {
      // For March, generate some tasks before April 2
      const isBeforeApril2 = m.month === 2 || (m.month === 3 && day < 2);
      
      // 2-3 events per day
      const dailyCount = getRandomInt(2, 3);
      for (let i = 0; i < dailyCount; i++) {
        const area = Math.random() > 0.5 ? 'COMPLIANCE' : 'DATA_PROTECTION';
        const company = getRandomItem(companies.slice(0, 5)); // Use specific companies more often
        const title = getRandomItem(taskPools[area]);
        const date = new Date(m.year, m.month, day).toISOString().split('T')[0];

        events.push({
          id: generateId('EV-MAN'),
          companyId: company.id,
          practiceArea: area as any,
          title: title,
          date: date,
          type: title.includes('Auditoría') ? 'AUDIT' : title.includes('Capacitación') ? 'TRAINING' : 'DEADLINE',
          category: area === 'DATA_PROTECTION' ? 'Privacidad' : 'Vigilancia',
          description: `Tarea de vigilancia programada para asegurar el cumplimiento continuo en ${area.toLowerCase()}.`,
          status: 'Pendiente',
          assignedTo: area === 'DATA_PROTECTION' ? 'DPO' : 'Compliance Manager'
        });
      }
    }
  });

  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const generateDataProcessors = (companies: Company[]): DataProcessor[] => {
    const processors: DataProcessor[] = [];
    companies.forEach(c => {
        processors.push({
            id: generateId('PROC'),
            companyId: c.id,
            practiceArea: 'DATA_PROTECTION',
            businessName: 'Amazon Web Services (AWS) EMEA',
            service: 'Infraestructura Cloud y Hosting',
            dpaSigned: true,
            internationalTransfer: true
        });
        processors.push({
            id: generateId('PROC'),
            companyId: c.id,
            practiceArea: 'DATA_PROTECTION',
            businessName: 'Salesforce Inc. (Latam)',
            service: 'Gestión de Relación con Clientes (CRM)',
            dpaSigned: true,
            internationalTransfer: true
        });
        processors.push({
            id: generateId('PROC'),
            companyId: c.id,
            practiceArea: 'DATA_PROTECTION',
            businessName: 'Courier Express Logística S.A.',
            service: 'Servicios de Logística y Envío de Documentación',
            dpaSigned: true,
            internationalTransfer: false
        });
    });
    return processors;
};

// --- SAFE STORAGE WRAPPER ---
class SafeStorage {
  private memoryStore: Record<string, string> = {};
  private isAvailable: boolean | null = null;

  private checkAvailability(): boolean {
    if (this.isAvailable !== null) return this.isAvailable;
    try {
      const testKey = '__test_storage__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      this.isAvailable = true;
      return true;
    } catch (e) {
      console.warn('localStorage is not available, falling back to memory store');
      this.isAvailable = false;
      return false;
    }
  }

  getItem(key: string): string | null {
    if (this.checkAvailability()) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        return this.memoryStore[key] || null;
      }
    }
    return this.memoryStore[key] || null;
  }

  setItem(key: string, value: string): void {
    if (this.checkAvailability()) {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        this.memoryStore[key] = value;
      }
    } else {
      this.memoryStore[key] = value;
    }
  }

  removeItem(key: string): void {
    if (this.checkAvailability()) {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        delete this.memoryStore[key];
      }
    } else {
      delete this.memoryStore[key];
    }
  }
}

const safeStorage = new SafeStorage();

// --- SERVICE FACTORY ---

const createService = <T extends { id: string }>(key: string, generator: () => T[]) => {
  const storageKey = `${DB_VERSION}_${key}`;
  
  // Init data if empty
  const stored = safeStorage.getItem(storageKey);
  let data: T[] = stored ? JSON.parse(stored) : [];
  
  if (!stored || data.length === 0) {
      data = generator();
      safeStorage.setItem(storageKey, JSON.stringify(data));
  }

  return {
    getAll: () => {
        const current = safeStorage.getItem(storageKey);
        const parsed = current ? JSON.parse(current) : data;
        return Array.isArray(parsed) ? parsed.filter(item => item !== null && item !== undefined) : [];
    },
    getById: (id: string) => data.find(item => item.id === id),
    add: (item: T) => {
      data = [item, ...data];
      safeStorage.setItem(storageKey, JSON.stringify(data));
    },
    update: (id: string, updates: Partial<T>) => {
      data = data.map(item => item.id === id ? { ...item, ...updates } : item);
      safeStorage.setItem(storageKey, JSON.stringify(data));
      return data.find(i => i.id === id);
    },
    delete: (id: string) => {
      data = data.filter(item => item.id !== id);
      safeStorage.setItem(storageKey, JSON.stringify(data));
    }
  };
};

// --- INITIALIZATION & EXPORTS ---

// 1. Generate Base Companies First
const companiesData = createService<Company>('companies', () => generateCompanies(COMPANY_COUNT)).getAll();

// 2. Generate Dependents
const incidentServiceInstance = createService<Incident>('incidents', () => generateIncidents(companiesData));
const regulationServiceInstance = createService<Regulation>('regulations', () => generateRegulations(companiesData));
const auditServiceInstance = createService<Audit>('audits', () => generateAudits(companiesData));
const trainingServiceInstance = createService<TrainingModule>('training', () => generateTrainings(companiesData));
const assessmentServiceInstance = createService<RiskAssessment>('assessments', () => generateRiskAssessments(companiesData));
const notificationServiceInstance = createService<Notification>('notifications', () => generateNotifications(companiesData));
const alertServiceInstance = createService<Alert>('alerts', () => generateAlerts(incidentServiceInstance.getAll()));

const dataInventoryServiceInstance = createService<DataInventory>('data_inventory', () => generateDataInventory(companiesData));
const arcoRequestServiceInstance = createService<ArcoRequest>('arco_requests', () => generateArcoRequests(companiesData));
const dpiaServiceInstance = createService<DpiaAssessment>('dpia_assessments', () => generateDpiaAssessments(companiesData));
const ratServiceInstance = createService<RatEntry>('rat_entries', () => generateRatEntries(companiesData));
const eipdServiceInstance = createService<EipdAssessment>('eipd_assessments', () => generateEipdAssessments(companiesData, dataInventoryServiceInstance.getAll()));
const dataProcessorServiceInstance = createService<DataProcessor>('data_processors', () => generateDataProcessors(companiesData));
const calendarServiceInstance = createService<CalendarEvent>('calendar_events', () => generateCalendarEvents(
  companiesData,
  auditServiceInstance.getAll(),
  trainingServiceInstance.getAll(),
  regulationServiceInstance.getAll(),
  arcoRequestServiceInstance.getAll(),
  dpiaServiceInstance.getAll()
));

// 3. Mock Users with RBAC
const ANDRES_USER: UserProfile = {
  id: 'USER-ANDRES',
  name: 'Andrés Marín',
  role: UserRole.GA_ABOGADOS_COMPLIANCE,
  practiceArea: 'COMPLIANCE',
  isGAAbogados: true,
  email: 'andres.marin@ga-abogados.cl',
  phone: '+56 2 2345 6789',
  avatar: 'https://picsum.photos/seed/andres/200/200',
  bio: 'Socio líder del área de Cumplimiento y Gobierno Corporativo. Especialista en Ley 20.393 y regulaciones financieras.',
  location: 'Santiago, Chile',
  notifications: { email: true, push: true, weeklyDigest: false }
};

const MERCEDES_USER: UserProfile = {
  id: 'USER-MERCEDES',
  name: 'Mercedes Londoño',
  role: UserRole.GA_ABOGADOS_DP,
  practiceArea: 'DATA_PROTECTION',
  isGAAbogados: true,
  email: 'mercedes.londono@ga-abogados.cl',
  phone: '+56 2 2345 1234',
  avatar: 'https://picsum.photos/seed/mercedes/200/200',
  bio: 'Socia líder del área de Protección de Datos y Privacidad. Especialista en GDPR, LOPDGDD y cumplimiento de privacidad.',
  location: 'Santiago, Chile',
  notifications: { email: true, push: true, weeklyDigest: true }
};

const COMPLIANCE_OFFICER: UserProfile = {
  id: 'USER-CO',
  name: 'Roberto Gómez',
  role: UserRole.CLIENT_COMPLIANCE_OFFICER,
  practiceArea: 'COMPLIANCE',
  companyId: 'COMP-1', // Linked to first generated company
  isGAAbogados: false,
  email: 'roberto.gomez@client.com',
  phone: '+56 2 9876 5432',
  avatar: 'https://picsum.photos/seed/roberto/200/200',
  bio: 'Oficial de Cumplimiento encargado de la implementación y monitoreo del modelo de prevención de delitos.',
  location: 'Santiago, Chile',
  notifications: { email: true, push: true, weeklyDigest: true }
};

const DPO_USER: UserProfile = {
  id: 'USER-DPO',
  name: 'Claudia Silva',
  role: UserRole.CLIENT_DPO,
  practiceArea: 'DATA_PROTECTION',
  companyId: 'COMP-1', // Same company as CO for testing multi-role client
  isGAAbogados: false,
  email: 'claudia.silva@client.com',
  phone: '+56 2 8765 4321',
  avatar: 'https://picsum.photos/seed/claudia/200/200',
  bio: 'Delegada de Protección de Datos responsable de asegurar el cumplimiento de la normativa de privacidad y atención de derechos ARCO.',
  location: 'Santiago, Chile',
  notifications: { email: true, push: true, weeklyDigest: true }
};

const userService = {
  get: (): UserProfile => {
    const stored = safeStorage.getItem(`${DB_VERSION}_user`);
    if (stored) return JSON.parse(stored);
    return COMPLIANCE_OFFICER;
  },
  update: (profile: UserProfile) => {
    // 1. Save current user first (highest priority, smaller object)
    // This ensures that even if the list fails, the current user's data is safe
    safeStorage.setItem(`${DB_VERSION}_user`, JSON.stringify(profile));
    
    // 2. Update the session ID to match
    safeStorage.setItem(`${DB_VERSION}_session_id`, profile.id);

    // 3. Attempt to update the global users list
    try {
      const users = userService.getAllUsers();
      const exists = users.some(u => u.id === profile.id);
      const updatedUsers = exists 
        ? users.map(u => u.id === profile.id ? profile : u)
        : [...users, profile];
        
      safeStorage.setItem(`${DB_VERSION}_users_list`, JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Critical: Failed to update users list in storage. Individual profile saved.', error);
    }
  },
  getSession: () => {
    return safeStorage.getItem(`${DB_VERSION}_session_id`);
  },
  setSession: (userId: string) => {
    safeStorage.setItem(`${DB_VERSION}_session_id`, userId);
  },
  clearSession: () => {
    safeStorage.removeItem(`${DB_VERSION}_session_id`);
  },
  getAllUsers: (): UserProfile[] => {
    const stored = safeStorage.getItem(`${DB_VERSION}_users_list`);
    if (stored) return JSON.parse(stored);
    const initialUsers = [ANDRES_USER, MERCEDES_USER, COMPLIANCE_OFFICER, DPO_USER];
    safeStorage.setItem(`${DB_VERSION}_users_list`, JSON.stringify(initialUsers));
    return initialUsers;
  },
  switchUser: (userId: string) => {
    const users = userService.getAllUsers();
    const newUser = users.find(u => u.id === userId) || 
                   (userId === 'USER-MERCEDES' ? MERCEDES_USER : 
                    userId === 'USER-CO' ? COMPLIANCE_OFFICER : 
                    userId === 'USER-DPO' ? DPO_USER : ANDRES_USER);
    safeStorage.setItem(`${DB_VERSION}_user`, JSON.stringify(newUser));
    return newUser;
  }
};

// Fix Alerts Company Name lookups (since we generated IDs)
const enrichedAlertService = {
    ...alertServiceInstance,
    getAll: () => {
        const rawAlerts = alertServiceInstance.getAll();
        return rawAlerts.map(a => ({
            ...a,
            company: companiesData.find(c => c.id === a.company)?.name || 'Desconocida'
        }));
    }
};

// --- FILTERING LOGIC ---

const getFilteredData = <T extends { id: string }>(
  data: T[], 
  user: UserProfile, 
  practiceArea?: 'COMPLIANCE' | 'DATA_PROTECTION'
): T[] => {
  const filterArea = practiceArea || user.practiceArea;
  
  return data.filter(item => {
    const itemWithMeta = item as any;
    // 1. Practice Area Segregation
    // Default to COMPLIANCE if missing to avoid showing general laws in DP view
    const itemArea = itemWithMeta.practiceArea || 'COMPLIANCE';
    if (itemArea !== filterArea) return false;

    // 2. Company Segregation
    if (!user.isGAAbogados && user.companyId) {
      if (itemWithMeta.companyId && itemWithMeta.companyId !== user.companyId) return false;
    }

    return true;
  });
};

// Export
export const companyService = {
  ...createService<Company>('companies', () => []),
  getAll: () => {
    const user = userService.get();
    const data = createService<Company>('companies', () => []).getAll();
    if (user.isGAAbogados) return data;
    return data.filter(c => c.id === user.companyId);
  }
};

export const incidentService = {
  ...incidentServiceInstance,
  getAll: (practiceArea?: 'COMPLIANCE' | 'DATA_PROTECTION'): Incident[] => 
    getFilteredData<Incident>(incidentServiceInstance.getAll(), userService.get(), practiceArea)
};

export const regulationService = {
  getById: (id: string) => regulationServiceInstance.getById(id),
  add: (item: Regulation) => regulationServiceInstance.add(item),
  update: (id: string, updates: Partial<Regulation>) => regulationServiceInstance.update(id, updates),
  delete: (id: string) => regulationServiceInstance.delete(id),
  getAll: (practiceArea?: 'COMPLIANCE' | 'DATA_PROTECTION'): Regulation[] => 
    getFilteredData<Regulation>(regulationServiceInstance.getAll(), userService.get(), practiceArea)
};

export const auditService = {
  ...auditServiceInstance,
  getAll: (practiceArea?: 'COMPLIANCE' | 'DATA_PROTECTION'): Audit[] => 
    getFilteredData<Audit>(auditServiceInstance.getAll(), userService.get(), practiceArea)
};

export const trainingService = {
  ...trainingServiceInstance,
  getAll: (practiceArea?: 'COMPLIANCE' | 'DATA_PROTECTION'): TrainingModule[] => 
    getFilteredData<TrainingModule>(trainingServiceInstance.getAll(), userService.get(), practiceArea)
};

export const assessmentService = {
  ...assessmentServiceInstance,
  getAll: (practiceArea?: 'COMPLIANCE' | 'DATA_PROTECTION'): RiskAssessment[] => 
    getFilteredData<RiskAssessment>(assessmentServiceInstance.getAll(), userService.get(), practiceArea || 'COMPLIANCE')
};

export const notificationService = {
  ...notificationServiceInstance,
  getAll: () => getFilteredData(notificationServiceInstance.getAll(), userService.get())
};

export const alertService = {
  ...enrichedAlertService,
  getAll: () => {
    const user = userService.get();
    const rawAlerts = enrichedAlertService.getAll();
    return rawAlerts.filter(a => {
        if (user.practiceArea === 'DATA_PROTECTION' && a.targetView !== ViewState.DATA_PROTECTION) return false;
        if (user.practiceArea === 'COMPLIANCE' && a.targetView === ViewState.DATA_PROTECTION) return false;
        
        if (!user.isGAAbogados && user.companyId) {
            const alertCompanyId = (a as any).companyId || a.company; 
            // Note: In generateAlerts, company was set to i.companyId
            // But enrichedAlertService maps 'company' to name.
            // We should probably check against the original companyId if available.
            // For now, let's assume we can find it.
            const company = companiesData.find(c => c.name === a.company);
            if (company && company.id !== user.companyId) return false;
        }
        return true;
    });
  }
};

export const dataInventoryService = {
  ...dataInventoryServiceInstance,
  getAll: (): DataInventory[] => getFilteredData<DataInventory>(dataInventoryServiceInstance.getAll(), userService.get(), 'DATA_PROTECTION')
};

export const arcoRequestService = {
  ...arcoRequestServiceInstance,
  getAll: (): ArcoRequest[] => getFilteredData<ArcoRequest>(arcoRequestServiceInstance.getAll(), userService.get(), 'DATA_PROTECTION')
};

export const dpiaService = {
  ...dpiaServiceInstance,
  getAll: (): DpiaAssessment[] => getFilteredData<DpiaAssessment>(dpiaServiceInstance.getAll(), userService.get(), 'DATA_PROTECTION')
};

export const ratService = {
  ...ratServiceInstance,
  getAll: (): RatEntry[] => getFilteredData<RatEntry>(ratServiceInstance.getAll(), userService.get(), 'DATA_PROTECTION')
};

export const eipdService = {
  ...eipdServiceInstance,
  getAll: (): EipdAssessment[] => getFilteredData<EipdAssessment>(eipdServiceInstance.getAll(), userService.get(), 'DATA_PROTECTION')
};

export const dataProcessorService = {
  ...dataProcessorServiceInstance,
  getAll: (): DataProcessor[] => getFilteredData<DataProcessor>(dataProcessorServiceInstance.getAll(), userService.get(), 'DATA_PROTECTION')
};

export const calendarService = {
  ...calendarServiceInstance,
  getAll: (practiceArea?: 'COMPLIANCE' | 'DATA_PROTECTION'): CalendarEvent[] => 
    getFilteredData<CalendarEvent>(calendarServiceInstance.getAll(), userService.get(), practiceArea),
  reorganizeTasks: () => {
    const TODAY = new Date('2026-04-10');
    const DELETE_BEFORE_DATE = new Date('2026-03-30');
    const LIMIT_DATE = new Date('2026-04-02');
    const TARGET_START_DATE = new Date('2026-04-01');
    const TARGET_END_DATE = new Date('2026-05-31');
    
    let events = calendarServiceInstance.getAll();
    
    // 0. Permanent deletion of tasks before March 30, 2026
    const tasksToDelete = events.filter(e => new Date(e.date) < DELETE_BEFORE_DATE);
    if (tasksToDelete.length > 0) {
      tasksToDelete.forEach(t => calendarServiceInstance.delete(t.id));
      // Refresh events list after deletion
      events = calendarServiceInstance.getAll();
    }

    // 1. Select tasks: Pendiente and date < April 2, 2026 (but >= March 30 now)
    const tasksToRedistribute = events.filter(e => 
      e.status === 'Pendiente' && new Date(e.date) < LIMIT_DATE
    );
    
    if (tasksToRedistribute.length === 0) return;
    
    // Sort by original date
    tasksToRedistribute.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // 2. Redistribute between TARGET_START_DATE and TARGET_END_DATE
    const totalDays = Math.ceil((TARGET_END_DATE.getTime() - TARGET_START_DATE.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Track tasks per day to avoid saturation (max 3 per day)
    const dailyTaskCount: Record<string, number> = {};
    
    // Pre-fill dailyTaskCount with existing tasks
    events.forEach(e => {
      if (new Date(e.date) >= TARGET_START_DATE && new Date(e.date) <= TARGET_END_DATE) {
        const dateStr = e.date.split('T')[0];
        dailyTaskCount[dateStr] = (dailyTaskCount[dateStr] || 0) + 1;
      }
    });

    const updatedEvents = tasksToRedistribute.map(task => {
      let assignedDate = new Date(TARGET_START_DATE);
      let found = false;
      
      // Try to find a day with < 3 tasks
      for (let i = 0; i < totalDays; i++) {
        const currentTry = new Date(TARGET_START_DATE);
        currentTry.setDate(TARGET_START_DATE.getDate() + i);
        const dateStr = currentTry.toISOString().split('T')[0];
        
        if ((dailyTaskCount[dateStr] || 0) < 3) {
          assignedDate = currentTry;
          dailyTaskCount[dateStr] = (dailyTaskCount[dateStr] || 0) + 1;
          found = true;
          break;
        }
      }
      
      if (!found) {
        let minCount = Infinity;
        let minDate = new Date(TARGET_START_DATE);
        
        for (let i = 0; i < totalDays; i++) {
          const currentTry = new Date(TARGET_START_DATE);
          currentTry.setDate(TARGET_START_DATE.getDate() + i);
          const dateStr = currentTry.toISOString().split('T')[0];
          const count = dailyTaskCount[dateStr] || 0;
          
          if (count < minCount) {
            minCount = count;
            minDate = currentTry;
          }
        }
        assignedDate = minDate;
        const dateStr = assignedDate.toISOString().split('T')[0];
        dailyTaskCount[dateStr] = (dailyTaskCount[dateStr] || 0) + 1;
      }

      return {
        ...task,
        originalDate: task.date,
        date: assignedDate.toISOString().split('T')[0],
        isRedistributed: true
      };
    });
    
    updatedEvents.forEach(task => {
      calendarServiceInstance.update(task.id, task);
    });
  }
};

export { userService };

// --- SUPABASE MOCK ---
export const isSupabaseConfigured = false;
export const supabaseService = {
    checkConnection: async () => ({ status: 'mock', message: 'Usando datos locales (Mock)' }),
    notifications: {
        getAll: async () => []
    }
};
export const supabase = null;
