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
  ExternalLink,
  Crown
} from 'lucide-react';

export default function AdminProducts() {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { success, error } = useToast();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const list = await productService.getAllProducts({
        includeDrafts: true,
        search,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        tier: tierFilter !== 'all' ? tierFilter : undefined
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
  }, [search, categoryFilter, tierFilter]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you certain you wish to retire '${name}' from the Catalogue?`)) {
      return;
    }
    try {
      await productService.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      success(`'${name}' has been removed.`);
    } catch (err) {
      error(err.message || 'Could not delete item.');
    }
  };

  return (
    <div className="space-y-6 text-[#F8F5F0]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 pb-4 gap-4">
        <div>
          <h1 className="font-cinzel text-xl font-bold uppercase tracking-wider text-[#F8F5F0]">
            Product Catalog Management
          </h1>
          <p className="text-xs text-[#8C6D37]">
            Manage all 60ml perfume tiers, pure oils, incense bakhoor, and cosmetic lines.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C07B] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#121010] border border-[#D4AF37]/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm text-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, notes..."
            className="w-full bg-black/60 border border-white/10 pl-9 pr-3 py-2 text-xs text-[#F8F5F0] focus:border-[#D4AF37] focus:outline-none rounded"
          />
          <Search className="w-4 h-4 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-black/60 border border-white/10 px-3 py-2 text-xs text-[#F8F5F0] rounded"
          >
            <option value="all">All Categories</option>
            <option value="perfumes">Perfumes</option>
            <option value="oils">Oils (Attar)</option>
            <option value="bakhoor">Bakhoor & Incense</option>
            <option value="cosmetics">Cosmetics</option>
            <option value="bundles">Bundles</option>
          </select>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-black/60 border border-white/10 px-3 py-2 text-xs text-[#F8F5F0] rounded"
          >
            <option value="all">All Tiers</option>
            <option value="Luxury">Luxury Tier (€50)</option>
            <option value="Royal">Royal Tier (€40)</option>
            <option value="Classic">Classic Tier (€30)</option>
          </select>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-[#121010] border border-[#D4AF37]/20 shadow-2xl overflow-x-auto">
        <table className="w-full text-left rtl:text-right border-collapse text-xs">
          <thead>
            <tr className="bg-[#181515] border-b border-[#D4AF37]/20 font-cinzel text-[11px] uppercase tracking-wider text-[#8C6D37]">
              <th className="p-4">Flacon</th>
              <th className="p-4">Product Name</th>
              <th className="p-4">Tier / Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right rtl:text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-neutral-500">Loading catalog...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-neutral-500">No products found.</td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-white/2 transition-colors">
                  <td className="p-4">
                    <img
                      src={p.cutoutImage || p.images?.[0] || '/products/black_diamond_gold.png'}
                      alt={p.name}
                      className="w-10 h-14 object-contain bg-black/50 p-1 border border-white/10"
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-cinzel font-bold text-[#F8F5F0]">{p.name}</div>
                    {p.arabicName && <div className="font-arabic text-[#D4AF37] text-[11px]">{p.arabicName}</div>}
                    <div className="text-[10px] text-[#8C6D37]">{p.size || '60 ml'}</div>
                  </td>
                  <td className="p-4">
                    {p.tier ? (
                      <span className="px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-cinzel text-[10px] font-bold">
                        {p.tier} Tier
                      </span>
                    ) : (
                      <span className="text-[#A69E94] uppercase tracking-wider text-[10px]">
                        {p.category}
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#D4AF37] text-sm">
                    €{p.price}
                  </td>
                  <td className="p-4 font-mono">
                    <span className={p.stock > 10 ? 'text-emerald-400' : p.stock > 0 ? 'text-amber-400' : 'text-red-400'}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                      {p.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="p-4 text-right rtl:text-left space-x-2 rtl:space-x-reverse">
                    <Link
                      to={`/admin/products/${p.id}/edit`}
                      className="p-1.5 inline-block bg-white/5 hover:bg-[#D4AF37] hover:text-black rounded text-[#D4AF37] transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-1.5 bg-white/5 hover:bg-red-600 hover:text-white rounded text-[#8C6D37] transition-colors cursor-pointer"
                      title="Delete Product"
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
  );
}
