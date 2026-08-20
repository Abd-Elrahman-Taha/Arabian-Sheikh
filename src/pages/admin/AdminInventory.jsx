import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import { Plus, Minus, AlertTriangle, Save, RefreshCw } from 'lucide-react';

export default function AdminInventory() {
  const { t } = useTranslation();
  const { success, error } = useToast();

  const [products, setProducts] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const list = await productService.getAllProducts({ includeDrafts: true });
      setProducts(list);
      const initialStock = {};
      list.forEach((p) => {
        initialStock[p.id] = p.stock;
      });
      setStockMap(initialStock);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = (productId, delta) => {
    setStockMap(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + delta)
    }));
  };

  const handleSaveStock = async (productId) => {
    const newStock = stockMap[productId];
    try {
      await productService.updateStock(productId, newStock);
      success('Inventory level updated in the warehouse.');
      fetchInventory();
    } catch (err) {
      error(err.message || 'Could not update stock.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[var(--color-earth-dark)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--color-terracotta-deep)]/20 pb-4 gap-4">
        <div>
          <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[var(--color-earth-dark)]">
            {t('admin.inventory')}
          </h1>
          <p className="text-xs text-[var(--color-terracotta-deep)] font-medium">
            Warehouse stock monitoring, vintage batch limits, and real-time inventory adjustments.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="luxury-btn-outline px-4 py-2 text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Stock Levels</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[var(--color-terracotta-deep)]/20 text-[var(--color-terracotta)] uppercase font-cinzel font-bold">
              <th className="py-3 px-4">Flacon Formulation</th>
              <th className="py-3 px-4">SKU / Code</th>
              <th className="py-3 px-4">Family</th>
              <th className="py-3 px-4">Stock Status</th>
              <th className="py-3 px-4">Inventory Quantity</th>
              <th className="py-3 px-4 text-right">Commit Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-terracotta-deep)]/15 text-[var(--color-earth-dark)]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--color-terracotta-deep)] font-medium">
                  Inspecting warehouse reserves...
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const currentVal = stockMap[p.id] ?? p.stock;
                const isLow = currentVal <= 10;
                const isOut = currentVal === 0;

                return (
                  <tr key={p.id} className="hover:bg-[var(--color-desert-primary)]/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0]}
                          alt={p.name}
                          className="w-10 h-12 object-cover bg-[var(--color-desert-primary)] shrink-0 border border-[var(--color-terracotta-deep)]/30"
                        />
                        <div>
                          <span className="font-cinzel font-bold text-sm text-[var(--color-earth-dark)] block">
                            {p.name}
                          </span>
                          <span className="font-arabic text-xs text-[var(--color-terracotta-deep)] font-semibold">
                            {p.arabicName}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[var(--color-terracotta-deep)] font-medium">
                      ARB-{p.id.slice(-6).toUpperCase()}
                    </td>

                    <td className="py-3 px-4 text-[var(--color-terracotta)] font-bold">
                      {p.fragranceFamily}
                    </td>

                    <td className="py-3 px-4">
                      {isOut ? (
                        <span className="px-2 py-0.5 text-[10px] uppercase font-mono bg-rose-500/20 border border-rose-500/30 text-rose-600 font-bold">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 text-[10px] uppercase font-mono bg-amber-500/20 border border-amber-500/30 text-amber-700 flex items-center gap-1 w-fit font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Low Reserve</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] uppercase font-mono bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 font-bold">
                          Optimal Stock ({currentVal})
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStockChange(p.id, -1)}
                          className="p-1 bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 text-[var(--color-terracotta-deep)] hover:text-[var(--color-earth-dark)] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={currentVal}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setStockMap(prev => ({ ...prev, [p.id]: Math.max(0, val) }));
                          }}
                          className="w-16 bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 text-center py-1 text-xs font-mono text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none font-bold"
                        />
                        <button
                          onClick={() => handleStockChange(p.id, 1)}
                          className="p-1 bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 text-[var(--color-terracotta-deep)] hover:text-[var(--color-earth-dark)] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSaveStock(p.id)}
                        className="luxury-btn-gold px-3 py-1.5 text-xs inline-flex items-center gap-1 cursor-pointer shadow-sm font-bold"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
