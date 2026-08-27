import React from 'react';
import { Link } from '../../router/RouterContext';
import { Package, ExternalLink, Clock, Truck } from 'lucide-react';

export default function AccountOrders() {
  const orders = [
    {
      id: 'ORD-98214',
      date: '2026-08-14',
      total: 120.00,
      status: 'DELIVERED',
      tracking: 'DHL-EXP-990142851',
      items: [
        { name: 'Arabian Gold Sovereign Flacon (Luxury €55)', qty: 2, price: 55 },
        { name: 'Palace Keepsake Gift Wrap', qty: 1, price: 10 }
      ]
    },
    {
      id: 'ORD-97450',
      date: '2026-07-28',
      total: 50.00,
      status: 'IN_TRANSIT',
      tracking: 'DHL-EXP-881204910',
      items: [
        { name: 'Millionaire Flacon (Royal €40)', qty: 1, price: 40 },
        { name: 'DHL Express Courier', qty: 1, price: 10 }
      ]
    }
  ];

  return (
    <div className="space-y-6 text-[#F3E6D0]">
      <div className="border-b border-[#3A2116]/40 pb-5">
        <h2 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
          Acquisition History
        </h2>
        <p className="text-xs sm:text-sm text-[#D8BE99] mt-1">
          Track and review all royal distillations dispatched to your palace residence.
        </p>
      </div>

      <div className="space-y-5">
        {orders.map((o) => (
          <div key={o.id} className="bg-[#21130D] border border-[#3A2116]/60 p-6 space-y-4 shadow-md rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#3A2116]/30 gap-2 text-sm">
              <div>
                <span className="font-cinzel font-bold text-[#D4AF37] text-base sm:text-lg">{o.id}</span>
                <span className="text-[#D8BE99] ml-3 font-mono text-xs sm:text-sm">{o.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-xs font-mono uppercase font-bold rounded-full ${
                  o.status === 'DELIVERED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                }`}>
                  {o.status}
                </span>
                <span className="font-cinzel font-bold text-[#F3E6D0] text-base sm:text-lg">€{o.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2.5 text-sm sm:text-base">
              {o.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-[#D8BE99]">
                  <span>{it.name} × {it.qty}</span>
                  <span className="font-mono text-[#F3E6D0] font-semibold">€{it.price * it.qty}</span>
                </div>
              ))}
            </div>

            <div className="pt-3.5 border-t border-[#3A2116]/30 flex items-center justify-between text-xs sm:text-sm text-[#D4AF37]">
              <div className="flex items-center gap-2 font-mono">
                <Truck className="w-4 h-4" />
                <span>Tracking: {o.tracking}</span>
              </div>
              <Link to={`/order-confirmation/${o.id}`} className="hover:underline font-cinzel text-xs sm:text-sm uppercase tracking-wider font-bold">
                View Receipt
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
