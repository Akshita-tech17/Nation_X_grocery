import React, { useState, useRef } from 'react';
import { PRODUCTS } from '../../data/products';
import { ParsedPurchaseItem } from '../../types';
import { parsePurchaseList } from '../../utils/whatsappParser';
import { generateCsvTemplate, parseCsvContent } from '../../utils/csvParser';
import { useCart } from '../../context/CartContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  ListPlus,
  Sparkles,
  ClipboardList,
  FileSpreadsheet,
  Upload,
  Plus,
  Trash2,
  Download,
  AlertCircle,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';

const PRESET_LISTS = [
  {
    name: 'Kirana Restock Staples (High Volume)',
    text: `Aashirvaad MP Sharbati Atta - 15 bags
Dhampur Sugar 50kg - 4 sacks
BPT 5204 Andhra Sona Masoori Rice 25kg - 6 sacks
Fortune Mustard Oil 5L - 8 tins
Tata Sampann Toor Dal - 25 kg`
  },
  {
    name: 'Catering & Banquet Biryani Feast',
    text: `India Gate Classic Basmati Rice - 12 bags
Pure Desi Gir Cow Vedic Bilona Ghee - 6 jars
Amul Fresh Malai Paneer - 15 kg
Tellicherry Extra Bold Black Pepper - 6 packs
Pampore Grade-1 Kashmiri Kesar - 4 boxes`
  },
  {
    name: 'Hostel Mess 15-Day Supply',
    text: `MP Sharbati Atta 5kg - 20 bags
Sona Masoori Rice 25kg - 8 sacks
Dhampur Pure Sugar 50kg - 2 sacks
Tata Salt 1kg - 50 packets
California Almonds 1kg - 8 packs`
  }
];

