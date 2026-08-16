import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function AdminProducts() {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { success, error } = useToast();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [familyFilter, setFamilyFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const list = await productService.getAllProducts({
        includeDrafts: true,
        search,
        family: familyFilter !== 'all' ? familyFilter : undefined
      });
      setProducts(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, familyFilter]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you certain you wish to retire '${name}' from the Royal Vault?`)) {
      return;
    }
    try {
      await productService.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      success(`'${name}' has been removed.`);
    } catch (err) {
      error(err.message || 'Could not delete fragrance.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#F3EEE5]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#C6A15B]/20 pb-4 gap-4">
        <div>
          <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider">
            {t('admin.products')}
          </h1>
          <p className="text-xs text-[#C5B8A8]">
            Manage the complete formulation catalog, pricing, and olfactory pyramid metadata.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="luxury-btn-gold px-5 py-2.5 text-xs flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin.addNewProduct')}</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#1C120E] border border-[#C6A15B]/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search creation or note..."
            className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 pl-9 pr-3 py-2 text-xs text-[#F3EEE5] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#C6A15B] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={familyFilter}
            onChange={(e) => setFamilyFilter(e.target.value)}
            className="w-full sm:w-auto bg-[#0F0D0C] border border-[#C6A15B]/30 px-3 py-2 text-xs text-[#F3EEE5] focus:outline-none cursor-pointer"
          >
            <option value="all">All Fragrance Families</option>
            <option value="woody">Woody (Oud Focus)</option>
            <option value="oriental">Oriental / Amber</option>
            <option value="floral">Floral</option>
            <option value="fresh">Fresh</option>
            <option value="fruity">Fruity</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#1C120E] border border-[#C6A15B]/20 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#C6A15B]/20 text-[#C6A15B] uppercase font-cinzel">
              <th className="py-3 px-4">Creation</th>
              <th className="py-3 px-4">Family / Gender</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C6A15B]/10 text-[#F3EEE5]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#C5B8A8]">
                  Retrieving fragrances...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#C5B8A8]">
                  No fragrances found.
                </td>
              </tr>
            ) : (
              products.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#241712] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.images?.[0]}
                        alt={prod.name}
                        className="w-10 h-12 object-cover bg-[#0F0D0C] shrink-0 border border-[#C6A15B]/20"
                      />
                      <div>
                        <span className="font-cinzel font-bold text-sm text-[#F3EEE5] block">
                          {prod.name}
                        </span>
                        <span className="font-arabic text-xs text-[#C5B8A8] block">
                          {prod.arabicName}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#DFBF7A] block">{prod.fragranceFamily}</span>
                    <span className="text-[11px] text-[#C5B8A8] capitalize">{prod.gender}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#C6A15B]">
                    ${prod.price}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className={`px-2 py-0.5 text-[10px] ${
                      prod.stock <= 5 ? 'bg-red-950/60 text-red-400 border border-red-500/30' : 'text-[#F3EEE5]'
                    }`}>
                      {prod.stock} units
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-mono border ${
                      prod.status === 'ACTIVE'
                        ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                        : prod.status === 'DRAFT'
                        ? 'border-neutral-500/40 bg-neutral-900 text-neutral-400'
                        : 'border-red-500/40 bg-red-950/40 text-red-400'
                    }`}>
                      {prod.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/product/${prod.id}`)}
                        className="p-1.5 text-[#C5B8A8] hover:text-[#C6A15B]"
                        title="View Storefront Preview"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/products/${prod.id}/edit`)}
                        className="p-1.5 text-[#C5B8A8] hover:text-[#DFBF7A]"
                        title="Edit Formulation"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id, prod.name)}
                        className="p-1.5 text-[#C5B8A8] hover:text-red-400"
                        title="Retire Creation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
