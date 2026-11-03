import React, { useState } from 'react';
import { useMerchant } from '../../context/MerchantContext';
import { Product } from '../../types';
import { Badge } from '../common/Badge';
import { Check, Edit2, AlertCircle, Search, ToggleLeft, ToggleRight } from 'lucide-react';

export const InventoryTable: React.FC = () => {
  const { products, toggleStockStatus, updateProductStock, updateProductPrice } = useMerchant();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartEditPrice = (product: Product) => {
    setEditingPriceId(product.id);
    setTempPrice(product.retailPrice);
  };

  const handleSavePrice = (productId: string) => {
    if (tempPrice > 0) {
      updateProductPrice(productId, tempPrice);
    }
    setEditingPriceId(null);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-warm-900 text-base">Kirana & Mandi Inventory Manager</h3>
          <p className="text-xs text-warm-500">
            Toggle real-time item availability, modify stock levels, and update retail prices
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search catalog items..."
            className="w-full pl-9 pr-3 py-1.5 bg-warm-50 border border-warm-200 rounded-xl text-xs text-warm-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-warm-200/90 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-50/80 border-b border-warm-200 text-warm-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product & Origin</th>
                <th className="py-3.5 px-4">Pack Unit</th>
                <th className="py-3.5 px-4">Stock Units</th>
                <th className="py-3.5 px-4">Retail Price (₹)</th>
                <th className="py-3.5 px-4">Wholesale Tiers</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {filteredProducts.map(product => {
                const isEditingThis = editingPriceId === product.id;
                return (
                  <tr key={product.id} className="hover:bg-warm-50/50 transition-colors">
                    {/* Product & Origin */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg border border-warm-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-warm-900 truncate max-w-xs">
                            {product.name}
                          </div>
                          <div className="text-[11px] text-warm-500">
                            {product.brand} • <span className="text-forest-700">{product.origin}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Pack Unit */}
                    <td className="py-3 px-4 font-semibold text-warm-700">
                      {product.unit}
                    </td>

                    {/* Stock Units Stepper */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          value={product.stockQuantity}
                          onChange={e => updateProductStock(product.id, Math.max(0, Number(e.target.value)))}
                          className="w-16 px-2 py-1 text-center font-mono font-bold bg-warm-50 border border-warm-200 rounded-lg text-warm-900 focus:outline-none focus:ring-1 focus:ring-forest-600 focus:bg-white"
                        />
                        {product.stockQuantity <= 5 && (
                          <span title="Low stock alert" className="text-amber-600">
                            <AlertCircle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Retail Price */}
                    <td className="py-3 px-4">
                      {isEditingThis ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={e => setTempPrice(Number(e.target.value))}
                            className="w-20 px-2 py-1 font-mono font-bold bg-white border border-forest-600 rounded-lg text-warm-900 focus:outline-none text-xs"
                          />
                          <button
                            onClick={() => handleSavePrice(product.id)}
                            className="p-1 rounded bg-forest-900 text-white hover:bg-forest-950"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-warm-900">
                            ₹{product.retailPrice}
                          </span>
                          <button
                            onClick={() => handleStartEditPrice(product)}
                            className="text-warm-400 hover:text-forest-700 p-0.5"
                            title="Edit price"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Wholesale Tiers */}
                    <td className="py-3 px-4">
                      {product.bulkTiers && product.bulkTiers.length > 0 ? (
                        <Badge variant="blue" size="sm">
                          {product.bulkTiers.length} Slabs Configured
                        </Badge>
                      ) : (
                        <span className="text-warm-400 italic text-[11px]">Retail Only</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      {product.inStock && product.stockQuantity > 0 ? (
                        <Badge variant="forest" size="sm">In Stock</Badge>
                      ) : (
                        <Badge variant="red" size="sm">Out of Stock</Badge>
                      )}
                    </td>

                    {/* Action Toggle */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => toggleStockStatus(product.id)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all inline-flex items-center gap-1.5 ${
                          product.inStock && product.stockQuantity > 0
                            ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        {product.inStock && product.stockQuantity > 0 ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-rose-600" />
                            <span>Mark Out</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-emerald-600" />
                            <span>Restock</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

