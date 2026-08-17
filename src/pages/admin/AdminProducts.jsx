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
    <div className="space-y-6 animate-fade-in text-[var(--text-primary)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-subtle)] pb-4 gap-4">
        <div>
          <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {t('admin.products')}
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Manage the complete formulation catalog, pricing, and olfactory pyramid metadata.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="luxury-btn-gold px-5 py-2.5 text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin.addNewProduct')}</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search creation or note..."
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-card)] pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[var(--gold-primary)] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={familyFilter}
            onChange={(e) => setFamilyFilter(e.target.value)}
            className="w-full sm:w-auto bg-[var(--bg-secondary)] border border-[var(--border-card)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none cursor-pointer"
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
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] text-[var(--gold-primary)] uppercase font-cinzel">
              <th className="py-3 px-4">Creation</th>
              <th className="py-3 px-4">Family / Gender</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">
                  Retrieving fragrances...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">
                  No fragrances found.
                </td>
              </tr>
            ) : (
              products.map((prod) => (
                <tr key={prod.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={prod.images?.[0]}
                      alt={prod.name}
                      className="w-10 h-12 object-cover bg-[var(--bg-primary)] border border-[var(--border-subtle)]"
                    />
                    <div>
                      <span className="font-cinzel font-bold text-sm text-[var(--text-primary)] block">
                        {prod.name}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] font-arabic">{prod.arabicName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs uppercase font-mono block text-[var(--gold-primary)]">{prod.fragranceFamily}</span>
                    <span className="text-[10px] text-[var(--text-muted)] capitalize">{prod.gender}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-sm text-[var(--gold-primary)]">
                    ${prod.price}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className={prod.stock < 10 ? 'text-rose-500 font-bold' : 'text-[var(--text-primary)]'}>
                      {prod.stock} units
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-[10px] font-mono uppercase ${prod.isFeatured ? 'bg-[var(--gold-primary)] text-[#130C05] font-bold' : 'bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-muted)]'}`}>
                      {prod.isFeatured ? 'Featured' : 'Standard'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => navigate(`/product/${prod.id}`)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[var(--gold-primary)] cursor-pointer"
                      title="View on Storefront"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/products/${prod.id}/edit`)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[var(--gold-primary)] cursor-pointer"
                      title="Edit Formulation"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id, prod.name)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-rose-400 cursor-pointer"
                      title="Delete Flacon"
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
