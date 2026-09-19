import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building,
  User,
  CreditCard,
  ExternalLink,
  Edit3,
  Check,
  Loader2,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import returnsService, {
  RETURN_STATUSES,
  ITEM_STATUSES,
  getReasonLabel,
  getReturnErrorMessage
} from '../../services/returnsService';

const REJECTION_REASONS = [
  'Item opened or seal broken (fragrance was used)',
  'Return request submitted outside the eligible return window',
  'Evidence photo does not demonstrate manufacturer defect',
  'Damage appears caused by transit mishandling (claim with courier)',
  'Item does not match order records',
  'Customer cancelled request'
];

export default function AdminReturnReviewModal({
  isOpen,
  onClose,
  returnId,
  onUpdated
}) {
  const [returnDetails, setReturnDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Per-item review state for PendingReview:
  // { [itemId]: { decision: 'Approved'|'Rejected', refundAmount: number, rejectionReason: string } }
  const [itemDecisions, setItemDecisions] = useState({});

  // Correction state for already approved items:
  // { [itemId]: { isOpen: boolean, newAmount: number|string, reason: string, saving: boolean, error: string } }
  const [correctionState, setCorrectionState] = useState({});

  // Fullscreen photo preview state
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null);

  const loadDetails = async () => {
    if (!returnId) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await returnsService.getAdminReturnDetails(returnId);
      setReturnDetails(data);

      // Initialize decisions for items if return is PendingReview
      const initialDecisions = {};
      (data.items || []).forEach(item => {
        const itemId = item.id || item.orderItemId;
        const maxPrice = Number(item.unitPrice || 0) * Number(item.quantity || 1);
        initialDecisions[itemId] = {
          decision: item.status === 'Approved' ? 'Approved' : (item.status === 'Rejected' ? 'Rejected' : 'Approved'),
          refundAmount: item.refundAmount > 0 ? item.refundAmount : maxPrice,
          rejectionReason: item.rejectionReason || ''
        };
      });
      setItemDecisions(initialDecisions);
    } catch (err) {
      setErrorMessage(getReturnErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && returnId) {
      loadDetails();
      setSuccessMessage('');
      setCorrectionState({});
    } else {
      setReturnDetails(null);
      setErrorMessage('');
      setSuccessMessage('');
      setPreviewPhotoUrl(null);
    }
  }, [isOpen, returnId]);

  if (!isOpen) return null;

  const isPendingReview = returnDetails?.status === 'PendingReview';

  // -------------------------------------------------------------
  // Decision Handlers
  // -------------------------------------------------------------
  const updateDecision = (itemId, decision) => {
    setItemDecisions(prev => {
      const current = prev[itemId] || {};
      const item = returnDetails.items?.find(i => (i.id || i.orderItemId) === itemId);
      const defaultMax = Number(item?.unitPrice || 0) * Number(item?.quantity || 1);

      return {
        ...prev,
        [itemId]: {
          ...current,
          decision,
          refundAmount: decision === 'Approved' ? (current.refundAmount || defaultMax) : 0,
          rejectionReason: decision === 'Rejected' ? (current.rejectionReason || REJECTION_REASONS[0]) : ''
        }
      };
    });
    setErrorMessage('');
  };

  const updateRefundAmount = (itemId, amount) => {
    setItemDecisions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        refundAmount: amount
      }
    }));
  };

  const updateRejectionReason = (itemId, reason) => {
    setItemDecisions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        rejectionReason: reason
      }
    }));
  };

  // -------------------------------------------------------------
  // Submit Review Handler (Atomic)
  // -------------------------------------------------------------
  const handleSubmitReview = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const items = returnDetails.items || [];
    const decisionsPayload = [];

    // Validation
    for (const item of items) {
      const itemId = item.id || item.orderItemId;
      const dec = itemDecisions[itemId];
      if (!dec || !dec.decision) {
        setErrorMessage(`Please select a decision (Approve or Reject) for item: ${item.productName}`);
        return;
      }

      const maxPrice = Number(item.unitPrice || 0) * Number(item.quantity || 1);

      if (dec.decision === 'Approved') {
        const amount = Number(dec.refundAmount);
        if (isNaN(amount) || amount <= 0) {
          setErrorMessage(`Approved item "${item.productName}" must have a refund amount greater than 0.`);
          return;
        }
        if (amount > maxPrice) {
          setErrorMessage(`Refund amount for "${item.productName}" cannot exceed original total of €${maxPrice.toFixed(2)}.`);
          return;
        }
        decisionsPayload.push({
          itemId,
          decision: 'Approved',
          refundAmount: amount,
          rejectionReason: null
        });
      } else if (dec.decision === 'Rejected') {
        if (!dec.rejectionReason || !dec.rejectionReason.trim()) {
          setErrorMessage(`Rejection reason is required for rejected item: ${item.productName}`);
          return;
        }
        decisionsPayload.push({
          itemId,
          decision: 'Rejected',
          refundAmount: null,
          rejectionReason: dec.rejectionReason.trim()
        });
      }
    }

    setSubmitting(true);
    try {
      const updated = await returnsService.reviewReturn(returnId, decisionsPayload);
      setReturnDetails(updated);
      setSuccessMessage('Return review submitted successfully.');
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      setErrorMessage(getReturnErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Correction Handlers (For Approved items)
  // -------------------------------------------------------------
  const toggleCorrection = (itemId, item) => {
    setCorrectionState(prev => {
      const existing = prev[itemId];
      if (existing?.isOpen) {
        return { ...prev, [itemId]: { ...existing, isOpen: false } };
      }
      return {
        ...prev,
        [itemId]: {
          isOpen: true,
          newAmount: item.refundAmount || (Number(item.unitPrice || 0) * Number(item.quantity || 1)),
          reason: '',
          saving: false,
          error: ''
        }
      };
    });
  };

  const handleSaveCorrection = async (itemId, item) => {
    const state = correctionState[itemId];
    const newAmount = Number(state?.newAmount);
    const reason = state?.reason?.trim();
    const maxPrice = Number(item.unitPrice || 0) * Number(item.quantity || 1);

    if (isNaN(newAmount) || newAmount <= 0) {
      setCorrectionState(prev => ({
        ...prev,
        [itemId]: { ...prev[itemId], error: 'Refund amount must be greater than 0.' }
      }));
      return;
    }
    if (newAmount > maxPrice) {
      setCorrectionState(prev => ({
        ...prev,
        [itemId]: { ...prev[itemId], error: `Refund amount cannot exceed max price of €${maxPrice.toFixed(2)}.` }
      }));
      return;
    }
    if (!reason) {
      setCorrectionState(prev => ({
        ...prev,
        [itemId]: { ...prev[itemId], error: 'A correction reason is required.' }
      }));
      return;
    }

    setCorrectionState(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], saving: true, error: '' }
    }));

    try {
      await returnsService.correctRefundAmount(returnId, itemId, {
        newRefundAmount: newAmount,
        correctionReason: reason
      });
      await loadDetails();
      setCorrectionState(prev => ({
        ...prev,
        [itemId]: { ...prev[itemId], isOpen: false, saving: false }
      }));
      if (onUpdated) onUpdated();
    } catch (err) {
      setCorrectionState(prev => ({
        ...prev,
        [itemId]: { ...prev[itemId], saving: false, error: getReturnErrorMessage(err) }
      }));
    }
  };

  const statusConfig = RETURN_STATUSES[returnDetails?.status] || {
    label: returnDetails?.status || 'Unknown',
    badgeClass: 'bg-neutral-800 text-neutral-300 border-neutral-600'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#120B06] border border-[#D4AF37]/40 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#F3E6D0]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/50">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                Return Request #{returnDetails?.id || returnId}
              </span>
              <h2 className="font-cinzel text-lg font-bold uppercase tracking-wider text-[#F3E6D0]">
                Admin Return Review
              </h2>
            </div>
            {returnDetails?.orderNumber && (
              <p className="text-xs text-[#D8BE99] mt-0.5 font-mono">
                Order #{returnDetails.orderNumber}
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

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
              <p className="text-xs text-neutral-400 font-cinzel">Loading return adjudication dossier...</p>
            </div>
          ) : errorMessage && !returnDetails ? (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-rose-200 mb-1">Failed to load return</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          ) : returnDetails ? (
            <>
              {/* Top Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Patron Dossier */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
                  <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Customer Information</span>
                  </h4>
                  <div className="space-y-1 text-neutral-300">
                    <p><strong className="text-[#F3E6D0]">{returnDetails.customerName}</strong></p>
                    <p className="text-neutral-400">{returnDetails.customerEmail || 'No email registered'}</p>
                    <p className="text-neutral-400">{returnDetails.customerPhone || 'No phone registered'}</p>
                    <p className="text-[11px] text-neutral-500 pt-1">
                      Submitted on {new Date(returnDetails.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Bank Settlement Dossier */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
                  <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Refund Bank Settlement Coordinates</span>
                  </h4>
                  <div className="space-y-1 text-neutral-300">
                    <p><span className="text-neutral-500">Bank:</span> <strong className="text-[#F3E6D0]">{returnDetails.bankName || 'N/A'}</strong></p>
                    <p><span className="text-neutral-500">Account Holder:</span> <strong className="text-[#F3E6D0]">{returnDetails.bankAccountHolderName || 'N/A'}</strong></p>
                    <p><span className="text-neutral-500">Account Number:</span> <strong className="font-mono text-[#D4AF37]">{returnDetails.bankAccountNumber || 'N/A'}</strong></p>
                    <p className="text-[10px] text-neutral-400 pt-0.5 italic">
                      Verify account details carefully before initiating wire disbursement.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-mono font-bold rounded-full uppercase ${statusConfig.badgeClass}`}>
                    {statusConfig.label}
                  </span>
                  {returnDetails.reviewedBy && (
                    <span className="text-neutral-400">
                      Reviewed by: <strong className="text-[#F3E6D0]">{returnDetails.reviewedBy}</strong>
                    </span>
                  )}
                </div>

                {returnDetails.totalRefundAmount > 0 && (
                  <div>
                    <span className="text-[10px] uppercase text-neutral-400 block">Total Approved Refund</span>
                    <span className="font-cinzel text-lg font-bold text-emerald-400 font-mono">
                      €{returnDetails.totalRefundAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Alerts */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Per-Item Review Cards */}
              <div className="space-y-4">
                <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  Return Items ({returnDetails.items?.length || 0})
                </h3>

                <div className="space-y-4">
                  {returnDetails.items?.map(item => {
                    const itemId = item.id || item.orderItemId;
                    const maxPrice = Number(item.unitPrice || 0) * Number(item.quantity || 1);
                    const decisionState = itemDecisions[itemId] || { decision: 'Approved', refundAmount: maxPrice, rejectionReason: '' };
                    const correction = correctionState[itemId] || {};
                    const isItemApproved = item.status === 'Approved';
                    const isItemPaid = Boolean(item.paidAt);

                    return (
                      <div
                        key={itemId}
                        className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-4"
                      >
                        {/* Item Details */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.productImageUrl || item.image || '/products/luxury_designs/07_arabian_gold.webp'}
                              alt={item.productName}
                              className="w-14 h-16 object-cover rounded border border-white/10"
                            />
                            <div>
                              <h4 className="font-cinzel text-xs font-bold text-[#F3E6D0]">
                                {item.productName}
                              </h4>
                              <p className="text-[11px] text-[#D8BE99]">
                                Qty: {item.quantity} &times; €{item.unitPrice?.toFixed(2)} = <strong className="text-[#D4AF37] font-mono">€{maxPrice.toFixed(2)}</strong>
                              </p>
                              <p className="text-[11px] text-neutral-400">
                                Reason: <strong className="text-[#F3E6D0]">{getReasonLabel(item.reason)}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded uppercase ${ITEM_STATUSES[item.status]?.badgeClass || 'bg-neutral-800'}`}>
                              {ITEM_STATUSES[item.status]?.label || item.status}
                            </span>
                            {item.paidAt && (
                              <span className="block text-[10px] text-emerald-400 mt-1 font-mono">
                                Paid on {new Date(item.paidAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Customer Note */}
                        {item.reasonNote && (
                          <div className="text-xs bg-white/5 p-2.5 rounded-lg text-neutral-300">
                            <span className="text-[10px] font-mono text-neutral-500 uppercase block">Patron Note:</span>
                            {item.reasonNote}
                          </div>
                        )}

                        {/* Verification Photos */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-cinzel text-[#D8BE99] uppercase tracking-wider block">
                            Evidence Photos ({item.photos?.length || 0})
                          </span>
                          {item.photos?.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-2">
                              {item.photos.map((photo, pIdx) => (
                                <button
                                  type="button"
                                  key={photo.id || photo.photoId || pIdx}
                                  onClick={() => setPreviewPhotoUrl(photo.url)}
                                  className="w-16 h-16 rounded-lg overflow-hidden border border-white/20 hover:border-[#D4AF37] transition-colors cursor-pointer group relative"
                                >
                                  <img
                                    src={photo.url}
                                    alt="Verification"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-neutral-500 italic">No verification photos attached.</p>
                          )}
                        </div>

                        {/* ATOMIC REVIEW SECTION (If PendingReview) */}
                        {isPendingReview && (
                          <div className="pt-3 border-t border-white/5 space-y-3">
                            <div className="flex items-center gap-3">
                              <label className="text-[11px] font-cinzel text-[#D8BE99] uppercase tracking-wider">
                                Decision:
                              </label>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateDecision(itemId, 'Approved')}
                                  className={`px-3 py-1 rounded text-xs font-cinzel font-bold uppercase transition-colors cursor-pointer ${
                                    decisionState.decision === 'Approved'
                                      ? 'bg-emerald-600 text-white shadow-md'
                                      : 'bg-white/5 text-neutral-400 hover:text-white border border-white/10'
                                  }`}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateDecision(itemId, 'Rejected')}
                                  className={`px-3 py-1 rounded text-xs font-cinzel font-bold uppercase transition-colors cursor-pointer ${
                                    decisionState.decision === 'Rejected'
                                      ? 'bg-rose-600 text-white shadow-md'
                                      : 'bg-white/5 text-neutral-400 hover:text-white border border-white/10'
                                  }`}
                                >
                                  Reject
                                </button>
                              </div>
                            </div>

                            {/* Decision inputs */}
                            {decisionState.decision === 'Approved' ? (
                              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <label className="text-[11px] font-cinzel text-emerald-300 uppercase tracking-wider">
                                    Refund Amount (€) *
                                  </label>
                                  <span className="text-[10px] text-neutral-400">
                                    Max: €{maxPrice.toFixed(2)}
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  max={maxPrice}
                                  value={decisionState.refundAmount}
                                  onChange={(e) => updateRefundAmount(itemId, e.target.value)}
                                  className="w-full bg-black/60 border border-emerald-500/40 rounded-lg p-2 text-xs text-[#F3E6D0] font-mono focus:border-emerald-400 focus:outline-none"
                                />
                              </div>
                            ) : (
                              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 space-y-2">
                                <label className="text-[11px] font-cinzel text-rose-300 uppercase tracking-wider block">
                                  Rejection Reason *
                                </label>
                                <select
                                  value={decisionState.rejectionReason}
                                  onChange={(e) => updateRejectionReason(itemId, e.target.value)}
                                  className="w-full bg-black/60 border border-rose-500/40 rounded-lg p-2 text-xs text-[#F3E6D0] focus:border-rose-400 focus:outline-none"
                                >
                                  {REJECTION_REASONS.map((r, rIdx) => (
                                    <option key={rIdx} value={r} className="bg-[#120B06] text-white">
                                      {r}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  placeholder="Or type custom rejection reason..."
                                  value={decisionState.rejectionReason}
                                  onChange={(e) => updateRejectionReason(itemId, e.target.value)}
                                  className="w-full bg-black/60 border border-rose-500/30 rounded-lg p-2 text-xs text-[#F3E6D0] placeholder:text-neutral-500"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* POST-REVIEW: REFUND CORRECTION (If Approved and Not Paid) */}
                        {!isPendingReview && isItemApproved && !isItemPaid && (
                          <div className="pt-2 border-t border-white/5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-neutral-400 font-mono">
                                Approved Refund: <strong className="text-emerald-400">€{item.refundAmount?.toFixed(2)}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleCorrection(itemId, item)}
                                className="px-2.5 py-1 text-[11px] font-cinzel text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>{correction.isOpen ? 'Close Correction' : 'Correct Refund Amount'}</span>
                              </button>
                            </div>

                            {correction.isOpen && (
                              <div className="p-3 rounded-lg bg-black/60 border border-[#D4AF37]/30 space-y-2.5 animate-fade-in">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] font-cinzel text-[#D8BE99] uppercase block mb-1">
                                      New Refund Amount (€)
                                    </label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0.01"
                                      max={maxPrice}
                                      value={correction.newAmount}
                                      onChange={(e) => setCorrectionState(prev => ({
                                        ...prev,
                                        [itemId]: { ...prev[itemId], newAmount: e.target.value }
                                      }))}
                                      className="w-full bg-black/80 border border-white/20 rounded p-1.5 text-xs text-[#F3E6D0] font-mono"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-cinzel text-[#D8BE99] uppercase block mb-1">
                                      Correction Reason *
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Adjusted after physical inspection..."
                                      value={correction.reason}
                                      onChange={(e) => setCorrectionState(prev => ({
                                        ...prev,
                                        [itemId]: { ...prev[itemId], reason: e.target.value }
                                      }))}
                                      className="w-full bg-black/80 border border-white/20 rounded p-1.5 text-xs text-[#F3E6D0]"
                                    />
                                  </div>
                                </div>

                                {correction.error && (
                                  <p className="text-[11px] text-rose-400">{correction.error}</p>
                                )}

                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => toggleCorrection(itemId, item)}
                                    className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveCorrection(itemId, item)}
                                    disabled={correction.saving}
                                    className="luxury-btn-gold px-3.5 py-1 text-xs font-cinzel font-bold uppercase cursor-pointer"
                                  >
                                    {correction.saving ? 'Saving...' : 'Save Correction'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 bg-black/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-cinzel text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>

          {isPendingReview && (
            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={submitting}
              className="luxury-btn-gold px-6 py-2.5 text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Adjudication...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Submit Return Review</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Fullscreen Photo Preview Modal */}
      {previewPhotoUrl && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-xl border border-[#D4AF37]/50">
            <img
              src={previewPhotoUrl}
              alt="Full Preview"
              className="max-w-full max-h-[85vh] object-contain"
            />
            <button
              type="button"
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/80 text-white hover:bg-[#D4AF37] hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
