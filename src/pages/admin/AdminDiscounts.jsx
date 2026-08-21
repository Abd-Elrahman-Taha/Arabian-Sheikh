import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { discountService } from '../../services/discountService';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2, X } from 'lucide-react';

export default function AdminDiscounts() {
  const { t } = useTranslation();
  const { success, error } = useToast();

  // Instant 0ms synchronous initialization
  const initialDiscounts = discountService.getAllDiscountsSync();
  const [discounts, setDiscounts] = useState(initialDiscounts);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: 10,
    minSpend: 0,
    description: '',
    validUntil: '2027-12-31'
  });

  const fetchDiscounts = () => {
    const list = discountService.getAllDiscountsSync();
    setDiscounts(list);
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await discountService.createDiscount({
        ...formData,
        value: Number(formData.value),
        minSpend: Number(formData.minSpend)
      });
      success(`Privilege Code '${formData.code.toUpperCase()}' activated.`);
      setIsModalOpen(false);
      setFormData({
        code: '',
        type: 'percentage',
        value: 10,
        minSpend: 0,
        description: '',
        validUntil: '2027-12-31'
      });
      fetchDiscounts();
    } catch (err) {
      error(err.message || 'Could not create discount.');
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm(`Delete discount code ${code}?`)) return;
    try {
      await discountService.deleteDiscount(code);
      success(`Code ${code} deleted.`);
      fetchDiscounts();
    } catch (err) {
      error(err.message || 'Could not delete.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#F3E6D0]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 pb-4 gap-4">
        <div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
            {t('admin.discounts')}
          </h1>
          <p className="text-xs text-[#D8BE99] font-medium mt-0.5">
            Manage privilege promo codes, percentage discounts, minimum spends, and expiration dates.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="group/btn relative px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/50 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin.createDiscount')}</span>
        </button>
      </div>

      {/* Discounts Table in Obsidian Glass */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#D4AF37]/25 text-[#F2D675] uppercase font-cinzel font-bold">
                <th className="py-3.5 px-4">Privilege Code</th>
                <th className="py-3.5 px-4">Discount Value</th>
                <th className="py-3.5 px-4">Min. Spend</th>
                <th className="py-3.5 px-4">Redemptions</th>
                <th className="py-3.5 px-4">Valid Until</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/15 text-[#F3E6D0]">
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#D8BE99] font-medium">
                    No privilege codes active.
                  </td>
                </tr>
              ) : (
                discounts.map((disc) => (
                  <tr key={disc.code} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-cinzel font-bold text-sm text-[#F2D675] tracking-wider block">
                        {disc.code}
                      </span>
                      <span className="text-[11px] text-[#D8BE99] font-medium">{disc.description}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-[#F3E6D0]">
                      {disc.type === 'percentage' ? `${disc.value}% OFF` : `€${disc.value} OFF`}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[#D8BE99] font-medium">
                      {disc.minSpend ? `€${disc.minSpend}` : 'No minimum'}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[#F2D675] font-bold">
                      {disc.usedCount} times
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[#D8BE99] font-medium">
                      {disc.validUntil}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(disc.code)}
                        className="p-1.5 text-[#D8BE99] hover:text-rose-400 cursor-pointer transition-colors"
                        title="Delete code"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create Discount in Obsidian Glass */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-[#0B0A08] border border-[#D4AF37]/40 p-6 sm:p-8 space-y-5 shadow-2xl animate-fade-in text-[#F3E6D0]">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
              <h3 className="font-cinzel text-base font-bold text-[#F2D675] uppercase tracking-wider">
                {t('admin.createDiscount')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#D8BE99] hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[#D8BE99] font-semibold mb-1 uppercase tracking-wider">Privilege Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. EMIRATES20"
                  className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl p-2.5 font-mono uppercase text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#D8BE99] font-semibold mb-1 uppercase tracking-wider">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl p-2.5 text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer font-medium"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#D8BE99] font-semibold mb-1 uppercase tracking-wider">Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl p-2.5 font-mono text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#D8BE99] font-semibold mb-1 uppercase tracking-wider">Min. Spend (€)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minSpend}
                    onChange={(e) => setFormData({ ...formData, minSpend: e.target.value })}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl p-2.5 font-mono text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#D8BE99] font-semibold mb-1 uppercase tracking-wider">Valid Until</label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl p-2.5 font-mono text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#D8BE99] font-semibold mb-1 uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. 20% privilege perk for VIP patrons"
                  className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl p-2.5 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full border border-[#D4AF37]/30 text-xs text-[#D8BE99] hover:text-white font-cinzel font-bold cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="group/btn relative flex-1 py-2.5 rounded-full bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/50 font-cinzel font-bold text-xs uppercase tracking-wider shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  Activate Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
