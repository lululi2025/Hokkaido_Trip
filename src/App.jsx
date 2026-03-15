import React, { useState, useEffect } from 'react';
import { signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { initFirebase } from './firebase';
import {
  MapPin, Clock, Calendar, Navigation, Info, ExternalLink,
  Coffee, Train, Camera, Utensils, Bed, ShoppingBag, Palmtree, Castle, Plane,
  ChevronDown, BookOpen, Map, ArrowUp, ArrowDown, GripVertical, Youtube, Globe,
  Trash2, CalendarDays, AlertTriangle, Footprints, ShieldAlert, Wallet, TrainFront, Plug, Lightbulb, CreditCard, Ticket, Sun, Gift,
  Store, Droplets, Fish, Sparkles, Gem, PaintBucket, ReceiptText, Plus, PieChart,
  Mountain, TreePine, Flame, Car, Landmark, Building, PlaneTakeoff, Home, Shirt, Wifi, Cookie, CakeSlice
} from 'lucide-react';

const ICON_MAP = {
  MapPin, Clock, Calendar, Navigation, Info, Coffee, Train, Camera, Utensils,
  Bed, ShoppingBag, Castle, Plane, Map, Ticket, Gift, Store, Droplets, Fish,
  Sparkles, Gem, PaintBucket, Mountain, TreePine, Flame, Car, Landmark,
  Building, PlaneTakeoff, Home, Shirt, Wifi, Cookie, CakeSlice, Sun, Lightbulb,
};

const resolveIcon = (icon) => {
  if (!icon) return MapPin;
  if (typeof icon === 'string') return ICON_MAP[icon] || MapPin;
  return icon;
};

// 🔻 步驟一：基本設定與 Firebase 配置
const TRIP_TITLE = "日本北海道8天7夜自駕與鐵道慢遊";
const TRIP_DATES = "2026/03/28 - 2026/04/04";
const FIREBASE_APP_ID = "hokkaido-trip-2026";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "hokkaido-trip-2026.firebaseapp.com",
  projectId: "hokkaido-trip-2026",
  storageBucket: "hokkaido-trip-2026.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID_HERE"
};

