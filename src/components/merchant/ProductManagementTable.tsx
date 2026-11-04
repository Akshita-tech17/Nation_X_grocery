import React, { useState } from 'react';
import { useMerchant } from '../../context/MerchantContext';
import { Product } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import {
  Search,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';

export const ProductManagementTable: React.FC = () => {
  const { products, addProduct, editProduct, deleteProduct, activeMerchantId, merchants } = useMerchant();
  const currentStore = merchants.find(m => m.id === activeMerchantId) || merchants[0];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [hindiName, setHindiName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('staples-atta');
  const [unit, setUnit] = useState('1 kg');
  const [packSize, setPackSize] = useState('1 kg pack');
  const [retailPrice, setRetailPrice] = useState<number>(100);
  const [originalPrice, setOriginalPrice] = useState<number>(120);
  const [purchaseCost, setPurchaseCost] = useState<number>(85);
  const [stockQuantity, setStockQuantity] = useState<number>(50);
  const [origin, setOrigin] = useState('India');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setHindiName('');
    setBrand('');
    setCategory('staples-atta');
    setUnit('1 kg');
    setPackSize('1 kg pack');
    setRetailPrice(150);
    setOriginalPrice(180);
    setPurchaseCost(125);
    setStockQuantity(40);
    setOrigin('Madhya Pradesh, India');
    setImage('https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80');
    setDescription('High quality culinary essential.');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setHindiName(prod.hindiName || '');
    setBrand(prod.brand);
    setCategory(prod.category);
    setUnit(prod.unit);
    setPackSize(prod.packSize || prod.unit);
    setRetailPrice(prod.retailPrice);
    setOriginalPrice(prod.originalPrice);
    setPurchaseCost(prod.purchaseCost || Math.round(prod.retailPrice * 0.8));
    setStockQuantity(prod.stockQuantity);
    setOrigin(prod.origin);
    setImage(prod.image);
    setDescription(prod.description);
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    const inStock = Number(stockQuantity) > 0;
    const availabilityStatus = !inStock ? 'unavailable' : Number(stockQuantity) < 10 ? 'low_stock' : 'available';

    if (editingProduct) {
      editProduct(editingProduct.id, {
        name,
        hindiName: hindiName || undefined,
        brand,
        category,
        unit,
        packSize,
        retailPrice: Number(retailPrice),
        originalPrice: Number(originalPrice),
        purchaseCost: Number(purchaseCost),
        stockQuantity: Number(stockQuantity),
        inStock,
        availabilityStatus,
        stockUpdatedAt: new Date().toISOString(),
        origin,
        image,
        description
      });
    } else {
      const newId = `prod-${Date.now()}`;
      const newProd: Product = {
        id: newId,
        name,
        hindiName: hindiName || undefined,
        brand,
        category,
        subCategory: 'Grocery',
        unit,
        packSize,
        retailPrice: Number(retailPrice),
        originalPrice: Number(originalPrice),
        purchaseCost: Number(purchaseCost),
        image,
        rating: 4.8,
        reviewCount: 1,
        inStock,
        stockQuantity: Number(stockQuantity),
        availabilityStatus,
        stockUpdatedAt: new Date().toISOString(),
        origin,
        description,
        tags: [brand],
        merchantId: currentStore.id,
        merchantName: currentStore.name
      };
      addProduct(newProd);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter & Add Product Button */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search product name or brand..."
              className="w-full pl-9 pr-3 py-1.5 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Categories ({products.length})</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={handleOpenAddModal}
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Product
        </Button>
      </div>

      {/* Catalog Table */}
      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Item & Origin</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Pack Unit</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">Purchase Cost (Protected)</th>
                <th className="py-3.5 px-4">MRP (₹)</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-lg border border-border shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground truncate max-w-xs" title={p.name}>
                          {p.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <span>{p.brand}</span>
                          <span>•</span>
                          <span className="text-primary">{p.origin}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-muted-foreground font-medium">
                    {p.category}
                  </td>

                  <td className="py-3 px-4 text-foreground font-semibold">
                    {p.packSize || p.unit}
                  </td>

                  <td className="py-3 px-4 font-bold text-foreground font-mono">
                    ₹{p.retailPrice}
                  </td>

                  <td className="py-3 px-4 font-semibold text-muted-foreground font-mono bg-muted/30">
                    ₹{p.purchaseCost || Math.round(p.retailPrice * 0.8)}
                  </td>

                  <td className="py-3 px-4 text-muted-foreground line-through font-mono">
                    ₹{p.originalPrice}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        p.inStock && p.stockQuantity > 5
                          ? 'bg-brand-soft text-primary border-primary/20'
                          : p.inStock
                          ? 'bg-amber-500/10 text-amber-900 border-amber-500/20'
                          : 'bg-destructive/10 text-destructive border-destructive/20'
                      }`}
                    >
                      {p.inStock ? `${p.stockQuantity} in stock` : 'Out of stock'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                        title="Edit product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${p.name} from catalog?`)) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Catalogue Product' : 'Add New Product to Store'}
        subtitle="Manage product specifications, pricing, pack units, and origin details"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-semibold text-foreground block mb-1">
                Product Title (Full Grocery Specification) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Fortune Sunlite Refined Sunflower Oil Pouch"
                className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Brand Name *</label>
              <input
                type="text"
                required
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. Fortune"
                className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Pack Size / Display Unit *</label>
              <input
                type="text"
                required
                value={packSize}
                onChange={e => {
                  setPackSize(e.target.value);
                  setUnit(e.target.value);
                }}
                placeholder="e.g. 1 Litre Pouch"
                className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Origin / Farm Source</label>
              <input
                type="text"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                placeholder="e.g. Gujarat, India"
                className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Retail Selling Price (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={retailPrice}
                onChange={e => setRetailPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground font-mono font-bold focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Original MRP (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={originalPrice}
                onChange={e => setOriginalPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Purchase Cost (Protected Merchant-Only) *</label>
              <input
                type="number"
                required
                min="1"
                value={purchaseCost}
                onChange={e => setPurchaseCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-brand-soft/30 border border-primary/20 rounded-xl text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Initial Stock Units *</label>
              <input
                type="number"
                required
                min="0"
                value={stockQuantity}
                onChange={e => setStockQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Product Photography Image URL</label>
              <input
                type="url"
                value={image}
                onChange={e => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-foreground block mb-1">Short Product Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Grade A staple suitable for daily cooking..."
                className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingProduct ? 'Save Changes' : 'Publish Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
