import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { CreditCard, Plus, Trash2, ShieldCheck, X, Sparkles } from 'lucide-react';

export default function AccountPaymentMethods() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    isDefault: false
  });

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const list = await userService.getPaymentMethods(user.id);
        setCards(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await userService.addPaymentMethod(user.id, formData);
      const updated = await userService.getPaymentMethods(user.id);
      setCards(updated);
      setIsModalOpen(false);
      setFormData({ cardholderName: '', cardNumber: '', expiry: '', cvv: '', isDefault: false });
      success('Privilege card secured in Royal Vault.');
    } catch (err) {
      error(err.message || 'Could not add card.');
    }
  };

  const handleRemoveCard = async (id) => {
    if (!user) return;
    try {
      await userService.removePaymentMethod(user.id, id);
      setCards(cards.filter(c => c.id !== id));
      success('Payment method removed.');
    } catch (err) {
      error(err.message || 'Could not remove card.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#F3EEE5]">
      <div className="flex justify-between items-center border-b border-[#C6A15B]/20 pb-3">
        <h2 className="font-cinzel text-xl font-bold uppercase">
          {t('account.paymentMethods')}
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="luxury-btn-gold px-4 py-1.5 text-xs flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('account.addCard')}</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-[#C5B8A8]">Retrieving cards from vault...</div>
      ) : cards.length === 0 ? (
        <div className="text-center py-12 bg-[#241712] border border-[#C6A15B]/15 space-y-3">
          <CreditCard className="w-8 h-8 text-[#C6A15B] mx-auto opacity-50" />
          <p className="text-xs text-[#C5B8A8]">No privilege payment methods saved yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="p-6 bg-gradient-to-br from-[#2B1A12] to-[#140D0A] border border-[#C6A15B]/40 flex flex-col justify-between h-48 shadow-2xl relative"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-cinzel text-sm font-bold text-[#C6A15B] tracking-widest uppercase">
                    ARABIAN SHEIKH PRIVILEGE
                  </span>
                  <p className="text-[10px] text-[#C5B8A8] uppercase font-mono mt-0.5">
                    {card.brand || 'Visa'} Card
                  </p>
                </div>
                {card.isDefault && (
                  <span className="px-2 py-0.5 text-[10px] bg-[#C6A15B] text-[#0F0D0C] font-mono font-bold">
                    Default
                  </span>
                )}
              </div>

              <div className="font-mono text-lg text-[#F3EEE5] tracking-widest">
                •••• •••• •••• {card.last4}
              </div>

              <div className="flex justify-between items-end border-t border-[#C6A15B]/20 pt-2 text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#C5B8A8] block">Cardholder</span>
                  <span className="font-cinzel font-semibold text-[#F3EEE5]">{card.cardholderName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-[#C5B8A8] block">Expires</span>
                  <span className="font-mono text-[#F3EEE5]">{card.expiry}</span>
                </div>
                <button
                  onClick={() => handleRemoveCard(card.id)}
                  className="text-red-400 hover:text-red-300 p-1"
                  title="Remove card"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Card */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F0D0C]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1C120E] border border-[#C6A15B]/40 p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#C6A15B]/20 pb-3">
              <h3 className="font-cinzel text-base font-bold text-[#F3EEE5] uppercase">
                {t('account.addCard')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#C5B8A8] hover:text-[#F3EEE5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCard} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-[#C5B8A8] mb-1 uppercase tracking-wider">Cardholder Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.cardholderName}
                  onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                  placeholder="e.g. Sultan Mansoor"
                  className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 p-2 text-[#F3EEE5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#C5B8A8] mb-1 uppercase tracking-wider">Card Number</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  placeholder="4000 1234 5678 9010"
                  className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 p-2 text-[#F3EEE5] font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#C5B8A8] mb-1 uppercase tracking-wider">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={formData.expiry}
                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                    placeholder="12/28"
                    className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 p-2 text-[#F3EEE5] font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#C5B8A8] mb-1 uppercase tracking-wider">CVV</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    placeholder="•••"
                    className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 p-2 text-[#F3EEE5] font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="defaultCard"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="accent-[#C6A15B]"
                />
                <label htmlFor="defaultCard" className="text-xs text-[#C5B8A8] cursor-pointer">
                  Set as default payment method
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#C6A15B]/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 luxury-btn-outline text-xs text-center"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 luxury-btn-gold text-xs text-center"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
