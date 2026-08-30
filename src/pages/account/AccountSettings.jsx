import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Save, Lock, User, Phone, Mail, ShieldCheck } from 'lucide-react';

export default function AccountSettings() {
  const { user, updateProfile } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : ''));
      setEmail(user.email || '');
      setPhone(user.phone || user.phoneNumber || '');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Full name is required.');
      return;
    }

    setSaving(true);
    try {
      if (updateProfile) {
        await updateProfile({ name: name.trim(), phone: phone.trim() });
      }
      success('Patron profile updated successfully.');
    } catch (err) {
      error(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-[#F3E6D0] max-w-2xl">
      <div className="border-b border-[#3A2116]/40 pb-5">
        <h2 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
          Profile Settings & Security
        </h2>
        <p className="text-xs sm:text-sm text-[#D8BE99] mt-1">
          Update your contact credentials and Palace concierge details.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 text-sm sm:text-base">
        <div className="space-y-1.5">
          <label className="text-[#D4AF37] uppercase font-cinzel text-xs sm:text-sm font-bold tracking-wider">
            Full Name (الاسم بالكامل)
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sheikh Tariq Al-Fassi"
              className="w-full bg-[#21130D] border border-[#3A2116]/60 p-3 pl-10 rounded-lg text-sm sm:text-base text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
            />
            <User className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[#D4AF37] uppercase font-cinzel text-xs sm:text-sm font-bold tracking-wider">
            Email Address (البريد الإلكتروني - محمي)
          </label>
          <div className="relative">
            <input
              type="email"
              disabled
              value={email}
              className="w-full bg-[#150D08] border border-[#3A2116]/40 p-3 pl-10 rounded-lg text-sm sm:text-base text-[#D8BE99]/70 cursor-not-allowed font-mono"
            />
            <Mail className="w-4 h-4 text-[#D4AF37]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[#D4AF37] uppercase font-cinzel text-xs sm:text-sm font-bold tracking-wider">
            Telephone Number (رقم الهاتف)
          </label>
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+201000000000"
              className="w-full bg-[#21130D] border border-[#3A2116]/60 p-3 pl-10 rounded-lg text-sm sm:text-base text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none font-mono"
            />
            <Phone className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-7 py-3 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2 transition-colors rounded-xl shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
