import React from 'react';
import { AlertTriangle, Trash2, RefreshCw } from 'lucide-react';

export default function DeleteAddressModal({
  isOpen,
  onClose,
  onConfirm,
  address,
  isDeleting = false,
  totalAddressesCount = 1
}) {
  if (!isOpen || !address) return null;

  const isSoleDefault = address.isDefaultShipping && totalAddressesCount <= 1;
  const isDefaultWithOthers = address.isDefaultShipping && totalAddressesCount > 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#0B0A08] border border-rose-500/40 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-[#F3E6D0]">
        {/* Header */}
        <div className="flex items-center gap-3 text-rose-400">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-cinzel text-lg font-bold uppercase tracking-wider text-[#F3E6D0]">
              Delete Delivery Address?
            </h3>
            <p className="text-xs text-[#D8BE99]">This action cannot be undone.</p>
          </div>
        </div>

        {/* Address summary box */}
        <div className="p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-1 text-xs font-sans">
          <p className="font-cinzel font-bold text-[#F2D675] uppercase">{address.label} {address.customLabel ? `(${address.customLabel})` : ''}</p>
          <p className="text-[#F3E6D0] font-semibold">{address.fullName}</p>
          <p className="text-[#D8BE99]">{address.addressLine1}</p>
          <p className="text-[#D8BE99]">{address.city}, {address.region} {address.postalCode}</p>
        </div>

        {isSoleDefault ? (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed">
            This is currently your <strong>only saved delivery address</strong>. The system requires at least one primary destination for royal courier shipping. Please add a new address before removing this one, or edit this address directly.
          </div>
        ) : isDefaultWithOthers ? (
          <div className="p-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F2D675] text-xs leading-relaxed">
            Note: This address is your <strong>default delivery destination</strong>. Your next saved address will automatically become your primary delivery destination.
          </div>
        ) : (
          <p className="text-xs text-[#D8BE99] leading-relaxed">
            Are you sure you want to remove this delivery destination from your saved addresses?
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-full border border-white/20 text-xs font-cinzel uppercase text-[#D8BE99] hover:text-white transition-all cursor-pointer font-bold disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(address)}
            disabled={isDeleting || isSoleDefault}
            className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 disabled:bg-rose-950 disabled:text-rose-400/50 disabled:border-rose-900 text-white font-cinzel text-xs uppercase font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Address</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

