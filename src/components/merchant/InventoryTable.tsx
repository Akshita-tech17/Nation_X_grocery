import React, { useState } from 'react';
import { useMerchant } from '../../context/MerchantContext';
import { Product, BulkTier } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Check, Edit2, AlertCircle, Search, ToggleLeft, ToggleRight, Layers } from 'lucide-react';

export const InventoryTable: React.FC = () => {
  const { products, toggleStockStatus, updateProductStock, updateProductPrice, editProduct } = useMerchant();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  // Slabs Modal State
  const [tierModalProduct, setTierModalProduct] = useState<Product | null>(null);
  const [tiers, setTiers] = useState<BulkTier[]>([]);

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

  const handleOpenTiersModal = (product: Product) => {
    setTierModalProduct(product);
    setTiers(
      product.bulkTiers && product.bulkTiers.length > 0
        ? [...product.bulkTiers]
        : [
            { minQty: 5, pricePerUnit: Math.round(product.retailPrice * 0.92), label: '5+ packs', discountPercent: 8 },
            { minQty: 15, pricePerUnit: Math.round(product.retailPrice * 0.85), label: '15+ packs', discountPercent: 15 },
            { minQty: 50, pricePerUnit: Math.round(product.retailPrice * 0.78), label: '50+ packs', discountPercent: 22 }
          ]
    );
  };

  const handleSaveTiers = () => {
    if (tierModalProduct) {
      editProduct(tierModalProduct.id, { bulkTiers: tiers });
      setTierModalProduct(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-stone-900 text-base">Inventory & Wholesale Slabs Manager</h3>
          <p className="text-xs text-stone-500">
            Real-time stock quantities, instant in/out of stock toggles, and multi-tier wholesale discounts
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search catalog items..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-forest-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden">
        {/* Mobile Swipe Hint */}
        <div className="sm:hidden px-4 py-2 bg-stone-50/90 border-b border-stone-200 text-[11px] font-semibold text-stone-600 flex items-center justify-between">
          <span>{filteredProducts.length} Inventory Items</span>
          <span className="text-forest-800 font-bold flex items-center gap-1">Swipe right to edit prices & slabs →</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sticky left-0 bg-stone-50 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-stone-200 min-w-[200px]">Product & Origin</th>
                <th className="py-3.5 px-4">Pack Unit</th>
                <th className="py-3.5 px-4">Stock Units</th>
                <th className="py-3.5 px-4">Retail Price (₹)</th>
                <th className="py-3.5 px-4">Wholesale Slabs</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map(product => {
                const isEditingThis = editingPriceId === product.id;
                return (
                  <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                    {/* Product & Origin */}
                    <td className="py-3 px-4 sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-stone-200 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg border border-stone-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-stone-900 truncate max-w-xs">
                            {product.name}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {product.brand} • <span className="text-forest-700">{product.origin}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Pack Unit */}
                    <td className="py-3 px-4 font-semibold text-stone-700">
                      {product.packSize || product.unit}
                    </td>

                    {/* Stock Units Stepper */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          value={product.stockQuantity}
                          onChange={e => updateProductStock(product.id, Math.max(0, Number(e.target.value)))}
                          className="w-16 px-2 py-1 text-center font-mono font-bold bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-forest-600 focus:bg-white"
                        />
                        {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
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
                            className="w-20 px-2 py-1 font-mono font-bold bg-white border border-forest-600 rounded-lg text-stone-900 focus:outline-none text-xs"
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
                          <span className="font-mono font-bold text-stone-900">
                            ₹{product.retailPrice}
                          </span>
                          <button
                            onClick={() => handleStartEditPrice(product)}
                            className="text-stone-400 hover:text-forest-700 p-0.5"
                            title="Edit price"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Wholesale Tiers */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleOpenTiersModal(product)}
                        className="text-xs font-semibold text-forest-700 hover:text-forest-900 hover:underline flex items-center gap-1"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>
                          {product.bulkTiers && product.bulkTiers.length > 0
                            ? `${product.bulkTiers.length} Slabs Configured`
                            : 'Configure Slabs'}
                        </span>
                      </button>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      {product.inStock && product.stockQuantity > 0 ? (
                        <Badge variant="forest" size="sm">In Stock</Badge>
                      ) : (
                        <Badge variant="rose" size="sm">Out of Stock</Badge>
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

      {/* Wholesale Slabs Modal */}
      {tierModalProduct && (
        <Modal
          isOpen={!!tierModalProduct}
          onClose={() => setTierModalProduct(null)}
          title={`Wholesale Slabs • ${tierModalProduct.name}`}
          subtitle="Configure volume discount break-points for B2B buyers & caterers"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div className="text-stone-600">Base Retail Price: <strong className="text-stone-900 font-mono">₹{tierModalProduct.retailPrice}</strong> per {tierModalProduct.packSize || tierModalProduct.unit}</div>
            </div>

            <div className="space-y-3">
              {tiers.map((tier, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-stone-900">Tier {idx + 1} Slabs</span>
                    <div className="text-stone-500 text-[11px]">Min Order: {tier.minQty}+ units</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500">Price/unit:</span>
                    <input
                      type="number"
                      value={tier.pricePerUnit}
                      onChange={e => {
                        const nextVal = Number(e.target.value);
                        setTiers(prev => {
                          const updated = [...prev];
                          const discount = Math.round(((tierModalProduct.retailPrice - nextVal) / tierModalProduct.retailPrice) * 100);
                          updated[idx] = { ...updated[idx], pricePerUnit: nextVal, discountPercent: Math.max(0, discount) };
                          return updated;
                        });
                      }}
                      className="w-20 px-2 py-1 font-mono font-bold text-forest-950 bg-stone-50 border border-stone-200 rounded-lg text-center"
                    />
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {tier.discountPercent}% OFF
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
              <Button variant="ghost" size="sm" onClick={() => setTierModalProduct(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveTiers}>
                Save Wholesale Slabs
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
