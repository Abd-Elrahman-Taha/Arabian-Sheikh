import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Save, Lock, User, ShieldCheck } from 'lucide-react';

export default function AccountSettings() {
  const { user } = useAuth();
  const { success } = useToast();

  const [name, setName] = useState(user?.name || 'Sheikh Tariq Al-Fassi');
  const [email, setEmail] = useState(user?.email || 'admin@arabiansheikh.com');
  const [phone, setPhone] = useState(user?.phone || '+971 50 123 4567');

  const handleSave = (e) => {
    e.preventDefault();
    success('Patron profile updated successfully.');
  };

  return (
    <div className="space-y-6 text-[#F5ECE3] max-w-2xl">
      <div className="border-b border-[#5C3D28]/40 pb-4">
        <h2 className="font-cinzel text-xl font-bold uppercase tracking-wider text-[#F8F5F0]">
          Profile Settings & Security
        </h2>
        <p className="text-xs text-[#BFA893]">
          Update your contact credentials and Palace concierge details.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div className="space-y-1">
          <label className="text-[#D4AF37] uppercase font-cinzel tracking-wider">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#160F0A] border border-[#5C3D28]/60 p-2.5 rounded text-[#F8F5F0] focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[#D4AF37] uppercase font-cinzel tracking-wider">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#160F0A] border border-[#5C3D28]/60 p-2.5 rounded text-[#F8F5F0] focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[#D4AF37] uppercase font-cinzel tracking-wider">Telephone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-[#160F0A] border border-[#5C3D28]/60 p-2.5 rounded text-[#F8F5F0] focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#E5C07B] text-black font-cinzel font-bold uppercase tracking-wider text-xs flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}
