
import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  AlertCircle,
  ChevronRight,
  Building2,
  Lock,
  Eye,
  Clock,
  Shield,
  LayoutGrid,
  List
} from 'lucide-react';
import { DataInventory as DataInventoryType, Company } from '../types';
import { dataInventoryService, companyService, generateId } from '../services/db';

interface DataInventoryProps {
  companyId?: string;
}

export const DataInventory: React.FC<DataInventoryProps> = ({ companyId }) => {
  const [inventory, setInventory] = useState<DataInventoryType[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DataInventoryType | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  
  // Form state
  const [formData, setFormData] = useState<Partial<DataInventoryType>>({
    systemName: '',
    companyId: companyId || '',
    description: '',
    dataCategory: [],
    dataSubjects: [],
    storageLocation: '',
    retentionPeriod: '',
    securityMeasures: [],
    status: 'Activo'
  });

  useEffect(() => {
    loadData();
  }, [companyId]);

  const loadData = () => {
    let allInventory = dataInventoryService.getAll();
    if (companyId) {
      allInventory = allInventory.filter(item => item.companyId === companyId);
    }
    setInventory(allInventory);
    setCompanies(companyService.getAll());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingRecord) {
      dataInventoryService.update(editingRecord.id, formData);
    } else {
      const newRecord: DataInventoryType = {
        ...formData as DataInventoryType,
        id: generateId('INV'),
      };
      dataInventoryService.add(newRecord);
    }
    
    setIsModalOpen(false);
    setEditingRecord(null);
    resetForm();
    loadData();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro?')) {
      dataInventoryService.delete(id);
      loadData();
    }
  };

  const openEditModal = (record: DataInventoryType) => {
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
      systemName: '',
      companyId: companyId || companies[0]?.id || '',
      description: '',
      dataCategory: [],
      dataSubjects: [],
      storageLocation: '',
      retentionPeriod: '',
      securityMeasures: [],
      status: 'Activo'
    });
  };

  const filteredInventory = inventory.filter(item => 
    item.systemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            placeholder="Buscar en el inventario..."
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
            Nuevo Registro
          </button>
          
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'card' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}
              title="Vista de Tarjetas"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}
              title="Vista de Lista"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table or Grid */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Sistema / Empresa</th>
                  <th className="px-6 py-4">Categorías</th>
                  <th className="px-6 py-4">Ubicación / Retención</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <Database size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{item.systemName}</div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Building2 size={10} />
                            {getCompanyName(item.companyId)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {item.dataCategory.map((cat, i) => (
                          <span key={i} className="px-2 py-0.5 bg-brand-light text-brand-secondary rounded-full text-[10px] font-bold">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-700 flex items-center gap-1">
                        <Lock size={12} className="text-gray-400" />
                        {item.storageLocation}
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock size={10} />
                        Retención: {item.retentionPeriod}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        item.status === 'Activo' ? 'bg-green-50 text-green-600' : 
                        item.status === 'En Revisión' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-50 text-gray-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-2 text-gray-400 hover:text-brand-primary transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
                    <Database size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No se encontraron registros en el inventario.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.length > 0 ? (
            filteredInventory.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Database size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{item.systemName}</h3>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Building2 size={10} />
                        {getCompanyName(item.companyId)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                    item.status === 'Activo' ? 'bg-green-50 text-green-600' : 
                    item.status === 'En Revisión' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-50 text-gray-600'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Categorías</p>
                    <div className="flex flex-wrap gap-1">
                      {item.dataCategory.map((cat, i) => (
                        <span key={i} className="px-2 py-0.5 bg-brand-light text-brand-secondary rounded-full text-[10px] font-bold">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Almacenamiento</p>
                      <p className="text-xs text-gray-700 flex items-center gap-1"><Lock size={12} className="text-gray-400" /> {item.storageLocation}</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1"><Clock size={10} /> Retención: {item.retentionPeriod}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(item)} className="p-2 text-gray-400 hover:text-brand-primary transition-colors bg-gray-50 hover:bg-brand-primary/10 rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed">
              <Database size={48} className="mx-auto mb-4 opacity-20" />
              <p>No se encontraron registros en el inventario.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {editingRecord ? <Edit2 size={20} className="text-brand-primary" /> : <Plus size={20} className="text-brand-primary" />}
                {editingRecord ? 'Editar Registro' : 'Nuevo Registro de Inventario'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* System Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre del Sistema</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    placeholder="Ej: ERP SAP, Salesforce..."
                    value={formData.systemName}
                    onChange={(e) => setFormData({...formData, systemName: e.target.value})}
                  />
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Empresa Responsable</label>
                  <select 
                    required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    value={formData.companyId}
                    onChange={(e) => setFormData({...formData, companyId: e.target.value})}
                  >
                    <option value="">Seleccionar Empresa</option>
                    {companies.map(c => c && (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción del Tratamiento</label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all resize-none"
                    placeholder="Describa el propósito y uso de los datos en este sistema..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                {/* Data Categories */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categorías de Datos</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    placeholder="Ej: Personal, Sensible, Financiero (separar por comas)"
                    value={formData.dataCategory?.join(', ')}
                    onChange={(e) => setFormData({...formData, dataCategory: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})}
                  />
                </div>

                {/* Data Subjects */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Interesados / Sujetos</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    placeholder="Ej: Empleados, Clientes (separar por comas)"
                    value={formData.dataSubjects?.join(', ')}
                    onChange={(e) => setFormData({...formData, dataSubjects: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})}
                  />
                </div>

                {/* Storage Location */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ubicación de Almacenamiento</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    placeholder="Ej: AWS (EE.UU.), Servidor Local..."
                    value={formData.storageLocation}
                    onChange={(e) => setFormData({...formData, storageLocation: e.target.value})}
                  />
                </div>

                {/* Retention Period */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Periodo de Retención</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    placeholder="Ej: 5 años, Hasta fin de contrato..."
                    value={formData.retentionPeriod}
                    onChange={(e) => setFormData({...formData, retentionPeriod: e.target.value})}
                  />
                </div>

                {/* Security Measures */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Medidas de Seguridad</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    placeholder="Ej: Cifrado, MFA, Auditoría (separar por comas)"
                    value={formData.securityMeasures?.join(', ')}
                    onChange={(e) => setFormData({...formData, securityMeasures: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})}
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</label>
                  <select 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="Activo">Activo</option>
                    <option value="En Revisión">En Revisión</option>
                    <option value="Obsoleto">Obsoleto</option>
                  </select>
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
    </div>
  );
};
