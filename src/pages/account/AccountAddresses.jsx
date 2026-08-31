import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { addressService } from '../../services/addressService';
import { useToast } from '../../context/ToastContext';
import AddressCard from '../../components/address/AddressCard';
import AddressFormModal from '../../components/address/AddressFormModal';
import DeleteAddressModal from '../../components/address/DeleteAddressModal';
import { MapPin, Plus, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';

export default function AccountAddresses() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [settingDefaultId, setSettingDefaultId] = useState(null);

  // Load Addresses
  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await addressService.getAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[AccountAddresses] Error fetching addresses:', err);
      setErrorMessage(err.message || 'Unable to load delivery addresses.');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingAddress(null);
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    setIsFormOpen(true);
  };

  // Submit Add / Edit Form
  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true);
    try {
      if (editingAddress) {
        const updated = await addressService.updateAddress(editingAddress.id, formData);
        setAddresses(prev => prev.map(a => (a.id === updated.id ? updated : a)));
        success('Address updated successfully.');
      } else {
        const created = await addressService.createAddress(formData);
        if (created.isDefaultShipping) {
          setAddresses(prev => [created, ...prev.map(a => ({ ...a, isDefaultShipping: false }))]);
        } else {
          setAddresses(prev => [...prev, created]);
        }
        success('Address saved successfully.');
      }
      setIsFormOpen(false);
      setEditingAddress(null);
    } catch (err) {
      error(err.message || 'Failed to save address.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Set Default Address
  const handleSetDefault = async (addr) => {
    if (addr.isDefaultShipping) return;
    setSettingDefaultId(addr.id);
    try {
      await addressService.setDefaultAddress(addr.id);
      setAddresses(prev => prev.map(a => ({
        ...a,
        isDefaultShipping: a.id === addr.id
      })));
      success('Default delivery address updated.');
    } catch (err) {
      error(err.message || 'Failed to update default address.');
    } finally {
      setSettingDefaultId(null);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (addr) => {
    setAddressToDelete(addr);
    setIsDeleteOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async (addr) => {
    setDeletingId(addr.id);
    try {
      const otherAddresses = addresses.filter(a => a.id !== addr.id);
      const replacementId = otherAddresses.length > 0 ? otherAddresses[0].id : null;
      await addressService.deleteAddress(addr.id, replacementId);

      setAddresses(prev => {
        const remaining = prev.filter(a => a.id !== addr.id);
        if (addr.isDefaultShipping && remaining.length > 0) {
          return remaining.map((a, idx) => ({
            ...a,
            isDefaultShipping: idx === 0
          }));
        }
        return remaining;
      });

      success('Address deleted successfully.');
      setIsDeleteOpen(false);
      setAddressToDelete(null);
    } catch (err) {
      error(err.message || 'Failed to delete address.');
    } finally {
      setDeletingId(null);
    }
  };

  // Sort addresses: Default address first, then others
  const sortedAddresses = [...addresses].sort((a, b) => {
    if (a.isDefaultShipping && !b.isDefaultShipping) return -1;
    if (!a.isDefaultShipping && b.isDefaultShipping) return 1;
    return b.id - a.id;
  });

  return (
    <div className="space-y-6 text-[#F3E6D0] animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <MapPin className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              {t('account.addresses') || 'Palace Delivery Addresses'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#D8BE99] font-medium">
            Manage your personal delivery destinations for royal courier transit.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchAddresses}
            disabled={loading}
            className="p-2.5 rounded-xl border border-[#D4AF37]/30 bg-black/40 hover:bg-black/70 text-[#D8BE99] hover:text-[#F2D675] transition-all cursor-pointer shadow-sm disabled:opacity-50"
            title="Refresh addresses"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="group/btn relative px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/50 font-cinzel font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
            <span>Add Address</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        /* Loading Skeleton */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="p-6 bg-[#0B0A08]/80 border border-[#D4AF37]/20 rounded-2xl space-y-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 bg-white/10 rounded-full w-20" />
                <div className="h-4 bg-white/10 rounded-full w-24" />
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-5 bg-white/15 rounded w-36" />
                <div className="h-4 bg-white/10 rounded w-full" />
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-4 bg-white/10 rounded w-28" />
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between">
                <div className="h-7 bg-white/10 rounded-lg w-28" />
                <div className="h-7 bg-white/10 rounded-lg w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : errorMessage ? (
        /* Error State */
        <div className="p-8 bg-[#0B0A08]/90 border border-rose-500/30 rounded-2xl text-center space-y-4 shadow-xl">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="font-cinzel text-base font-bold text-[#F3E6D0]">Unable to Load Addresses</h3>
          <p className="text-xs text-[#D8BE99] max-w-md mx-auto">{errorMessage}</p>
          <button
            onClick={fetchAddresses}
            className="px-5 py-2 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 text-[#F2D675] font-cinzel text-xs uppercase font-bold tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : sortedAddresses.length === 0 ? (
        /* Empty State */
        <div className="py-16 px-6 bg-[#0B0A08]/80 border border-[#D4AF37]/25 rounded-2xl text-center space-y-4 shadow-xl backdrop-blur-md">
          <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto text-[#D4AF37]">
            <MapPin className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-cinzel text-lg sm:text-xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              No Saved Addresses
            </h3>
            <p className="text-xs sm:text-sm text-[#D8BE99] leading-relaxed">
              Add your delivery address now to ensure fast, seamless courier dispatch during royal checkout.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/50 font-cinzel font-bold text-xs uppercase tracking-wider shadow-lg transition-all duration-300 inline-flex items-center gap-2 cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Address</span>
          </button>
        </div>
      ) : (
        /* Address Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sortedAddresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onSetDefault={handleSetDefault}
              isSettingDefault={settingDefaultId === addr.id}
              isDeleting={deletingId === addr.id}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Form Modal */}
      <AddressFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAddress(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingAddress}
        isSubmitting={formSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteAddressModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setAddressToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        address={addressToDelete}
        isDeleting={deletingId === addressToDelete?.id}
        totalAddressesCount={addresses.length}
      />
    </div>
  );
}