// 🔻 步驟二：每日行程規劃
const INITIAL_ITINERARY = [
  {
    day: 1,
    date: "2026/03/28",
    title: "啟程：抵達函館與璀璨夜景",
    activities: [
      {
        time: "13:30",
        duration: "2小時",
        location: "函館機場",
        description: "搭乘星宇航空 JX860 抵達函館機場，辦理入境與租車手續。",
        transport: "飛機 / 租車自駕",
        detailInfo: "航廈內領取行李後，前往一樓國內線航廈旁的租車櫃檯取車，準備前往市區。",
        icon: "Plane",
        mapQuery: "函館機場",
        imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: []
      },
      {
        time: "16:00",
        duration: "1.5小時",
        location: "幸運小丑漢堡 (Lucky Pierrot)",
        description: "品嚐函館限定的人氣小丑漢堡，首推招牌中華雞腿堡。",
        transport: "自駕",
        detailInfo: "函館必吃美食，點餐後可稍作休息，感受復古美式裝潢風格。",
        icon: "Utensils",
        mapQuery: "Lucky Pierrot Hakodate",
        imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: []
      },
      {
        time: "18:30",
        duration: "2小時",
        location: "函館山",
        description: "搭乘纜車上山，欣賞榮獲米其林三星評鑑的「百萬夜景」。",
        transport: "自駕至纜車站 / 纜車",
        detailInfo: "春季山上風大且氣溫接近零度，務必穿著防風保暖的厚外套與毛帽。",
        icon: "Mountain",
        mapQuery: "函館山纜車",
        imageUrl: "https://images.unsplash.com/photo-1590485600122-8d7ec66ee593?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: []
      }
    ]
  },
  {
    day: 2,
    date: "2026/03/29",
    title: "函館歷史散策：星形要塞與紅磚倉庫",
    activities: [
      {
        time: "09:00",
        duration: "2.5小時",
        location: "五稜郭公園與五稜郭塔",
        description: "登上五稜郭塔俯瞰星形要塞，欣賞護城河與城廓交織的壯麗景致。",
        transport: "自駕",
        detailInfo: "塔上可360度眺望函館市區、津輕海峽與函館山。公園內可漫步感受歷史氛圍。",
        icon: "Castle",
        mapQuery: "五稜郭塔",
        imageUrl: "https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: []
      },
      {
        time: "14:00",
        duration: "3小時",
        location: "金森紅磚倉庫與元町",
        description: "漫步於充滿異國風情的港區與洋館街，享受午後時光。",
        transport: "自駕 / 步行",
        detailInfo: "可在此品嚐美味的 Snaffle's 起司蛋糕，並購買精緻的玻璃工藝品伴手禮。",
        icon: "Store",
        mapQuery: "金森紅磚倉庫",
        imageUrl: "https://images.unsplash.com/photo-1588691880486-5d6664d5089c?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: []
      }
    ]
  },
  {
    day: 3,
    date: "2026/03/30",
    title: "向北移動：大沼國定公園與洞爺湖",
    activities: [
      {
        time: "10:00",
        duration: "2.5小時",
        location: "大沼國定公園",
        description: "欣賞駒岳與湖泊交織的自然美景，可租借自行車環湖。",
        transport: "自駕",
        detailInfo: "公園內腹地廣大，適合悠閒散步，午餐可品嚐當地著名的沼澤公魚與大沼牛肉。",
        icon: "TreePine",
        mapQuery: "大沼國定公園",
        imageUrl: "https://images.unsplash.com/photo-1599380696989-18baeb59b3ab?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: []
      },
      {
        time: "15:30",
        duration: "2小時",
        location: "筒倉展望台 (SAIRO展望台)",
        description: "遠眺洞爺湖全景、中島與有珠山火山遺跡的最佳攝影點。",
        transport: "自駕",
        detailInfo: "展望台旁的商店有販售限定的洞爺湖布丁，推薦一試。",
        icon: "Camera",
        mapQuery: "筒倉展望台",
        imageUrl: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: []
      }
    ]
  },
  {
    day: 4,
    date: "2026/03/31",
    title: "地獄谷奇觀與溫泉鄉放鬆",
    activities: [
      {
        time: "10:00",
        duration: "2小時",
        location: "登別地獄谷",
        description: "感受火山氣體噴發的壯觀景象與濃郁的硫磺氣息。",
        transport: "自駕",
        detailInfo: "沿著木棧道漫步，欣賞奇特的地貌，若遇下雪或殘雪路面會較為濕滑，請小心行走。",
        icon: "Flame",
        mapQuery: "登別地獄谷",
        imageUrl: "https://images.unsplash.com/photo-1621215438848-18544c09d581?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: []
      },
      {
        time: "14:00",
        duration: "3小時",
        location: "登別尼克斯海洋公園",
        description: "觀賞著名的企鵝遊行與豐富的海洋生物。",
        transport: "自駕",
        detailInfo: "充滿北歐城堡風格的水族館，除了企鵝遊行外，海豚與海獅表演也非常精彩。",
        icon: "Fish",
        mapQuery: "登別尼克斯海洋公園",
        imageUrl: "https://images.unsplash.com/photo-1596733430284-f74370601460?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: []
      }
    ]
  },
  {
    day: 5,
    date: "2026/04/01",
    title: "浪漫小樽與札幌市區探索",
    activities: [
      {
        time: "11:00",
        duration: "3.5小時",
        location: "小樽運河與堺町通商店街",
        description: "漫步於歷史悠久的運河畔，探訪北一硝子館與小樽音樂盒堂。",
        transport: "自駕",
        detailInfo: "午餐強烈推薦在三角市場或商店街享用新鮮的海鮮丼或壽司，飯後可來杯 LeTAO 下午茶。",
        icon: "Map",
        mapQuery: "小樽運河",
        imageUrl: "https://images.unsplash.com/photo-1606212513476-c40d04bd19c2?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: []
      },
      {
        time: "16:00",
        duration: "1小時",
        location: "札幌市區還車",
        description: "抵達札幌後先行還車，後續行程依靠大眾運輸以節省市區停車費。",
        transport: "自駕",
        detailInfo: "還車後可搭乘地鐵前往飯店辦理入住，放下行李後準備晚間的市區採購。",
        icon: "Car",
        mapQuery: "札幌車站",
        imageUrl: "https://images.unsplash.com/photo-1580556201735-d8dc2f966159?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: []
      }
    ]
  },
  {
    day: 6,
    date: "2026/04/02",
    title: "札幌城市巡禮與美食饗宴",
    activities: [
      {
        time: "09:30",
        duration: "2小時",
        location: "北海道神宮與圓山公園",
        description: "參拜北海道總鎮守，感受寧靜的神聖氛圍。",
        transport: "地鐵",
        detailInfo: "四月初園區內仍可能有殘雪，參拜後可在六花亭神宮茶屋店品嚐限定的「判官大人」烤麻糬。",
        icon: "Landmark",
        mapQuery: "北海道神宮",
        imageUrl: "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: []
      },
      {
        time: "14:00",
        duration: "2.5小時",
        location: "大通公園、札幌電視塔與時計台",
        description: "市區經典地標打卡，漫步於橫貫市區的綠色長廊。",
        transport: "步行",
        detailInfo: "可購票登上電視塔俯瞰札幌市區的棋盤狀街道。",
        icon: "Building",
        mapQuery: "札幌電視塔",
        imageUrl: "https://images.unsplash.com/photo-1603006859330-9bc7c48f8605?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: []
      },
      {
        time: "19:00",
        duration: "3小時",
        location: "狸小路商店街與薄野",
        description: "北海道最大的商店街採購藥妝與伴手禮，並體驗夜間聖代文化。",
        transport: "步行",
        detailInfo: "晚餐推薦享用 GARAKU 湯咖哩或達摩成吉思汗烤肉，宵夜務必體驗札幌特有的「締めパフェ」(結尾聖代)。",
        icon: "ShoppingBag",
        mapQuery: "狸小路商店街",
        imageUrl: "https://images.unsplash.com/photo-1596440263654-728b4931a742?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: []
      }
    ]
  },
  {
    day: 7,
    date: "2026/04/03",
    title: "白色戀人與熱血棒球園區",
    activities: [
      {
        time: "10:00",
        duration: "3小時",
        location: "白色戀人觀光工廠",
        description: "參觀充滿歐風的巧克力主題樂園，了解經典伴手禮的製作過程。",
        transport: "地鐵",
        detailInfo: "園區內有許多童話般的造景適合拍照，還能體驗製作專屬的白色戀人餅乾。",
        icon: "Coffee",
        mapQuery: "白色戀人觀光工廠",
        imageUrl: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: []
      },
      {
        time: "14:30",
        duration: "4小時",
        location: "HOKKAIDO BALLPARK F VILLAGE (北海道棒球園區)",
        description: "前往北廣島市朝聖最新的鬥士隊棒球園區，參觀達比修有與大谷翔平壁畫。",
        transport: "JR 至北廣島站 + 接駁車",
        detailInfo: "園區內設施豐富，即使無賽事也非常好逛，設有精釀啤酒餐廳、特色商店，甚至還有邊看球邊泡湯的溫泉設施。",
        icon: "Ticket",
        mapQuery: "HOKKAIDO BALLPARK F VILLAGE",
        imageUrl: "https://images.unsplash.com/photo-1508344928928-7137b29de216?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: []
      }
    ]
  },
  {
    day: 8,
    date: "2026/04/04",
    title: "滿載而歸：新千歲機場最後血拚",
    activities: [
      {
        time: "10:00",
        duration: "2.5小時",
        location: "札幌車站周邊百貨",
        description: "把握最後時間在札幌車站周邊的大丸百貨、ESTA 等商場進行最後補給。",
        transport: "步行",
        detailInfo: "可以在百貨地下街購買精緻的便當或伴手禮帶去機場享用。",
        icon: "ShoppingBag",
        mapQuery: "札幌車站",
        imageUrl: "https://images.unsplash.com/photo-1558862106-d53b92f4405d?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: []
      },
      {
        time: "14:00",
        duration: "3.5小時",
        location: "新千歲機場 (國內線航廈/哆啦A夢樂園)",
        description: "提前抵達機場，新千歲機場猶如大型遊樂場與購物中心，絕不能錯過。",
        transport: "JR 快速機場線",
        detailInfo: "國內線航廈的伴手禮區非常齊全，還有拉麵道場、Royce' 巧克力世界與哆啦A夢空中樂園，務必預留充足時間。",
        icon: "PlaneTakeoff",
        mapQuery: "新千歲機場",
        imageUrl: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: []
      },
      {
        time: "19:10",
        duration: "3.5小時",
        location: "搭機返台",
        description: "搭乘酷航 TR893，帶著滿滿回憶返回台灣。",
        transport: "飛機",
        detailInfo: "預計 22:35 抵達桃園國際機場 T1 航廈，結束美好的北海道之旅。",
        icon: "Home",
        mapQuery: "桃園國際機場",
        imageUrl: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: []
      }
    ]
  }
];