export const AssistedPurchaseListSection: React.FC = () => {
  const { addToCart, showToast } = useCart();

  const [inputMode, setInputMode] = useState<'text' | 'grid' | 'csv'>('text');
  const [rawText, setRawText] = useState(PRESET_LISTS[0].text);
  const [parsedItems, setParsedItems] = useState<ParsedPurchaseItem[]>([]);
  const [isParsed, setIsParsed] = useState(false);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const csvData = generateCsvTemplate();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'nationx_b2b_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded nationx_b2b_template.csv');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      const res = parseCsvContent(content, PRODUCTS);
      if (res.items.length > 0) {
        setParsedItems(res.items);
        setIsParsed(true);
        setInputMode('text');
        showToast(`Imported ${res.items.length} items from ${file.name}`);
      }
      setCsvErrors(res.errors);
      if (res.errors.length > 0 && res.items.length === 0) {
        showToast(`CSV error: ${res.errors[0]}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Spreadsheet Grid Rows state
  const [gridRows, setGridRows] = useState<{ productId: string; quantity: number }[]>([
    { productId: 'prod-aashirvaad-sharbati', quantity: 15 },
    { productId: 'prod-india-gate-classic', quantity: 8 },
    { productId: 'prod-wholesale-sugar-50kg', quantity: 4 },
    { productId: 'prod-sona-masoori-25kg', quantity: 5 }
  ]);

  // Intelligent parser function
  const parseList = (textToParse: string) => {
    const parsed = parsePurchaseList(textToParse, PRODUCTS);
    setParsedItems(parsed);
    setIsParsed(true);
    showToast(`✨ Smart Parser processed ${parsed.length} line items!`);
  };

  const handleAddAllParsedToCart = () => {
    let addedCount = 0;
    parsedItems.forEach(item => {
      if (item.matchedProduct) {
        addToCart(item.matchedProduct, item.quantity, 'wholesale');
        addedCount++;
      }
    });
    showToast(`🛒 Successfully added ${addedCount} bulk items to your basket!`);
  };

  const handleAddGridToCart = () => {
    gridRows.forEach(row => {
      const prod = PRODUCTS.find(p => p.id === row.productId);
      if (prod && row.quantity > 0) {
        addToCart(prod, row.quantity, 'wholesale');
      }
    });
    showToast(`🛒 Batch added ${gridRows.length} bulk lines to your basket!`);
  };

  return (
    <div className="space-y-6">
      {/* Subheader and Mode Selector */}
      <div className="bg-white rounded-2xl border border-warm-200/90 p-5 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-900">
              <ListPlus className="w-5 h-5" />
            </span>
            <h3 className="font-display font-extrabold text-lg text-warm-900">
              Path C — Assisted Purchase-List Entry
            </h3>
            <Badge variant="forest">Fastest B2B Checkout</Badge>
          </div>
          <p className="text-xs text-warm-500 mt-1 max-w-2xl">
            Designed for busy Kirana owners, restaurant chefs, and mess supervisors. Paste your raw WhatsApp/handwritten list,
            use the rapid spreadsheet SKU grid, or upload a CSV order template without searching one by one.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-warm-100 rounded-xl text-xs font-semibold shrink-0">
          <button
            onClick={() => setInputMode('text')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              inputMode === 'text'
                ? 'bg-white text-forest-950 shadow-sm'
                : 'text-warm-600 hover:text-warm-900'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>List Parser</span>
          </button>

          <button
            onClick={() => setInputMode('grid')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              inputMode === 'grid'
                ? 'bg-white text-forest-950 shadow-sm'
                : 'text-warm-600 hover:text-warm-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Rapid SKU Grid</span>
          </button>

          <button
            onClick={() => setInputMode('csv')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              inputMode === 'csv'
                ? 'bg-white text-forest-950 shadow-sm'
                : 'text-warm-600 hover:text-warm-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>CSV Upload</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Text / WhatsApp Parser */}
      {inputMode === 'text' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Text Box & Presets */}
          <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-warm-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-warm-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Paste Purchase List
              </h4>
              <span className="text-[11px] text-warm-400">1 item per line</span>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-warm-400 block">
                Load Sample Indian Bulk Lists:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_LISTS.map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setRawText(p.text);
                      setIsParsed(false);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-warm-50 hover:bg-forest-50 border border-warm-200 hover:border-forest-300 text-warm-700 hover:text-forest-900 transition-colors font-medium text-left"
                  >
                    {p.name.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={9}
              value={rawText}
              onChange={e => {
                setRawText(e.target.value);
                setIsParsed(false);
              }}
              placeholder={`Paste your list here, e.g.:\n25kg Sona Masoori Rice - 4 bags\nMP Sharbati Atta - 15 bags\nDhampur Sugar 50kg - 2 sacks\nPure Desi Ghee - 6 jars`}
              className="w-full p-3.5 bg-warm-50/70 border border-warm-200 rounded-2xl text-xs font-mono text-warm-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white resize-none shadow-inner"
            />

            <Button
              variant="primary"
              size="md"
              className="w-full font-bold shadow-soft"
              onClick={() => parseList(rawText)}
              icon={<Sparkles className="w-4 h-4 text-emerald-300" />}
            >
              Auto-Parse & Match Catalog
            </Button>
          </div>

          {/* Right Parsed Results */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-warm-200 shadow-soft flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-warm-100 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-warm-900">
                    Matched Catalog Commodities
                  </h4>
                  <p className="text-xs text-warm-500">
                    Smart mapping with volume tier pricing & MOQ enforcement
                  </p>
                </div>
                {isParsed && (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {parsedItems.length} lines parsed
                  </span>
                )}
              </div>

              {!isParsed ? (
                <div className="py-16 text-center space-y-3 text-warm-400">
                  <ClipboardList className="w-12 h-12 mx-auto stroke-1 text-warm-300" />
                  <p className="text-xs max-w-xs mx-auto text-warm-500">
                    Click <strong>"Auto-Parse & Match Catalog"</strong> to convert raw notes into verified grocery SKUs with live discount tiers.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 mt-3 max-h-[360px] overflow-y-auto pr-1">
                  {parsedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-warm-200 bg-warm-50/50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.matchedProduct ? (
                          <img
                            src={item.matchedProduct.image}
                            alt={item.matchedProduct.name}
                            className="w-11 h-11 rounded-lg object-cover border border-warm-200 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-warm-200 flex items-center justify-center shrink-0 text-warm-500">
                            <AlertCircle className="w-5 h-5" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="font-bold text-warm-900 truncate">
                            {item.matchedProduct ? item.matchedProduct.name : item.rawLine}
                          </div>
                          <div className="text-[11px] text-warm-500 flex items-center gap-2 mt-0.5">
                            <span>Input: "{item.rawLine}"</span>
                            {item.matchedProduct && (
                              <span className="text-emerald-700 font-semibold">• Sourced from {item.matchedProduct.origin}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-sm text-forest-950">
                          {item.quantity}x {item.unit}
                        </div>
                        {item.matchedProduct && (
                          <span className="text-[10px] text-indigo-700 font-semibold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                            Bulk Tier Active
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isParsed && (
              <div className="pt-3 border-t border-warm-100 flex items-center justify-between">
                <span className="text-xs text-warm-500">
                  Ready to add directly into your B2B basket
                </span>
                <Button
                  variant="amber"
                  size="md"
                  onClick={handleAddAllParsedToCart}
                  icon={<ShoppingBag className="w-4 h-4" />}
                >
                  Add All Matched Items to Basket
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Rapid Multi-Row Spreadsheet SKU Grid */}
      {inputMode === 'grid' && (
        <div className="bg-white rounded-3xl border border-warm-200 shadow-soft p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-warm-900">
                Spreadsheet-Style Rapid SKU Matrix
              </h4>
              <p className="text-xs text-warm-500">
                Select items from dropdown, set pack quantities, and batch-add all lines in one click
              </p>
            </div>

            <button
              onClick={() =>
                setGridRows(prev => [
                  ...prev,
                  { productId: PRODUCTS[0].id, quantity: 5 }
                ])
              }
              className="px-3 py-1.5 rounded-lg bg-forest-50 text-forest-900 hover:bg-forest-100 font-semibold text-xs flex items-center gap-1.5 border border-forest-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add SKU Row</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-warm-50 border-b border-warm-200 text-warm-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Commodity / SKU</th>
                  <th className="py-3 px-4">Pack Unit</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Applicable Unit Rate (₹)</th>
                  <th className="py-3 px-4">Subtotal (₹)</th>
                  <th className="py-3 px-4 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {gridRows.map((row, idx) => {
                  const product = PRODUCTS.find(p => p.id === row.productId) || PRODUCTS[0];
                  const activeTier = product.bulkTiers
                    ?.filter(t => row.quantity >= t.minQty)
                    .sort((a, b) => b.minQty - a.minQty)[0];
                  const unitPrice = activeTier ? activeTier.pricePerUnit : product.retailPrice;
                  const lineTotal = unitPrice * row.quantity;

                  return (
                    <tr key={idx} className="hover:bg-warm-50/40">
                      <td className="py-2.5 px-4">
                        <select
                          value={row.productId}
                          onChange={e => {
                            const newId = e.target.value;
                            setGridRows(prev => {
                              const updated = [...prev];
                              updated[idx].productId = newId;
                              return updated;
                            });
                          }}
                          className="w-full max-w-sm px-2.5 py-1.5 bg-white border border-warm-200 rounded-lg text-xs font-semibold text-warm-900 cursor-pointer"
                        >
                          {PRODUCTS.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.unit})
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-2.5 px-4 font-semibold text-warm-700">
                        {product.unit}
                      </td>

                      <td className="py-2.5 px-4">
                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={e => {
                            const val = Math.max(1, Number(e.target.value));
                            setGridRows(prev => {
                              const updated = [...prev];
                              updated[idx].quantity = val;
                              return updated;
                            });
                          }}
                          className="w-20 px-2 py-1 bg-warm-50 border border-warm-200 rounded-lg font-mono font-bold text-center text-warm-900"
                        />
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="font-mono font-bold text-forest-900">
                          ₹{unitPrice}
                        </div>
                        {activeTier && (
                          <span className="text-[10px] text-emerald-700 font-bold">
                            Save {activeTier.discountPercent}%
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-4 font-mono font-bold text-warm-900 text-sm">
                        ₹{lineTotal}
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => setGridRows(prev => prev.filter((_, i) => i !== idx))}
                          disabled={gridRows.length <= 1}
                          className="p-1 text-warm-400 hover:text-rose-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-warm-200 flex items-center justify-between">
            <span className="text-xs text-warm-500">
              {gridRows.length} rows configured
            </span>
            <Button
              variant="amber"
              size="md"
              onClick={handleAddGridToCart}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Batch Add All {gridRows.length} Items to Basket
            </Button>
          </div>
        </div>
      )}

      {/* Mode 3: CSV Template Upload */}
      {inputMode === 'csv' && (
        <div className="bg-white rounded-3xl border border-warm-200 shadow-soft p-6 sm:p-10 text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-900 flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-base text-warm-900">
              Bulk CSV Order Template
            </h4>
            <p className="text-xs text-warm-500 max-w-md mx-auto">
              Download our pre-structured Excel / CSV template, fill in SKU quantities, and re-upload to automatically populate your cart.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 rounded-xl border border-warm-300 hover:border-warm-400 bg-warm-50 hover:bg-white text-xs font-semibold text-warm-800 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-forest-700" />
              <span>Download CSV Template</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,text/csv"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-950 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-emerald-300" />
              <span>Upload Completed CSV</span>
            </button>
          </div>

          {csvErrors.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-left text-xs space-y-1">
              <span className="font-bold text-rose-800 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> CSV Validation Errors:
              </span>
              <ul className="list-disc list-inside text-rose-700 text-[11px] space-y-0.5">
                {csvErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
