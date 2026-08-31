import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Home,
  Briefcase,
  User,
  Phone,
  Globe,
  Building,
  Navigation,
  RefreshCw,
  Sparkles
} from 'lucide-react';

const COMMON_COUNTRIES = [
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'QA', name: 'Qatar' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'OM', name: 'Oman' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'CH', name: 'Switzerland' }
];

export default function AddressFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false
}) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    label: 'Home',
    customLabel: '',
    fullName: '',
    phone: '',
    countryCode: 'AE',
    region: '',
    city: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        label: initialData.label || 'Home',
        customLabel: initialData.customLabel || '',
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        countryCode: initialData.countryCode || 'AE',
        region: initialData.region || '',
        city: initialData.city || '',
        addressLine1: initialData.addressLine1 || '',
        addressLine2: initialData.addressLine2 || '',
        postalCode: initialData.postalCode || ''
      });
    } else {
      setFormData({
        label: 'Home',
        customLabel: '',
        fullName: '',
        phone: '',
        countryCode: 'AE',
        region: '',
        city: '',
        addressLine1: '',
        addressLine2: '',
        postalCode: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};

    if (!formData.fullName.trim()) {
      errs.fullName = 'Recipient name is required.';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required for delivery.';
    } else if (formData.phone.trim().length < 6) {
      errs.phone = 'Please enter a valid contact number.';
    }

    if (!formData.countryCode.trim()) {
      errs.countryCode = 'Please select a country.';
    }

    if (!formData.region.trim()) {
      errs.region = 'Region / State / Governorate is required.';
    }

    if (!formData.city.trim()) {
      errs.city = 'City is required.';
    }

    if (!formData.addressLine1.trim()) {
      errs.addressLine1 = 'Street address / building is required.';
    }

    if (!formData.postalCode.trim()) {
      errs.postalCode = 'Postal / ZIP code is required.';
    }

    if (formData.label === 'Other' && !formData.customLabel.trim()) {
      errs.customLabel = 'Please specify a label for this destination.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      id: initialData?.id
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#0B0A08] border border-[#D4AF37]/40 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto my-auto text-[#F3E6D0]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="font-cinzel text-lg sm:text-xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              {isEdit ? 'Edit Delivery Destination' : 'Add New Palace Address'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-[#D8BE99] hover:text-white p-1 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {/* Label Type Selector */}
          <div>
            <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-2 font-bold">
              Address Category *
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { id: 'Home', label: 'Home', icon: Home },
                { id: 'Work', label: 'Office', icon: Briefcase },
                { id: 'Other', label: 'Other', icon: MapPin }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = formData.label === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, label: item.id }))}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-cinzel text-xs uppercase font-bold tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#D4AF37] bg-[#D4AF37] text-black shadow-md'
                        : 'border-[#D4AF37]/25 bg-black/40 text-[#D8BE99] hover:border-[#D4AF37]/50 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Label Input (if Other) */}
          {formData.label === 'Other' && (
            <div className="animate-fade-in">
              <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1.5 font-bold">
                Custom Label *
              </label>
              <input
                type="text"
                value={formData.customLabel}
                onChange={(e) => setFormData(p => ({ ...p, customLabel: e.target.value }))}
                placeholder="e.g. Private Villa, Diplomatic Salon, Beach House"
                className={`w-full bg-black/60 border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:outline-none transition-all shadow-inner ${
                  errors.customLabel ? 'border-rose-500' : 'border-[#D4AF37]/30 focus:border-[#D4AF37]'
                }`}
              />
              {errors.customLabel && (
                <p className="text-rose-400 text-xs mt-1">{errors.customLabel}</p>
              )}
            </div>
          )}

          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1.5 font-bold">
                Recipient Full Name *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))}
                  placeholder="e.g. Sheikh Ahmed Al-Fassi"
                  className={`w-full bg-black/60 border rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:outline-none transition-all shadow-inner ${
                    errors.fullName ? 'border-rose-500' : 'border-[#D4AF37]/30 focus:border-[#D4AF37]'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-rose-400 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1.5 font-bold">
                Courier Contact Phone *
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  placeholder="e.g. +971 50 123 4567"
                  className={`w-full bg-black/60 border rounded-xl pl-10 pr-4 py-2.5 font-mono text-xs sm:text-sm text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:outline-none transition-all shadow-inner ${
                    errors.phone ? 'border-rose-500' : 'border-[#D4AF37]/30 focus:border-[#D4AF37]'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-rose-400 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1.5 font-bold">
              Street Address / Building / Villa *
            </label>
            <div className="relative">
              <Building className="w-3.5 h-3.5 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => setFormData(p => ({ ...p, addressLine1: e.target.value }))}
                placeholder="e.g. Royal Mirage Boulevard, Crescent Tower 1"
                className={`w-full bg-black/60 border rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:outline-none transition-all shadow-inner ${
                  errors.addressLine1 ? 'border-rose-500' : 'border-[#D4AF37]/30 focus:border-[#D4AF37]'
                }`}
              />
            </div>
            {errors.addressLine1 && (
              <p className="text-rose-400 text-xs mt-1">{errors.addressLine1}</p>
            )}
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-xs font-cinzel text-[#D8BE99] uppercase tracking-wider mb-1.5 font-bold">
              Apartment / Suite / Floor (Optional)
            </label>
            <input
              type="text"
              value={formData.addressLine2}
              onChange={(e) => setFormData(p => ({ ...p, addressLine2: e.target.value }))}
              placeholder="e.g. Royal Penthouse 4201, Level 42"
              className="w-full bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:outline-none transition-all shadow-inner"
            />
          </div>

          {/* City & Region / State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1.5 font-bold">
                City / Municipality *
              </label>
              <div className="relative">
                <Navigation className="w-3.5 h-3.5 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                  placeholder="e.g. Dubai"
                  className={`w-full bg-black/60 border rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:outline-none transition-all shadow-inner ${
                    errors.city ? 'border-rose-500' : 'border-[#D4AF37]/30 focus:border-[#D4AF37]'
                  }`}
                />
              </div>
              {errors.city && (
                <p className="text-rose-400 text-xs mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1.5 font-bold">
                Region / State / Governorate *
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData(p => ({ ...p, region: e.target.value }))}
                placeholder="e.g. Dubai / Abu Dhabi / Riyadh"
                className={`w-full bg-black/60 border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:outline-none transition-all shadow-inner ${
                  errors.region ? 'border-rose-500' : 'border-[#D4AF37]/30 focus:border-[#D4AF37]'
                }`}
              />
              {errors.region && (
                <p className="text-rose-400 text-xs mt-1">{errors.region}</p>
              )}
            </div>
          </div>

          {/* Country & Postal Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1.5 font-bold">
                Country *
              </label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={formData.countryCode}
                  onChange={(e) => setFormData(p => ({ ...p, countryCode: e.target.value }))}
                  className="w-full bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl pl-10 pr-8 py-2.5 text-xs sm:text-sm text-[#F3E6D0] focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  {COMMON_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-[#0B0A08] text-[#F3E6D0]">
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
              {errors.countryCode && (
                <p className="text-rose-400 text-xs mt-1">{errors.countryCode}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1.5 font-bold">
                Postal / ZIP Code *
              </label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData(p => ({ ...p, postalCode: e.target.value }))}
                placeholder="e.g. 00000 or 12345"
                className={`w-full bg-black/60 border rounded-xl px-4 py-2.5 font-mono text-xs sm:text-sm text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:outline-none transition-all shadow-inner ${
                  errors.postalCode ? 'border-rose-500' : 'border-[#D4AF37]/30 focus:border-[#D4AF37]'
                }`}
              />
              {errors.postalCode && (
                <p className="text-rose-400 text-xs mt-1">{errors.postalCode}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4AF37]/20">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-cinzel uppercase tracking-wider text-[#D8BE99] hover:text-white transition-all cursor-pointer font-bold disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/50 font-cinzel font-bold text-xs uppercase tracking-wider shadow-lg transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isEdit ? 'Updating Address...' : 'Saving Address...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEdit ? 'Save Changes' : 'Save Address'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