// 🔻 步驟三：生存指南
const SURVIVAL_GUIDES = [
  {
    icon: "Shirt",
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    title: "四月衣物穿搭指南",
    content: "四月上旬平地氣溫約 5°C～10°C，早晚逼近 0°C。務必採用「洋蔥式穿搭」，外層防風防水。適逢融雪期，路面泥濘濕滑，強烈建議穿著防水且防滑的靴子，避免穿著易進水的球鞋或吸水雪靴。"
  },
  {
    icon: "Car",
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    title: "自駕與交通策略",
    content: "四月初租車多數可能已無配置雪胎，請留意山區與清晨的路面結冰。前段行程（函館至洞爺湖）採自駕最便利；抵達札幌後建議提早還車，依靠地鐵與 JR 活動，省下昂貴的市區停車費與找車位的麻煩。"
  },
  {
    icon: "Wifi",
    color: "text-green-500",
    bg: "bg-green-50",
    border: "border-green-200",
    title: "網路與實用 APP",
    content: "建議出發前準備好免換卡的 eSIM 或實體網卡。自駕導航除了車載系統，可搭配 Google Maps 或 Yahoo!乘換案內，以便精準掌握市區電車與 JR 的轉乘時刻表。"
  }
];

// 🔻 步驟四：必買清單
const SHOPPING_ITEMS = [
  {
    icon: "Cookie",
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
    title: "六花亭",
    subtitle: "Rokkatei",
    content: "必買萊姆葡萄奶油夾心餅乾與酒糖，包裝充滿花草手繪風，送禮自用兩相宜。札幌市區與機場皆有販售。",
    link: "https://www.rokkatei.co.jp/"
  },
  {
    icon: "CakeSlice",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    title: "LeTAO",
    subtitle: "小樽洋菓子舖",
    content: "原味雙層起司蛋糕是絕對的經典，濃郁奶香入口即化，小樽本店可內用，新千歲機場可買到保冷包裝帶回台灣。",
    link: "https://www.letao.jp/"
  },
  {
    icon: "Gift",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    title: "ROYCE'",
    subtitle: "生巧克力與洋芋片",
    content: "北海道極具代表性的生巧克力與巧克力洋芋片，機場免稅店品項最齊全，購買免稅還享折扣。",
    link: "https://www.royce.com/"
  }
];


