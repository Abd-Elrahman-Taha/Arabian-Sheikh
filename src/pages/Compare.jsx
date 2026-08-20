import React, { useState, useEffect } from 'react';
import { Link } from '../router/RouterContext';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ChevronRight, Check } from 'lucide-react';

export default function Compare() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const perfumes = await productService.getPerfumes();
      setProducts(perfumes);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="pt-36 pb-20 text-center text-xs text-[#8C6D37]">Loading comparison matrix...</div>;
  }

  return (
    <div className="min-h-screen bg-transparent text-[#F8F5F0] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs uppercase tracking-[0.35em] text-[#D4AF37] font-cinzel">
            Analytical Flacon Matrix
          </span>
          <h1 className="text-3xl sm:text-4xl font-cinzel font-bold text-[#F8F5F0]">
            The Three Flacons Comparison
          </h1>
          <p className="text-xs sm:text-sm text-[#A69E94]">
            Analyze notes, longevity, sillage, and pricing side-by-side.
          </p>
        </div>

        <div className="overflow-x-auto bg-[#121010] border border-[#D4AF37]/20 shadow-2xl">
          <table className="w-full text-left rtl:text-right border-collapse text-xs">
            <thead>
              <tr className="bg-[#181515] border-b border-[#D4AF37]/20">
                <th className="p-4 font-cinzel uppercase text-[#8C6D37] w-1/4">Specification</th>
                {products.map((p) => (
                  <th key={p.id} className="p-4 font-cinzel text-sm font-bold text-[#D4AF37] text-center w-1/4">
                    {p.name} ({p.tier})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="p-4 font-semibold text-[#A69E94]">Bottle Silhouette</td>
                {products.map((p) => (
                  <td key={p.id} className="p-4 text-center">
                    <img
                      src={p.cutoutImage || p.images?.[0]}
                      alt={p.name}
                      className="h-32 mx-auto object-contain filter drop-shadow-md"
                    />
                  </td>
                ))}
              </tr>
              <tr className="bg-white/2">
                <td className="p-4 font-semibold text-[#A69E94]">Price / Size</td>
                {products.map((p) => (
                  <td key={p.id} className="p-4 text-center font-cinzel font-bold text-[#D4AF37] text-sm">
                    €{p.price} <span className="text-xs text-[#A69E94] font-normal">/ {p.size}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-[#A69E94]">Tier Category</td>
                {products.map((p) => (
                  <td key={p.id} className="p-4 text-center font-cinzel text-[#F8F5F0]">
                    {p.tier} Tier
                  </td>
                ))}
              </tr>
              <tr className="bg-white/2">
                <td className="p-4 font-semibold text-[#A69E94]">Longevity Meter</td>
                {products.map((p) => (
                  <td key={p.id} className="p-4 text-center font-semibold text-[#D4AF37]">
                    {p.longevity}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-[#A69E94]">Sillage Profile</td>
                {products.map((p) => (
                  <td key={p.id} className="p-4 text-center text-[#E5E0D8]">
                    {p.sillage}
                  </td>
                ))}
              </tr>
              <tr className="bg-white/2">
                <td className="p-4 font-semibold text-[#A69E94]">Top Notes</td>
                {products.map((p) => (
                  <td key={p.id} className="p-4 text-center text-[#E5E0D8]">
                    {p.notes?.top?.join(', ')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-[#A69E94]">Heart Notes</td>
                {products.map((p) => (
                  <td key={p.id} className="p-4 text-center text-[#E5E0D8]">
                    {p.notes?.heart?.join(', ')}
                  </td>
                ))}
              </tr>
              <tr className="bg-white/2">
                <td className="p-4 font-semibold text-[#A69E94]">Base Notes</td>
                {products.map((p) => (
                  <td key={p.id} className="p-4 text-center text-[#E5E0D8]">
                    {p.notes?.base?.join(', ')}
                  </td>
                ))}
              </tr>
              <tr className="bg-[#181515]">
                <td className="p-4 font-semibold text-[#A69E94]">Action</td>
                {products.map((p) => (
                  <td key={p.id} className="p-4 text-center">
                    <button
                      onClick={() => addToCart(p, '60 ml', 1)}
                      className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C07B] text-black font-cinzel font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                      Add to Bag (€{p.price})
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
