import React, { useState } from 'react';
import {
  X,
  Check,
  AlertCircle,
  UploadCloud,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Package,
  FileText,
  CreditCard,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import returnsService, {
  RETURN_REASONS,
  validateReturnPhoto,
  getReturnErrorMessage
} from '../../services/returnsService';

export default function ReturnWizardModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  eligibility,
  onSuccess
}) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successReturn, setSuccessReturn] = useState(null);

  // Form State
  // selectedItems: { [orderItemId]: { selected: boolean, quantity: number, reason: string, reasonNote: string, stagedPhotos: Array<{ photoId: string, url: string }> } }
  const [itemConfigs, setItemConfigs] = useState(() => {
    const initial = {};
    const items = eligibility?.eligibleItems || [];
    items.forEach(item => {
      initial[item.orderItemId] = {
        selected: false,
        quantity: 1,
        maxQuantity: item.eligibleQuantity || 1,
        reason: 'DefectiveProduct',
        reasonNote: '',
        stagedPhotos: [], // Array<{ photoId, url }>
        uploading: false,
        uploadError: ''
      };
    });
    return initial;
  });

  // Bank Details State
  const [bankAccount, setBankAccount] = useState({
    accountNumber: '',
    accountHolder: '',
    bankName: ''
  });
  const [bankErrors, setBankErrors] = useState({});

  if (!isOpen) return null;

  const eligibleItems = eligibility?.eligibleItems || [];

  // -------------------------------------------------------------
  // Step 1: Item Selection & Quantity Handlers
  // -------------------------------------------------------------
  const toggleItemSelection = (orderItemId) => {
    setItemConfigs(prev => ({
      ...prev,
      [orderItemId]: {
        ...prev[orderItemId],
        selected: !prev[orderItemId]?.selected
      }
    }));
    setErrorMessage('');
  };

  const updateItemQuantity = (orderItemId, quantity) => {
    const max = itemConfigs[orderItemId]?.maxQuantity || 1;
    const cleanQty = Math.max(1, Math.min(max, Number(quantity) || 1));
    setItemConfigs(prev => ({
      ...prev,
      [orderItemId]: {
        ...prev[orderItemId],
        quantity: cleanQty
      }
    }));
  };

  const selectedItemIds = Object.keys(itemConfigs).filter(id => itemConfigs[id]?.selected);

  // -------------------------------------------------------------
  // Step 2: Reason, Note & Photo Staging Handlers
  // -------------------------------------------------------------
  const updateItemReason = (orderItemId, reason) => {
    setItemConfigs(prev => ({
      ...prev,
      [orderItemId]: {
        ...prev[orderItemId],
        reason
      }
    }));
    setErrorMessage('');
  };

  const updateItemNote = (orderItemId, reasonNote) => {
    setItemConfigs(prev => ({
      ...prev,
      [orderItemId]: {
        ...prev[orderItemId],
        reasonNote
      }
    }));
  };

  const handlePhotoUpload = async (orderItemId, file) => {
    if (!file) return;

    const validation = validateReturnPhoto(file);
    if (!validation.valid) {
      setItemConfigs(prev => ({
        ...prev,
        [orderItemId]: {
          ...prev[orderItemId],
          uploadError: validation.error
        }
      }));
      return;
    }

    setItemConfigs(prev => ({
      ...prev,
      [orderItemId]: {
        ...prev[orderItemId],
        uploading: true,
        uploadError: ''
      }
    }));

    try {
      const staged = await returnsService.stagePhoto(file);
      setItemConfigs(prev => ({
        ...prev,
        [orderItemId]: {
          ...prev[orderItemId],
          uploading: false,
          stagedPhotos: [
            ...(prev[orderItemId]?.stagedPhotos || []),
            { photoId: staged.photoId, url: staged.url }
          ]
        }
      }));
    } catch (err) {
      setItemConfigs(prev => ({
        ...prev,
        [orderItemId]: {
          ...prev[orderItemId],
          uploading: false,
          uploadError: getReturnErrorMessage(err)
        }
      }));
    }
  };

  const removeStagedPhoto = (orderItemId, photoIndex) => {
    setItemConfigs(prev => {
      const photos = [...(prev[orderItemId]?.stagedPhotos || [])];
      photos.splice(photoIndex, 1);
      return {
        ...prev,
        [orderItemId]: {
          ...prev[orderItemId],
          stagedPhotos: photos
        }
      };
    });
  };

  // -------------------------------------------------------------
  // Step 3: Bank Details Validation
  // -------------------------------------------------------------
  const validateBankForm = () => {
    const errors = {};
    if (!bankAccount.accountNumber.trim()) {
      errors.accountNumber = 'IBAN or account number is required for refund transfer.';
    }
    if (!bankAccount.accountHolder.trim()) {
      errors.accountHolder = 'Account holder full name is required.';
    }
    if (!bankAccount.bankName.trim()) {
      errors.bankName = 'Bank name is required.';
    }
    setBankErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // -------------------------------------------------------------
  // Wizard Navigation & Step Validation
  // -------------------------------------------------------------
  const handleNext = () => {
    setErrorMessage('');
    if (step === 1) {
      if (selectedItemIds.length === 0) {
        setErrorMessage('Please select at least one item to return.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate that defective items have at least one photo staged
      for (const id of selectedItemIds) {
        const cfg = itemConfigs[id];
        const itemInfo = eligibleItems.find(i => String(i.orderItemId) === String(id));
        if (cfg.reason === 'DefectiveProduct' && (!cfg.stagedPhotos || cfg.stagedPhotos.length === 0)) {
          setErrorMessage(
            `Item "${itemInfo?.productName || 'Selected Item'}" is marked as Defective / Damaged. At least one clear photo is required.`
          );
          return;
        }
      }
      setStep(3);
    } else if (step === 3) {
      if (!validateBankForm()) {
        return;
      }
      setStep(4);
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // -------------------------------------------------------------
  // Final Submission
  // -------------------------------------------------------------
  const handleSubmitReturn = async () => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        bankAccountNumber: bankAccount.accountNumber.trim(),
        bankAccountHolderName: bankAccount.accountHolder.trim(),
        bankName: bankAccount.bankName.trim(),
        items: selectedItemIds.map(id => {
          const cfg = itemConfigs[id];
          return {
            orderItemId: Number(id),
            quantity: Number(cfg.quantity || 1),
            reason: cfg.reason,
            reasonNote: cfg.reasonNote.trim(),
            photoIds: (cfg.stagedPhotos || []).map(p => p.photoId).filter(Boolean)
          };
        })
      };

      const created = await returnsService.createReturn(orderId, payload);
      setSuccessReturn(created);
      if (onSuccess) {
        onSuccess(created);
      }
    } catch (err) {
      setErrorMessage(getReturnErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate estimated refund
  const estimatedRefund = selectedItemIds.reduce((total, id) => {
    const cfg = itemConfigs[id];
    const item = eligibleItems.find(i => String(i.orderItemId) === String(id));
    return total + (Number(item?.unitPrice || 0) * Number(cfg?.quantity || 1));
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#120B06] border border-[#D4AF37]/40 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#F3E6D0]">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                Order {orderNumber ? (String(orderNumber).startsWith('#') ? orderNumber : `#${orderNumber}`) : (String(orderId).startsWith('#') ? orderId : `#${orderId}`)}
              </span>
              <h2 className="font-cinzel text-lg font-bold uppercase tracking-wider text-[#F3E6D0]">
                Request Return & Refund
              </h2>
            </div>
            <p className="text-xs text-[#D8BE99] mt-0.5">
              Select items, supply verification details, and request royal reimbursement.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Progress Indicator */}
        {!successReturn && (
          <div className="px-6 py-3 bg-black/30 border-b border-white/5 flex items-center justify-between text-xs">
            {[
              { num: 1, label: 'Items & Qty', icon: Package },
              { num: 2, label: 'Reasons & Evidence', icon: FileText },
              { num: 3, label: 'Bank Details', icon: CreditCard },
              { num: 4, label: 'Review & Submit', icon: CheckCircle2 }
            ].map(s => {
              const Icon = s.icon;
              const isActive = step === s.num;
              const isPast = step > s.num;
              return (
                <div
                  key={s.num}
                  className={`flex items-center gap-2 ${
                    isActive
                      ? 'text-[#D4AF37] font-bold'
                      : isPast
                      ? 'text-emerald-400 font-medium'
                      : 'text-neutral-500'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono ${
                      isActive
                        ? 'bg-[#D4AF37] text-black font-bold'
                        : isPast
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-white/5 border border-white/10 text-neutral-400'
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span className="hidden sm:inline font-cinzel text-[11px] tracking-wide">
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SUCCESS SCREEN */}
          {successReturn ? (
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <h3 className="font-cinzel text-xl font-bold uppercase tracking-wider text-[#F3E6D0]">
                  Return Request Submitted
                </h3>
                <p className="text-xs text-[#D8BE99] max-w-md mx-auto leading-relaxed">
                  Your return request for Order <strong className="text-[#F3E6D0]">{orderNumber ? (String(orderNumber).startsWith('#') ? orderNumber : `#${orderNumber}`) : (String(orderId).startsWith('#') ? orderId : `#${orderId}`)}</strong> has been received and is currently under review by our royal concierges.
                </p>
                <div className="p-3 bg-black/40 border border-white/10 rounded-xl inline-block text-xs font-mono text-[#D4AF37]">
                  Return Reference ID: #{successReturn.id}
                </div>
              </div>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="luxury-btn-gold px-6 py-2.5 text-xs uppercase tracking-wider font-cinzel font-bold cursor-pointer"
                >
                  Close & View Order
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: SELECT ITEMS */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#D8BE99]">
                      Select the flacons from this order you wish to return.
                    </p>
                    <span className="text-[11px] font-mono text-[#D4AF37]">
                      {selectedItemIds.length} item{selectedItemIds.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>

                  {eligibleItems.length === 0 ? (
                    <div className="p-6 text-center text-xs text-neutral-400 border border-white/10 rounded-xl">
                      No items are currently eligible for return on this order.
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-black/20">
                      {eligibleItems.map(item => {
                        const cfg = itemConfigs[item.orderItemId] || {};
                        const isSelected = Boolean(cfg.selected);

                        return (
                          <div
                            key={item.orderItemId}
                            className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                              isSelected ? 'bg-[#D4AF37]/10' : 'hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleItemSelection(item.orderItemId)}
                                className="w-4 h-4 accent-[#D4AF37] cursor-pointer rounded"
                              />
                              <img
                                src={item.productImageUrl || '/products/luxury_designs/07_arabian_gold.webp'}
                                alt={item.productName}
                                className="w-12 h-14 object-cover rounded border border-white/10 bg-black/40"
                              />
                              <div>
                                <h4 className="font-cinzel text-xs font-bold text-[#F3E6D0]">
                                  {item.productName}
                                </h4>
                                <p className="text-[11px] font-mono text-[#D4AF37]">
                                  €{item.unitPrice?.toFixed(2)} each
                                </p>
                                <p className="text-[10px] text-neutral-400">
                                  Eligible Qty: {item.eligibleQuantity}
                                </p>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="flex items-center gap-2">
                                <label className="text-[11px] text-neutral-400">Qty:</label>
                                <select
                                  value={cfg.quantity || 1}
                                  onChange={(e) => updateItemQuantity(item.orderItemId, e.target.value)}
                                  className="bg-black/60 border border-white/20 rounded-lg px-2.5 py-1 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                                >
                                  {Array.from({ length: item.eligibleQuantity || 1 }, (_, i) => i + 1).map(num => (
                                    <option key={num} value={num} className="bg-[#120B06] text-white">
                                      {num}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: REASONS, NOTES & PHOTOS */}
              {step === 2 && (
                <div className="space-y-6">
                  <p className="text-xs text-[#D8BE99]">
                    Provide the rationale for returning each chosen item. Note that defective or damaged items strictly mandate at least one verification photo.
                  </p>

                  <div className="space-y-5">
                    {selectedItemIds.map(id => {
                      const item = eligibleItems.find(i => String(i.orderItemId) === String(id));
                      const cfg = itemConfigs[id];
                      const isDefective = cfg.reason === 'DefectiveProduct';

                      return (
                        <div
                          key={id}
                          className="p-4 rounded-xl border border-white/10 bg-black/30 space-y-4"
                        >
                          {/* Item Header */}
                          <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={item?.productImageUrl || '/products/luxury_designs/07_arabian_gold.webp'}
                                alt={item?.productName}
                                className="w-10 h-12 object-cover rounded border border-white/10"
                              />
                              <div>
                                <h4 className="font-cinzel text-xs font-bold text-[#F3E6D0]">
                                  {item?.productName}
                                </h4>
                                <p className="text-[11px] font-mono text-neutral-400">
                                  Returning {cfg.quantity} unit{cfg.quantity > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            {isDefective && (
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                Photo Required
                              </span>
                            )}
                          </div>

                          {/* Reason Selector */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-cinzel text-[#D8BE99] uppercase tracking-wider mb-1">
                                Return Reason *
                              </label>
                              <select
                                value={cfg.reason}
                                onChange={(e) => updateItemReason(id, e.target.value)}
                                className="w-full bg-black/60 border border-white/20 rounded-xl p-2.5 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                              >
                                {RETURN_REASONS.map(r => (
                                  <option key={r.value} value={r.value} className="bg-[#120B06] text-white">
                                    {r.label} {r.requiresPhoto ? '(Photo Required)' : ''}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-cinzel text-[#D8BE99] uppercase tracking-wider mb-1">
                                Explanation Note (Optional)
                              </label>
                              <input
                                type="text"
                                value={cfg.reasonNote}
                                onChange={(e) => updateItemNote(id, e.target.value)}
                                placeholder="Describe the defect or discrepancy..."
                                className="w-full bg-black/60 border border-white/20 rounded-xl p-2.5 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none placeholder:text-neutral-500"
                              />
                            </div>
                          </div>

                          {/* Photo Staging Area */}
                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-cinzel text-[#D8BE99] uppercase tracking-wider">
                                Photo Verification {isDefective ? '*' : '(Optional)'}
                              </label>
                              <span className="text-[10px] text-neutral-400">
                                JPG, PNG, WEBP &le; 5MB
                              </span>
                            </div>

                            {/* Staged Photos Grid */}
                            <div className="flex flex-wrap items-center gap-3">
                              {cfg.stagedPhotos?.map((p, idx) => (
                                <div
                                  key={p.photoId || idx}
                                  className="relative group w-16 h-16 rounded-lg overflow-hidden border border-[#D4AF37]/50 bg-black/50"
                                >
                                  <img
                                    src={p.url}
                                    alt="Evidence"
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeStagedPhoto(id, idx)}
                                    className="absolute inset-0 bg-black/70 text-rose-400 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                                    title="Remove photo"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}

                              {/* Upload Button */}
                              <label
                                className={`w-16 h-16 border border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                                  cfg.uploading
                                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 pointer-events-none'
                                    : 'border-white/20 hover:border-[#D4AF37] bg-white/5 hover:bg-white/10'
                                }`}
                              >
                                {cfg.uploading ? (
                                  <Loader2 className="w-5 h-5 text-[#D4AF37] animate-spin" />
                                ) : (
                                  <>
                                    <UploadCloud className="w-5 h-5 text-neutral-400 group-hover:text-[#D4AF37]" />
                                    <span className="text-[9px] text-neutral-400 mt-1">Add</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  className="hidden"
                                  disabled={cfg.uploading}
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handlePhotoUpload(id, e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>
                            </div>

                            {cfg.uploadError && (
                              <p className="text-[11px] text-rose-400 mt-1">{cfg.uploadError}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: BANK DETAILS */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs text-[#D8BE99] flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#F3E6D0] block mb-0.5">Direct Bank Disbursement</strong>
                      Approved refunds are directly wired to your bank account. Sensitive account coordinates are never stored in your browser or used for any other purpose.
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-[11px] font-cinzel text-[#D8BE99] uppercase tracking-wider mb-1.5">
                        Bank Account Number / IBAN *
                      </label>
                      <input
                        type="text"
                        value={bankAccount.accountNumber}
                        onChange={(e) => {
                          setBankAccount(prev => ({ ...prev, accountNumber: e.target.value }));
                          if (bankErrors.accountNumber) setBankErrors(prev => ({ ...prev, accountNumber: null }));
                        }}
                        placeholder="e.g. BG80BNBG91651012345678 or local account number"
                        className="w-full bg-black/60 border border-white/20 rounded-xl p-3 text-xs text-[#F3E6D0] font-mono focus:border-[#D4AF37] focus:outline-none placeholder:text-neutral-500"
                      />
                      {bankErrors.accountNumber && (
                        <p className="text-[11px] text-rose-400 mt-1">{bankErrors.accountNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-cinzel text-[#D8BE99] uppercase tracking-wider mb-1.5">
                        Account Holder Full Name *
                      </label>
                      <input
                        type="text"
                        value={bankAccount.accountHolder}
                        onChange={(e) => {
                          setBankAccount(prev => ({ ...prev, accountHolder: e.target.value }));
                          if (bankErrors.accountHolder) setBankErrors(prev => ({ ...prev, accountHolder: null }));
                        }}
                        placeholder="Full name as registered on the bank account"
                        className="w-full bg-black/60 border border-white/20 rounded-xl p-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none placeholder:text-neutral-500"
                      />
                      {bankErrors.accountHolder && (
                        <p className="text-[11px] text-rose-400 mt-1">{bankErrors.accountHolder}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-cinzel text-[#D8BE99] uppercase tracking-wider mb-1.5">
                        Bank / Institution Name *
                      </label>
                      <input
                        type="text"
                        value={bankAccount.bankName}
                        onChange={(e) => {
                          setBankAccount(prev => ({ ...prev, bankName: e.target.value }));
                          if (bankErrors.bankName) setBankErrors(prev => ({ ...prev, bankName: null }));
                        }}
                        placeholder="e.g. UniCredit Bulbank, HSBC, Chase"
                        className="w-full bg-black/60 border border-white/20 rounded-xl p-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none placeholder:text-neutral-500"
                      />
                      {bankErrors.bankName && (
                        <p className="text-[11px] text-rose-400 mt-1">{bankErrors.bankName}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & SUBMIT */}
              {step === 4 && (
                <div className="space-y-5">
                  <p className="text-xs text-[#D8BE99]">
                    Please verify your return request details before finalizing submission.
                  </p>

                  {/* Items to Return */}
                  <div className="p-4 rounded-xl border border-white/10 bg-black/30 space-y-3">
                    <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                      Items to Return ({selectedItemIds.length})
                    </h4>
                    <div className="divide-y divide-white/5">
                      {selectedItemIds.map(id => {
                        const item = eligibleItems.find(i => String(i.orderItemId) === String(id));
                        const cfg = itemConfigs[id];
                        const totalItemPrice = Number(item?.unitPrice || 0) * Number(cfg?.quantity || 1);

                        return (
                          <div key={id} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={item?.productImageUrl || '/products/luxury_designs/07_arabian_gold.webp'}
                                alt={item?.productName}
                                className="w-10 h-12 object-cover rounded border border-white/10"
                              />
                              <div>
                                <span className="font-cinzel font-bold text-[#F3E6D0] block">
                                  {item?.productName}
                                </span>
                                <span className="text-[11px] text-neutral-400 block">
                                  Qty: {cfg?.quantity} &times; €{item?.unitPrice?.toFixed(2)} | Reason: {cfg?.reason}
                                </span>
                                {cfg?.stagedPhotos?.length > 0 && (
                                  <span className="text-[10px] text-emerald-400">
                                    {cfg.stagedPhotos.length} verification photo(s) attached
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="font-mono font-bold text-[#D4AF37]">
                              €{totalItemPrice.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bank Account Coordinates */}
                  <div className="p-4 rounded-xl border border-white/10 bg-black/30 space-y-2 text-xs">
                    <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                      Refund Settlement Destination
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-neutral-300">
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase">Bank Name</span>
                        <span className="font-medium text-[#F3E6D0]">{bankAccount.bankName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase">Account Holder</span>
                        <span className="font-medium text-[#F3E6D0]">{bankAccount.accountHolder}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase">Account Number</span>
                        <span className="font-mono text-[#F3E6D0]">
                          •••• {bankAccount.accountNumber.slice(-4) || '••••'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Total Estimated Refund */}
                  <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-between">
                    <div>
                      <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#F3E6D0] block">
                        Estimated Refund Total
                      </span>
                      <span className="text-[10px] text-[#D8BE99]">
                        Final amount subject to concierge inspection
                      </span>
                    </div>
                    <span className="font-cinzel text-xl font-bold text-[#D4AF37] font-mono">
                      €{estimatedRefund.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!successReturn && (
          <div className="p-5 border-t border-white/10 bg-black/40 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="px-4 py-2 bg-white/5 border border-white/10 text-xs font-cinzel text-[#F3E6D0] hover:bg-white/10 transition-colors rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-xs font-cinzel text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="luxury-btn-gold px-5 py-2 text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitReturn}
                  disabled={submitting}
                  className="luxury-btn-gold px-6 py-2.5 text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Return...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm & Submit Return</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
