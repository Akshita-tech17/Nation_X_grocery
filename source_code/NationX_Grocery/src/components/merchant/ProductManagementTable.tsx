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
    setStockQuantity(40);
    setOrigin('Madhya Pradesh, India');
    setImage('https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80');
    setDescription('Fresh pantry grocery staple sourced directly from authentic growers.');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setHindiName(p.hindiName || '');
    setBrand(p.brand);
    setCategory(p.category);
    setUnit(p.unit);
    setPackSize(p.packSize || p.unit);
    setRetailPrice(p.retailPrice);
    setOriginalPrice(p.originalPrice);
    setStockQuantity(p.stockQuantity);
    setOrigin(p.origin);
    setImage(p.image);
    setDescription(p.description);
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !brand || retailPrice <= 0) {
      alert('Please fill out all required fields with valid values.');
      return;
    }

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
        stockQuantity: Number(stockQuantity),
        inStock: Number(stockQuantity) > 0,
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
        image,
        rating: 4.8,
        reviewCount: 1,
        inStock: Number(stockQuantity) > 0,
        stockQuantity: Number(stockQuantity),
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
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search product name or brand..."
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-forest-600"
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
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Item & Origin</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Pack Unit</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">MRP (₹)</th>
                <th className="py-3.5 px-4">Stock Units</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-lg border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-stone-900 truncate max-w-xs" title={p.name}>
                          {p.name}
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                          <span>{p.brand}</span>
                          <span>•</span>
                          <span className="text-forest-700">{p.origin}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-stone-600 font-medium">
                    {p.category}
                  </td>

                  <td className="py-3 px-4 text-stone-700 font-semibold">
                    {p.packSize || p.unit}
                  </td>

                  <td className="py-3 px-4 font-bold text-forest-950 font-mono">
                    ₹{p.retailPrice}
                  </td>

                  <td className="py-3 px-4 text-stone-400 line-through font-mono">
                    ₹{p.originalPrice}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        p.inStock && p.stockQuantity > 5
                          ? 'bg-emerald-50 text-emerald-800'
                          : p.inStock
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      {p.inStock ? `${p.stockQuantity} in stock` : 'Out of stock'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
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
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
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
              <label className="font-semibold text-stone-700 block mb-1">
                Product Title (Full Grocery Specification) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Fortune Sunlite Refined Sunflower Oil Pouch"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Brand Name *</label>
              <input
                type="text"
                required
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. Fortune"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Pack Size / Display Unit *</label>
              <input
                type="text"
                required
                value={packSize}
                onChange={e => {
                  setPackSize(e.target.value);
                  setUnit(e.target.value);
                }}
                placeholder="e.g. 1 Litre Pouch"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Origin / Farm Source</label>
              <input
                type="text"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                placeholder="e.g. Gujarat, India"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Retail Selling Price (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={retailPrice}
                onChange={e => setRetailPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-forest-600"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Original MRP (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={originalPrice}
                onChange={e => setOriginalPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono focus:outline-none focus:ring-1 focus:ring-forest-600"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Initial Stock Units *</label>
              <input
                type="number"
                required
                min="0"
                value={stockQuantity}
                onChange={e => setStockQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono focus:outline-none focus:ring-1 focus:ring-forest-600"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Product Photography Image URL</label>
              <input
                type="url"
                value={image}
                onChange={e => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-stone-700 block mb-1">Short Product Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Grade A staple suitable for daily cooking..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
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
