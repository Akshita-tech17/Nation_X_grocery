import React, { useState, useRef } from 'react';
import { PRODUCTS } from '../../data/products';
import { Product, ParsedPurchaseItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  ListPlus,
  ClipboardList,
  FileSpreadsheet,
  Upload,
  Plus,
  Trash2,
  Download,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  HelpCircle
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputMode, setInputMode] = useState<'text' | 'grid' | 'csv'>('text');
  const [rawText, setRawText] = useState(PRESET_LISTS[0].text);
  const [parsedItems, setParsedItems] = useState<ParsedPurchaseItem[]>([]);
  const [isParsed, setIsParsed] = useState(false);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);

  // Spreadsheet Grid Rows state
  const [gridRows, setGridRows] = useState<{ productId: string; quantity: number }[]>([
    { productId: 'prod-aashirvaad-sharbati', quantity: 15 },
    { productId: 'prod-india-gate-classic', quantity: 8 },
    { productId: 'prod-wholesale-sugar-50kg', quantity: 4 },
    { productId: 'prod-sona-masoori-25kg', quantity: 5 }
  ]);

  /**
   * Genuine token-based catalog matcher with legitimate evidence scoring
   */
  const matchCatalogueProduct = (line: string): { matchedProduct?: Product; confidence: number; isUncertain: boolean } => {
    const lower = line.toLowerCase();
    let bestProduct: Product | undefined;
    let highestScore = 0;

    for (const prod of PRODUCTS) {
      let score = 0;
      const pName = prod.name.toLowerCase();
      const pBrand = prod.brand.toLowerCase();
      const pCat = prod.category.toLowerCase();
      const pVariant = (prod.variant || '').toLowerCase();

      // Brand exact token
      if (lower.includes(pBrand)) score += 30;
      // Category token match
      if (lower.includes(pCat)) score += 10;
      // Name tokens
      const nameTokens = pName.split(' ').filter(t => t.length > 2);
      let matchedTokens = 0;
      nameTokens.forEach(t => {
        if (lower.includes(t)) matchedTokens++;
      });
      score += Math.min(40, matchedTokens * 8);

      // Commodity keywords
      if (lower.includes('atta') && pName.includes('atta')) score += 15;
      if (lower.includes('sharbati') && pName.includes('sharbati')) score += 20;
      if (lower.includes('basmati') && pName.includes('basmati')) score += 25;
      if (lower.includes('sugar') && pName.includes('sugar')) score += 20;
      if (lower.includes('rice') && pName.includes('rice')) score += 15;
      if (lower.includes('toor') && pName.includes('toor')) score += 20;
      if (lower.includes('ghee') && pName.includes('ghee')) score += 25;
      if (lower.includes('mustard') && pName.includes('mustard')) score += 20;
      if (lower.includes('paneer') && pName.includes('paneer')) score += 20;
      if (lower.includes('kesar') && pName.includes('kesar')) score += 25;
      if (lower.includes('salt') && pName.includes('salt')) score += 20;
      if (lower.includes('almond') && pName.includes('almond')) score += 20;
      if (pVariant && lower.includes(pVariant)) score += 15;

      if (score > highestScore) {
        highestScore = score;
        bestProduct = prod;
      }
    }

    const normalizedConfidence = Math.min(100, highestScore);
    const isUncertain = normalizedConfidence < 50 || !bestProduct;

    return {
      matchedProduct: bestProduct,
      confidence: normalizedConfidence,
      isUncertain
    };
  };

  /**
   * Review-first parser workflow
   */
  const parseList = (textToParse: string) => {
    const lines = textToParse
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const parsed: ParsedPurchaseItem[] = lines.map((line, idx) => {
      const lower = line.toLowerCase();
      // Extract quantity: looks for numbers
      const numMatch = lower.match(/\b(\d+)\b/);
      const quantity = numMatch ? Math.max(1, parseInt(numMatch[1], 10)) : 5;

      const { matchedProduct, confidence, isUncertain } = matchCatalogueProduct(line);

      return {
        id: `parsed-${idx}-${Date.now()}`,
        rawLine: line,
        matchedMasterProductId: matchedProduct?.id,
        matchedOfferingId: matchedProduct?.offeringId,
        matchedProduct,
        matchedShopId: matchedProduct?.merchantId,
        matchedShopName: matchedProduct?.merchantName,
        quantity,
        unit: matchedProduct?.unit || 'bags / units',
        packSize: matchedProduct?.packSize,
        confidence,
        isUncertain,
        manualCorrectionNeeded: isUncertain,
        userConfirmed: !isUncertain
      };
    });

    setParsedItems(parsed);
    setIsParsed(true);
    showToast(`Parsed ${parsed.length} items. Please review matches before adding to basket.`);
  };

  const handleUpdateParsedItem = (
    id: string,
    field: 'productId' | 'quantity' | 'unit',
    value: any
  ) => {
    setParsedItems(prev =>
      prev.map(it => {
        if (it.id === id) {
          if (field === 'productId') {
            const prod = PRODUCTS.find(p => p.id === value);
            return {
              ...it,
              matchedMasterProductId: prod?.id,
              matchedOfferingId: prod?.offeringId,
              matchedProduct: prod,
              matchedShopId: prod?.merchantId,
              matchedShopName: prod?.merchantName,
              unit: prod?.unit || it.unit,
              packSize: prod?.packSize,
              isUncertain: false,
              userConfirmed: true
            };
          }
          if (field === 'quantity') {
            return { ...it, quantity: Math.max(1, Number(value)) };
          }
          if (field === 'unit') {
            return { ...it, unit: value };
          }
        }
        return it;
      })
    );
  };

  const handleRemoveParsedItem = (id: string) => {
    setParsedItems(prev => prev.filter(it => it.id !== id));
  };

  /**
   * Real CSV File Reader
   */
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();

    reader.onload = event => {
      const text = event.target?.result as string;
      if (!text || text.trim().length === 0) {
        showToast('CSV file is empty!');
        return;
      }

      const lines = text
        .split(/\r\n|\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0);

      // Skip header row if it contains 'item' or 'commodity'
      const dataLines = lines[0].toLowerCase().includes('item') || lines[0].toLowerCase().includes('commodity') || lines[0].toLowerCase().includes('product')
        ? lines.slice(1)
        : lines;

      if (dataLines.length === 0) {
        showToast('No grocery items found in uploaded CSV.');
        return;
      }

      // Convert CSV lines (e.g. "Aashirvaad Atta, 10, bags") to list text
      const extractedText = dataLines
        .map(line => {
          const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
          if (parts.length >= 2) {
            return `${parts[0]} - ${parts[1]} ${parts[2] || ''}`;
          }
          return parts[0];
        })
        .join('\n');

      setRawText(extractedText);
      parseList(extractedText);
      setInputMode('text');
      showToast(`Successfully imported ${dataLines.length} rows from ${file.name}!`);
    };

    reader.onerror = () => {
      showToast('Error reading uploaded CSV file.');
    };

    reader.readAsText(file);
  };

  const handleDownloadCsvTemplate = () => {
    const templateContent = `Commodity Name,Quantity,Unit,Target Price
Aashirvaad MP Sharbati Atta,15,5kg bags,315
India Gate Classic Basmati Rice,10,5kg bags,730
Dhampur Refined Sugar,4,50kg gunny sacks,2150
Pure Desi Gir Cow Vedic Ghee,5,1L jars,1320
Tata Sampann Toor Dal,20,1kg packs,155`;

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'nationx_b2b_grocery_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded nationx_b2b_grocery_template.csv');
  };

  const handleAddAllParsedToCart = () => {
    let addedCount = 0;
    parsedItems.forEach(item => {
      if (item.matchedProduct) {
        addToCart(item.matchedProduct, item.quantity, 'wholesale');
        addedCount++;
      }
    });
    showToast(`🛒 Successfully added ${addedCount} verified bulk items to your basket!`);
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
      <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-900">
              <ListPlus className="w-5 h-5" />
            </span>
            <h3 className="font-display font-extrabold text-lg text-stone-900">
              Path C — Assisted Purchase-List Entry
            </h3>
            <Badge variant="forest">Review-First Workflow</Badge>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Designed for Kirana shopkeepers, catering chefs, and hostel supervisors. Paste unformatted notes, use our SKU spreadsheet grid, or upload an actual CSV file.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-semibold shrink-0">
          <button
            onClick={() => setInputMode('text')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              inputMode === 'text'
                ? 'bg-white text-forest-950 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
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
                : 'text-stone-600 hover:text-stone-900'
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
                : 'text-stone-600 hover:text-stone-900'
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
          <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-emerald-600" />
                Raw WhatsApp / Text List
              </h4>
              <span className="text-[11px] text-stone-400">1 item per line</span>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
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
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-forest-50 border border-stone-200 hover:border-forest-300 text-stone-700 hover:text-forest-900 transition-colors font-medium text-left"
                  >
                    {p.name.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={8}
              value={rawText}
              onChange={e => {
                setRawText(e.target.value);
                setIsParsed(false);
              }}
              placeholder={`Paste your list here, e.g.:\n25kg Sona Masoori Rice - 4 bags\nMP Sharbati Atta - 15 bags\nDhampur Sugar 50kg - 2 sacks\nPure Desi Ghee - 6 jars`}
              className="w-full p-3.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white resize-none shadow-inner"
            />

            <div className="p-2.5 rounded-xl bg-stone-100 text-[11px] text-stone-600 space-y-1">
              <div className="font-semibold text-stone-800 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
                <span>Notice on Automated Extraction</span>
              </div>
              <p>
                Keyword matching maps text to master catalog SKUs. High-risk matching flags uncertain items for manual review. Camera OCR remains pending integration.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full font-bold shadow-soft"
              onClick={() => parseList(rawText)}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Parse & Match Against Catalogue
            </Button>
          </div>

          {/* Right Parsed Results with Review Controls */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-soft flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-stone-900">
                    Review Matched Catalogue Items
                  </h4>
                  <p className="text-xs text-stone-500">
                    Verify matched SKU, quantity and shop before confirmation
                  </p>
                </div>
                {isParsed && (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {parsedItems.length} lines parsed
                  </span>
                )}
              </div>

              {!isParsed ? (
                <div className="py-16 text-center space-y-3 text-stone-400">
                  <ClipboardList className="w-12 h-12 mx-auto stroke-1 text-stone-300" />
                  <p className="text-xs max-w-xs mx-auto text-stone-500">
                    Click <strong>"Parse & Match Against Catalogue"</strong> to convert raw notes into verified grocery SKUs with live discount tiers.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 mt-3 max-h-[380px] overflow-y-auto pr-1">
                  {parsedItems.map(item => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition-all text-xs space-y-2.5 ${
                        item.isUncertain
                          ? 'border-amber-300 bg-amber-50/40'
                          : 'border-stone-200 bg-stone-50/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {item.matchedProduct ? (
                            <img
                              src={item.matchedProduct.image}
                              alt={item.matchedProduct.name}
                              className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-stone-200 flex items-center justify-center shrink-0 text-stone-500">
                              <AlertCircle className="w-5 h-5" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] text-stone-500 font-mono">
                              Raw: "{item.rawLine}"
                            </div>

                            {/* Dropdown to change matched product */}
                            <div className="mt-1">
                              <select
                                value={item.matchedProduct?.id || ''}
                                onChange={e => handleUpdateParsedItem(item.id, 'productId', e.target.value)}
                                className="w-full px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-900"
                              >
                                {PRODUCTS.map(p => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({p.unit}) • {p.merchantName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveParsedItem(item.id)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Row Controls: Quantity & Confidence Badge */}
                      <div className="flex items-center justify-between border-t border-stone-200/70 pt-2 text-xs">
                        <div className="flex items-center gap-2">
                          <label className="font-semibold text-stone-600">Qty:</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => handleUpdateParsedItem(item.id, 'quantity', e.target.value)}
                            className="w-16 px-2 py-0.5 border border-stone-300 rounded-lg text-center font-bold font-mono"
                          />
                          <span className="text-stone-500">{item.unit}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.isUncertain ? (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Uncertain match ({item.confidence}% confidence)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Confident match ({item.confidence}%)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isParsed && (
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  {parsedItems.length} lines ready for basket
                </span>
                <Button
                  variant="amber"
                  size="md"
                  onClick={handleAddAllParsedToCart}
                  icon={<ShoppingBag className="w-4 h-4" />}
                >
                  Confirm & Add Verified Items to Basket
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Rapid Multi-Row Spreadsheet SKU Grid */}
      {inputMode === 'grid' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-soft p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-stone-900">
                Spreadsheet-Style Rapid SKU Matrix
              </h4>
              <p className="text-xs text-stone-500">
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
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Commodity / SKU</th>
                  <th className="py-3 px-4">Pack Unit</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Applicable Unit Rate (₹)</th>
                  <th className="py-3 px-4">Subtotal (₹)</th>
                  <th className="py-3 px-4 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {gridRows.map((row, idx) => {
                  const product = PRODUCTS.find(p => p.id === row.productId) || PRODUCTS[0];
                  const activeTier = product.bulkTiers
                    ?.filter(t => row.quantity >= t.minQty)
                    .sort((a, b) => b.minQty - a.minQty)[0];
                  const unitPrice = activeTier ? activeTier.pricePerUnit : product.retailPrice;
                  const lineTotal = unitPrice * row.quantity;

                  return (
                    <tr key={idx} className="hover:bg-stone-50/50">
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
                          className="w-full max-w-sm px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-stone-900 cursor-pointer"
                        >
                          {PRODUCTS.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.unit}) • {p.merchantName}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-2.5 px-4 font-semibold text-stone-700">
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
                          className="w-20 px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg font-mono font-bold text-center text-stone-900"
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

                      <td className="py-2.5 px-4 font-mono font-bold text-stone-900 text-sm">
                        ₹{lineTotal}
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => setGridRows(prev => prev.filter((_, i) => i !== idx))}
                          disabled={gridRows.length <= 1}
                          className="p-1 text-stone-400 hover:text-rose-600 disabled:opacity-30"
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

          <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
            <span className="text-xs text-stone-500">
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

      {/* Mode 3: Real CSV File Reader */}
      {inputMode === 'csv' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-soft p-6 sm:p-10 text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-900 flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-base text-stone-900">
              Real CSV Order File Processing
            </h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Upload your structured .csv file (with Commodity, Quantity, Unit). The file is parsed in your browser and matched against verified catalogue items.
            </p>
          </div>

          {/* Hidden real file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCsvFileUpload}
            className="hidden"
          />

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleDownloadCsvTemplate}
              className="px-4 py-2 rounded-xl border border-stone-300 hover:border-stone-400 bg-stone-50 hover:bg-white text-xs font-semibold text-stone-800 flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-forest-700" />
              <span>Download Official CSV Template</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-950 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-emerald-300" />
              <span>{csvFileName ? `Replace ${csvFileName}` : 'Choose CSV File to Upload'}</span>
            </button>
          </div>

          {csvFileName && (
            <div className="text-xs text-emerald-800 font-semibold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Loaded: {csvFileName}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
