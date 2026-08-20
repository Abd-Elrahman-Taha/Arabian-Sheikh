import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { CreditCard, Plus, Trash2, X } from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../../components/common/ScrollReveal';

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
    <div className="space-y-6 animate-fade-in text-[var(--color-earth-dark)]">
      <ScrollReveal direction="up">
        <div className="flex justify-between items-center border-b border-[var(--color-terracotta-deep)]/20 pb-3">
          <h2 className="font-cinzel text-xl font-bold uppercase text-[var(--color-earth-dark)]">
            {t('account.paymentMethods')}
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="luxury-btn-gold px-4 py-1.5 text-xs flex items-center gap-1 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('account.addCard')}</span>
          </button>
        </div>
      </ScrollReveal>

      {loading ? (
        <div className="text-center py-12 text-xs text-[var(--color-terracotta-deep)] font-medium">Retrieving cards from vault...</div>
      ) : cards.length === 0 ? (
        <div className="text-center py-12 bg-[var(--color-desert-primary)]/20 border border-[var(--color-terracotta-deep)]/20 space-y-3">
          <CreditCard className="w-8 h-8 text-[var(--color-terracotta)] mx-auto opacity-70" />
          <p className="text-xs text-[var(--color-terracotta-deep)] font-medium">No privilege payment methods saved yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, index) => (
            <ScrollRevealItem key={card.id} index={index}>
            <div
              className="p-6 bg-gradient-to-br from-[var(--color-desert-primary)]/40 to-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 flex flex-col justify-between h-48 shadow-lg relative"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-cinzel text-sm font-bold text-[var(--color-terracotta)] tracking-widest uppercase">
                    ARABIAN SHEIKH PRIVILEGE
                  </span>
                  <p className="text-[10px] text-[var(--color-terracotta-deep)] uppercase font-mono mt-0.5 font-semibold">
                    {card.brand || 'Visa'} Card
                  </p>
                </div>
                {card.isDefault && (
                  <span className="px-2 py-0.5 text-[10px] bg-[var(--color-terracotta)] text-[#F2D675] font-mono font-bold">
                    Default
                  </span>
                )}
              </div>

              <div className="font-mono text-lg text-[var(--color-earth-dark)] font-bold tracking-widest">
                •••• •••• •••• {card.last4}
              </div>

              <div className="flex justify-between items-end border-t border-[var(--color-terracotta-deep)]/20 pt-2 text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[var(--color-terracotta-deep)] block font-semibold">Cardholder</span>
                  <span className="font-cinzel font-bold text-[var(--color-earth-dark)]">{card.cardholderName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-[var(--color-terracotta-deep)] block font-semibold">Expires</span>
                  <span className="font-mono text-[var(--color-earth-dark)] font-semibold">{card.expiry}</span>
                </div>
                <button
                  onClick={() => handleRemoveCard(card.id)}
                  className="text-rose-600 hover:text-rose-700 p-1 cursor-pointer"
                  title="Remove card"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            </ScrollRevealItem>
          ))}
        </div>
      )}

      {/* Modal Add Card */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <ScrollReveal direction="up" className="max-w-md w-full">
            <div className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta)]/40 p-6 space-y-4 shadow-2xl animate-fade-in text-[var(--color-earth-dark)]">
              <div className="flex items-center justify-between border-b border-[var(--color-terracotta-deep)]/20 pb-3">
              <h3 className="font-cinzel text-base font-bold text-[var(--color-earth-dark)] uppercase">
                {t('account.addCard')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--color-terracotta-deep)] hover:text-[var(--color-earth-dark)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCard} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-[var(--color-terracotta-deep)] mb-1 uppercase tracking-wider font-semibold">Cardholder Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.cardholderName}
                  onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                  placeholder="e.g. Sultan Mansoor"
                  className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 p-2 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--color-terracotta-deep)] mb-1 uppercase tracking-wider font-semibold">Card Number</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  placeholder="4000 1234 5678 9010"
                  className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 p-2 text-[var(--color-earth-dark)] font-mono focus:border-[var(--color-terracotta)] focus:outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--color-terracotta-deep)] mb-1 uppercase tracking-wider font-semibold">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={formData.expiry}
                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                    placeholder="12/28"
                    className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 p-2 text-[var(--color-earth-dark)] font-mono focus:border-[var(--color-terracotta)] focus:outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-terracotta-deep)] mb-1 uppercase tracking-wider font-semibold">CVV</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    placeholder="•••"
                    className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 p-2 text-[var(--color-earth-dark)] font-mono focus:border-[var(--color-terracotta)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="defaultCard"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="accent-[#3A2116] cursor-pointer"
                />
                <label htmlFor="defaultCard" className="text-xs text-[var(--color-terracotta-deep)] font-medium cursor-pointer">
                  Set as default payment method
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--color-terracotta-deep)]/20">
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
