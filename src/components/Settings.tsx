import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { User, Mail, Phone, MapPin, Bell, Shield, Save, Camera, Loader2 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export const Settings: React.FC = () => {
  const { user, updateProfile } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(user);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile(user);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          setProfile({
            ...profile,
            avatar: compressedDataUrl
          });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (profile) {
      setIsSaving(true);
      
      try {
        await updateProfile(profile);
        setIsSaving(false);
        console.log('Profile synced with backend successfully');
      } catch (error) {
        console.error('Failed to sync profile:', error);
        setIsSaving(false);
      }
    }
  };

  if (!profile) return null;

  return (
    <div className="p-8 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Perfil y Configuración</h1>
          <p className="text-gray-500 mt-1">Gestione su información personal y preferencias de la plataforma.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-primaryLight transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50 min-w-[180px] justify-center"
        >
          {isSaving ? (
            <><Loader2 size={18} className="animate-spin" /> Guardando...</>
          ) : (
            <><Save size={18} /> Guardar Cambios</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Role */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="relative inline-block mb-4 group">
              <img 
                src={profile?.avatar} 
                alt={profile?.name || 'Usuario'} 
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-50 shadow-md transition-all group-hover:opacity-75"
                referrerPolicy="no-referrer"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="text-white" size={24} />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-brand-secondary border-4 border-white rounded-full"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{profile?.name || 'Usuario'}</h3>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mt-1">
              {profile?.role === 'CLIENT_COMPLIANCE_OFFICER' ? 'Compliance Officer' : 
               profile?.role === 'CLIENT_DPO' ? 'Data Protection Officer' : 
               (profile?.role || 'Usuario')}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-bold">
              <Shield size={12} />
              {profile?.practiceArea}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Bell size={18} className="text-brand-secondary" />
              Notificaciones
            </h4>
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Alertas por Email' },
                { key: 'push', label: 'Notificaciones Push' },
                { key: 'weeklyDigest', label: 'Resumen Semanal' },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{item.label}</span>
                  <input 
                    type="checkbox" 
                    checked={(profile.notifications as any)[item.key]} 
                    onChange={(e) => setProfile({
                      ...profile,
                      notifications: { ...profile.notifications, [item.key]: e.target.checked }
                    })}
                    className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <User size={18} className="text-brand-primary" />
              Información Personal
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="email" 
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ubicación</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Biografía Profesional</label>
              <textarea 
                rows={4}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all text-sm resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
