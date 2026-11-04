import React, { useState } from 'react';
import { useMerchant } from '../../context/MerchantContext';
import { Product, BulkTier } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Check, Edit2, AlertCircle, Search, ToggleLeft, ToggleRight, Layers, Clock } from 'lucide-react';

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
            Real-time stock quantities, explicit availability status, freshness metadata, and multi-tier wholesale discounts
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product & Origin</th>
                <th className="py-3.5 px-4">Pack Unit</th>
                <th className="py-3.5 px-4">Stock Units</th>
                <th className="py-3.5 px-4">Retail Price (₹)</th>
                <th className="py-3.5 px-4">Wholesale Slabs</th>
                <th className="py-3.5 px-4 text-center">Availability Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map(product => {
                const isEditingThis = editingPriceId === product.id;
                return (
                  <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                    {/* Product & Origin */}
                    <td className="py-3 px-4">
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
                          <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                            <span>{product.brand}</span>
                            <span>•</span>
                            <span className="text-forest-700">{product.origin}</span>
                            {product.stockUpdatedAt && (
                              <span className="text-stone-400 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                Updated {new Date(product.stockUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
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
                      {product.availabilityStatus === 'available' || (product.inStock && product.stockQuantity >= 10) ? (
                        <Badge variant="forest" size="sm">Available</Badge>
                      ) : product.availabilityStatus === 'low_stock' || (product.stockQuantity > 0 && product.stockQuantity < 10) ? (
                        <Badge variant="amber" size="sm">Low Stock</Badge>
                      ) : product.availabilityStatus === 'unconfirmed' ? (
                        <Badge variant="stone" size="sm">Call to Confirm</Badge>
                      ) : (
                        <Badge variant="rose" size="sm">Unavailable</Badge>
                      )}
                    </td>

                    {/* Action Toggle */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => toggleStockStatus(product.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                          product.inStock
                            ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                        }`}
                      >
                        {product.inStock ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-600" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-rose-600" />
                            <span>Out of Stock</span>
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

      {/* Slabs Configuration Modal */}
      <Modal
        isOpen={!!tierModalProduct}
        onClose={() => setTierModalProduct(null)}
        title={`Configure Wholesale Slabs • ${tierModalProduct?.name}`}
        subtitle="Set minimum unit breaks and discounted per-unit pricing for commercial buyers"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-stone-600">
            Discounts automatically apply in B2B Direct Bulk Ordering (Path 7.1) when buyers select quantities exceeding tier thresholds.
          </p>

          <div className="space-y-3">
            {tiers.map((tier, index) => (
              <div key={index} className="p-3 rounded-xl bg-stone-50 border border-stone-200 grid grid-cols-3 gap-3 items-center">
                <div>
                  <label className="font-semibold text-stone-600 block mb-1">Min Qty ({tierModalProduct?.unit}s)</label>
                  <input
                    type="number"
                    min="1"
                    value={tier.minQty}
                    onChange={e => {
                      const updated = [...tiers];
                      updated[index].minQty = Number(e.target.value);
                      setTiers(updated);
                    }}
                    className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-600 block mb-1">Price / Unit (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={tier.pricePerUnit}
                    onChange={e => {
                      const updated = [...tiers];
                      updated[index].pricePerUnit = Number(e.target.value);
                      const mrp = tierModalProduct?.originalPrice || tierModalProduct?.retailPrice || 100;
                      updated[index].discountPercent = Math.round(((mrp - updated[index].pricePerUnit) / mrp) * 100);
                      setTiers(updated);
                    }}
                    className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-600 block mb-1">Discount %</label>
                  <div className="font-mono font-bold text-emerald-700 py-1.5">
                    {tier.discountPercent}% off
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
            <Button variant="ghost" size="sm" onClick={() => setTierModalProduct(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveTiers}>
              Save Slabs Configuration
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
