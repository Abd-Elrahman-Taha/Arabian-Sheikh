import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { MapPin, Plus, Trash2, X } from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../../components/common/ScrollReveal';

export default function AccountAddresses() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Address Form
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    country: 'United Arab Emirates',
    postalCode: '',
    phone: '',
    isDefault: false
  });

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const list = await userService.getAddresses(user.id);
        setAddresses(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await userService.addAddress(user.id, formData);
      const updated = await userService.getAddresses(user.id);
      setAddresses(updated);
      setIsModalOpen(false);
      setFormData({
        fullName: '',
        address: '',
        city: '',
        country: 'United Arab Emirates',
        postalCode: '',
        phone: '',
        isDefault: false
      });
      success('New destination added to your Address Book.');
    } catch (err) {
      error(err.message || 'Could not save address.');
    }
  };

  const handleDelete = async (addressId) => {
    if (!user) return;
    try {
      await userService.deleteAddress(user.id, addressId);
      setAddresses(addresses.filter((a) => a.id !== addressId));
      success('Address removed.');
    } catch (err) {
      error(err.message || 'Could not delete address.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[var(--text-primary)]">
      <ScrollReveal direction="up">
        <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3">
          <h2 className="font-cinzel text-xl font-bold uppercase">
            {t('account.addresses')}
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="luxury-btn-gold px-4 py-1.5 text-xs flex items-center gap-1 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('account.addAddress')}</span>
          </button>
        </div>
      </ScrollReveal>

      {loading ? (
        <div className="text-center py-12 text-xs text-[var(--text-muted)]">Retrieving addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-3">
          <MapPin className="w-8 h-8 text-[var(--gold-primary)] mx-auto opacity-50" />
          <p className="text-xs text-[var(--text-muted)]">No addresses registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr, index) => (
            <ScrollRevealItem key={addr.id} index={index}>
            <div
              className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-card)] flex flex-col justify-between space-y-3 shadow-sm relative"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-cinzel font-bold text-sm text-[var(--text-primary)]">
                    {addr.fullName}
                  </span>
                  {addr.isDefault && (
                    <span className="px-2 py-0.5 text-[10px] uppercase font-mono bg-[var(--gold-primary)] text-[#130C05] font-bold">
                      {t('account.default')}
                    </span>
                  )}
                </div>
                <div className="text-xs text-[var(--text-muted)] space-y-1 font-sans">
                  <p>{addr.address}</p>
                  <p>{addr.city}, {addr.postalCode}</p>
                  <p>{addr.country}</p>
                  <p className="pt-1">Phone: {addr.phone}</p>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-[var(--border-subtle)]">
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('account.delete')}</span>
                </button>
              </div>
            </div>
            </ScrollRevealItem>
          ))}
        </div>
      )}

      {/* Modal Add Address */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <ScrollReveal direction="up" className="max-w-md w-full">
            <div className="w-full bg-[var(--bg-card)] border border-[var(--border-gold)] p-6 space-y-4 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-cinzel text-base font-bold text-[var(--text-primary)] uppercase">
                {t('account.addAddress')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-[var(--text-muted)] mb-1 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-card)] p-2 text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 uppercase tracking-wider">Street Address & Villa</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-card)] p-2 text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] mb-1 uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-card)] p-2 text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-muted)] mb-1 uppercase tracking-wider">Postal / ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-card)] p-2 text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 uppercase tracking-wider">Country / Region</label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-card)] p-2 text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+971 50 000 0000"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-card)] p-2 text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="defaultAddr"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="accent-[#D2A55F] cursor-pointer"
                />
                <label htmlFor="defaultAddr" className="text-xs text-[var(--text-muted)] cursor-pointer">
                  {t('account.setDefault')}
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 luxury-btn-outline text-xs text-center cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 luxury-btn-gold text-xs text-center cursor-pointer shadow-md"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
            </div>
          </ScrollReveal>
        </div>
      )}
    </div>
  );
}
