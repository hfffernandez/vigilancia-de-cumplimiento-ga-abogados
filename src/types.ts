
import React from 'react';

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  ALERTS = 'ALERTS',
  AUDITS = 'AUDITS',
  REGULATIONS = 'REGULATIONS',
  INCIDENTS = 'INCIDENTS',
  AI_RECOMMENDATIONS = 'AI_RECOMMENDATIONS',
  RISK_CULTURE = 'RISK_CULTURE',
  LEGAL_NOTIFICATIONS = 'LEGAL_NOTIFICATIONS',
  CLIENTS = 'CLIENTS',
  TRAINING = 'TRAINING',
  CALENDAR = 'CALENDAR',
  DATA_PROTECTION = 'DATA_PROTECTION',
  SETTINGS = 'SETTINGS'
}

export enum Severity {
  LOW = 'Baja',
  MEDIUM = 'Media',
  HIGH = 'Alta',
  CRITICAL = 'Crítica'
}

export enum Status {
  NEW = 'Nueva',
  IN_PROGRESS = 'En Progreso',
  CLOSED = 'Cerrada',
  ESCALATED = 'Escalada'
}

export enum UserRole {
  GA_ABOGADOS_COMPLIANCE = 'GA_ABOGADOS_COMPLIANCE',
  GA_ABOGADOS_DP = 'GA_ABOGADOS_DP',
  CLIENT_COMPLIANCE_OFFICER = 'CLIENT_COMPLIANCE_OFFICER',
  CLIENT_DPO = 'CLIENT_DPO'
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  practiceArea: 'COMPLIANCE' | 'DATA_PROTECTION';
  companyId?: string; // Linked to Company for CLIENT roles
  isGAAbogados: boolean;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  location: string;
  notifications: {
    email: boolean;
    push: boolean;
    weeklyDigest: boolean;
  };
}

export interface Alert {
  id: string;
  code: string;
  title: string;
  severity: Severity;
  status: Status;
  date: string;
  company: string;
  description: string;
  // Navigation targets
  targetView?: ViewState;
  targetId?: string;
}

export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  color?: string;
  trendBad?: boolean;
}

// Shared Evidence Type for Legal Proof
export interface Evidence {
  id: string;
  name: string;
  type: 'PDF' | 'IMG' | 'DOC' | 'AUDIO' | 'EMAIL' | 'VIDEO';
  url: string;
  uploadDate: string;
  uploadedBy: string;
  hash?: string; // For legal validation
  description?: string;
}

export interface AuditFinding {
    id: string;
    description: string;
    severity: Severity;
    status: 'Abierto' | 'Cerrado';
}

export interface Audit {
  id: string;
  companyId?: string; // Linked to Company
  practiceArea: 'COMPLIANCE' | 'DATA_PROTECTION'; // Segregation by service
  title: string;
  type: 'Interna' | 'Externa' | 'Certificación';
  status: 'Planificada' | 'En Progreso' | 'Finalizada' | 'Atrasada';
  auditor: string;
  startDate: string;
  scope: string;
  description?: string; 
  
  // Detailed Evidence & Granularity
  evidence: Evidence[];
  findings: AuditFinding[];
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  riskScore: number; // 0-100
  activeAlerts: number;
  status: 'Activo' | 'Inactivo' | 'Onboarding';
  contactPerson: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  description?: string;
  logo?: string;
  importance?: number; // 1-5, where 5 is most important
}

export interface Trainee {
    id: string;
    name: string;
    department: string;
    companyId: string; // MANDATORY: Link to Company (even in Global Courses)
    status: 'Presente' | 'Ausente' | 'Justificado';
    score?: number; // Evaluation 0-100
    feedback?: string; // Qualitative feedback
    certificateUrl?: string; // For SENCE or general accreditation
}

