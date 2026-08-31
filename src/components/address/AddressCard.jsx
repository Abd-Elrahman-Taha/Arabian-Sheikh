import React from 'react';
import {
  Home,
  Briefcase,
  MapPin,
  Star,
  Edit3,
  Trash2,
  Phone,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isSettingDefault = false,
  isDeleting = false,
  selectable = false,
  selected = false,
  onSelect
}) {
  if (!address) return null;

  const isDefault = Boolean(address.isDefaultShipping);

  const getLabelIcon = () => {
    switch (address.label) {
      case 'Work':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'Other':
        return <MapPin className="w-3.5 h-3.5" />;
      case 'Home':
      default:
        return <Home className="w-3.5 h-3.5" />;
    }
  };

  const displayLabel = address.label === 'Other' && address.customLabel
    ? address.customLabel
    : address.label || 'Home';

  return (
    <div
      onClick={() => selectable && onSelect && onSelect(address)}
      className={`group relative rounded-2xl p-5 sm:p-6 transition-all duration-300 backdrop-blur-md shadow-xl flex flex-col justify-between ${
        selectable ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'bg-gradient-to-br from-[#1C160F] to-[#0B0A08] border-2 border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.2)]'
          : isDefault
          ? 'bg-[#0B0A08]/95 border border-[#D4AF37]/60 shadow-[0_4px_20px_rgba(212,175,55,0.12)]'
          : 'bg-[#0B0A08]/85 border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 hover:bg-[#0B0A08]'
      }`}
    >
      {/* Top Bar: Label Badge + Default Badge / Radio */}
      <div>
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-[#D4AF37]/15">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-cinzel font-bold tracking-wider uppercase bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#F2D675]">
              {getLabelIcon()}
              <span>{displayLabel}</span>
            </span>

            {isDefault && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                <span>Default Address</span>
              </span>
            )}
          </div>

          {selectable && (
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              selected
                ? 'border-[#D4AF37] bg-[#D4AF37] text-black shadow-sm'
                : 'border-white/30 bg-black/40'
            }`}>
              {selected && <CheckCircle2 className="w-4 h-4 fill-black text-[#D4AF37]" />}
            </div>
          )}
        </div>

        {/* Address Content */}
        <div className="pt-4 space-y-2 text-xs sm:text-sm font-sans leading-relaxed">
          {/* Recipient Full Name */}
          <h4 className="font-cinzel text-base font-bold text-[#F3E6D0] tracking-wide">
            {address.fullName}
          </h4>

          {/* Address Lines */}
          <div className="text-[#D8BE99] space-y-0.5 font-medium">
            <p className="text-[#F3E6D0]/90">{address.addressLine1}</p>
            {address.addressLine2 && (
              <p className="text-[#D8BE99]/80">{address.addressLine2}</p>
            )}
            <p>
              {address.city}, {address.region} {address.postalCode}
            </p>
            <p className="text-xs font-mono uppercase tracking-wider text-[#F2D675]">
              {address.countryCode}
            </p>
          </div>

          {/* Phone Number */}
          {address.phone && (
            <div className="pt-1.5 flex items-center gap-2 text-xs font-mono text-[#D8BE99]">
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{address.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      {!selectable && (
        <div className="pt-5 mt-4 border-t border-[#D4AF37]/15 flex items-center justify-between gap-2 flex-wrap">
          <div>
            {!isDefault ? (
              <button
                type="button"
                onClick={() => onSetDefault && onSetDefault(address)}
                disabled={isSettingDefault}
                className="px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 hover:border-[#D4AF37] bg-black/40 hover:bg-[#D4AF37]/15 text-[#D8BE99] hover:text-[#F2D675] text-xs font-cinzel uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSettingDefault ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                ) : (
                  <Star className="w-3.5 h-3.5 text-[#D4AF37]" />
                )}
                <span>{isSettingDefault ? 'Updating...' : 'Set as Default'}</span>
              </button>
            ) : (
              <span className="text-[11px] font-cinzel text-[#D4AF37]/70 uppercase tracking-wider font-semibold">
                Primary Delivery Destination
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit && onEdit(address)}
              className="p-2 rounded-lg border border-white/10 hover:border-[#D4AF37]/50 bg-white/5 hover:bg-[#D4AF37]/15 text-[#D8BE99] hover:text-[#F2D675] transition-all cursor-pointer"
              title="Edit Address"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onDelete && onDelete(address)}
              disabled={isDeleting}
              className="p-2 rounded-lg border border-rose-500/20 hover:border-rose-500/50 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 transition-all cursor-pointer disabled:opacity-50"
              title="Delete Address"
            >
              {isDeleting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

