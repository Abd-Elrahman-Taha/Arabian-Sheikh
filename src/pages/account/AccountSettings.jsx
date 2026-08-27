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
          <label className="text-[#D4AF37] uppercase font-cinzel text-xs sm:text-sm font-bold tracking-wider">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#21130D] border border-[#3A2116]/60 p-3 rounded-lg text-sm sm:text-base text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[#D4AF37] uppercase font-cinzel text-xs sm:text-sm font-bold tracking-wider">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#21130D] border border-[#3A2116]/60 p-3 rounded-lg text-sm sm:text-base text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[#D4AF37] uppercase font-cinzel text-xs sm:text-sm font-bold tracking-wider">Telephone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-[#21130D] border border-[#3A2116]/60 p-3 rounded-lg text-sm sm:text-base text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="px-7 py-3 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2 transition-colors rounded-xl shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}
