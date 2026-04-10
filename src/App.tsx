import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight,
  LayoutGrid, 
  Calendar, 
  Home as HomeIcon,
  Package,
  Barcode,
  Tag,
  CheckCircle2,
  AlertCircle,
  Filter,
  Star,
  Heart
} from 'lucide-react';
import { RACKS_DATA, JADWAL } from './data';
import { Rack, Product } from './types';

type Screen = 'home' | 'denah' | 'jadwal' | 'detail-rak';
type RHPeriod = 'daily' | 'weekly' | 'monthly';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [history, setHistory] = useState<Screen[]>(['home']);
  const [selectedRack, setSelectedRack] = useState<Rack | null>(null);
  const [rhPeriod, setRhPeriod] = useState<RHPeriod>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [letterFilter, setLetterFilter] = useState('all');
  const [specificRackId, setSpecificRackId] = useState<string | null>(null);
  const [expandedLetter, setExpandedLetter] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hargaFilter, setHargaFilter] = useState('all');
  const [rapiFilter, setRapiFilter] = useState('all');
  const [itemsToShow, setItemsToShow] = useState(18);
  const [denahCategory, setDenahCategory] = useState('all');
  const [selectedDenahRack, setSelectedDenahRack] = useState<Rack | null>(null);

  const navigateTo = (screen: Screen, data?: Rack) => {
    if (data) setSelectedRack(data);
    setCurrentScreen(screen);
    setHistory(prev => [...prev, screen]);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const prev = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentScreen(prev);
    } else {
      setCurrentScreen('home');
      setHistory(['home']);
    }
  };

  const filteredRacks = useMemo(() => {
    let filtered = [...RACKS_DATA];
    const search = searchQuery.trim().toLowerCase();

    if (search) {
      filtered = filtered.filter(r => 
        r.id.toLowerCase().includes(search) ||
        r.products.some(p => p.name.toLowerCase().includes(search) || p.barcode.includes(search))
      );
    }

    if (statusFilter !== 'all') filtered = filtered.filter(r => r.status === statusFilter);
    if (categoryFilter !== 'all') filtered = filtered.filter(r => r.category === categoryFilter);
    
    if (specificRackId) {
      filtered = filtered.filter(r => r.id === specificRackId);
    } else if (letterFilter !== 'all') {
      filtered = filtered.filter(r => r.id.toUpperCase().startsWith(letterFilter));
    }

    if (hargaFilter !== 'all') filtered = filtered.filter(r => r.harga === (hargaFilter === 'true'));
    if (rapiFilter !== 'all') filtered = filtered.filter(r => r.rapi === (rapiFilter === 'true'));

    return filtered;
  }, [searchQuery, statusFilter, categoryFilter, specificRackId, letterFilter, hargaFilter, rapiFilter]);

  const filteredProducts = useMemo(() => {
    const products: (Product & { rackId: string, rackColor: string, rack: Rack })[] = [];
    filteredRacks.forEach(rack => {
      rack.products.forEach(product => {
        // Apply search filter to products if search query exists
        const search = searchQuery.trim().toLowerCase();
        if (!search || product.name.toLowerCase().includes(search) || product.barcode.includes(search) || rack.id.toLowerCase().includes(search)) {
          products.push({ ...product, rackId: rack.id, rackColor: rack.color, rack });
        }
      });
    });
    return products;
  }, [filteredRacks, searchQuery]);

  const paginatedProducts = filteredProducts.slice(0, itemsToShow * 2);
  const problemCount = RACKS_DATA.filter(r => r.status === 'warn' || r.status === 'danger').length;

  const availableLetters = useMemo(() => {
    const letters = new Set(RACKS_DATA.map(r => r.id.charAt(0).toUpperCase()));
    return Array.from(letters).sort();
  }, []);

  const getRHValue = (rack: Rack, period: RHPeriod) => {
    if (!rack.rhHistory) return 0;
    return rack.rhHistory[period];
  };

  const highlightText = (text: string, search: string) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() ? 
            <span key={i} className="search-highlight">{part}</span> : part
        )}
      </span>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg max-w-md mx-auto shadow-2xl overflow-hidden relative font-sans">
      <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        <AnimatePresence mode="wait">
          {currentScreen === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-3"
            >
              {/* Search & Filter Section */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1 bg-surface rounded-[24px] p-1 pl-4 flex items-center gap-2 shadow-sm border border-border-custom focus-within:border-gold transition-all">
                  <Search className="w-4 h-4 text-text-muted" />
                  <input 
                    type="text" 
                    placeholder="Cari rak atau produk..." 
                    className="flex-1 py-2 bg-transparent outline-none text-text-main text-sm font-medium placeholder:text-text-muted placeholder:font-normal"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="bg-card2 rounded-full w-7 h-7 flex items-center justify-center text-text-muted">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => setIsFilterOpen(true)}
                  className={`w-11 h-11 rounded-[20px] flex items-center justify-center border transition-all ${
                    statusFilter !== 'all' || categoryFilter !== 'all' || letterFilter !== 'all'
                    ? 'bg-gold border-gold text-white shadow-lg' 
                    : 'bg-surface border-border-custom text-text-main shadow-sm'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Status Bar */}
              <div className="overflow-x-auto flex gap-2 pb-3 scrollbar-hide mb-4">
                {[
                  { label: 'Semua', status: 'all' },
                  { label: 'Prioritas', status: 'danger' },
                  { label: 'Perlu Cek', status: 'warn' },
                  { label: 'Penuh', status: 'full' },
                ].map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setStatusFilter(f.status)}
                    className={`px-2.5 py-1 rounded-full text-[9px] font-black whitespace-nowrap border transition-all uppercase tracking-wider ${
                      statusFilter === f.status 
                      ? 'bg-gold border-gold text-white shadow-md' 
                      : 'bg-card2 border-border-custom text-text-dim'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-start mb-4 px-1">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-lg font-sans font-black text-text-main tracking-tight uppercase">
                      {specificRackId ? specificRackId : 'PLANOGRAM'}
                    </h1>
                    {specificRackId && (
                      <div className="flex gap-1">
                        {RACKS_DATA.find(r => r.id === specificRackId)?.harga && (
                          <div className="flex items-center gap-0.5 bg-green-500/10 text-green-500 px-1 py-0.5 rounded text-[7px] font-black border border-green-500/20">
                            <CheckCircle2 className="w-2 h-2" />
                            HARGA
                          </div>
                        )}
                        {RACKS_DATA.find(r => r.id === specificRackId)?.rapi && (
                          <div className="flex items-center gap-0.5 bg-blue-500/10 text-blue-500 px-1 py-0.5 rounded text-[7px] font-black border border-blue-500/20">
                            <CheckCircle2 className="w-2 h-2" />
                            RAPI
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {specificRackId && (
                    <>
                      <div className="text-[10px] font-bold text-text-main mb-0.5">
                        Rak {specificRackId} · Planogram Utama
                      </div>
                      <div className="text-[9px] font-medium text-text-dim flex items-center gap-1">
                        Geser produk untuk melihat detail lokasi
                      </div>
                    </>
                  )}
                </div>
                <div className="text-[8px] font-bold text-text-dim bg-card2 px-2 py-0.5 rounded-full border border-border-custom mt-1">
                  {specificRackId ? `${filteredProducts.length} ITEM` : `${filteredRacks.length} RAK`}
                </div>
              </div>

              {specificRackId ? (
                /* Product Grid View (When a specific rack is selected) */
                <div className="grid grid-cols-2 gap-3 pb-8">
                  {paginatedProducts.map((product, idx) => (
                    <motion.div 
                      key={`${product.rackId}-${product.barcode}-${idx}`}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => navigateTo('detail-rak', product.rack)}
                      className="bg-white rounded-[16px] overflow-hidden border border-border-custom relative cursor-pointer flex flex-col active:scale-95 transition-all"
                    >
                      {/* Product Image */}
                      <div className="aspect-square flex items-center justify-center relative">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Product Details Grid */}
                      <div className="p-2 bg-white border-t border-border-custom space-y-1">
                        <div className="text-[7px] font-black text-text-main uppercase truncate mb-1">
                          {product.description}
                        </div>
                        <div className="flex justify-between items-center border-t border-border-custom/50 pt-1">
                          <span className="text-[6px] font-bold text-text-dim uppercase tracking-tighter">PLU</span>
                          <span className="text-[7px] font-bold text-text-main">{product.plu}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[6px] font-bold text-text-dim uppercase tracking-tighter">Barcode</span>
                          <span className="text-[7px] font-bold text-text-main">{product.barcode}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* Rack List View (General Browsing) */
                <div className="grid grid-cols-2 gap-3 pb-8">
                  {filteredRacks.slice(0, itemsToShow).map((rack) => (
                    <motion.div 
                      key={rack.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-surface rounded-[16px] border border-border-custom overflow-hidden shadow-sm transition-all flex flex-col"
                    >
                      {/* Rack Header Section - Clickable */}
                      <div 
                        onClick={() => navigateTo('detail-rak', rack)}
                        className="p-2.5 border-b border-border-custom cursor-pointer active:bg-surface-alt transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-base font-black text-text-main uppercase tracking-tight">{rack.id}</div>
                            <div className="flex gap-1">
                              {rack.harga && (
                                <div className="bg-green-500 w-2 h-2 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]" title="HARGA" />
                              )}
                              {rack.rapi && (
                                <div className="bg-blue-500 w-2 h-2 rounded-full shadow-[0_0_5px_rgba(59,130,246,0.5)]" title="RAPI" />
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-3 h-3 text-text-dim" />
                        </div>
                      </div>

                      {/* Top Colored Section - Swipeable Products */}
                      <div className="relative group flex-1">
                        <div 
                          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide touch-pan-x h-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {rack.products.map((product, idx) => (
                            <div key={idx} className="w-full flex-shrink-0 snap-center p-2">
                              <div className="mb-1.5 px-1">
                                <div className="text-[9px] font-bold text-text-main leading-tight">
                                  Shelving {product.shelving} · Baris {product.baris}
                                </div>
                                <div className="text-[8px] font-bold text-red-500">
                                  RH {product.baseRH} hari
                                </div>
                              </div>
                              <div 
                                className="bg-white rounded-[12px] overflow-hidden border border-border-custom relative aspect-square flex flex-col shadow-sm"
                              >
                                {/* Product Image */}
                                <div className="flex-1 flex items-center justify-center">
                                  <img 
                                    src={product.image} 
                                    alt={product.name}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                              {/* Product Details - Clickable */}
                              <div 
                                onClick={() => navigateTo('detail-rak', rack)}
                                className="mt-2 px-1 space-y-1 cursor-pointer"
                              >
                                <div className="text-[8px] font-black text-text-main uppercase truncate leading-none">
                                  {product.description}
                                </div>
                                <div className="flex justify-between items-center border-t border-border-custom/30 pt-1">
                                  <span className="text-[7px] font-bold text-text-dim uppercase">PLU</span>
                                  <span className="text-[8px] font-black text-text-main">{product.plu}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[7px] font-bold text-text-dim uppercase">Barcode</span>
                                  <span className="text-[8px] font-black text-text-main">{product.barcode}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="px-2.5 pb-2.5 mt-1 border-t border-border-custom/30 pt-2">
                        <div className="text-[7px] font-black text-text-dim uppercase mb-1.5 tracking-tighter">Barcode Visual</div>
                        <div className="flex gap-[1px] h-4 items-stretch overflow-hidden bg-white/50 p-1 rounded-sm border border-border-custom/30">
                          {Array.from({ length: 50 }).map((_, i) => (
                            <div 
                              key={i} 
                              className="bg-black/90" 
                              style={{ 
                                width: `${[1, 1, 2, 1, 1, 3, 1, 2][i % 8]}px`,
                                opacity: (i % 9 === 0) ? 0 : 1
                              }} 
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {specificRackId && filteredProducts.length > paginatedProducts.length && (
                <button 
                  onClick={() => setItemsToShow(prev => prev + 12)}
                  className="w-full py-4 bg-card2 border border-border-custom text-text-main rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all mb-8"
                >
                  Muat Lebih Banyak Produk
                </button>
              )}

              {!specificRackId && filteredRacks.length > itemsToShow && (
                <button 
                  onClick={() => setItemsToShow(prev => prev + 12)}
                  className="w-full py-4 bg-card2 border border-border-custom text-text-main rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all mb-8"
                >
                  Muat Lebih Banyak Rak
                </button>
              )}

              {filteredRacks.length === 0 && (
                <div className="py-20 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <div className="text-text-muted font-medium">Tidak ada rak yang cocok</div>
                  <button 
                    onClick={() => { setSearchQuery(''); setStatusFilter('all'); setCategoryFilter('all'); }}
                    className="mt-4 text-gold font-bold text-sm underline"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {currentScreen === 'denah' && (
            <motion.div 
              key="denah"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="p-3"
            >
              <header className="flex items-center gap-3 mb-6">
                <button onClick={goBack} className="w-9 h-9 bg-surface rounded-full flex items-center justify-center border border-border-custom text-gold shadow-sm">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-bold text-text-main">Denah Toko</h1>
              </header>

              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {['all', 'Makanan', 'Chiller', 'Gondola', 'Dinding'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setDenahCategory(cat)}
                    className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                      denahCategory === cat 
                      ? 'bg-gold border-gold text-white shadow-md' 
                      : 'bg-card2 border-border-custom text-text-dim'
                    }`}
                  >
                    {cat === 'all' ? 'Semua' : cat}
                  </button>
                ))}
              </div>

              <div className="bg-surface rounded-3xl border border-border-custom p-2 shadow-sm overflow-x-auto scrollbar-hide">
                <div className="min-w-[800px]">
                  {/* Top Header Row */}
                  <div className="flex gap-1 mb-1">
                    <div className="flex-1 min-w-[40px] aspect-square flex flex-col items-center justify-center text-[7px] font-bold text-text-muted bg-card2 rounded-lg border border-dashed border-border-custom">
                      <div className="w-3 h-3 border-t-2 border-r-2 border-gold rotate-[-45deg] mb-0.5" />
                      UTARA
                    </div>
                    {["IA5", "HA1", "HA2", "HA3", "HA4", "HA5", "HA6", "HA7", "HA8", "HB1", "VJT", "VLT", "ZHH"].map(id => {
                      const rack = RACKS_DATA.find(r => r.id === id);
                      const isSelected = selectedDenahRack?.id === id;
                      return (
                        <button 
                          key={id} 
                          onClick={() => rack && setSelectedDenahRack(rack)}
                          className={`flex-1 min-w-[40px] aspect-square flex items-center justify-center text-[9px] font-bold transition-all rounded-lg relative ${
                            isSelected ? 'ring-2 ring-gold scale-105 z-10' : ''
                          } ${rack ? '' : 'text-text-muted bg-card2'}`}
                          style={{ backgroundColor: rack ? rack.color : undefined }}
                        >
                          {id}
                          {rack?.status === 'danger' && (
                            <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Main Grid Rows */}
                  {[
                    { left: "IA4", items: ["LA1", "IB1", "OB1", "NA3", "NA2", "NA1", "LA2", "LA3", "LE1", "LF2", "", ""], right: "VJ1" },
                    { left: "IA3", items: ["LF1", "LB2", "LB1", "LD1", "LD2", "LC1", "LC2", "LC3", "OA1", "OA2", "", ""], right: "VI1" },
                    { left: "IA2", items: ["JD3", "JD2", "JD1", "KA2", "KA1", "UAI", "MA1", "", "", "", "", ""], right: "VF2" },
                    { left: "IA1", items: ["JC1", "JC2", "JB1", "JB2", "JB3", "UA2", "PA1", "", "", "", "", ""], right: "VF1" },
                    { left: "JA1", items: ["ZI4", "ZI1", "ZI3", "ZI2", "ZL1", "ZK1", "ZK2", "", "", "", "", ""], right: "VD1" },
                    { left: "SA3", items: ["EA1", "IC2", "IC1", "RA1", "OD2", "OD1", "TA2", "TA1", "ID1", "ZM1", "", ""], right: "VB4" },
                    { left: "SA2", items: ["EA2", "EA3", "EA4", "EA5", "GA3", "GA2", "GA1", "", "", "", "", ""], right: "VB3" },
                    { left: "SA1", items: ["BA3", "BA2", "BA1", "FB1", "FA3", "FA2", "FA1", "FC1", "", "", "", ""], right: "VB2" },
                    { left: "AA5", items: ["DA1", "DA2", "DA3", "CB1", "CA1", "CA2", "CA3", "", "", "", "", ""], right: "VB1" },
                    { left: "AA4", items: ["AKA", "AK0", "AK9", "AK8", "AK7", "AK6", "AK5", "AK4", "", "", "", ""], right: "YB1" },
                    { left: "AA3", items: ["AK3", "AK2", "AK1", "YA4", "YA3", "YA2", "YA1", "YN1", "", "", "", ""], right: "YB2" },
                    { left: "AA2", items: ["YH1", "YI1", "YJ1", "YL1", "YL2", "YL3", "YL4", "", "", "", "", ""], right: "YG1" },
                    { left: "AA1", items: ["YL5", "YL6", "YM1", "YN2", "YO1", "YO2", "", "", "", "", "", ""], right: "YG2" },
                  ].map((row, i) => (
                    <div key={i} className="flex gap-1 mb-1">
                      {/* Left Header */}
                      <button 
                        onClick={() => {
                          const rack = RACKS_DATA.find(r => r.id === row.left);
                          rack && setSelectedDenahRack(rack);
                        }}
                        className={`flex-1 min-w-[40px] aspect-square flex items-center justify-center text-[9px] font-bold transition-all rounded-lg relative ${
                          selectedDenahRack?.id === row.left ? 'ring-2 ring-gold scale-105 z-10' : ''
                        } ${RACKS_DATA.find(r => r.id === row.left) ? '' : 'text-text-muted bg-card2'}`}
                        style={{ backgroundColor: RACKS_DATA.find(r => r.id === row.left)?.color }}
                      >
                        {row.left}
                        {RACKS_DATA.find(r => r.id === row.left)?.status === 'danger' && (
                          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
                        )}
                      </button>
                      
                      {/* Grid Items */}
                      {row.items.map((id, j) => {
                        const rack = RACKS_DATA.find(r => r.id === id);
                        const isVisible = id === "" || denahCategory === 'all' || (rack && rack.category === denahCategory);
                        const isSelected = selectedDenahRack?.id === id;
                        
                        return (
                          <button
                            key={j}
                            onClick={() => rack && setSelectedDenahRack(rack)}
                            disabled={!id}
                            className={`flex-1 min-w-[40px] aspect-square rounded-lg flex items-center justify-center text-[8px] font-bold transition-all relative ${
                              !id ? 'bg-gray-50' : ''
                            } ${isVisible ? '' : 'opacity-20 grayscale'} ${isSelected ? 'ring-2 ring-gold scale-105 z-10' : ''}`}
                            style={{ 
                              backgroundColor: rack ? rack.color : undefined
                            }}
                          >
                            {id}
                            {rack?.status === 'danger' && (
                              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
                            )}
                          </button>
                        );
                      })}

                      {/* Right Header */}
                      <button 
                        onClick={() => {
                          const rack = RACKS_DATA.find(r => r.id === row.right);
                          rack && setSelectedDenahRack(rack);
                        }}
                        className={`flex-1 min-w-[40px] aspect-square flex items-center justify-center text-[9px] font-bold transition-all rounded-lg relative ${
                          selectedDenahRack?.id === row.right ? 'ring-2 ring-gold scale-105 z-10' : ''
                        } ${RACKS_DATA.find(r => r.id === row.right) ? '' : 'text-text-muted bg-card2'}`}
                        style={{ backgroundColor: RACKS_DATA.find(r => r.id === row.right)?.color }}
                      >
                        {row.right}
                        {RACKS_DATA.find(r => r.id === row.right)?.status === 'danger' && (
                          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {selectedDenahRack ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-6 bg-surface rounded-3xl p-5 border border-border-custom shadow-lg"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-xl font-bold text-text-main">Rak {selectedDenahRack.id}</div>
                        <div className="text-sm text-text-dim">{selectedDenahRack.product.name}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold`} style={{ backgroundColor: `${selectedDenahRack.color}20`, color: selectedDenahRack.color }}>
                        {selectedDenahRack.label}
                      </div>
                    </div>
                    <div className="flex gap-4">
                    <div className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold ${selectedRack.harga ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                      {selectedRack.harga ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      Harga {selectedRack.harga ? 'Sesuai' : 'Salah'}
                    </div>
                    <div className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold ${selectedRack.rapi ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                      {selectedRack.rapi ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {selectedRack.rapi ? 'Rapi' : 'Berantakan'}
                    </div>
                  </div>

                  <div className="flex gap-2">
                      <button 
                        onClick={() => navigateTo('detail-rak', selectedDenahRack)}
                        className="flex-1 py-3 bg-gold text-white rounded-full font-bold text-sm shadow-md active:scale-95 transition-all"
                      >
                        Detail Rak
                      </button>
                      <button 
                        onClick={() => alert('Ditambahkan ke jadwal')}
                        className="flex-1 py-3 bg-card2 border border-border-custom text-text-dim rounded-full font-bold text-sm active:scale-95 transition-all"
                      >
                        Jadwalkan
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="mt-10 text-center text-text-muted font-medium">
                    Ketuk rak untuk melihat ringkasan
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {currentScreen === 'jadwal' && (
            <motion.div 
              key="jadwal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-3"
            >
              <header className="flex items-center gap-3 mb-8">
                <button onClick={goBack} className="w-9 h-9 bg-surface rounded-full flex items-center justify-center border border-border-custom text-gold shadow-sm">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-bold text-text-main">Jadwal Hari Ini</h1>
              </header>

              <div className="space-y-4 relative before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border-custom">
                {JADWAL.map((task, i) => (
                  <div key={i} className="flex gap-3 items-start relative z-10">
                    <div className="text-[10px] font-bold text-text-muted pt-2 w-10 text-right">{task.time}</div>
                    <div className={`w-3 h-3 rounded-full mt-2.5 border-2 border-white shadow-sm ${
                      task.status === 'done' ? 'bg-green-500' : task.status === 'active' ? 'bg-gold' : 'bg-gray-300'
                    }`} />
                    <div className={`flex-1 bg-surface p-3 rounded-xl border border-border-custom shadow-sm ${
                      task.status === 'done' ? 'opacity-60' : ''
                    }`}>
                      <div className={`font-bold text-xs mb-0.5 ${task.status === 'done' ? 'line-through text-text-muted' : 'text-text-main'}`}>
                        {task.title}
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
                        {task.status === 'done' ? 'Selesai' : task.status === 'active' ? 'Sedang Berjalan' : 'Menunggu'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {currentScreen === 'detail-rak' && selectedRack && (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="pb-10"
            >
              <header className="flex items-center justify-between p-3 sticky top-0 bg-bg z-10 border-b border-border-custom">
                <div className="flex items-center gap-3">
                  <button onClick={goBack} className="w-9 h-9 bg-surface rounded-full flex items-center justify-center border border-border-custom text-gold shadow-sm">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h1 className="text-lg font-black text-text-main uppercase tracking-tight">PLANOGRAM RAK {selectedRack.id}</h1>
                </div>
                <div className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black border border-blue-100">
                  {selectedRack.category === 'Makanan' ? 'Makanan' : 'Non-Makanan'}
                </div>
              </header>

              <div className="p-3 space-y-4">
                {/* Product Slider (Planogram Style) */}
                <div className="bg-surface rounded-[24px] border border-border-custom overflow-hidden shadow-sm">
                  <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide touch-pan-x">
                    {selectedRack.products.map((product, idx) => (
                      <div key={idx} className="w-full flex-shrink-0 snap-center p-2">
                        <div className="bg-[#2D2D35] rounded-[20px] overflow-hidden shadow-2xl relative aspect-[4/5] flex flex-col">
                          {/* Product Info Overlay */}
                          <div className="p-4 z-10">
                            <div className="text-white font-black text-base uppercase tracking-tight mb-0.5">{product.name}</div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-orange-400">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="text-xs font-bold text-white/90">{product.rating}</span>
                              </div>
                            </div>
                          </div>

                          {/* Product Image */}
                          <div className="flex-1 flex items-center justify-center p-4">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain drop-shadow-2xl"
                            />
                          </div>

                          {/* Footer */}
                          <div className="p-4 flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-1.5 text-white/70">
                              <Heart className="w-4 h-4" />
                              <span className="text-xs font-bold">{product.likes}</span>
                            </div>
                            <div className="text-[10px] font-black text-gold bg-gold/10 px-2 py-1 rounded-lg border border-gold/20">
                              PLU: {product.barcode.slice(-4)}
                            </div>
                          </div>

                          {/* Dots */}
                          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                            {selectedRack.products.map((_, pIdx) => (
                              <div key={pIdx} className={`w-1 h-1 rounded-full transition-all ${idx === pIdx ? 'bg-gold w-3' : 'bg-white/20'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black border ${selectedRack.harga ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {selectedRack.harga ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    <span className="text-[9px] uppercase tracking-wider">Harga</span>
                  </div>
                  <div className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black border ${selectedRack.rapi ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {selectedRack.rapi ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    <span className="text-[9px] uppercase tracking-wider">Kerapian</span>
                  </div>
                </div>

                  {/* Realistic Shelving Structure */}
                  <div className="space-y-2 mb-6">
                    <div className="text-[9px] font-black text-text-dim uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <LayoutGrid className="w-2.5 h-2.5" />
                      Struktur Selving & Baris
                    </div>
                    <div className="flex flex-col-reverse gap-2">
                      {selectedRack.shelfData.map((count, i) => {
                        const capacityPerShelf = Math.ceil(selectedRack.slots / selectedRack.shelfData.length);
                        const fillPercentage = (count / capacityPerShelf) * 100;
                        
                        return (
                          <div key={i} className="group">
                            <div className="flex justify-between items-end mb-1 px-1">
                              <span className="text-[8px] font-black text-text-dim uppercase">Lantai {i + 1}</span>
                              <span className="text-[8px] font-bold text-gold">{count} / {capacityPerShelf} Unit</span>
                            </div>
                            <div className="h-3 bg-surface-alt rounded-md border border-border-custom relative overflow-hidden shadow-inner">
                              {/* Shelf Base Line */}
                              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-border-custom opacity-50" />
                              
                              {/* Fill Indicator */}
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${fillPercentage}%` }}
                                className="h-full relative"
                                style={{ 
                                  backgroundColor: `${selectedRack.color}30`,
                                  borderRight: `2px solid ${selectedRack.color}`
                                }}
                              >
                                {/* Pattern for products */}
                                <div className="absolute inset-0 opacity-20" style={{ 
                                  backgroundImage: `linear-gradient(90deg, transparent 90%, ${selectedRack.color} 90%)`,
                                  backgroundSize: `${100 / capacityPerShelf}% 100%`
                                }} />
                              </motion.div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pt-2 text-center">
                      <div className="inline-block px-3 py-1 bg-surface-alt rounded-full border border-border-custom text-[8px] font-black text-text-dim uppercase tracking-widest">
                        Tampilan Depan (Front View)
                      </div>
                    </div>
                  </div>

                <div className="bg-surface rounded-3xl p-5 border border-border-custom shadow-sm space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border-custom">
                    <div className="flex items-center gap-2 text-sm text-text-dim"><Package className="w-4 h-4" /> Produk Utama</div>
                    <div className="text-sm font-bold text-text-main">{selectedRack.products[0].name}</div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border-custom">
                    <div className="flex items-center gap-2 text-sm text-text-dim"><Barcode className="w-4 h-4" /> Barcode Utama</div>
                    <div className="text-sm font-mono text-text-main">{selectedRack.products[0].barcode}</div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border-custom">
                    <div className="flex items-center gap-2 text-sm text-text-dim"><Tag className="w-4 h-4" /> Harga Utama</div>
                    <div className="text-sm font-bold text-text-main">{selectedRack.products[0].price}</div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border-custom">
                    <div className="flex items-center gap-2 text-sm text-text-dim"><LayoutGrid className="w-4 h-4" /> Kapasitas</div>
                    <div className="text-sm font-bold text-text-main">{selectedRack.filled}/{selectedRack.slots} Unit</div>
                  </div>
                </div>

                <div className="bg-surface rounded-3xl p-5 border border-border-custom shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-bold text-text-main">Reorder History (RH)</div>
                    <div className="flex bg-card2 rounded-full p-1 border border-border-custom gap-1">
                      {(['daily', 'weekly', 'monthly'] as RHPeriod[]).map((p) => (
                        <button
                          key={p}
                          onClick={() => setRhPeriod(p)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                            rhPeriod === p ? 'bg-gold text-white' : 'text-text-muted'
                          }`}
                        >
                          {p === 'daily' ? '1H' : p === 'weekly' ? '7H' : '30H'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gold mb-1">{getRHValue(selectedRack, rhPeriod)} unit</div>
                  <div className="text-[11px] text-text-muted font-medium">
                    Total permintaan dalam {rhPeriod === 'daily' ? 'hari ini' : rhPeriod === 'weekly' ? '7 hari terakhir' : '30 hari terakhir'}
                  </div>
                </div>

                <div className="bg-surface rounded-3xl p-5 border border-border-custom shadow-sm">
                  <div className="text-lg font-bold text-text-main mb-4">{selectedRack.filled}/{selectedRack.slots} Slot Terisi</div>
                  <div className="h-3 bg-card2 rounded-full overflow-hidden mb-6">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${(selectedRack.filled / selectedRack.slots) * 100}%`, backgroundColor: selectedRack.color }}
                    />
                  </div>
                  <button 
                    onClick={() => alert('Ditambahkan ke jadwal')}
                    className="w-full py-4 bg-gold text-white rounded-full font-bold text-base shadow-lg active:scale-95 transition-all"
                  >
                    Tambah ke Jadwal
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Sheet Filter */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-surface rounded-t-[24px] z-50 p-4 pb-6 shadow-2xl border-t border-border-custom"
            >
              <div className="w-8 h-1 bg-border-custom/40 rounded-full mx-auto mb-5" />
              
              <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-base font-black text-text-main uppercase tracking-tight">Pilih Rak</h2>
                <button 
                  onClick={() => { 
                    setStatusFilter('all'); 
                    setCategoryFilter('all'); 
                    setLetterFilter('all'); 
                    setSpecificRackId(null);
                    setExpandedLetter(null);
                  }}
                  className="text-gold font-bold text-[9px] uppercase tracking-widest bg-gold/5 px-2.5 py-1 rounded-full active:opacity-70 transition-all"
                >
                  Reset
                </button>
              </div>

              <div className="space-y-4">
                {/* Letter Filter with Toggle */}
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-hide">
                  <div className="text-[8px] font-black text-text-dim uppercase tracking-widest mb-1 px-1">Zona (Abjad)</div>
                  
                  <button
                    onClick={() => {
                      setLetterFilter('all');
                      setSpecificRackId(null);
                      setExpandedLetter(null);
                    }}
                    className={`w-full py-1.5 px-3 rounded-lg text-[9px] font-bold border transition-all text-left ${
                      letterFilter === 'all' 
                      ? 'bg-gold border-gold text-white shadow-sm' 
                      : 'bg-card2 border-border-custom text-text-dim'
                    }`}
                  >
                    SEMUA ZONA
                  </button>

                  {availableLetters.map((letter) => (
                    <div key={letter} className="space-y-1">
                      <button
                        onClick={() => setExpandedLetter(expandedLetter === letter ? null : letter)}
                        className={`w-full py-1.5 px-3 rounded-lg text-[10px] font-black border flex justify-between items-center transition-all ${
                          letterFilter === letter 
                          ? 'bg-gold/5 border-gold/20 text-gold' 
                          : 'bg-card2 border-border-custom text-text-dim'
                        }`}
                      >
                        <span>ZONA {letter}</span>
                        <ChevronRight className={`w-3 h-3 transition-transform ${expandedLetter === letter ? 'rotate-90' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {expandedLetter === letter && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="grid grid-cols-4 gap-1 px-0.5 overflow-hidden pb-1"
                          >
                            <button
                              onClick={() => {
                                setLetterFilter(letter);
                                setSpecificRackId(null);
                                setSearchQuery('');
                                setIsFilterOpen(false);
                              }}
                              className={`col-span-4 py-1.5 rounded-md text-[8px] font-black border transition-all uppercase tracking-widest ${
                                letterFilter === letter && !specificRackId
                                ? 'bg-gold text-white border-gold' 
                                : 'bg-surface-alt border-border-custom text-text-dim'
                              }`}
                            >
                              Semua {letter}
                            </button>
                            {RACKS_DATA.filter(r => r.id.toUpperCase().startsWith(letter))
                              .sort((a, b) => a.id.localeCompare(b.id))
                              .map(r => (
                                <button
                                  key={r.id}
                                  onClick={() => {
                                    setSpecificRackId(r.id);
                                    setLetterFilter(letter);
                                    setSearchQuery('');
                                    setIsFilterOpen(false);
                                  }}
                                  className={`py-1.5 rounded-md text-[8px] font-bold border transition-all ${
                                    specificRackId === r.id 
                                    ? 'bg-gold border-gold text-white shadow-sm' 
                                    : 'bg-surface border-border-custom text-text-muted'
                                  }`}
                                >
                                  {r.id}
                                </button>
                              ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                <div className="pt-1">
                  <div className="text-[8px] font-black text-text-dim uppercase tracking-widest mb-2 px-1">Status</div>
                  <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                    {[
                      { id: 'danger', label: 'Prioritas' },
                      { id: 'warn', label: 'Cek' },
                      { id: 'full', label: 'Penuh' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStatusFilter(statusFilter === s.id ? 'all' : s.id as any)}
                        className={`py-1.5 px-3 rounded-full text-[8px] font-black border transition-all whitespace-nowrap ${
                          statusFilter === s.id 
                          ? 'bg-gold border-gold text-white' 
                          : 'bg-card2 border-border-custom text-text-dim'
                        }`}
                      >
                        {s.label.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-3 bg-text-main text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all"
                >
                  Lihat {filteredRacks.length} Rak
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-surface border-t border-border-custom px-4 pt-1.5 pb-6 z-20">
        <div className="bg-card2 rounded-[20px] p-1 flex gap-1 border border-border-custom">
          {[
            { id: 'home', label: 'Home', icon: HomeIcon },
            { id: 'denah', label: 'Denah', icon: LayoutGrid },
            { id: 'jadwal', label: 'Jadwal', icon: Calendar },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id || (currentScreen === 'detail-rak' && item.id === 'home');
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id as Screen)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-[16px] transition-all ${
                  isActive ? 'bg-surface text-gold shadow-sm' : 'text-text-muted'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                <span className="text-[9px] font-bold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
