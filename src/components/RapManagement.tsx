
import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  ChevronRight,
  Building2,
  Shield,
  FileText,
  Globe,
  Lock
} from 'lucide-react';
import { RatEntry as RapEntry, Company } from '../types';
import { ratService as rapService, companyService, generateId } from '../services/db';

interface RapManagementProps {
  companyId?: string;
}

export const RapManagement: React.FC<RapManagementProps> = ({ companyId }) => {
  const [entries, setEntries] = useState<RapEntry[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RapEntry | null>(null);
  const [viewingRecord, setViewingRecord] = useState<RapEntry | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<RapEntry>>({
    process: '',
    purpose: '',
    legalBase: 'Obligación Legal',
    dataSubjectCategory: '',
    dataCategory: '',
    recipients: '',
    internationalTransfers: 'No previstas',
    retentionPeriod: '',
    securityMeasures: '',
    companyId: companyId || ''
  });

  useEffect(() => {
    loadData();
  }, [companyId]);

  const loadData = () => {
    let allEntries = rapService.getAll();
    if (companyId) {
      allEntries = allEntries.filter(item => item.companyId === companyId);
    }
    setEntries(allEntries);
    setCompanies(companyService.getAll());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingRecord) {
      rapService.update(editingRecord.id, formData);
    } else {
      const newRecord: RapEntry = {
        ...formData as RapEntry,
        id: generateId('RAP'),
        practiceArea: 'DATA_PROTECTION',
        companyId: formData.companyId || companyId || companies[0]?.id || ''
      };
      rapService.add(newRecord);
    }
    
    setIsModalOpen(false);
    setEditingRecord(null);
    resetForm();
    loadData();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro del RAP?')) {
      rapService.delete(id);
      loadData();
    }
  };

  const openEditModal = (record: RapEntry) => {
    setEditingRecord(record);
    setFormData(record);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingRecord(null);
    resetForm();
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      process: '',
      purpose: '',
      legalBase: 'Obligación Legal',
      dataSubjectCategory: '',
      dataCategory: '',
      recipients: '',
      internationalTransfers: 'No previstas',
      retentionPeriod: '',
      securityMeasures: '',
      companyId: companyId || companies[0]?.id || ''
    });
  };

  const filteredEntries = entries.filter(item => 
    item.process.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (companies.find(c => c.id === item.companyId)?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name || 'Desconocida';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar en el RAP..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-all">
            <Filter size={18} />
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-primaryLight transition-all shadow-lg shadow-brand-primary/20"
          >
            <Plus size={18} />
            Nuevo Registro RAP
          </button>
        </div>
      </div>

      {/* RAP Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Actividad / Proceso</th>
                <th className="px-6 py-4">Base Legal</th>
                <th className="px-6 py-4">Interesados</th>
                <th className="px-6 py-4">Conservación</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-light text-brand-secondary rounded-lg">
                          <Scale size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{item.process}</div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Building2 size={10} />
                            {getCompanyName(item.companyId)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold">
                        {item.legalBase}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.dataSubjectCategory}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.retentionPeriod}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setViewingRecord(item)}
                          className="p-2 text-gray-400 hover:text-brand-primary transition-colors"
                          title="Ver Detalle"
                        >
                          <ChevronRight size={18} />
                        </button>
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-2 text-gray-400 hover:text-brand-primary transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <Scale size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No se encontraron registros en el RAP.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {editingRecord ? <Edit2 size={20} className="text-brand-primary" /> : <Plus size={20} className="text-brand-primary" />}
                {editingRecord ? 'Editar Actividad de Tratamiento' : 'Nuevo Registro RAP'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Process Name */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Actividad / Proceso</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    placeholder="Ej: Gestión de Nóminas, Marketing Directo..."
                    value={formData.process}
                    onChange={(e) => setFormData({...formData, process: e.target.value})}
                  />
                </div>

                {/* Purpose */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Finalidad del Tratamiento</label>
                  <textarea 
                    required
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all resize-none"
                    placeholder="Describa para qué se utilizan los datos..."
                    value={formData.purpose}
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  />
                </div>

                {/* Legal Base */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Base Legal</label>
                  <select 
                    required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    value={formData.legalBase}
                    onChange={(e) => setFormData({...formData, legalBase: e.target.value})}
                  >
                    <option value="Consentimiento">Consentimiento</option>
                    <option value="Contrato">Ejecución de Contrato</option>
                    <option value="Obligación Legal">Obligación Legal</option>
                    <option value="Interés Vital">Interés Vital</option>
                    <option value="Misión Pública">Misión Pública</option>
                    <option value="Interés Legítimo">Interés Legítimo</option>
                  </select>
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Empresa</label>
                  <select 
                    required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    value={formData.companyId}
                    onChange={(e) => setFormData({...formData, companyId: e.target.value})}
                    disabled={!!companyId}
                  >
                    {companies.map(c => c && (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Data Subjects */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría de Interesados</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    placeholder="Ej: Empleados, Clientes, Proveedores..."
                    value={formData.dataSubjectCategory}
                    onChange={(e) => setFormData({...formData, dataSubjectCategory: e.target.value})}
                  />
                </div>

                {/* Data Categories */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría de Datos</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    placeholder="Ej: Identificativos, Salud, Biométricos..."
                    value={formData.dataCategory}
                    onChange={(e) => setFormData({...formData, dataCategory: e.target.value})}
                  />
                </div>

                {/* Recipients */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Destinatarios / Cesiones</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    placeholder="Ej: Bancos, Administraciones Públicas..."
                    value={formData.recipients}
                    onChange={(e) => setFormData({...formData, recipients: e.target.value})}
                  />
                </div>

                {/* International Transfers */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transferencias Internacionales</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    placeholder="Ej: No previstas, EE.UU. (SCC)..."
                    value={formData.internationalTransfers}
                    onChange={(e) => setFormData({...formData, internationalTransfers: e.target.value})}
                  />
                </div>

                {/* Retention Period */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Plazo de Conservación</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    placeholder="Ej: 5 años, 10 años..."
                    value={formData.retentionPeriod}
                    onChange={(e) => setFormData({...formData, retentionPeriod: e.target.value})}
                  />
                </div>

                {/* Security Measures */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Medidas de Seguridad</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    placeholder="Ej: Cifrado, Control de acceso..."
                    value={formData.securityMeasures}
                    onChange={(e) => setFormData({...formData, securityMeasures: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-primaryLight transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2"
                >
                  <Check size={18} />
                  {editingRecord ? 'Actualizar' : 'Guardar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="text-brand-primary" size={24} />
                Detalle de Actividad RAP
              </h3>
              <button 
                onClick={() => setViewingRecord(null)}
                className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Actividad</p>
                  <p className="text-lg font-bold text-gray-900">{viewingRecord.process}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Empresa</p>
                  <p className="text-lg font-bold text-gray-900">{getCompanyName(viewingRecord.companyId)}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Finalidad</p>
                <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-600 leading-relaxed border border-gray-100">
                  {viewingRecord.purpose}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Base Legal</p>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                    {viewingRecord.legalBase}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Plazo Conservación</p>
                  <p className="text-sm font-bold text-gray-700">{viewingRecord.retentionPeriod}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Interesados</p>
                  <p className="text-sm text-gray-700">{viewingRecord.dataSubjectCategory}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Categoría Datos</p>
                  <p className="text-sm text-gray-700">{viewingRecord.dataCategory}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Building2 size={12} /> Destinatarios
                  </p>
                  <p className="text-sm text-gray-700">{viewingRecord.recipients}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Globe size={12} /> Transferencias
                  </p>
                  <p className="text-sm text-gray-700">{viewingRecord.internationalTransfers}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Lock size={12} /> Medidas de Seguridad
                </p>
                <div className="p-4 bg-green-50/30 rounded-2xl text-sm text-gray-700 leading-relaxed border border-green-100">
                  {viewingRecord.securityMeasures}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button 
                onClick={() => setViewingRecord(null)}
                className="px-8 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primaryLight transition-all shadow-lg shadow-brand-primary/20"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
