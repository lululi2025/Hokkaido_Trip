import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import {
  MapPin, Clock, Calendar, Navigation, Info, ExternalLink,
  Coffee, Train, Camera, Utensils, Bed, ShoppingBag, Palmtree, Castle, Plane,
  ChevronDown, BookOpen, Map, ArrowUp, ArrowDown, GripVertical, Youtube, Globe,
  Trash2, CalendarDays, AlertTriangle, Footprints, ShieldAlert, Wallet, TrainFront, Plug, Lightbulb, CreditCard, Ticket, Sun, Gift,
  Store, Droplets, Fish, Sparkles, Gem, PaintBucket, ReceiptText, Plus, PieChart, Car,
  Snowflake, Shield, Heart, CameraOff, Moon, CloudSnow, AlertCircle, BaggageClaim, Pill, Package, Droplet, List, Leaf, Wine
} from 'lucide-react';
import { TRIP_TITLE, TRIP_DATES, INITIAL_ITINERARY, SURVIVAL_GUIDES, SHOPPING_ITEMS } from './data.js';

const FIREBASE_APP_ID = "hokkaido-spring-pro-2026"; 

const firebaseConfig = {
  apiKey: "AIzaSyBFjpqbRYv3uPq8_IXbtkdcohNPnMyKKS0",
  authDomain: "trip-app-4d33c.firebaseapp.com",
  projectId: "trip-app-4d33c",
  storageBucket: "trip-app-4d33c.firebasestorage.app",
  messagingSenderId: "996431488972",
  appId: "1:996431488972:web:193f674d463d50a82cdf69",
  measurementId: "G-H3G5B2X1Y2"
};

// =========================================================================
// ⬇️ 以下為系統核心程式碼
// =========================================================================

// Lucide icon fallback logic
const Flame = AlertTriangle; 

let app, auth, db;
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error('Firebase error:', error);
  }
}

// --- 路線地圖組件 (移除了北廣島，讓軌跡平滑指向千歲) ---
const RouteMap = () => {
  const points = [
    { id: 'hakodate', name: '函館', sub: 'D1-D2', x: 20, y: 88, align: 'start', ox: 3, oy: 1 },
    { id: 'onuma', name: '大沼', sub: 'D3', x: 22, y: 75, align: 'start', ox: 3, oy: 1 },
    { id: 'toya', name: '洞爺湖', sub: 'D3-D4', x: 42, y: 62, align: 'end', ox: -3, oy: 1 },
    { id: 'noboribetsu', name: '登別', sub: 'D4', x: 56, y: 68, align: 'start', ox: 3, oy: 1 },
    { id: 'otaru', name: '小樽', sub: 'D5', x: 48, y: 30, align: 'end', ox: -3, oy: 1 },
    { id: 'sapporo', name: '札幌', sub: 'D5-D8', x: 65, y: 35, align: 'start', ox: 3, oy: 1 },
    { id: 'chitose', name: '新千歲', sub: 'D8', x: 76, y: 55, align: 'start', ox: 3, oy: 1 }
  ];

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 h-[400px] lg:h-[600px] relative overflow-hidden flex flex-col group">
      <div className="absolute top-4 left-5 z-20">
        <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2 drop-shadow-sm">
          <Navigation size={18} className="text-blue-500" /> 移動軌跡地圖
        </h4>
        <p className="text-xs text-gray-500 font-medium">8天7夜 道南 ➝ 道央 總路線</p>
      </div>

      <div className="absolute top-4 right-5 z-20 opacity-50 pointer-events-none">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="#3b82f6" stroke="none"></polygon>
        </svg>
      </div>

      <div className="absolute inset-0 bg-blue-50/30"></div>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(59, 130, 246, 0.05)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <div className="flex-1 relative mt-8">
        <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 drop-shadow-sm" preserveAspectRatio="xMidYMid meet">
          <polyline 
            points={polylinePoints} 
            fill="none" 
            stroke="#60a5fa" 
            strokeWidth="1.2" 
            strokeDasharray="2,2" 
            className="animate-pulse"
          />
          {points.map((p, i) => (
            <g key={p.id} className="transition-transform duration-300 hover:scale-110 cursor-help">
              <circle cx={p.x} cy={p.y} r="2.5" fill="white" stroke="#3b82f6" strokeWidth="0.8" />
              <circle cx={p.x} cy={p.y} r="1" fill="#3b82f6" />
              <text x={p.x + p.ox} y={p.y + p.oy} fontSize="3.5" fontWeight="bold" fill="white" stroke="white" strokeWidth="0.8" strokeLinejoin="round" textAnchor={p.align}>
                {p.name}
              </text>
              <text x={p.x + p.ox} y={p.y + p.oy} fontSize="3.5" fontWeight="bold" fill="#1e293b" textAnchor={p.align}>
                {p.name}
              </text>
              <text x={p.x + p.ox} y={p.y + p.oy + 3.2} fontSize="2.2" fontWeight="600" fill="#64748b" textAnchor={p.align}>
                {p.sub}
              </text>
            </g>
          ))}
          <g transform={`translate(${points[0].x - 6}, ${points[0].y + 3})`}>
            <rect x="0" y="0" width="10" height="3" rx="1" fill="#ef4444" opacity="0.9" />
            <text x="5" y="2.2" fontSize="2" fill="white" fontWeight="bold" textAnchor="middle">START</text>
          </g>
          <g transform={`translate(${points[points.length - 1].x + 2}, ${points[points.length - 1].y + 3})`}>
            <rect x="0" y="0" width="8" height="3" rx="1" fill="#10b981" opacity="0.9" />
            <text x="4" y="2.2" fontSize="2" fill="white" fontWeight="bold" textAnchor="middle">END</text>
          </g>
        </svg>
      </div>
    </div>
  );
};