export interface TrainingModule {
  id: string;
  practiceArea: 'COMPLIANCE' | 'DATA_PROTECTION'; // Segregation by service
  title: string;
  startDate?: string;
  deadline: string; // Acts as End Date
  completionRate: number; // 0-100
  assignedTo: number; // number of employees
  status: 'Activo' | 'Cerrado' | 'Pendiente';
  category: string; // e.g., "Inducción", "Normativa"
  modality: 'Presencial' | 'Online' | 'Híbrido';
  isSence: boolean;
  senceCode?: string;
  description?: string;
  objectives?: string;
  instructor?: string; // Relator
  location?: string; // Ubicación / Plataforma
  durationHours?: number;
  targetDepartments?: string; // "Departamento(s) Dirigido(s)"
  evaluationMethod?: string;

  // Multi-tenancy Scope logic
  scope: 'GLOBAL' | 'SPECIFIC'; 
  companyId?: string; // Required if SCOPE is SPECIFIC. Optional if GLOBAL.

  // Granular Proof
  attendees: Trainee[];
  evidence: Evidence[]; // Photos, Videos, Signed Lists
}

export interface CalendarEvent {
  id: string;
  companyId: string; // Multi-tenancy
  practiceArea: 'COMPLIANCE' | 'DATA_PROTECTION'; // Service classification
  title: string;
  date: string; // ISO format
  originalDate?: string; // For redistributed tasks
  type: 'AUDIT' | 'DEADLINE' | 'REVIEW' | 'MEETING' | 'TRAINING' | 'ARCO' | 'DPIA' | 'CONSENT';
  category: string; // Visual label
  description?: string;
  status: 'Pendiente' | 'Completado' | 'Atrasado';
  evidence?: Evidence[]; // Due diligence proof
  assignedTo?: string; // Consultant or Officer
  isRedistributed?: boolean;
}

export type RegulationType = 'Ley' | 'Reglamento' | 'Política Interna' | 'Circular' | 'Resolución' | 'Otro';

export interface Regulation {
  id: string;
  companyId?: string; // Linked to Company (for internal policies or specific assignments)
  practiceArea: 'COMPLIANCE' | 'DATA_PROTECTION'; // Segregation by service
  code: string; // e.g., "LEY-21000"
  title: string;
  type: RegulationType; // Explicit type for filtering
  status: 'Vigente' | 'Derogada' | 'En Revisión';
  criticality: Severity;
  agency: string; // Organismo Emisor
  
  // Dates
  publishDate?: string; // Fecha Publicación DO
  effectiveDate?: string; // Fecha Entrada en Vigor
  nextReview: string; // Próxima revisión interna
  lastModification?: string;

  // Content & Indexing
  summary?: string;
  fullText?: string; // Can be long text
  keywords?: string[]; // For search indexing
  tags?: string[]; // Categorization
  scope?: 'Nacional' | 'Internacional' | 'Sectorial' | 'Regional' | 'Interno';
  
  // Linking
  linkedLaw?: string; // If type is 'Reglamento', which law does it belong to?
  department?: string; // If type is 'Política Interna', which department? (RRHH, TI, etc)
  relatedRegulations?: string[]; // Free text or IDs of other regs
  sectors?: string[]; // Industries affected (e.g., "Mining", "Finance")
  linkedPolicies?: string[]; // Internal Policy Codes (e.g., "POL-HR-001")
  updateFrequency?: string; // e.g., "Anual", "Semestral"

  // Attachments
  attachments?: Evidence[];
}

// --- INCIDENT & DOSSIER TYPES ---

export interface InvolvedParty {
  id: string;
  name: string;
  role: 'Investigado' | 'Testigo' | 'Denunciante' | 'Abogado';
  department?: string;
}

export interface ChainOfCustody {
  id: string;
  action: string; // e.g., "Evidence Collected", "Reviewed by Partner", "Sealed"
  performer: string;
  timestamp: string;
  notes?: string;
  verified: boolean; // Digital signature check
}

export interface Incident {
  id: string;
  companyId: string; // Link to Company
  practiceArea: 'COMPLIANCE' | 'DATA_PROTECTION'; // Segregation by service
  title: string;
  severity: Severity;
  status: string; // Using string instead of enum for UI flexibility in Kanban
  date: string;
  reportedBy: string;
  category: string;
  assignedTo: string;
  description: string; // The narrative
  
