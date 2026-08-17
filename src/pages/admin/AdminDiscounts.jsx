import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { discountService } from '../../services/discountService';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2, X } from 'lucide-react';

export default function AdminDiscounts() {
  const { t } = useTranslation();
  const { success, error } = useToast();

  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: 10,
    minSpend: 0,
    description: '',
    validUntil: '2027-12-31'
  });

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const list = await discountService.getAllDiscounts();
      setDiscounts(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
    <div className="space-y-6 animate-fade-in text-[var(--text-primary)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-subtle)] pb-4 gap-4">
        <div>
          <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {t('admin.discounts')}
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Manage privilege promo codes, percentage discounts, minimum spends, and expiration dates.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="luxury-btn-gold px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin.createDiscount')}</span>
        </button>
      </div>

      {/* Discounts Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] text-[var(--gold-primary)] uppercase font-cinzel">
              <th className="py-3 px-4">Privilege Code</th>
              <th className="py-3 px-4">Discount Value</th>
              <th className="py-3 px-4">Min. Spend</th>
              <th className="py-3 px-4">Redemptions</th>
              <th className="py-3 px-4">Valid Until</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">
                  Loading privilege codes...
                </td>
              </tr>
            ) : (
              discounts.map((disc) => (
                <tr key={disc.code} className="hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-cinzel font-bold text-sm text-[var(--gold-primary)] tracking-wider block">
                      {disc.code}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">{disc.description}</span>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-[var(--text-primary)]">
                    {disc.type === 'percentage' ? `${disc.value}% OFF` : `$${disc.value} OFF`}
                  </td>

                  <td className="py-3 px-4 font-mono text-[var(--text-muted)]">
                    {disc.minSpend ? `$${disc.minSpend}` : 'No minimum'}
                  </td>

                  <td className="py-3 px-4 font-mono text-[var(--gold-light)] font-semibold">
                    {disc.usedCount} times
                  </td>

                  <td className="py-3 px-4 font-mono text-[var(--text-muted)]">
                    {disc.validUntil}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(disc.code)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-rose-400 cursor-pointer"
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

      {/* Modal Create Discount */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border-gold)] p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-cinzel text-base font-bold text-[var(--text-primary)] uppercase">
                {t('admin.createDiscount')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-[var(--text-muted)] mb-1 uppercase tracking-wider">Privilege Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. EMIRATES20"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-card)] p-2 font-mono uppercase text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] mb-1 uppercase tracking-wider">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-card)] p-2 text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] mb-1 uppercase tracking-wider">Value</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-card)] p-2 text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 uppercase tracking-wider">Minimum Spend ($)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.minSpend}
                  onChange={(e) => setFormData({ ...formData, minSpend: e.target.value })}
                  placeholder="0 for no minimum"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-card)] p-2 text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. VIP Inaugural Privilege 20% Off"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-card)] p-2 text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 uppercase tracking-wider">Expiration Date</label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-card)] p-2 text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--border-subtle)]">
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