// --- 行程大綱 (Overview) 組件 ---
const ItineraryOverview = ({ itinerary, setActiveDay }) => {
  return (
    <div className="transition-opacity duration-500 opacity-100 animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-8 pl-2 border-l-4 border-blue-500">
        <h2 className="text-2xl font-bold text-gray-800">🗺️ 行程大綱與路線圖</h2>
        <p className="text-gray-500 mt-1">八天七夜全路線快速預覽，點擊左側卡片可查看每日詳細圖文</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 relative border-l-2 border-blue-200 ml-4 md:ml-8 lg:order-1 order-2">
          {itinerary.map((dayData, idx) => (
            <div 
              key={idx} 
              className="mb-8 ml-6 md:ml-8 relative group cursor-pointer"
              onClick={() => setActiveDay(idx)}
            >
              <span className="absolute -left-[39px] md:-left-[47px] top-0 flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-blue-500 text-blue-600 font-bold text-xs shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                D{dayData.day}
              </span>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 transform group-hover:-translate-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-gray-50 pb-3">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{dayData.title}</h3>
                  <span className="text-sm font-semibold text-blue-500 bg-blue-50 px-3 py-1 rounded-full w-fit mt-2 sm:mt-0">{dayData.date}</span>
                </div>
                <ul className="space-y-3">
                  {dayData.activities.map((act, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-gray-400 mt-0.5"><MapPin size={16} /></span>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="font-bold text-gray-700">{act.time}</span>
                          <span className="text-gray-800 font-medium">{act.location}</span>
                        </div>
                        {act.transport !== "-" && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Car size={12}/> {act.transport}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-blue-500 mt-4 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  點擊查看本日景點與故事 <ArrowDown size={12} className="-rotate-90"/>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-7 lg:sticky lg:top-24 lg:order-2 order-1 z-10">
          <RouteMap />
        </div>
      </div>
    </div>
  );
};


const SurvivalGuide = () => {
  return (
    <div className="transition-opacity duration-500 opacity-100 animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-8 pl-2 border-l-4 border-teal-400">
        <h2 className="text-2xl font-bold text-gray-800">💡 內行玩家懶人包：14大避坑指南</h2>
        <p className="text-gray-500 mt-1">拒絕觀光客思維！這是一份保命、省錢又懂玩的深度攻略。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SURVIVAL_GUIDES.map((guide, idx) => {
          const Icon = guide.icon;
          return (
            <div key={idx} className={`p-5 rounded-2xl border ${guide.border} bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col h-full`}>
              <div className={`absolute top-0 right-0 w-24 h-24 ${guide.bg} rounded-bl-full -z-10 transition-transform group-hover:scale-110`}></div>
              <div className="flex items-start gap-4 z-10 relative flex-1">
                <div className={`p-3 rounded-xl ${guide.bg} ${guide.color} flex-shrink-0`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{guide.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed text-justify whitespace-pre-wrap">
                    {guide.content}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ExpenseTracker = ({ daysList, expenses, onAddExpense, onDeleteExpense }) => {
  const [day, setDay] = useState(daysList[0]?.day || 1);
  const [category, setCategory] = useState('🍽️ 餐飲');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  const categories = ['🍽️ 餐飲', '🚆 交通', '🎟️ 門票', '🛍️ 購物', '🏠 住宿', '💡 其他'];

  const handleAdd = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) return;
    
    const newExpense = {
      day: parseInt(day),
      category,
      description: desc.trim() || category.split(' ')[1],
      amount: parseFloat(amount)
    };
    
    onAddExpense(newExpense);
    setDesc('');
    setAmount('');
  };

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="transition-opacity duration-500 opacity-100 animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-8 pl-2 border-l-4 border-indigo-400">
        <h2 className="text-2xl font-bold text-gray-800">💰 雲端記帳本</h2>
        <p className="text-gray-500 mt-1">隨手紀錄每日花費，掌握旅行預算不超支！</p>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-3xl p-6 text-white shadow-md mb-8 flex items-center justify-between">
        <div>
          <p className="text-indigo-100 text-sm font-medium mb-1 flex items-center gap-1.5"><PieChart size={16}/> 總花費</p>
          <div className="text-4xl font-bold">$ {totalExpense.toFixed(2)}</div>
        </div>
        <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
          <Wallet size={32} className="text-white" />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-indigo-500" /> 新增一筆花費
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500">日期</label>
            <select value={day} onChange={(e) => setDay(e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {daysList.map(d => <option key={d.day} value={d.day}>Day {d.day} ({d.date.split(' ')[0]})</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500">分類</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500">項目 / 備註</label>
            <input type="text" placeholder="例如: 車票" value={desc} onChange={(e) => setDesc(e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500">金額</label>
            <div className="relative flex items-center">
              <input type="number" step="0.01" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <span className="absolute left-3 text-gray-400 font-bold">$</span>
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-4 mt-2">
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2">
              <Plus size={18} /> 記下一筆
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ReceiptText size={20} className="text-indigo-500" /> 花費紀錄
        </h3>
        {expenses.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400 border border-gray-100 border-dashed">
            目前還沒有任何花費紀錄喔！
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {expenses.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-xl flex-shrink-0">
                      {item.category.split(' ')[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{item.description}</h4>
                      <p className="text-xs text-gray-500">Day {item.day} • {item.category.split(' ')[1]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-indigo-600">$ {item.amount.toFixed(2)}</span>
                    <button onClick={() => onDeleteExpense(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ShoppingGuide = () => {
  const categories = [...new Set(SHOPPING_ITEMS.map(item => item.category))];

  return (
    <div className="transition-opacity duration-500 opacity-100 animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-10 pl-2 border-l-4 border-rose-400">
        <h2 className="text-2xl font-bold text-gray-800">🛍️ 必買戰利品：在地人嚴選清單</h2>
        <p className="text-gray-500 mt-1">從經典甜點到藥妝好物，跟著部落客買出高質感與驚人價差！</p>
      </div>

      {categories.map((category, catIdx) => (
        <div key={catIdx} className="mb-12">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b-2 border-gray-100 pb-2">
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SHOPPING_ITEMS.filter(item => item.category === category).map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className={`rounded-3xl border ${item.border} bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full group`}>
                  <div className="h-48 w-full relative overflow-hidden bg-gray-100 flex-shrink-0">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = "https://placehold.co/600x400/f8fafc/64748b?text=Hokkaido+Shopping"; 
                      }}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className={`absolute top-4 right-4 p-2 rounded-xl ${item.bg} ${item.color} shadow-lg backdrop-blur-md bg-white/90`}>
                      <Icon size={20} />
                    </div>
                    <div className="absolute bottom-4 left-4 text-white pr-4">
                      <h3 className="text-xl font-bold text-white drop-shadow-md leading-tight">{item.title}</h3>
                      <p className="text-xs font-semibold text-white/90 drop-shadow-md mt-1">{item.subtitle}</p>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col bg-white">
                    <p className="text-gray-600 text-sm leading-relaxed text-justify mb-5 flex-1">
                      {item.content}
                    </p>
                    {item.link && (
                      <div className="mt-auto pt-4 border-t border-gray-50">
                        <a href={item.link.url} target="_blank" rel="noopener noreferrer" className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${item.bg} ${item.color} hover:brightness-95`}>
                          {item.link.type === 'youtube' ? <Youtube size={16} /> : <Globe size={16} />}
                          {item.link.name}
                          <ExternalLink size={14} className="ml-auto opacity-50" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const ActivityCard = ({ 
  activity, index, activeDay, daysList, totalActivities,
  openGoogleMaps, moveActivity, moveActivityToDay, deleteActivity,
  handleDragStart, handleDragEnter, handleDragEnd
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragEnabled, setIsDragEnabled] = useState(false);
  const IconComponent = activity.icon;

  return (
    <div 
      draggable={isDragEnabled} 
      onDragStart={(e) => handleDragStart(e, index)} 
      onDragEnter={(e) => handleDragEnter(e, index)} 
      onDragEnd={(e) => { handleDragEnd(e); setIsDragEnabled(false); }} 
      onDragOver={(e) => e.preventDefault()}
      className="mb-10 ml-8 relative group"
    >
      <span className="absolute -left-12 top-1 flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-blue-500 text-blue-500 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 z-10">
        <IconComponent size={16} />
      </span>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
        <div className="p-5 md:p-6 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:gap-5">
              {activity.imageUrl && !imgError && (
                <div className="w-full sm:w-36 h-36 sm:h-32 flex-shrink-0 relative overflow-hidden bg-gray-100 rounded-xl shadow-sm border border-gray-100 mt-1">
                  <img 
                    src={activity.imageUrl} 
                    alt={activity.location} 
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = "https://placehold.co/600x400/f8fafc/64748b?text=Hokkaido+Spot"; 
                    }} 
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" 
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1.5"><Clock size={14} />{activity.time}</span>
                  <span className="text-gray-400 text-sm flex items-center gap-1">{activity.duration !== "-" && `預計停留 ${activity.duration}`}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">{activity.location}</h3>
                
                {activity.tags && activity.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {activity.tags.map((tag, idx) => (
                      <span key={idx} className={`px-2 py-0.5 text-xs font-bold rounded-md border ${
                        tag.includes('熱門') ? 'bg-red-50 text-red-600 border-red-200' :
                        tag.includes('順路') ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        tag.includes('小眾') || tag.includes('老饕') ? 'bg-purple-50 text-purple-600 border-purple-200' :
                        tag.includes('非必要') || tag.includes('備用') ? 'bg-gray-100 text-gray-500 border-gray-200' :
                        'bg-blue-50 text-blue-600 border-blue-200'
                      }`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-gray-600 mb-4 leading-relaxed">{activity.description}</p>
                <div className="bg-gray-50 p-3 rounded-lg flex items-start gap-2 border border-gray-100 mb-2">
                  <Info size={16} className="text-teal-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600"><span className="font-semibold text-gray-700">移動方式：</span>{activity.transport}</p>
                </div>
                
                {activity.sourceLinks && activity.sourceLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {activity.sourceLinks.map((link, idx) => (
                      <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors shadow-sm ${link.type === 'youtube' ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'}`}>
                        {link.type === 'youtube' ? <Youtube size={14} /> : <Globe size={14} />} {link.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 md:mt-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 flex-shrink-0 w-full md:w-auto border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
              {isDeleting ? (
                <div className="flex items-center gap-2 bg-red-50 p-1.5 rounded-lg border border-red-200 shadow-sm">
                  <span className="text-xs text-red-600 font-bold px-1">確定移除？</span>
                  <button onClick={() => deleteActivity(activeDay, index)} className="text-xs bg-red-600 text-white px-2 py-1.5 rounded-md hover:bg-red-700 transition-colors shadow-sm">是</button>
                  <button onClick={() => setIsDeleting(false)} className="text-xs bg-white text-gray-600 border border-gray-300 px-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors shadow-sm">否</button>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200 shadow-sm">
                  <button onClick={() => moveActivity(index, index - 1)} disabled={index === 0} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded-md disabled:opacity-30 transition-colors shadow-sm"><ArrowUp size={16} /></button>
                  <button onClick={() => moveActivity(index, index + 1)} disabled={index === totalActivities - 1} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded-md disabled:opacity-30 transition-colors shadow-sm"><ArrowDown size={16} /></button>
                  <div className="relative flex items-center justify-center">
                    <select className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" value="" onChange={(e) => { if(e.target.value !== "") moveActivityToDay(activeDay, index, parseInt(e.target.value)); }}>
                      <option value="" disabled>移動到...</option>
                      {daysList.map((d, i) => <option key={i} value={i} disabled={i === activeDay}>Day {d.day}</option>)}
                    </select>
                    <div className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded-md transition-colors shadow-sm"><CalendarDays size={16} /></div>
                  </div>
                  <button onClick={() => setIsDeleting(true)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded-md transition-colors shadow-sm"><Trash2 size={16} /></button>
                  <div 
                    onMouseEnter={() => setIsDragEnabled(true)} 
                    onMouseLeave={() => setIsDragEnabled(false)} 
                    onTouchStart={() => setIsDragEnabled(true)} 
                    onTouchEnd={() => setIsDragEnabled(false)} 
                    className="p-1.5 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600"
                  >
                    <GripVertical size={16} />
                  </div>
                </div>
              )}
              <button onClick={() => openGoogleMaps(activity.mapQuery)} className="w-full md:w-auto flex items-center justify-center gap-2 bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
                <Navigation size={18} /><span>地圖導航</span><ExternalLink size={14} className="ml-1 opacity-50" />
              </button>
            </div>
          </div>
          {activity.detailInfo && (
            <div className="mt-2 border-t border-gray-100 pt-3">
              <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-between text-left text-blue-600 hover:text-blue-800 transition-colors py-2">
                <span className="flex items-center gap-2 text-sm font-semibold"><BookOpen size={16} />{isExpanded ? '收起達人解說' : '展開：深度景點故事與內行攻略'}</span>
                <ChevronDown size={18} className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1200px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                <div className="bg-blue-50/50 p-4 md:p-5 rounded-xl text-gray-700 text-sm md:text-base leading-relaxed border border-blue-100 text-justify whitespace-pre-wrap">
                  {activity.detailInfo}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [itineraryState, setItineraryState] = useState(INITIAL_ITINERARY);
  const [activeDay, setActiveDay] = useState('overview'); 
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);

  const dragItem = React.useRef(null);
  const dragOverItem = React.useRef(null);

  useEffect(() => {
    setIsLoaded(true);
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try { await signInWithPopup(auth, provider); } catch (error) { console.error('Login error:', error); }
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch (error) { console.error('Logout error:', error); }
  };

  useEffect(() => {
    if (!user || !db) return;
    const expensesRef = collection(db, 'artifacts', FIREBASE_APP_ID, 'users', user.uid, 'expenses');
    const unsubscribe = onSnapshot(expensesRef, (snapshot) => {
      const loadedExpenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      loadedExpenses.sort((a, b) => b.createdAt - a.createdAt);
      setExpenses(loadedExpenses);
    });
    return () => unsubscribe();
  }, [user]);


  const handleAddExpense = async (newExpense) => {
    if (user && db) {
      const docId = Date.now().toString();
      const docRef = doc(db, 'artifacts', FIREBASE_APP_ID, 'users', user.uid, 'expenses', docId);
      await setDoc(docRef, { ...newExpense, createdAt: Date.now() });
    } else {
      const localExpense = { ...newExpense, id: Date.now().toString(), createdAt: Date.now() };
      setExpenses(prev => [...prev, localExpense].sort((a, b) => b.createdAt - a.createdAt));
    }
  };

  const handleDeleteExpense = async (id) => {
    if (user && db) {
      const docRef = doc(db, 'artifacts', FIREBASE_APP_ID, 'users', user.uid, 'expenses', id.toString());
      await deleteDoc(docRef);
    } else {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const openGoogleMaps = (query) => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
  const openDayRouteMap = (activities) => {
    if (!activities || activities.length === 0) return;
    const origin = encodeURIComponent(activities[0].mapQuery);
    const destination = encodeURIComponent(activities[activities.length - 1].mapQuery);
    const waypoints = activities.length > 2 ? '&waypoints=' + activities.slice(1, -1).map(a => encodeURIComponent(a.mapQuery)).join('|') : '';
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints}`, '_blank');
  };

  const handleDragStart = (e, index) => { dragItem.current = index; setTimeout(() => { if(e.target) e.target.style.opacity = '0.4'; }, 0); };
  const handleDragEnter = (e, index) => { dragOverItem.current = index; };
  const handleDragEnd = (e) => {
    if(e.target) e.target.style.opacity = '1';
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const newItinerary = [...itineraryState];
      const activities = [...newItinerary[activeDay].activities];
      activities.splice(dragOverItem.current, 0, activities.splice(dragItem.current, 1)[0]);
      newItinerary[activeDay].activities = activities;
      setItineraryState(newItinerary);
    }
    dragItem.current = dragOverItem.current = null;
  };

  const moveActivity = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= itineraryState[activeDay].activities.length) return;
    const newItinerary = [...itineraryState];
    const activities = [...newItinerary[activeDay].activities];
    activities.splice(toIndex, 0, activities.splice(fromIndex, 1)[0]);
    newItinerary[activeDay].activities = activities;
    setItineraryState(newItinerary);
  };

  const moveActivityToDay = (currentDayIndex, activityIndex, targetDayIndex) => {
    const newItinerary = [...itineraryState];
    newItinerary[targetDayIndex].activities.push(newItinerary[currentDayIndex].activities.splice(activityIndex, 1)[0]);
    setItineraryState(newItinerary);
  };

  const deleteActivity = (dayIndex, activityIndex) => {
    const newItinerary = [...itineraryState];
    newItinerary[dayIndex].activities.splice(activityIndex, 1);
    setItineraryState(newItinerary);
  };

  const currentItinerary = (typeof activeDay === 'number') ? itineraryState[activeDay] : null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-blue-200">
      <div className="relative bg-gradient-to-r from-blue-700 to-teal-600 text-white overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center"></div>
        <div className="relative px-6 pt-12 pb-8 max-w-4xl mx-auto">
          <p className="text-blue-100 font-medium tracking-wider text-sm mb-2 uppercase flex items-center gap-2">
            <Palmtree size={16} />
            Hokkaido Spring Trip
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{TRIP_TITLE}</h1>
          <p className="text-blue-50 opacity-90 flex items-center gap-2 text-sm md:text-base">
            <Calendar size={18} />
            {TRIP_DATES}
          </p>
        </div>
      </div>

      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex overflow-x-auto scrollbar-hide px-4 py-3 gap-2">
          <button onClick={() => setActiveDay('overview')} className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex flex-col items-center min-w-[80px] ${activeDay === 'overview' ? 'bg-blue-600 text-white shadow-md transform scale-105' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
            <span className="flex items-center gap-1.5"><List size={16} />大綱</span>
            <span className={`text-xs mt-0.5 ${activeDay === 'overview' ? 'text-blue-100' : 'text-blue-500/70'}`}>行程總覽</span>
          </button>
          <button onClick={() => setActiveDay('guide')} className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex flex-col items-center min-w-[80px] ${activeDay === 'guide' ? 'bg-teal-500 text-white shadow-md transform scale-105' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}>
            <span className="flex items-center gap-1.5"><Lightbulb size={16} />避坑指南</span>
            <span className={`text-xs mt-0.5 ${activeDay === 'guide' ? 'text-teal-100' : 'text-teal-500/70'}`}>行前必讀</span>
          </button>
          <button onClick={() => setActiveDay('shopping')} className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex flex-col items-center min-w-[80px] ${activeDay === 'shopping' ? 'bg-rose-500 text-white shadow-md transform scale-105' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'}`}>
            <span className="flex items-center gap-1.5"><Gift size={16} />戰利品</span>
            <span className={`text-xs mt-0.5 ${activeDay === 'shopping' ? 'text-rose-100' : 'text-rose-500/70'}`}>圖文攻略</span>
          </button>
          <button onClick={() => setActiveDay('expense')} className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex flex-col items-center min-w-[80px] ${activeDay === 'expense' ? 'bg-indigo-600 text-white shadow-md transform scale-105' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}>
            <span className="flex items-center gap-1.5"><ReceiptText size={16} />記帳本</span>
            <span className={`text-xs mt-0.5 ${activeDay === 'expense' ? 'text-indigo-100' : 'text-indigo-500/70'}`}>花費紀錄</span>
          </button>
          {itineraryState.map((data, index) => (
            <button key={index} onClick={() => setActiveDay(index)} className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex flex-col items-center min-w-[80px] ${activeDay === index ? 'bg-blue-600 text-white shadow-md transform scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <span>Day {data.day}</span>
              <span className={`text-xs mt-0.5 ${activeDay === index ? 'text-blue-100' : 'text-gray-400'}`}>{data.date.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {activeDay === 'overview' ? <ItineraryOverview itinerary={itineraryState} setActiveDay={setActiveDay} /> :
         activeDay === 'guide' ? <SurvivalGuide /> : 
         activeDay === 'shopping' ? <ShoppingGuide /> : 
         activeDay === 'expense' ? (
           user ? (
             <div>
               <div className="flex justify-end items-center gap-2 mb-4">
                 <img src={user.photoURL} alt="avatar" className="w-7 h-7 rounded-full" />
                 <span className="text-gray-600 text-sm">{user.displayName}</span>
                 <button onClick={handleLogout} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-all">登出</button>
               </div>
               <ExpenseTracker daysList={itineraryState.map(d => ({day: d.day, date: d.date}))} expenses={expenses} onAddExpense={handleAddExpense} onDeleteExpense={handleDeleteExpense} />
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center py-20 text-center">
               <div className="bg-indigo-50 rounded-full p-6 mb-6">
                 <ReceiptText size={48} className="text-indigo-400" />
               </div>
               <h2 className="text-2xl font-bold text-gray-800 mb-2">雲端記帳本</h2>
               <p className="text-gray-500 mb-6">登入 Google 帳號即可使用記帳功能<br/>跨裝置同步，資料不遺失</p>
               <button onClick={handleGoogleLogin} className="flex items-center gap-3 bg-white border border-gray-200 text-gray-700 font-semibold text-base px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all">
                 <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                 使用 Google 登入
               </button>
             </div>
           )
         ) : 
         (
          <div className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <div className="mb-8 pl-2 border-l-4 border-yellow-400 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{currentItinerary.title}</h2>
                <p className="text-gray-500 mt-1">{currentItinerary.date} 行程總覽</p>
              </div>
              <button onClick={() => openDayRouteMap(currentItinerary.activities)} className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:from-blue-700 hover:to-teal-600 px-5 py-2.5 rounded-xl font-medium transition-all shadow-md transform hover:scale-105 active:scale-95 flex-shrink-0">
                <Map size={18} /><span>在地圖查看本日路線</span>
              </button>
            </div>
            <div className="relative border-l-2 border-blue-100 ml-4 md:ml-8">
              {currentItinerary.activities.length === 0 ? (
                <div className="mb-10 ml-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">目前沒有安排行程喔！</div>
              ) : (
                currentItinerary.activities.map((activity, index) => (
                  <ActivityCard 
                    key={`${activity.location}-${index}`} activity={activity} index={index} activeDay={activeDay}
                    daysList={itineraryState.map(d => ({day: d.day, date: d.date}))} totalActivities={currentItinerary.activities.length}
                    openGoogleMaps={openGoogleMaps} moveActivity={moveActivity} moveActivityToDay={moveActivityToDay}
                    deleteActivity={deleteActivity} handleDragStart={handleDragStart} handleDragEnter={handleDragEnter} handleDragEnd={handleDragEnd}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </main>
      <footer className="text-center py-8 text-gray-400 text-sm bg-gray-100 mt-8"><p>Enjoy Your Trip ✈️ Designed exclusively for your Hokkaido Journey.</p></footer>
    </div>
  );
}