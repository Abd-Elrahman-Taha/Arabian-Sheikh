import React, { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  UploadCloud,
  Trash2,
  ShieldCheck,
  CreditCard,
  Loader2,
  Building,
  User,
  Info
} from 'lucide-react';
import returnsService, {
  RETURN_STATUSES,
  ITEM_STATUSES,
  getReasonLabel,
  getReturnErrorMessage,
  validateReturnPhoto
} from '../../services/returnsService';

export default function ReturnDetailsModal({
  isOpen,
  onClose,
  returnId,
  onUpdated
}) {
  const [returnDetails, setReturnDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Per-item supplementary photo state: { [itemId]: { uploading: boolean, error: string } }
  const [photoActionState, setPhotoActionState] = useState({});

  const loadDetails = async () => {
    if (!returnId) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await returnsService.getReturnDetails(returnId);
      setReturnDetails(data);
    } catch (err) {
      setErrorMessage(getReturnErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && returnId) {
      loadDetails();
    } else {
      setReturnDetails(null);
      setShowCancelConfirm(false);
      setErrorMessage('');
    }
  }, [isOpen, returnId]);

  if (!isOpen) return null;

  const handleCancelReturn = async () => {
    setCancelling(true);
    setErrorMessage('');
    try {
      const updated = await returnsService.cancelReturn(returnId);
      setReturnDetails(updated);
      setShowCancelConfirm(false);
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      setErrorMessage(getReturnErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  const handleAddPhoto = async (item, file) => {
    if (!file || !returnId) return;
    const itemId = item.id || item.orderItemId;

    const validation = validateReturnPhoto(file);
    if (!validation.valid) {
      setPhotoActionState(prev => ({
        ...prev,
        [itemId]: { uploading: false, error: validation.error }
      }));
      return;
    }

    setPhotoActionState(prev => ({
      ...prev,
      [itemId]: { uploading: true, error: '' }
    }));

    try {
      // 1. Stage photo
      const staged = await returnsService.stagePhoto(file);
      // 2. Attach to item
      await returnsService.addSupplementaryPhoto(returnId, itemId, staged.photoId);
      // 3. Reload details to reflect attached photo
      await loadDetails();
      if (onUpdated) onUpdated();
    } catch (err) {
      setPhotoActionState(prev => ({
        ...prev,
        [itemId]: { uploading: false, error: getReturnErrorMessage(err) }
      }));
    } finally {
      setPhotoActionState(prev => ({
        ...prev,
        [itemId]: { ...prev[itemId], uploading: false }
      }));
    }
  };

  const handleDeletePhoto = async (item, photo) => {
    if (!returnId) return;
    const itemId = item.id || item.orderItemId;
    const photoId = photo.id || photo.photoId;

    // Rule: Cannot delete the only photo for a defective item
    if (item.reason === 'DefectiveProduct' && (item.photos?.length || 0) <= 1) {
      setPhotoActionState(prev => ({
        ...prev,
        [itemId]: {
          uploading: false,
          error: 'Cannot delete the only photo for a defective item. Defective items require at least one photo.'
        }
      }));
      return;
    }

    setPhotoActionState(prev => ({
      ...prev,
      [itemId]: { uploading: true, error: '' }
    }));

    try {
      await returnsService.deleteSupplementaryPhoto(returnId, itemId, photoId);
      await loadDetails();
      if (onUpdated) onUpdated();
    } catch (err) {
      setPhotoActionState(prev => ({
        ...prev,
        [itemId]: { uploading: false, error: getReturnErrorMessage(err) }
      }));
    } finally {
      setPhotoActionState(prev => ({
        ...prev,
        [itemId]: { ...prev[itemId], uploading: false }
      }));
    }
  };

  const statusConfig = RETURN_STATUSES[returnDetails?.status] || {
    label: returnDetails?.status || 'Unknown',
    badgeClass: 'bg-neutral-800 text-neutral-300 border-neutral-600'
  };

  const canCancel = returnDetails?.status === 'PendingReview';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#120B06] border border-[#D4AF37]/40 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#F3E6D0]">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                Return #{returnDetails?.id || returnId}
              </span>
              <h2 className="font-cinzel text-lg font-bold uppercase tracking-wider text-[#F3E6D0]">
                Return Request Details
              </h2>
            </div>
            {returnDetails?.orderNumber && (
              <p className="text-xs text-[#D8BE99] mt-0.5">
                Associated Order: <span className="font-mono text-[#F3E6D0]">{returnDetails.orderNumber ? (String(returnDetails.orderNumber).startsWith('#') ? returnDetails.orderNumber : `#${returnDetails.orderNumber}`) : (String(returnDetails.orderId).startsWith('#') ? returnDetails.orderId : `#${returnDetails.orderId}`)}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
              <p className="text-xs text-neutral-400 font-cinzel">Retrieving return dossier...</p>
            </div>
          ) : errorMessage && !returnDetails ? (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-rose-200 mb-1">Failed to load return details</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          ) : returnDetails ? (
            <>
              {/* Status & Timing Banner */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-mono font-bold rounded-full uppercase ${statusConfig.badgeClass}`}>
                    {statusConfig.label}
                  </span>
                  <div className="text-xs text-[#D8BE99]">
                    <span>Requested: {new Date(returnDetails.createdAt).toLocaleDateString()}</span>
                    {returnDetails.reviewedAt && (
                      <span className="block text-[11px] text-neutral-400">
                        Reviewed: {new Date(returnDetails.reviewedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {returnDetails.totalRefundAmount > 0 && (
                  <div className="sm:text-right">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                      Approved Refund
                    </span>
                    <span className="font-cinzel text-lg font-bold text-emerald-400 font-mono">
                      €{returnDetails.totalRefundAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Error Message */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Items in Return */}
              <div className="space-y-4">
                <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  Returned Flacons & Status
                </h3>

                <div className="space-y-4">
                  {returnDetails.items?.map(item => {
                    const itemId = item.id || item.orderItemId;
                    const itemStatusConfig = ITEM_STATUSES[item.status] || {
                      label: item.status || 'Pending',
                      badgeClass: 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                    };
                    const itemState = photoActionState[itemId] || {};

                    return (
                      <div
                        key={itemId}
                        className="p-4 rounded-xl border border-white/10 bg-black/30 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.productImageUrl || item.image || '/products/luxury_designs/07_arabian_gold.webp'}
                              alt={item.productName}
                              className="w-12 h-14 object-cover rounded border border-white/10"
                            />
                            <div>
                              <h4 className="font-cinzel text-xs font-bold text-[#F3E6D0]">
                                {item.productName}
                              </h4>
                              <p className="text-[11px] text-[#D8BE99]">
                                Qty: {item.quantity} &times; €{item.unitPrice?.toFixed(2)}
                              </p>
                              <p className="text-[11px] text-neutral-400">
                                Reason: <strong className="text-[#F3E6D0]">{getReasonLabel(item.reason)}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                            <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded uppercase ${itemStatusConfig.badgeClass}`}>
                              {itemStatusConfig.label}
                            </span>
                            {item.status === 'Approved' && item.refundAmount > 0 && (
                              <span className="font-mono text-xs text-emerald-400 font-bold">
                                Refund: €{item.refundAmount.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Reason Note */}
                        {item.reasonNote && (
                          <div className="text-xs text-neutral-300 bg-white/5 p-2.5 rounded-lg">
                            <span className="text-neutral-500 uppercase text-[10px] block font-mono">Customer Note:</span>
                            {item.reasonNote}
                          </div>
                        )}

                        {/* Rejection Note */}
                        {item.status === 'Rejected' && item.rejectionReason && (
                          <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300">
                            <span className="text-rose-400 font-bold block uppercase text-[10px] font-mono mb-0.5">
                              Rejection Reason:
                            </span>
                            {item.rejectionReason}
                          </div>
                        )}

                        {/* Verification Photos */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-cinzel text-[#D8BE99] uppercase tracking-wider">
                              Verification Photos ({item.photos?.length || 0})
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5">
                            {item.photos?.map((photo, pIdx) => (
                              <div
                                key={photo.id || photo.photoId || pIdx}
                                className="relative group w-14 h-14 rounded-lg overflow-hidden border border-white/10 bg-black/50"
                              >
                                <img
                                  src={photo.url}
                                  alt="Return verification"
                                  className="w-full h-full object-cover"
                                />
                                {canCancel && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePhoto(item, photo)}
                                    disabled={itemState.uploading}
                                    className="absolute inset-0 bg-black/75 text-rose-400 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                                    title="Delete photo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}

                            {/* Supplementary Upload Button (if still pending review) */}
                            {canCancel && (
                              <label
                                className={`w-14 h-14 border border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                                  itemState.uploading
                                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 pointer-events-none'
                                    : 'border-white/20 hover:border-[#D4AF37] bg-white/5 hover:bg-white/10'
                                }`}
                              >
                                {itemState.uploading ? (
                                  <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin" />
                                ) : (
                                  <>
                                    <UploadCloud className="w-4 h-4 text-neutral-400" />
                                    <span className="text-[8px] text-neutral-400 mt-0.5">Add</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  className="hidden"
                                  disabled={itemState.uploading}
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleAddPhoto(item, e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>
                            )}
                          </div>

                          {itemState.error && (
                            <p className="text-[11px] text-rose-400 mt-1">{itemState.error}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bank Settlement Destination */}
              {returnDetails.bankName && (
                <div className="p-4 rounded-xl border border-white/10 bg-black/30 space-y-2 text-xs">
                  <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>Refund Settlement Destination</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-neutral-300">
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase">Bank</span>
                      <span className="font-medium text-[#F3E6D0]">{returnDetails.bankName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase">Holder</span>
                      <span className="font-medium text-[#F3E6D0]">{returnDetails.bankAccountHolderName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase">Account</span>
                      <span className="font-mono text-[#F3E6D0]">
                        •••• {returnDetails.bankAccountNumber?.slice(-4) || '••••'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancel Confirmation Prompt */}
              {showCancelConfirm && (
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-3 animate-fade-in">
                  <div className="flex items-start gap-2.5 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-rose-200 mb-0.5">Confirm Return Cancellation</strong>
                      Are you certain you wish to cancel this return request? Once cancelled, this return dossier cannot be reinstated.
                    </div>
                  </div>
                  <div className="flex justify-end gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCancelConfirm(false)}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 text-xs font-cinzel text-[#F3E6D0] hover:bg-white/10 rounded"
                    >
                      Keep Return
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelReturn}
                      disabled={cancelling}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-cinzel font-bold uppercase tracking-wider rounded flex items-center gap-1.5"
                    >
                      {cancelling ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Cancelling...</span>
                        </>
                      ) : (
                        <span>Confirm Cancel</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <div>
            {canCancel && !showCancelConfirm && (
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                className="px-3.5 py-1.5 border border-rose-500/40 hover:border-rose-500 text-rose-300 hover:text-rose-200 bg-rose-950/20 text-xs font-cinzel font-bold flex items-center gap-1.5 transition-colors cursor-pointer rounded"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Cancel Return</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="luxury-btn-gold px-5 py-2 text-xs font-cinzel font-bold uppercase tracking-wider cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