  // Dossier specific
  evidence: Evidence[];
  involvedParties: InvolvedParty[];
  chainOfCustody: ChainOfCustody[];
  tags?: string[];

  // Architectural additions
  legalStatus?: string; // e.g., "En Litigio", "Cerrado Administrativamente"
  residualRisk?: Severity;
  correctiveMeasures?: string;
  certificationFrame?: string; // e.g., "ISO 27001", "GPDR Art. 33"
}

// --- RISK CULTURE TYPES ---

export interface RiskDimension {
    name: string; // e.g., "Tone at the Top", "Speak Up Culture"
    score: number; // 0-100 internal score
    benchmark: number; // Industry average
    description: string;
}

export interface RiskAssessment {
  id: string;
  companyId: string;
  practiceArea: 'COMPLIANCE' | 'DATA_PROTECTION'; // Segregation by service
  title: string;
  date: string;
  status: 'Activa' | 'Finalizada' | 'Borrador';
  participation: number; // percentage
  score: number; // Global Score
  
  // Granular Data
  dimensions: RiskDimension[];
  keyFindings?: string[];
}

// --- DATA PROTECTION TYPES ---

export interface DataInventory {
  id: string;
  companyId: string;
  practiceArea?: 'COMPLIANCE' | 'DATA_PROTECTION';
  systemName: string;
  description: string;
  dataCategory: string[]; // e.g., "Personal", "Sensitive", "Financial"
  dataSubjects: string[]; // e.g., "Employees", "Customers"
  storageLocation: string; // e.g., "Cloud (AWS)", "On-premise"
  retentionPeriod: string;
  securityMeasures: string[];
  status: 'Activo' | 'En Revisión' | 'Obsoleto';
}

export interface ArcoRequest {
  id: string;
  companyId: string;
  practiceArea?: 'COMPLIANCE' | 'DATA_PROTECTION';
  requesterName: string;
  requestType: 'Acceso' | 'Rectificación' | 'Cancelación' | 'Oposición' | 'Portabilidad' | 'Limitación';
  requestDate: string;
  deadlineDate: string;
  status: 'Pendiente' | 'En Trámite' | 'Resuelto' | 'Rechazado';
  description: string;
  resolution?: string;
  evidence?: Evidence[];
}

export interface DpiaAssessment {
  id: string;
  companyId: string;
  practiceArea?: 'COMPLIANCE' | 'DATA_PROTECTION';
  title: string;
  startDate: string;
  completionDate?: string;
  status: 'No Iniciado' | 'En Progreso' | 'Completado' | 'Requiere Mitigación';
  riskLevel: Severity;
  description: string;
  mitigationPlan?: string;
  evidence?: Evidence[];
}

export interface RatEntry {
  id: string;
  companyId: string;
  practiceArea?: 'COMPLIANCE' | 'DATA_PROTECTION';
  process: string;
  purpose: string;
  legalBase: string;
  dataSubjectCategory: string;
  dataCategory: string;
  recipients: string;
  internationalTransfers: string;
  retentionPeriod: string;
  securityMeasures: string;
}

export interface EipdAssessment {
  id: string;
  companyId: string;
  practiceArea?: 'COMPLIANCE' | 'DATA_PROTECTION';
  systemId: string; // Reference to DataInventory
  identifiedRisk: string;
  probability: number; // 1-5
  impact: number; // 1-5
  mitigationMeasure: string;
  approvalStatus: 'Pendiente' | 'En Revisión' | 'Aprobado' | 'Rechazado';
}

export interface DataProcessor {
  id: string;
  companyId: string;
  practiceArea?: 'COMPLIANCE' | 'DATA_PROTECTION';
  businessName: string;
  service: string;
  dpaSigned: boolean;
  internationalTransfer: boolean;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'CRITICAL' | 'WARNING';
  date: string;
  company: string;
  relatedTo: string;
  
  // Navigation Logic
  targetView?: ViewState;
  targetId?: string;
}
