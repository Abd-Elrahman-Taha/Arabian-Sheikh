import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import { Warehouse, Plus, Minus, AlertTriangle, Save, RefreshCw } from 'lucide-react';

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
    <div className="space-y-6 animate-fade-in text-[#F3EEE5]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#C6A15B]/20 pb-4 gap-4">
        <div>
          <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider">
            {t('admin.inventory')}
          </h1>
          <p className="text-xs text-[#C5B8A8]">
            Warehouse stock monitoring, vintage batch limits, and real-time inventory adjustments.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="luxury-btn-outline px-4 py-2 text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Stock Levels</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#1C120E] border border-[#C6A15B]/20 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#C6A15B]/20 text-[#C6A15B] uppercase font-cinzel">
              <th className="py-3 px-4">Flacon Formulation</th>
              <th className="py-3 px-4">SKU / Code</th>
              <th className="py-3 px-4">Family</th>
              <th className="py-3 px-4">Stock Status</th>
              <th className="py-3 px-4">Inventory Quantity</th>
              <th className="py-3 px-4 text-right">Commit Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C6A15B]/10 text-[#F3EEE5]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#C5B8A8]">
                  Inspecting warehouse reserves...
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const currentVal = stockMap[p.id] ?? p.stock;
                const isLow = currentVal <= 10;
                const isOut = currentVal === 0;

                return (
                  <tr key={p.id} className="hover:bg-[#241712] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0]}
                          alt={p.name}
                          className="w-10 h-12 object-cover bg-[#0F0D0C] shrink-0 border border-[#C6A15B]/20"
                        />
                        <div>
                          <span className="font-cinzel font-bold text-sm text-[#F3EEE5] block">
                            {p.name}
                          </span>
                          <span className="font-arabic text-xs text-[#C5B8A8]">
                            {p.arabicName}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[#C5B8A8]">
                      ARB-{p.id.slice(-6).toUpperCase()}
                    </td>

                    <td className="py-3 px-4 text-[#DFBF7A]">
                      {p.fragranceFamily}
                    </td>

                    <td className="py-3 px-4">
                      {isOut ? (
                        <span className="px-2 py-0.5 text-[10px] uppercase font-mono bg-red-950/60 border border-red-500/40 text-red-400">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 text-[10px] uppercase font-mono bg-amber-950/60 border border-amber-500/40 text-amber-300 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Low Reserve</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] uppercase font-mono bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                          Optimal Reserve
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center border border-[#C6A15B]/30 bg-[#0F0D0C] w-fit">
                        <button
                          onClick={() => handleStockChange(p.id, -1)}
                          className="p-1 text-[#C5B8A8] hover:text-[#C6A15B]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 font-mono font-bold text-xs">{currentVal}</span>
                        <button
                          onClick={() => handleStockChange(p.id, 1)}
                          className="p-1 text-[#C5B8A8] hover:text-[#C6A15B]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSaveStock(p.id)}
                        disabled={currentVal === p.stock}
                        className="luxury-btn-gold px-3 py-1 text-xs disabled:opacity-30 disabled:pointer-events-none"
                      >
                        Save
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