// =========================================================================
// ⬇️⬇️⬇️ 以下為系統核心程式碼，建立新行程時「完全不需要修改」 ⬇️⬇️⬇️
// =========================================================================

let app, auth, db;
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    const init = initFirebase(firebaseConfig);
    app = init.app;
    auth = init.auth;
    db = init.db;
  } catch (error) {
    console.error('Firebase error:', error);
  }
}

// --- 懶人包組件 ---
const SurvivalGuide = () => {
  return (
    <div className="transition-opacity duration-500 opacity-100 animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-8 pl-2 border-l-4 border-teal-400">
        <h2 className="text-2xl font-bold text-gray-800">💡 行前懶人包</h2>
        <p className="text-gray-500 mt-1">精選必備知識與避坑指南，出發前請務必詳閱！</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SURVIVAL_GUIDES.map((guide, idx) => {
          const Icon = resolveIcon(guide.icon);
          return (
            <div key={idx} className={`p-5 rounded-2xl border ${guide.border} bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col h-full`}>
              <div className={`absolute top-0 right-0 w-24 h-24 ${guide.bg} rounded-bl-full -z-10 transition-transform group-hover:scale-110`}></div>
              <div className="flex items-start gap-4 z-10 relative flex-1">
                <div className={`p-3 rounded-xl ${guide.bg} ${guide.color} flex-shrink-0`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{guide.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed text-justify">
                    {guide.content}
                  </p>
                  
                  {guide.links && guide.links.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                      {guide.links.map((link, linkIdx) => (
                        <a
                          key={linkIdx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors shadow-sm ${
                            link.type === 'youtube' 
                              ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                              : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
                          }`}
                        >
                          {link.type === 'youtube' ? <Youtube size={14} /> : <Globe size={14} />}
                          {link.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- 記帳本組件 ---
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

// --- 戰利品分頁組件 ---
const ShoppingGuide = () => {
  return (
    <div className="transition-opacity duration-500 opacity-100 animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-8 pl-2 border-l-4 border-rose-400">
        <h2 className="text-2xl font-bold text-gray-800">🛍️ 必買戰利品清單</h2>
        <p className="text-gray-500 mt-1">行李箱空間殺手！在地人與部落客狂推的質感伴手禮與精品</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SHOPPING_ITEMS.map((item, idx) => {
          const Icon = resolveIcon(item.icon);
          return (
            <div key={idx} className={`p-6 rounded-3xl border ${item.border} bg-white shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group flex flex-col h-full`}>
              <div className={`absolute -right-6 -top-6 w-32 h-32 ${item.bg} rounded-full -z-10 transition-transform duration-500 group-hover:scale-150 opacity-50`}></div>
              <div className="flex items-start gap-4 z-10 relative flex-1">
                <div className={`p-3.5 rounded-2xl ${item.bg} ${item.color} flex-shrink-0 shadow-sm`}>
                  <Icon size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-1 leading-tight">{item.title}</h3>
                  <p className={`text-sm font-semibold ${item.color} mb-3`}>{item.subtitle}</p>
                  <p className="text-gray-600 text-sm leading-relaxed text-justify mb-5">
                    {item.content}
                  </p>
                </div>
              </div>
              {item.link && (
                <div className="z-10 mt-auto pt-4 border-t border-gray-50">
                  <a href={item.link.url} target="_blank" rel="noopener noreferrer" className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${item.bg} ${item.color} hover:brightness-95`}>
                    {item.link.type === 'youtube' ? <Youtube size={16} /> : <Globe size={16} />}
                    {item.link.name}
                    <ExternalLink size={14} className="ml-auto opacity-50" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- 行程卡片組件 ---
const ActivityCard = ({ 
  activity, index, activeDay, daysList, totalActivities,
  openGoogleMaps, moveActivity, moveActivityToDay, deleteActivity,
  handleDragStart, handleDragEnter, handleDragEnd
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const IconComponent = resolveIcon(activity.icon);

  return (
    <div 
      draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnter={(e) => handleDragEnter(e, index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()}
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
                  <img src={activity.imageUrl} alt={activity.imageAlt} onError={() => setImgError(true)} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1.5"><Clock size={14} />{activity.time}</span>
                  <span className="text-gray-400 text-sm flex items-center gap-1">{activity.duration !== "-" && `停留約 ${activity.duration}`}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">{activity.location}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{activity.description}</p>
                <div className="bg-gray-50 p-3 rounded-lg flex items-start gap-2 border border-gray-100 mb-2">
                  <Info size={16} className="text-teal-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600"><span className="font-semibold text-gray-700">交通/備註：</span>{activity.transport}</p>
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
                  <div className="p-1.5 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600"><GripVertical size={16} /></div>
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
                <span className="flex items-center gap-2 text-sm font-semibold"><BookOpen size={16} />{isExpanded ? '收起景點故事' : '閱讀深度景點故事與歷史背景'}</span>
                <ChevronDown size={18} className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                <div className="bg-blue-50/50 p-4 md:p-5 rounded-xl text-gray-700 text-sm md:text-base leading-relaxed border border-blue-100 text-justify">
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

// --- 主應用程式 ---
export default function App() {
  const [itineraryState, setItineraryState] = useState(INITIAL_ITINERARY);
  const [activeDay, setActiveDay] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);

  const dragItem = React.useRef(null);
  const dragOverItem = React.useRef(null);

  useEffect(() => {
    setIsLoaded(true);
    if (!auth) return;
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (error) { console.error('Auth error:', error); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

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

  const currentItinerary = (activeDay !== 'guide' && activeDay !== 'shopping' && activeDay !== 'expense') ? itineraryState[activeDay] : null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-blue-200">
      <div className="relative bg-gradient-to-r from-blue-700 to-teal-600 text-white overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
        <div className="relative px-6 pt-12 pb-8 max-w-4xl mx-auto">
          <p className="text-blue-100 font-medium tracking-wider text-sm mb-2 uppercase flex items-center gap-2">
            <Palmtree size={16} />
            My Journey
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
          <button onClick={() => setActiveDay('guide')} className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex flex-col items-center min-w-[80px] ${activeDay === 'guide' ? 'bg-teal-500 text-white shadow-md transform scale-105' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}>
            <span className="flex items-center gap-1.5"><Lightbulb size={16} />懶人包</span>
            <span className={`text-xs mt-0.5 ${activeDay === 'guide' ? 'text-teal-100' : 'text-teal-500/70'}`}>行前必看</span>
          </button>
          <button onClick={() => setActiveDay('shopping')} className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex flex-col items-center min-w-[80px] ${activeDay === 'shopping' ? 'bg-rose-500 text-white shadow-md transform scale-105' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'}`}>
            <span className="flex items-center gap-1.5"><Gift size={16} />戰利品</span>
            <span className={`text-xs mt-0.5 ${activeDay === 'shopping' ? 'text-rose-100' : 'text-rose-500/70'}`}>購物攻略</span>
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
        {activeDay === 'guide' ? <SurvivalGuide /> : 
         activeDay === 'shopping' ? <ShoppingGuide /> : 
         activeDay === 'expense' ? <ExpenseTracker daysList={itineraryState.map(d => ({day: d.day, date: d.date}))} expenses={expenses} onAddExpense={handleAddExpense} onDeleteExpense={handleDeleteExpense} /> : 
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
      <footer className="text-center py-8 text-gray-400 text-sm bg-gray-100 mt-8"><p>Enjoy Your Trip ✈️</p></footer>
    </div>
  );
}