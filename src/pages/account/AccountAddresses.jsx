import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { MapPin, Plus, Trash2, X, Check } from 'lucide-react';

export default function AccountAddresses() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      title: 'Primary Palace Residence',
      fullName: 'Sheikh Tariq Al-Fassi',
      street: 'Royal Mirage Boulevard, Villa 42',
      city: 'Dubai',
      country: 'United Arab Emirates',
      postalCode: '00000',
      isDefault: true
    }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 text-[#F3E6D0]">
      <div className="flex items-center justify-between border-b border-[#3A2116]/40 pb-4">
        <div>
          <h2 className="font-cinzel text-xl font-bold uppercase tracking-wider text-[#F3E6D0]">
            Palace Delivery Addresses
          </h2>
          <p className="text-xs text-[#D8BE99]">
            Manage delivery destinations for royal courier transit.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Address</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div key={addr.id} className="p-5 bg-[#21130D] border border-[#3A2116]/60 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="font-cinzel font-bold text-xs text-[#D4AF37] uppercase">{addr.title}</span>
              {addr.isDefault && (
                <span className="px-2 py-0.5 text-[9px] font-mono bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                  Default
                </span>
              )}
            </div>
            <div className="text-xs text-[#D8BE99] space-y-0.5">
              <p className="text-[#F3E6D0] font-semibold">{addr.fullName}</p>
              <p>{addr.street}</p>
              <p>{addr.city}, {addr.country}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
