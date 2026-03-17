import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  MapPin, Clock, Calendar, Navigation, Info, ExternalLink, 
  Coffee, Train, Camera, Utensils, Bed, ShoppingBag, Palmtree, Castle, Plane,
  ChevronDown, BookOpen, Map, ArrowUp, ArrowDown, GripVertical, Youtube, Globe,
  Trash2, CalendarDays, AlertTriangle, Footprints, ShieldAlert, Wallet, TrainFront, Plug, Lightbulb, CreditCard, Ticket, Sun, Gift,
  Store, Droplets, Fish, Sparkles, Gem, PaintBucket, ReceiptText, Plus, PieChart, Car,
  Snowflake, Shield, Heart, CameraOff, Moon, CloudSnow, AlertCircle, BaggageClaim, Pill, Package, Droplet, List, Leaf, Wine
} from 'lucide-react';

// ==========================================
// 🔻 步驟一：基本設定與 Firebase 🔻
// ==========================================
const TRIP_TITLE = "北海道8天7夜 春季自駕尋味之旅";
const TRIP_DATES = "2026/03/28 - 2026/04/04";
const FIREBASE_APP_ID = "hokkaido-spring-pro-2026"; 

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ==========================================
// 🔻 步驟二：「每日行程」深度部落客版 🔻
// ==========================================
const INITIAL_ITINERARY = [
  {
    day: 1,
    date: "2026/03/28",
    title: "啟程：抵達函館與百萬夜景",
    activities: [
      {
        time: "13:30", duration: "1.5小時", location: "函館機場入境與租車",
        tags: ["👍 順路可加", "✈️ 交通節點"],
        description: "搭乘星宇航空 JX860 抵達，辦理入境後至機場櫃檯取車。",
        transport: "飛機 ➝ 租車自駕", 
        detailInfo: "【資深玩家帶路】\n函館機場規模精巧，國際線通關速度依當日航班重疊率而定，相較於新千歲機場，這裡是極度省時的北海道門戶。\n\n【雪地自駕雙重確認】\n取車時務必執行兩項檢查：\n第一，確認輪胎是否為「Studless（無釘雪胎）」。四月初的北海道早晚仍有「黑冰（Black Ice）」危機，路面看似潮濕實則結冰，極度危險。\n第二，務必加購 NOC（營業損失賠償）全險與 ETC 卡。",
        icon: Plane, mapQuery: "函館機場",
        imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "波比看世界：北海道交通攻略", url: "https://www.google.com/search?q=波比看世界+北海道+交通自駕", type: "web" },
          { name: "台灣Vlog：函館機場入境實錄", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 函館機場 入境")}`, type: "youtube" }
        ]
      },
      {
        time: "15:00", duration: "1小時", location: "入住：函館站前柔婕閣飯店",
        tags: ["🏨 絕佳住宿", "📍 車站旁"],
        description: "抵達市區先辦理入住放行李，飯店結合古典與現代和風，更附設天然溫泉大浴場。",
        transport: "自駕 (從機場約 9km / 20分)", 
        detailInfo: "【絕佳地理位置】\n這間飯店 (La Gent Stay Hakodate Ekimae) 就位在 JR 函館站旁，地理位置無敵，走路到函館朝市只要 1~2 分鐘！一樓還有便利商店與在地伴手禮店。強烈建議先在此卸下大件行李，稍微休息後再前往紅磚倉庫與函館山，能大幅減輕旅遊疲勞。\n\n【天然溫泉消解疲勞】\n飯店附設的「天然溫泉 ぽんの湯」，充滿濃濃的江戶時代復古風情，晚上看完夜景回來泡湯，絕對是一大享受！",
        icon: Bed, mapQuery: "La Gent Stay Hakodate Ekimae",
        imageUrl: "https://images.unsplash.com/photo-1542314831-c6a4d14d8373?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "Marktrip：函館溫泉住宿開箱", url: "https://www.google.com/search?q=Marktrip+函館溫泉住宿", type: "web" },
          { name: "台灣Vlog：柔婕閣飯店開箱", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 函館 柔婕閣飯店")}`, type: "youtube" }
        ]
      },
      {
        time: "16:00", duration: "1小時", location: "午茶/遲午餐：幸運小丑漢堡 (碼頭末廣店)",
        tags: ["⭐ 非常熱門", "🍔 必吃美食"],
        description: "品嚐函館限定的靈魂美食，推薦必點「中華雞腿堡」。",
        transport: "自駕 (從飯店出發約 2km / 7分)", 
        detailInfo: "【老饕必吃淵源】\n為什麼小丑漢堡（Lucky Pierrot）只在函館展店？創辦人王一郎堅持使用道南在地食材（高達80%），為了確保品質與新鮮度，霸氣拒絕了跨出函館的無數邀約，成為日本唯一打敗麥當勞的地方速食霸主！\n\n【特色飲品搭配】\n千萬別忘了配上一杯北海道限定的 Guarana（瓜拿納）碳酸飲料，這款帶有獨特藥草香氣的汽水，絕對是函館式下午茶的最強標配。",
        icon: Utensils, mapQuery: "Lucky Pierrot Marina Suehiro",
        imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "娜塔蝦：函館必吃美食清單", url: "https://www.google.com/search?q=娜塔蝦+函館+美食", type: "web" },
          { name: "台灣Vlog：小丑漢堡食記", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 小丑漢堡 必吃")}`, type: "youtube" }
        ]
      },
      {
        time: "17:30", duration: "2小時", location: "函館山 百萬夜景",
        tags: ["⭐ 非常熱門", "📸 經典絕景"],
        description: "搭乘纜車上山，欣賞榮獲米其林三星評鑑的雙海灣夜景。",
        transport: "自駕至山麓纜車站 (約 2km / 5分) ➝ 轉乘纜車", 
        detailInfo: "【攝影師機密視角】\n函館夜景之所以被譽為「百萬夜景」，在於其獨特的「陸連島」地形，被津輕海峽與函館灣夾擊出的極致雙弧線。最佳觀賞時間點是「日落前30分鐘（Magic Hour）」，能一次捕捉天際線從湛藍漸層到黑夜，以及華燈初上的瞬間。",
        icon: Camera, mapQuery: "函館山纜車",
        imageUrl: "https://images.unsplash.com/photo-1573055418049-c70e28d4ea91?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "波比看世界：函館夜景全攻略", url: "https://www.google.com/search?q=波比看世界+函館夜景", type: "web" },
          { name: "台灣Vlog：百萬夜景實錄", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 函館山 夜景")}`, type: "youtube" }
        ]
      },
      {
        time: "19:30", duration: "1.5小時", location: "晚餐：麵廚房味彩 (あじさい) 總店",
        tags: ["⭐ 非常熱門", "🍜 在地名店"],
        description: "品嚐清透鮮甜的招牌鹽味拉麵，暖胃解寒的完美結尾。",
        transport: "自駕或步行 (位於五稜郭，函館山下也有紅磚倉庫分店) ➝ 飯後返回飯店休息 (約 2km / 7分)", 
        detailInfo: "【在地人激推的鹽味霸主】\n函館與札幌的味噌、旭川的醬油並列為「北海道三大拉麵」。味彩（Ajisai）的鹽味拉麵以道南產昆布、豬骨與雞骨長時間熬製，湯頭清澈見底卻層次豐富、鮮甜回甘。\n\n💡 內行建議：可以選擇吃離函館山較近的「紅磚倉庫分店」，吃飽後開車回柔婕閣飯店超級近！",
        icon: Utensils, mapQuery: "麵廚房味彩 本店",
        imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "娜塔蝦：函館拉麵評比", url: "https://www.google.com/search?q=娜塔蝦+函館+拉麵", type: "web" },
          { name: "台灣Vlog：味彩拉麵試吃", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 麵廚房味彩")}`, type: "youtube" }
        ]
      }
    ]
  },
  {
    day: 2,
    date: "2026/03/29",
    title: "函館歷史散策：朝市、星形要塞與元町",
    activities: [
      {
        time: "09:00", duration: "2小時", location: "早餐：函館朝市",
        tags: ["⭐ 非常熱門", "🦀 必吃海鮮"],
        description: "睡飽再出門！體驗當地早市活力，品嚐極致鮮甜的海鮮丼。",
        transport: "步行 (08:55 從柔婕閣飯店出發，僅需 2 分鐘過馬路！)", 
        detailInfo: "【究極海鮮丼早餐】\n因為我們住的飯店就在車站旁，早上睡飽到 9 點出門都來得及！早餐強烈推薦創立於 1956 年的「きくよ食堂」。點一碗鎮店之寶「元祖巴丼」（海膽、鮭魚卵、干貝），這裡的米飯特別選用北海道特A級的『ふっくりんこ』，拌著鮮甜海膽一口吃下，堪稱視覺與味覺的最高享受。",
        icon: Fish, mapQuery: "函館朝市",
        imageUrl: "https://images.unsplash.com/photo-1583337260546-28b6dbbc0e82?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "波比看世界：函館朝市必吃名單", url: "https://www.google.com/search?q=波比看世界+函館朝市", type: "web" },
          { name: "台灣Vlog：釣烏賊與海鮮丼", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 函館朝市 釣烏賊")}`, type: "youtube" }
        ]
      },
      {
        time: "11:00", duration: "2小時", location: "五稜郭公園與五稜郭塔",
        tags: ["⭐ 非常熱門", "🌸 歷史名勝"],
        description: "登上五稜郭塔俯瞰壯觀的星形要塞，感受幕末歷史氛圍。",
        transport: "自駕 (從飯店/朝市出發約 5km / 15分)", 
        detailInfo: "【幕末浪漫朝聖】\n身為日本最後內戰「箱館戰爭」的終結地，五稜郭不僅是座星形要塞，更是新選組副長土方歲三的隕落處。4月初雖未逢櫻花滿開，但殘雪與星形護城河的幾何對比，是攝影愛好者眼中的絕景。",
        icon: Castle, mapQuery: "五稜郭塔",
        imageUrl: "https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "泰莎出去玩：五稜郭散策", url: "https://www.google.com/search?q=泰莎出去玩+五稜郭", type: "web" },
          { name: "台灣Vlog：五稜郭塔美景", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 五稜郭塔")}`, type: "youtube" }
        ]
      },
      {
        time: "13:30", duration: "1.5小時", location: "午餐：迴轉壽司 函太郎 (宇賀浦本店)",
        tags: ["👍 順路可加", "🍣 海景餐廳"],
        description: "坐在無敵海景吧台，享用津輕海峽直送的新鮮漁獲。",
        transport: "自駕 (附設大型免費停車場)", 
        detailInfo: "【風景與味覺的雙重饗宴】\n函太郎是發跡於函館的高級迴轉壽司，宇賀浦本店就位於海邊，擁有大片無敵海景落地窗！師傅在吧台中央現捏，必點「炙燒鮭魚」、「新鮮活貝」以及當季的白身魚。",
        icon: Utensils, mapQuery: "函太郎 宇賀浦本店",
        imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "娜塔蝦：函太郎壽司食記", url: "https://www.google.com/search?q=娜塔蝦+函太郎", type: "web" },
          { name: "台灣Vlog：海景壽司開箱", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 函太郎 宇賀浦")}`, type: "youtube" }
        ]
      },
      {
        time: "15:30", duration: "1.5小時", location: "金森紅磚倉庫群",
        tags: ["⭐ 非常熱門", "🛍️ 購物散策"],
        description: "漫步充滿異國風情的港灣，採買伴手禮與品嚐起司蛋糕。",
        transport: "自駕 (約 6km / 20分)", 
        detailInfo: "【海港繁華見證】\n明治時代由富商渡邊熊四郎建立的紅磚倉庫群，見證了函館身為國際貿易港的繁華。在紅磚牆前拍照，隨便一張都有濃濃的復古雜誌風。逛累了必吃「Snaffle's」的 Catchcakes！在立食區只要花 200 日圓就能享用。",
        icon: ShoppingBag, mapQuery: "金森紅磚倉庫",
        imageUrl: "https://images.unsplash.com/photo-1588691880486-5d6664d5089c?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "波比看世界：金森倉庫必買伴手禮", url: "https://www.google.com/search?q=波比看世界+金森倉庫", type: "web" },
          { name: "台灣Vlog：紅磚倉庫好物特搜", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 金森紅磚倉庫")}`, type: "youtube" }
        ]
      },
      {
        time: "17:00", duration: "1小時", location: "八幡坂與元町洋館群",
        tags: ["⭐ 非常熱門", "📸 順路必拍"],
        description: "函館最有名的電影取景坡道，筆直通向蔚藍海港。",
        transport: "步行 (從金森倉庫出發僅需10分鐘)", 
        detailInfo: "【日劇與廣告的御用絕景】\n從金森倉庫走過來非常順路，完全不用繞路！八幡坂被譽為全日本最美坡道之一，筆直的石板路從山坡一路延伸，盡頭直接銜接著湛藍的函館港與青函連絡船紀念館「摩周丸」。建議在日落前來拍攝，兩側的樹木與西洋建築（如元町天主堂）交織出濃厚的歐洲異國風情，10分鐘就能拍出大片！",
        icon: Camera, mapQuery: "八幡坂",
        imageUrl: "https://images.unsplash.com/photo-1605658140303-34e8f7ce1cb3?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "泰莎出去玩：元町絕美坡道", url: "https://www.google.com/search?q=泰莎出去玩+八幡坂", type: "web" },
          { name: "台灣Vlog：八幡坂美照教學", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 函館 八幡坂")}`, type: "youtube" }
        ]
      },
      {
        time: "18:30", duration: "2小時", location: "晚餐：阿佐利本店 (百年和牛壽喜燒)",
        tags: ["🌟 小眾但很棒", "🥩 老饕必吃"],
        description: "在昭和時代的百年老屋內，品嚐頂級A5黑毛和牛壽喜燒。",
        transport: "搭乘市電至「寶來町」 ➝ 飯後搭乘市電直達「函館站前」返回飯店 (約 10分)", 
        detailInfo: "【米其林必比登推薦名店】\n創立於 1901 年的肉舖老店，一樓賣肉、二樓是傳統的日式榻榻米包廂餐廳。這裡的壽喜燒使用秘製醬汁，A5黑毛和牛的油花分布均勻，稍微涮過後沾上新鮮生蛋液，入口即化！\n⚠️由於極度熱門且座位少，建議出發前請飯店協助電話預訂。",
        icon: Utensils, mapQuery: "阿佐利本店 壽喜燒",
        imageUrl: "https://images.unsplash.com/photo-1558985250-27a406d64cb3?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "娜塔蝦：A5和牛壽喜燒老店", url: "https://www.google.com/search?q=娜塔蝦+阿佐利", type: "web" },
          { name: "台灣Vlog：阿佐利本店食記", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 函館 阿佐利")}`, type: "youtube" }
        ]
      }
    ]
  },
  {
    day: 3,
    date: "2026/03/30",
    title: "向北移動：大沼國定公園與絕美洞爺湖",
    activities: [
      {
        time: "09:30", duration: "45分鐘", location: "飯店退房與出發",
        tags: ["🏨 退房", "🚗 準備啟程"],
        description: "睡飽吃完早餐後，09:30 完成柔婕閣飯店退房手續，取車向北出發。",
        transport: "步行至特約停車場取車", 
        detailInfo: "【出發前小提醒】\n符合每日 9 點後出發的悠閒步調！飯店規定為 11:00 前退房，我們 09:30 辦理退房能避開最後一刻的人潮。將行李上車後，別忘了確認導航設定為「大沼國定公園」。飯店一樓的便利商店是補給行車零食與飲料的最後好機會喔！",
        icon: Bed, mapQuery: "La Gent Stay Hakodate Ekimae",
        imageUrl: "https://images.unsplash.com/photo-1542314831-c6a4d14d8373?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "泰莎出去玩：北海道自駕懶人包", url: "https://www.google.com/search?q=泰莎出去玩+北海道自駕", type: "web" }
        ]
      },
      {
        time: "10:15", duration: "2.5小時", location: "大沼國定公園",
        tags: ["⭐ 非常熱門", "🚴 自然絕景"],
        description: "欣賞駒岳火山與湖泊交織的自然美景，租借自行車環湖散策。",
        transport: "自駕 (從飯店出發約 28km / 40分)", 
        detailInfo: "【詩意般的自然秘境】\n大沼公園是由活火山「駒岳」噴發後形成的堰塞湖，湖面上有著星羅棋布的 126 個小島。這裡不僅風景如畫，更是日本名曲《千風之歌》的靈感發源地，非常適合租借自行車環湖。",
        icon: Palmtree, mapQuery: "大沼國定公園",
        imageUrl: "https://images.unsplash.com/photo-1599380696989-18baeb59b3ab?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "波比看世界：大沼公園單車攻略", url: "https://www.google.com/search?q=波比看世界+大沼國定公園", type: "web" },
          { name: "台灣Vlog：大沼公園風景實拍", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 大沼國定公園")}`, type: "youtube" }
        ]
      },
      {
        time: "12:45", duration: "1.5小時", location: "午餐：名物「沼之家」與 餐廳「梓」",
        tags: ["👍 順路可加", "🍡 百年名物"],
        description: "百年老店醬油糰子，搭配在地知名的 AKaushi (褐毛和牛) 料理。",
        transport: "步行 (位於大沼公園車站旁)", 
        detailInfo: "【天皇御用與在地名產】\n先到「沼之家」買一盒連明治天皇都讚不絕口的百年甜點「醬油芝麻糰子」（⚠️無添加防腐劑，賞味期限僅當天，絕對不能放冰箱）。正餐則強烈推薦到旁邊的餐廳「梓」，品嚐大沼的「褐毛和牛」牛排丼。",
        icon: Utensils, mapQuery: "大沼公園 沼之家",
        imageUrl: "https://images.unsplash.com/photo-1626844131082-256783844137?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "娜塔蝦：沼之家糰子試吃", url: "https://www.google.com/search?q=娜塔蝦+沼之家", type: "web" },
          { name: "台灣Vlog：百年糰子口感分享", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 沼之家")}`, type: "youtube" }
        ]
      },
      {
        time: "14:30", duration: "1小時", location: "洞爺湖 筒倉展望台 (SAIRO)",
        tags: ["👍 順路可加", "📸 休息站"],
        description: "自駕途中的絕佳休息站，遠眺洞爺湖全景的最佳視角。",
        transport: "自駕高速公路 (約 130km / 2小時15分)", 
        detailInfo: "【公路旅行攻略】\n這段長達 130 公里的道央自動車道，是本次旅行最長的一段車程。抵達筒倉展望台後，您將能俯瞰洞爺湖這座「全日本最北的不凍湖」的壯麗全景。別忘了在一樓賣店購買超人氣的「牧家Bocca」氣球布丁！",
        icon: Camera, mapQuery: "筒倉展望台",
        imageUrl: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "波比看世界：洞爺湖景點彙整", url: "https://www.google.com/search?q=波比看世界+洞爺湖景點", type: "web" },
          { name: "台灣Vlog：氣球布丁開箱", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 牧家Bocca 氣球布丁")}`, type: "youtube" }
        ]
      },
      {
        time: "16:00", duration: "1.5小時", location: "有珠山纜車與昭和新山",
        tags: ["⭐ 非常熱門", "🌋 地質奇觀"],
        description: "搭乘纜車近距離觀看仍在冒煙的活火山遺跡。",
        transport: "自駕 (約 15km / 20分)", 
        detailInfo: "【地質奇觀探秘】\n昭和新山的誕生極具傳奇色彩——它是在二戰期間（1943年），短短兩年內從一塊平坦的麥田平地，硬生生隆起形成高達近 400 公尺的活火山！搭乘纜車登上旁邊的有珠山，您可以同時看見太平洋、洞爺湖與火山口冒煙的壯麗三景。",
        icon: MapPin, mapQuery: "有珠山纜車",
        imageUrl: "https://images.unsplash.com/photo-1621215438848-18544c09d581?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "泰莎出去玩：有珠山纜車美景", url: "https://www.google.com/search?q=泰莎出去玩+有珠山", type: "web" },
          { name: "台灣Vlog：活火山震撼體驗", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 昭和新山 有珠山")}`, type: "youtube" }
        ]
      },
      {
        time: "17:30", duration: "1小時", location: "入住：洞爺湖畔亭飯店 ＆ 湖畔散步",
        tags: ["🏨 絕景住宿", "♨️ 浪漫湖景"],
        description: "抵達飯店並務必於 19:00 前辦理入住。放妥行李後可至湖畔散步。",
        transport: "自駕至飯店 (有專屬停車場)", 
        detailInfo: "【絕景溫泉與入住死線】\n洞爺湖畔亭 (Toya Kohantei) 位於溫泉街絕佳位置。請務必在 19:00 前完成入住手續，以免錯過為您準備的豪華晚餐！\n\n【空中大浴場的震撼】\n這間飯店最引以為傲的就是位於頂樓的「空中露天風呂」，可以毫無遮蔽地欣賞整座洞爺湖與羊蹄山的壯麗景色，入住後一定要去泡！",
        icon: Bed, mapQuery: "洞爺湖畔亭",
        imageUrl: "https://images.unsplash.com/photo-1634551139360-1596e1919864?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "Marktrip：洞爺湖畔亭住宿開箱", url: "https://www.google.com/search?q=Marktrip+洞爺湖住宿", type: "web" },
          { name: "台灣Vlog：畔亭飯店絕景溫泉", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 洞爺湖畔亭")}`, type: "youtube" }
        ]
      },
      {
        time: "18:30", duration: "2小時", location: "晚餐：洞爺湖畔亭 豪華百匯 (第一晚)",
        tags: ["⭐ 非常熱門", "🍽️ 一泊二食"],
        description: "換上浴衣，享用飯店特製的北海道道產食材百匯自助餐。",
        transport: "步行 (飯店餐廳)", 
        detailInfo: "【極致的放鬆體驗】\n來到洞爺湖，強烈建議這兩天晚餐直接在飯店內享用。洞爺湖畔亭的百匯提供豐富的北海道當季海鮮、現煎牛排與特製甜點。吃飽後稍微休息，再去頂樓泡個面對夜間湖景的露天溫泉，完美結束第三天！",
        icon: Utensils, mapQuery: "洞爺湖畔亭",
        imageUrl: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "波比看世界：洞爺湖溫泉飯店推薦", url: "https://www.google.com/search?q=波比看世界+洞爺湖溫泉", type: "web" },
          { name: "台灣Vlog：溫泉飯店一泊二食", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 洞爺湖 溫泉飯店 自助餐")}`, type: "youtube" }
        ]
      }
    ]
  },
  {
    day: 4,
    date: "2026/03/31",
    title: "登別地獄谷奇觀與海洋公園",
    activities: [
      {
        time: "10:30", duration: "1.5小時", location: "登別地獄谷",
        tags: ["⭐ 非常熱門", "🌋 經典必去"],
        description: "早上 09:30 從洞爺湖飯店悠閒出發，抵達感受火山氣體噴發的壯觀景象。",
        transport: "自駕 (約 45km / 50分)", 
        detailInfo: "【北海道第一溫泉鄉】\n登別地獄谷每天湧出多達一萬噸、高達 9 種不同泉質的溫泉水，是北海道最知名的溫泉鄉。在這裡，「鬼（Oni）」不是邪惡的象徵，而是守護湯泉的「湯鬼神」。\n\n沿著木棧道漫步，看著鐵紅色與灰黃色的岩石間噴發著陣陣白煙，景觀極具視覺震撼。",
        icon: AlertTriangle, mapQuery: "登別地獄谷",
        imageUrl: "https://images.unsplash.com/photo-1506158669146-619067262a00?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "波比看世界：登別一日遊攻略", url: "https://www.google.com/search?q=波比看世界+登別", type: "web" },
          { name: "台灣Vlog：登別地獄谷步道實走", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 登別地獄谷")}`, type: "youtube" }
        ]
      },
      {
        time: "12:00", duration: "1.5小時", location: "登別熊牧場",
        tags: ["👍 順路可加", "🐻 親子推薦"],
        description: "搭乘纜車上山餵食可愛棕熊，俯瞰透明度極高的倶多樂湖。",
        transport: "步行 (纜車站就在地獄谷溫泉街旁)", 
        detailInfo: "【北海道原始生態互動】\n這是很多旅行團會安排的超級熱門景點！搭乘專屬纜車直達山頂，園區內放養了數十隻北海道特有的「蝦夷棕熊」。最有趣的是可以購買蘋果餵食，看著巨大的棕熊們舉起手「拜託討食」或四腳朝天接食物的模樣，極度反差萌！\n另一大亮點是山頂的展望台，能無死角俯瞰透明度極高、神祕的圓形「倶多樂湖」。⚠️【行程彈性】：若覺得時間略趕，此景點可彈性刪減。",
        icon: Camera, mapQuery: "登別熊牧場",
        imageUrl: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "泰莎出去玩：登別熊牧場介紹", url: "https://www.google.com/search?q=泰莎出去玩+熊牧場", type: "web" },
          { name: "台灣Vlog：棕熊餵食與纜車", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 登別熊牧場")}`, type: "youtube" }
        ]
      },
      {
        time: "13:30", duration: "1小時", location: "午餐：登別溫泉街「福庵」手工蕎麥麵",
        tags: ["🌟 小眾名店", "🍜 排隊美食"],
        description: "溫泉街上的超人氣老字號，必點炸蝦天婦羅冷蕎麥麵。",
        transport: "步行 (極樂通溫泉街上)", 
        detailInfo: "【在地人排隊名店】\n地獄谷散步完後，走到溫泉街（極樂通）上的「福庵」。這家手工蕎麥麵店深受當地人與溫泉客喜愛，現炸的大蝦天婦羅外酥內嫩。若不想吃麵，也可以選擇附近的「溫泉市場」大啖生鮮海鮮丼！",
        icon: Utensils, mapQuery: "登別 福庵",
        imageUrl: "https://images.unsplash.com/photo-1519984388953-d2406bf725c8?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "娜塔蝦：登別美食推薦", url: "https://www.google.com/search?q=娜塔蝦+登別美食", type: "web" },
          { name: "台灣Vlog：福庵蕎麥麵食記", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 登別 福庵")}`, type: "youtube" }
        ]
      },
      {
        time: "14:45", duration: "2.5小時", location: "登別尼克斯海洋公園",
        tags: ["⭐ 非常熱門", "🐧 企鵝遊行"],
        description: "北歐風格的水族館，觀賞超萌的「企鵝遊行」與海豚表演。",
        transport: "自駕 (約 8km / 15分)", 
        detailInfo: "【零距離企鵝大遊行】\n最大的賣點就是零距離的「國王企鵝遊行」。\n⚠️ 【必看時程提醒】\n企鵝遊行下午場次通常為 14:15 或 15:30（請務必上官網確認當天班次），請提早到廣場卡位！企鵝會毫無防備地從你腳邊走過，切記遵守園方規定：不伸手觸摸、不使用閃光燈。",
        icon: Fish, mapQuery: "登別尼克斯海洋公園",
        imageUrl: "https://images.unsplash.com/photo-1596733430284-f74370601460?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "泰莎出去玩：尼克斯海洋公園攻略", url: "https://www.google.com/search?q=泰莎出去玩+尼克斯海洋公園", type: "web" },
          { name: "台灣Vlog：企鵝遊行實境", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 尼克斯海洋公園 企鵝")}`, type: "youtube" }
        ]
      },
      {
        time: "18:00", duration: "2小時", location: "晚餐：洞爺湖畔亭 豪華百匯 (第二晚)",
        tags: ["⭐ 非常熱門", "🍽️ 一泊二食"],
        description: "結束登別行程，返回飯店享用第二晚的百匯晚餐。",
        transport: "自駕返回洞爺湖畔亭飯店 (約 50分，務必 19:00 前抵達)", 
        detailInfo: "【一泊二食的極致享受】\n由於您已預訂連續兩晚含晚餐的方案，今天從登別離開後，請務必掌握時間在 18:30 左右回到飯店，洗個澡後悠閒享用晚餐。\n\n在經歷了一整天登別的地質奇觀後，今晚正是再度享受洞爺湖畔亭「空中露天風呂」的最佳時機，舒緩自駕一整天的疲勞。",
        icon: Utensils, mapQuery: "洞爺湖畔亭",
        imageUrl: "https://images.unsplash.com/photo-1606756790138-261d2b21cd75?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "娜塔蝦：洞爺湖一泊二食", url: "https://www.google.com/search?q=娜塔蝦+洞爺湖", type: "web" },
          { name: "台灣Vlog：洞爺湖畔亭晚餐實拍", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 洞爺湖畔亭 晚餐")}`, type: "youtube" }
        ]
      }
    ]
  },
  {
    day: 5,
    date: "2026/04/01",
    title: "浪漫小樽與札幌還車、市區探索",
    activities: [
      {
        time: "09:00", duration: "1小時", location: "退房出發：洞爺湖畔亭",
        tags: ["🏨 退房", "🚗 準備啟程"],
        description: "享用完日式早餐後，於 10:00 前完成退房手續，告別美麗的洞爺湖。",
        transport: "步行至停車場取車", 
        detailInfo: "【出發與退房注意事項】\n洞爺湖畔亭的規定退房時間為 10:00。我們預計 09:00 吃飽喝足後辦理退房，隨後驅車前往小樽。\n\n⚠️ 取消政策小提醒：此筆訂單在 3/23 12:00 前可免費取消，3/26 收取 TWD 2,002，3/28 12:00 後即不可退款。行程確認後就安心期待美好的溫泉之旅吧！",
        icon: Bed, mapQuery: "洞爺湖畔亭",
        imageUrl: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "泰莎出去玩：北海道自駕懶人包", url: "https://www.google.com/search?q=泰莎出去玩+北海道自駕", type: "web" },
          { name: "台灣Vlog：日本自駕上路實錄", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 北海道 自駕 洞爺湖")}`, type: "youtube" }
        ]
      },
      {
        time: "11:00", duration: "1.5小時", location: "小樽運河與堺町通商店街",
        tags: ["⭐ 非常熱門", "📸 浪漫地標"],
        description: "漫步歷史運河畔，探訪北一硝子館與音樂盒堂。",
        transport: "自駕 (從洞爺湖出發約 100km / 1小時45分)", 
        detailInfo: "【海商百萬兩的遺產】\n小樽曾是繁華一時的「北之華爾街」，運河旁保留了當年鯡魚貿易興盛時的石造倉庫群。沿著堺町通散步，這裡有由漁業浮球起家的「北一硝子（玻璃）」工藝，隨處可見充滿大正浪漫氛圍的歷史建築。",
        icon: Droplets, mapQuery: "小樽運河",
        imageUrl: "https://images.unsplash.com/photo-1606212513476-c40d04bd19c2?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "泰莎出去玩：小樽景點全攻略", url: "https://www.google.com/search?q=泰莎出去玩+小樽", type: "web" },
          { name: "台灣Vlog：小樽運河浪漫散策", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 小樽運河")}`, type: "youtube" }
        ]
      },
      {
        time: "12:30", duration: "1.5小時", location: "午餐：小樽三角市場「滝波食堂」",
        tags: ["⭐ 非常熱門", "🦀 痛風海鮮"],
        description: "小樽車站旁的痛風海鮮丼，自由搭配帝王蟹肉、海膽與牡丹蝦。",
        transport: "步行 (位於小樽車站旁)", 
        detailInfo: "【海商的極致鮮甜】\n小樽三角市場是海鮮控的絕對天堂！強烈推薦排隊老店「滝波食堂」的『任性丼（わがまま丼）』。您可以從 10 種頂級海鮮中自由挑選 3~4 種鋪滿白飯。新鮮的海膽入口即化、帝王蟹肉鮮甜多汁，絕對是這趟旅行最難忘的一餐！",
        icon: Utensils, mapQuery: "小樽 三角市場 滝波食堂",
        imageUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "波比看世界：三角市場必吃", url: "https://www.google.com/search?q=波比看世界+三角市場", type: "web" },
          { name: "台灣Vlog：滝波食堂海鮮丼開箱", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 滝波食堂")}`, type: "youtube" }
        ]
      },
      {
        time: "14:30", duration: "1.5小時", location: "LeTAO 本店下午茶",
        tags: ["👍 順路可加", "🍰 甜點朝聖"],
        description: "品嚐現做雙層起司蛋糕，免費登上三樓展望台俯瞰童話十字路口。",
        transport: "步行 (位於堺町通盡頭)", 
        detailInfo: "【童話十字路口的奇蹟】\n除了逛小樽運河，位在堺町通盡頭的 LeTAO 本店絕對是甜點控聖地！強烈建議到二樓咖啡廳，點一份限定的「現做雙層起司蛋糕 (Double Fromage)」套餐，現做的口感比冷凍伴手禮更加輕盈綿密。\n\n👉【內行加碼秘境】：吃完別急著走，一定要搭電梯上三樓的「免費展望台」，可以360度完美俯瞰小樽市區與宛如歐洲般的童話十字路口！",
        icon: Coffee, mapQuery: "LeTAO 小樽本店",
        imageUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "娜塔蝦：LeTAO 雙層起司蛋糕", url: "https://www.google.com/search?q=娜塔蝦+LeTAO", type: "web" },
          { name: "台灣Vlog：LeTAO展望台視角", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog LeTAO 展望台")}`, type: "youtube" }
        ]
      },
      {
        time: "17:00", duration: "1.5小時", location: "札幌市區還車與入住",
        tags: ["💡 省錢必做", "📍 交通節點"],
        description: "抵達札幌後先行還車，後續行程全靠大眾運輸，省下高昂停車費。",
        transport: "自駕 (約 40km / 50分) ➝ 還車", 
        detailInfo: "【省錢內行操作】\n札幌市區的交通極度擁擠，且絕大多數飯店的停車場皆需「額外收費」（每晚高達 1,500~2,500 日圓不等），路邊停車更是難上加難。\n\n【切換大眾運輸模式】\n因此，強烈建議在抵達札幌飯店卸下行李後，立刻前往附近的營業所辦理「異地還車」。接下來的札幌市區行程，依賴綿密的札幌市營地下鐵與路面電車即可。",
        icon: Car, mapQuery: "札幌車站",
        imageUrl: "https://images.unsplash.com/photo-1580556201735-d8dc2f966159?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "Marktrip：札幌住宿指南", url: "https://www.google.com/search?q=Marktrip+札幌住宿", type: "web" },
          { name: "台灣Vlog：日本自駕還車教學", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 日本租車 還車")}`, type: "youtube" }
        ]
      },
      {
        time: "18:30", duration: "1.5小時", location: "狸小路商店街與薄野散策",
        tags: ["⭐ 非常熱門", "🛍️ 爆買聖地"],
        description: "北海道最大的商店街，開啟藥妝採購與探路。",
        transport: "步行或地鐵", 
        detailInfo: "【札幌的繁華中心】\n狸小路是全長一公里的巨型拱廊商店街，無論晴雨都能輕鬆逛街。這裡是購買伴手禮與藥妝（大國、松本清、唐吉訶德）的絕佳戰場。逛完後可順勢往南走到「薄野（すすきの）」，與著名的 Nikka 威士忌大看板合影。",
        icon: ShoppingBag, mapQuery: "狸小路商店街",
        imageUrl: "https://images.unsplash.com/photo-1596440263654-728b4931a742?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "波比看世界：狸小路藥妝攻略", url: "https://www.google.com/search?q=波比看世界+狸小路", type: "web" },
          { name: "台灣Vlog：札幌薄野夜生活", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 狸小路 逛街")}`, type: "youtube" }
        ]
      },
      {
        time: "20:00", duration: "1.5小時", location: "晚餐：札幌靈魂美食「湯咖哩」",
        tags: ["⭐ 非常熱門", "🍛 靈魂美食"],
        description: "幾十種香料熬煮的藥膳湯頭，配上酥炸北海道時蔬。",
        transport: "步行 (薄野 / 大通區域)", 
        detailInfo: "【札幌獨創美食】\n晚餐絕對要吃發源於札幌的「湯咖哩（Soup Curry）」！排隊名店 GARAKU 的秘製香料味濃郁，而 Suage+ 則以「將食材串在竹籤上」方便食用聞名。\n\n【體驗：夜間聖代文化】\n吃飽後別急著回飯店！跟著在地人體驗札幌獨有的「夜間聖代（シメパフェ）」。札幌人習慣在酒局後或晚餐後，以一份精緻如藝術品的水果聖代收尾，推薦前往隱蔽的排隊名店「佐藤堂」。",
        icon: Utensils, mapQuery: "札幌 湯咖哩 GARAKU",
        imageUrl: "https://images.unsplash.com/photo-1633504581786-316c8002b1b9?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "娜塔蝦：札幌湯咖哩評比", url: "https://www.google.com/search?q=娜塔蝦+湯咖哩", type: "web" },
          { name: "台灣Vlog：夜間聖代初體驗", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 札幌 夜間聖代")}`, type: "youtube" }
        ]
      }
    ]
  },
  {
    day: 6,
    date: "2026/04/02",
    title: "札幌與郊區秘境：支笏湖藍與吃貨路線",
    activities: [
      {
        time: "09:30", duration: "1小時", location: "早餐：二條市場海鮮早午餐",
        tags: ["⭐ 非常熱門", "🦀 海鮮早午餐"],
        description: "早上 09:30 出發，前往札幌人的傳統廚房，大啖新鮮海鮮丼。",
        transport: "步行或地鐵", 
        detailInfo: "【完美的早晨起點】\n早晨非常推薦前往「二條市場」。這裡雖小但五臟俱全，推薦找一家現烤海鮮的攤位，品嚐現烤帆立貝與牡蠣，或是來碗迷你的海鮮丼，吃飽後準備搭車前往支笏湖！",
        icon: Fish, mapQuery: "札幌 二條市場",
        imageUrl: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "娜塔蝦：二條市場海鮮推薦", url: "https://www.google.com/search?q=娜塔蝦+二條市場", type: "web" },
          { name: "台灣Vlog：二條市場現烤海鮮", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 二條市場")}`, type: "youtube" }
        ]
      },
      {
        time: "11:00", duration: "大半天", location: "支笏湖半日遊 (神秘不凍湖)",
        tags: ["🌟 絕美秘境", "🚌 郊區小旅行"],
        description: "前往日本最清澈的火山口湖，欣賞被譽為「支笏湖藍」的絕美湖景。",
        transport: "JR 快速列車 (札幌 ➝ 千歲) 轉乘 北海道中央巴士 (單程約1.5小時)", 
        detailInfo: "【無車族也能抵達的秘境】\n由於已在札幌還車，前往支笏湖需從札幌搭乘 JR 快速列車到「千歲站」（約 40 分鐘），再轉乘路線巴士（約 45 分鐘）。把支笏湖安排在這天當作獨立的半日遊，沒有趕飛機的時間壓力，玩起來非常愜意！\n\n【支笏湖藍的魅力】\n支笏湖是一座連嚴冬都不會結冰的火山口湖。湖水清澈度極高，被稱為「支笏湖藍」。您可以在寧靜的湖畔散步、喝杯咖啡，享受遠離市區塵囂的放鬆時光。",
        icon: Droplets, mapQuery: "支笏湖",
        imageUrl: "https://images.unsplash.com/photo-1596440263654-728b4931a742?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "泰莎出去玩：支笏湖交通與景點", url: "https://www.google.com/search?q=泰莎出去玩+支笏湖", type: "web" },
          { name: "台灣Vlog：支笏湖藍絕美空拍", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 支笏湖")}`, type: "youtube" }
        ]
      },
      {
        time: "15:30", duration: "1.5小時", location: "遲午餐：根室花丸迴轉壽司 (Stellar Place店)",
        tags: ["⭐ 非常熱門", "🍣 完美離峰"],
        description: "產地直送的高CP值壽司，利用離峰時段避開可怕的人潮。",
        transport: "搭乘巴士與JR返回「札幌車站」Stellar Place 6樓", 
        detailInfo: "【部落客離峰神操作】\n去完支笏湖回到札幌車站大約下午三點半左右，這時候去吃永遠大排長龍的『根室花丸』剛好是人最少的離峰時段（午晚餐交界）！\n\n【必點攻略】\n入座後必點菜色包含：疊了兩層的「生干貝握壽司」、濃郁無比的「花咲蟹鐵砲汁（大碗螃蟹味噌湯）」，以及浮誇的「醬油漬鮭魚卵」，性價比極高。",
        icon: Utensils, mapQuery: "根室花丸 Stellar Place店",
        imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "娜塔蝦：根室花丸點餐攻略", url: "https://www.google.com/search?q=娜塔蝦+根室花丸", type: "web" },
          { name: "台灣Vlog：迴轉壽司瘋狂開箱", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 根室花丸")}`, type: "youtube" }
        ]
      },
      {
        time: "18:00", duration: "1.5小時", location: "藻岩山夜景 (或 大通公園散策)",
        tags: ["💡 可去但非必要", "🌃 備用夜景"],
        description: "搭乘迷你纜車，360度俯瞰日本新三大夜景的都會寶寶盒。",
        transport: "市電至「纜車入口站」 ➝ 免費接駁車 ➝ 轉乘纜車", 
        detailInfo: "【日本新三大夜景】\n名列日本新三大夜景之一，搭乘兩段式纜車登頂，360度俯瞰擁有近 200 萬人口的札幌大都會，燈火猶如打翻的珠寶盒般璀璨。\n\n⚠️【行程彈性調整建議】\n如果從支笏湖回來覺得腳痠，這個景點可以替換成輕鬆的「大通公園與時計台散步」，甚至直接回飯店休息一下再出門吃烤肉！",
        icon: Moon, mapQuery: "藻岩山纜車",
        imageUrl: "https://images.unsplash.com/photo-1628178873749-06b251ce72cc?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "波比看世界：札幌藻岩山夜景", url: "https://www.google.com/search?q=波比看世界+藻岩山", type: "web" },
          { name: "台灣Vlog：新三大夜景拍攝實錄", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 藻岩山 纜車")}`, type: "youtube" }
        ]
      },
      {
        time: "20:00", duration: "2小時", location: "晚餐：達摩 (だるま) 成吉思汗烤肉",
        tags: ["⭐ 非常熱門", "🥩 宵夜首選"],
        description: "炭火鐵鍋烤出的頂級羊肉，札幌宵夜的代名詞。",
        transport: "地鐵至「薄野站 (すすきの)」", 
        detailInfo: "【祖師爺級的神仙烤肉】\n達摩是札幌成吉思汗烤肉的發跡名店，只賣一種秘製的新鮮羊肉（完全沒有羊騷味）。特製的圓頂炭火烤盤會將羊油逼出，順著烤盤流下煎熟邊緣的洋蔥與大蔥，香味四溢！\n\n【老饕專屬吃法】\n吃完烤肉與白飯後，千萬別直接結帳！請將店家提供的熱麥茶倒入您裝著「殘餘烤肉醬」的小碗中，攪拌後一飲而盡，這碗融合了羊脂精華與醬香的熱湯，暖胃又解膩！",
        icon: Utensils, mapQuery: "達摩 成吉思汗烤肉 本店",
        imageUrl: "https://images.unsplash.com/photo-1547050605-9e62319fdb2c?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "娜塔蝦：達摩成吉思汗烤肉", url: "https://www.google.com/search?q=娜塔蝦+達摩烤肉", type: "web" },
          { name: "台灣Vlog：札幌烤肉超狂排隊", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 達摩 成吉思汗烤肉")}`, type: "youtube" }
        ]
      }
    ]
  },
  {
    day: 7,
    date: "2026/04/03",
    title: "東西線一日神串聯：童話工廠與神宮參拜",
    activities: [
      {
        time: "10:00", duration: "2.5小時", location: "白色戀人觀光工廠",
        tags: ["⭐ 非常熱門", "🍫 童話打卡"],
        description: "早上 09:30 出發，參觀充滿歐風的巧克力主題樂園。",
        transport: "地鐵東西線「宮之澤站」步行10分", 
        detailInfo: "【不只買餅乾的童話樂園】\n「白色戀人」這款以法式貓舌餅夾白巧克力的甜點，名稱靈感來自創辦人滑雪歸來時隨口說出的一句：「白色的戀人們降落了」。這座由石屋製菓打造的觀光工廠，宛如走入歐洲童話小鎮，每到整點中庭還會有華麗的機關鐘塔遊行。\n\n【隱藏版必吃甜點】\n館內還能自製「專屬相片鐵盒版」的白色戀人餅乾，是送給自己最棒的紀念品。",
        icon: Gift, mapQuery: "白色戀人觀光工廠",
        imageUrl: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "波比看世界：白色戀人工廠", url: "https://www.google.com/search?q=波比看世界+白色戀人觀光工廠", type: "web" },
          { name: "台灣Vlog：客製化鐵盒體驗", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 白色戀人觀光工廠")}`, type: "youtube" }
        ]
      },
      {
        time: "12:30", duration: "1.5小時", location: "午餐：白色戀人公園「巧克力休閒餐廳」",
        tags: ["👍 順路可加", "🍛 景觀餐廳"],
        description: "在英式洋館內享用咖哩、義大利麵與限定版甜點。",
        transport: "步行 (位於白色戀人公園內)", 
        detailInfo: "【童話般的用餐環境】\n逛完生產線後，可直接在館內的「巧克力休閒餐廳・牛津」用餐。這裡除了提供美味的西式簡餐（如歐風咖哩飯、義大利麵），重頭戲是限定的「ISHIYA 特製聖代」與巧克力鍋。坐在古色古香的窗邊，還能一邊俯瞰中庭的雪景與機關鐘塔遊行。",
        icon: Utensils, mapQuery: "白色戀人公園",
        imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "娜塔蝦：白色戀人限定甜點", url: "https://www.google.com/search?q=娜塔蝦+白色戀人+餐廳", type: "web" },
          { name: "台灣Vlog：英式洋館用餐氛圍", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 白色戀人 餐廳")}`, type: "youtube" }
        ]
      },
      {
        time: "14:30", duration: "1.5小時", location: "北海道神宮與圓山公園",
        tags: ["⭐ 非常熱門", "⛩️ 初春參拜"],
        description: "參拜北海道總鎮守，感受初春寧靜的神聖氛圍。",
        transport: "地鐵東西線 搭回「圓山公園站」步行15分 (超順路！)", 
        detailInfo: "【路線神助攻！極度順路】\n因為「白色戀人」跟「北海道神宮」都位在同一條地鐵『東西線』上，直接搭車往返市區時順路下車即可，動線100分！\n\n【神宮專屬：判官大人】\n參拜完畢後，務必前往神宮腹地內的「六花亭 神宮茶屋店」！這裡販售著全日本唯一的現烤「判官大人（判官さま）」蕎麥紅豆麻糬。外皮微焦酥脆、內餡綿密，絕對是午後最療癒的點心。",
        icon: Castle, mapQuery: "北海道神宮",
        imageUrl: "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "泰莎出去玩：北海道神宮參拜", url: "https://www.google.com/search?q=泰莎出去玩+北海道神宮", type: "web" },
          { name: "台灣Vlog：現烤判官大人麻糬", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 北海道神宮 六花亭")}`, type: "youtube" }
        ]
      },
      {
        time: "16:30", duration: "1.5小時", location: "大通公園與札幌電視塔",
        tags: ["⭐ 非常熱門", "🗼 市區地標"],
        description: "漫步於橫貫市區的綠色長廊，登塔俯瞰市區黃昏美景。",
        transport: "地鐵東西線 搭回「大通站」 (免轉線直達)", 
        detailInfo: "【無縫接軌市區核心】\n從圓山公園站搭乘地鐵東西線，只需 5 分鐘就能直達「大通站」。大通公園是札幌的心臟，四月初雖然還沒有花海，但在微涼的春風中散步非常舒服。強烈建議在黃昏時分登上「札幌電視塔」，看著市區的華燈初上，接著再步行前往附近的居酒屋吃晚餐，是非常完美的節奏！",
        icon: Camera, mapQuery: "大通公園 札幌電視塔",
        imageUrl: "https://images.unsplash.com/photo-1603006859330-9bc7c48f8605?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "波比看世界：大通公園電視塔", url: "https://www.google.com/search?q=波比看世界+大通公園", type: "web" },
          { name: "台灣Vlog：登塔看札幌市景", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 札幌電視塔")}`, type: "youtube" }
        ]
      },
      {
        time: "18:30", duration: "2小時", location: "晚餐：札幌「串鳥」或 附近居酒屋",
        tags: ["👍 順路可加", "🍻 平價居酒屋"],
        description: "吃平價美味的現烤肉串，體驗道地居酒屋文化。",
        transport: "大眾運輸 (大通、薄野周邊皆有分店)", 
        detailInfo: "【道民下班後的最愛】\n大通公園周邊有很多美食，晚餐強烈推薦吃北海道最知名的連鎖平價居酒屋「串鳥」！\n\n一入座店家會送上好喝的雞湯，現烤的「雞肉丸子」、「豬肉蘆筍卷」配上一大杯生啤酒，CP值極高，且氣氛輕鬆無拘束，分店多隨時都能吃！",
        icon: Utensils, mapQuery: "札幌 串鳥",
        imageUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "娜塔蝦：串鳥居酒屋推薦", url: "https://www.google.com/search?q=娜塔蝦+串鳥", type: "web" },
          { name: "台灣Vlog：平民居酒屋開箱", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 札幌 串鳥")}`, type: "youtube" }
        ]
      }
    ]
  },
  {
    day: 8,
    date: "2026/04/04",
    title: "滿載而歸：札幌市區與新千歲機場",
    activities: [
      {
        time: "09:30", duration: "3小時", location: "札幌市區最後大採買",
        tags: ["⭐ 非常熱門", "🛍️ 最後採買"],
        description: "09:30 退房後將行李寄放，舒適地在市區作最後掃貨。",
        transport: "步行 (札幌車站周邊)", 
        detailInfo: "【百貨地下街掃貨指南】\n退房後將行李寄放在飯店，或利用車站的置物櫃。札幌車站周邊的購物動線極佳，若要補齊高級伴手禮（如生鮮海產真空包、高級和菓子、明太子），請直攻「大丸百貨（Daimaru）」地下室的 Depachika（地下美食街）。\n\n【電器與藥妝最後衝刺】\n若需採買電器或藥妝，可前往車站南口的 Bic Camera（東急百貨內）。",
        icon: ShoppingBag, mapQuery: "札幌車站",
        imageUrl: "https://images.unsplash.com/photo-1558862106-d53b92f4405d?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "波比看世界：札幌車站必買", url: "https://www.google.com/search?q=波比看世界+札幌車站+必買", type: "web" },
          { name: "台灣Vlog：大丸百貨伴手禮特搜", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 札幌 大丸百貨 地下街")}`, type: "youtube" }
        ]
      },
      {
        time: "13:00", duration: "1.5小時", location: "午餐：機場拉麵道場「一幻拉麵」",
        tags: ["⭐ 非常熱門", "🍜 蝦味極致"],
        description: "用濃郁蝦膏熬煮的絕頂湯頭，離開北海道前的最後一擊。",
        transport: "搭乘 JR 快速機場線 (約40分) 至機場國內線航廈 3F", 
        detailInfo: "【濃郁蝦味的最高傑作】\n提早抵達機場後，請直奔國內線航廈 3F 的「北海道拉麵道場」。裡面排隊人潮最誇張的「一幻拉麵 (えびそば一幻)」絕對值得等待！以大量甜蝦頭熬煮的湯底鮮甜無比，推薦點「原味蝦鹽 (そのまま えびしお)」口味，將北海道的鮮味深深刻入腦海，作為旅程最完美的句點。",
        icon: Utensils, mapQuery: "新千歲機場 一幻拉麵",
        imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "娜塔蝦：一幻拉麵食記", url: "https://www.google.com/search?q=娜塔蝦+一幻拉麵", type: "web" },
          { name: "台灣Vlog：拉麵道場排隊盛況", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 新千歲機場 一幻拉麵")}`, type: "youtube" }
        ]
      },
      {
        time: "14:30", duration: "3小時", location: "新千歲機場終極巡禮",
        tags: ["⭐ 非常熱門", "✈️ 最強機場"],
        description: "猶如大型購物中心與遊樂場，絕對要預留時間好好逛！",
        transport: "步行 (航廈內)", 
        detailInfo: "【機場就是最強景點】\n吃飽後，新千歲機場堪稱全日本最好逛的機場，沒有之一！國內線航廈二樓集結了全北海道最強的名產。\n此外，這裡隱藏著多家牧場直營的霜淇淋店（強烈推薦 Kinotoya），甚至有 Royce 巧克力工廠、哆啦A夢樂園，以及機場天然溫泉！務必提早抵達，把最後的日幣花光！",
        icon: Plane, mapQuery: "新千歲機場",
        imageUrl: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "泰莎出去玩：新千歲機場攻略", url: "https://www.google.com/search?q=泰莎出去玩+新千歲機場", type: "web" },
          { name: "台灣Vlog：機場免稅店掃貨", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 新千歲機場 必買")}`, type: "youtube" }
        ]
      },
      {
        time: "19:10", duration: "3.5小時", location: "搭機返台",
        tags: ["📍 交通節點", "🧳 滿載而歸"],
        description: "搭乘酷航 TR893，帶著滿滿的北國回憶返回台灣。",
        transport: "飛機", 
        detailInfo: "【完美落地與回憶歸檔】\n酷航櫃檯通常在起飛前 3 小時開放，托運行李前請務必再次確認「液體類」與「免稅品密封袋」是否已經妥善安置。\n\n此班機預計於台灣時間 22:35 抵達桃園國際機場第一航廈。在飛機上剛好可以整理滿滿的相片與雲端記帳本，規劃下一趟的北海道夏季薰衣草或冬季破冰船之旅！",
        icon: Bed, mapQuery: "桃園國際機場",
        imageUrl: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=1000&auto=format&fit=crop",
        sourceLinks: [
          { name: "台灣Vlog：酷航搭乘實錄", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("台灣 Vlog 酷航 札幌 台北")}`, type: "youtube" }
        ]
      }
    ]
  }
];

// ==========================================
// 🔻 步驟三：「行前懶人包」 14大內行避坑指南 🔻
// ==========================================
const SURVIVAL_GUIDES = [
  {
    icon: Train,
    color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200",
    title: "1. JR Pass 絕對省錢？請精算！",
    content: "不要盲目購買「北海道鐵路周遊券」。本行程前四天採自駕，若只有後段（札幌-小樽-機場）搭乘 JR，購買單程票或刷 Suica/ICOCA 絕對比買 Pass 便宜得多！別被「吃到飽」的迷思綁架了預算。"
  },
  {
    icon: Snowflake,
    color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200",
    title: "2. 四月自駕的「隱形殺手」",
    content: "雖然四月平地已無積雪，但清晨或山區（如登別、洞爺湖）極易出現「黑冰（Black Ice）」——路面結冰呈透明狀，看似濕潤實則極滑。租車時務必向車行再三確認是否配置「Studless（無釘雪胎）」，切勿心存僥倖。"
  },
  {
    icon: Shield,
    color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200",
    title: "3. 租車保險：防鹿勝於防人",
    content: "在北海道郊區自駕，最大的威脅不是其他車輛，而是「蝦夷鹿（Ezo Deer）」。黃昏至夜間蝦夷鹿常突然衝出馬路，撞擊會導致車輛嚴重毀損。請務必加購包含「NOC（營業損失賠償）」的最高等級保險（Full Coverage）。"
  },
  {
    icon: CloudSnow,
    color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200",
    title: "4. 別穿錯鞋！四月限定的泥濘地獄",
    content: "四月正值北海道的「融雪期」，路邊積雪融化會讓街道變成冰水與泥巴的混合池。穿一般運動鞋或不防水的雪靴，10分鐘內就會濕透凍傷。強烈建議穿著具備 Gore-Tex 防水功能且防滑的短靴或皮靴！"
  },
  {
    icon: Sun,
    color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200",
    title: "5. 「洋蔥式穿搭」是個錯誤迷思",
    content: "在北海道，室內與車內的暖氣高達 25 度！如果穿好幾件毛衣（洋蔥式），進室內會熱到流汗崩潰。正確做法是「玉米式穿搭」：最外層穿極度保暖防風防雪的大衣，裡面只穿一件普通長袖秋裝即可，方便迅速穿脫。"
  },
  {
    icon: Wallet,
    color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200",
    title: "6. 居酒屋的「潛規則」：小菜費",
    content: "在札幌薄野或函館的居酒屋入座時，店家會自動送上一碟小菜（お通し/Otoshi），結帳時會多出 300~500 日圓的費用。這不是敲竹槓，而是日本的「座位費/服務費」文化，請當作體驗在地禮儀大方接受。"
  },
  {
    icon: Heart,
    color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200",
    title: "7. 溫泉禮儀與刺青規範",
    content: "日本多數傳統大眾溫泉（含登別、洞爺湖）嚴格禁止露出刺青者入浴（含微刺青）。若有刺青，請務必購買膚色「刺青遮蔽貼紙」貼妥，或訂購附設「貸切風呂（私人湯屋）」的房型。且毛巾絕對不可浸入浴池中。"
  },
  {
    icon: Clock,
    color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200",
    title: "8. 避開人潮的名店排隊法",
    content: "諸如「GARAKU湯咖哩」、「達摩成吉思汗烤肉」等名店幾乎不接受訂位，用餐尖峰至少排隊1.5小時起跳。部落客秘訣：選擇下午 3 點或晚上 9 點過後的「離峰時段」前往，能大幅提升旅遊品質。"
  },
  {
    icon: BaggageClaim,
    color: "text-fuchsia-600", bg: "bg-fuchsia-50", border: "border-fuchsia-200",
    title: "9. 寄物櫃危機：善用預約APP",
    content: "札幌車站與函館車站的大型投幣式置物櫃（Coin Locker）常常在早上 10 點前就被搶空。建議下載並使用「ecbo cloak」APP，可事先預約附近郵局、咖啡廳的閒置空間來寄放大型行李箱。"
  },
  {
    icon: CreditCard,
    color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200",
    title: "10. 現金為王！偏鄉支付現況",
    content: "雖然百貨與超商皆支援 Apple Pay 與信用卡，但在函館朝市的攤販、老字號拉麵店的食券機、郊區的付費停車場，高機率「只收現金（Cash Only）」。建議每人隨身備妥至少 3 萬日圓現鈔應急。"
  },
  {
    icon: AlertCircle,
    color: "text-red-600", bg: "bg-red-50", border: "border-red-200",
    title: "11. 免稅品包裝千萬別拆！",
    content: "依據日本免稅法規，屬於「消耗品」（如藥妝、零食）在退稅後會被密封在免稅袋中，【離開日本前絕對不能拆封使用】，否則海關查驗時將被要求補繳 10% 消費稅。一般物品（衣服、電器）則可直接在日本使用。"
  },
  {
    icon: ShieldAlert,
    color: "text-stone-600", bg: "bg-stone-50", border: "border-stone-200",
    title: "12. 野生動物應對：嚴禁餵食",
    content: "在道南道央郊區極易遇到北狐或蝦夷鹿，【絕對不可餵食】！除了會破壞生態讓動物失去覓食能力，人類食物的氣味更容易引來致命的棕熊。拍照請保持安全距離，自駕遇到動物請減速，切勿鳴按喇叭。"
  },
  {
    icon: Sun,
    color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200",
    title: "13. 雪盲症防護與極端防曬",
    content: "千萬別以為春天的太陽不毒辣！四月初郊區仍有殘雪，白雪反射的紫外線強度高達平地的兩倍。出外自駕或長時間散步，請務必配戴「抗UV太陽眼鏡」並塗抹高係數防曬，否則眼睛極易發炎（雪盲症）並嚴重曬黑。"
  },
  {
    icon: Utensils,
    color: "text-lime-600", bg: "bg-lime-50", border: "border-lime-200",
    title: "14. 餐廳「共食」潛規則",
    content: "許多台灣遊客習慣「兩人點一碗麵分食」以保留胃口，但這在日本餐廳（特別是拉麵店、海鮮丼飯）是非常失禮的。請務必遵守「一人點一份餐（One Order制）」。若食量較小，可詢問店家是否有「Small Size（小份）」可以點。"
  }
];

// ==========================================
// 🔻 步驟四：「必買戰利品」 17 大擴充清單 🔻
// ==========================================
const SHOPPING_ITEMS = [
  // 🍰 分類一：經典必敗甜點
  {
    category: "🍰 經典必敗甜點",
    icon: Gift, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200",
    title: "六花亭 (Rokkatei)", subtitle: "北海道最具藝術氣息的甜點霸主",
    content: "除了經典的「萊姆葡萄奶油夾心餅乾」與酒糖，內行人才知道要買機場買不到的「酥脆派 (サクサクパイ)」！其包裝紙由畫家坂本直行繪製的北海道野花，極具質感。建議在札幌本店或五稜郭店一次買齊。",
    imageUrl: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?q=80&w=1000&auto=format&fit=crop",
    link: { name: "官方網站", url: "https://www.rokkatei.co.jp/", type: "blog" }
  },
  {
    category: "🍰 經典必敗甜點",
    icon: Coffee, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200",
    title: "LeTAO", subtitle: "小樽發跡的起司蛋糕傳奇",
    content: "「原味雙層起司蛋糕 (Double Fromage)」是必買神物，上層是義大利馬斯卡彭生乳酪，下層是烘焙乳酪，入口即化。不用擔心帶不回台灣，機場有販售採用獨家冷凍技術的保冷包裝，可維持 48 小時！",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop",
    link: { name: "官方網站", url: "https://www.letao.jp/", type: "blog" }
  },
  {
    category: "🍰 經典必敗甜點",
    icon: Store, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200",
    title: "ROYCE'", subtitle: "機場免稅區的最後掃貨重點",
    content: "北海道極具代表性的「生巧克力」與邪惡的「巧克力洋芋片」。部落客掃貨攻略：【千萬不要在市區買】！因為生巧克力需要保冷且沉重，請在回程時，於新千歲機場「過完海關安檢後」的免稅店大買特買，直接省稅又免提。",
    imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=1000&auto=format&fit=crop",
    link: { name: "官方網站", url: "https://www.royce.com/", type: "blog" }
  },
  {
    category: "🍰 經典必敗甜點",
    icon: Heart, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200",
    title: "白色戀人 (ISHIYA)", subtitle: "永遠的經典法式貓舌餅",
    content: "雖然大家已經吃到怕，但這款白巧克力夾心餅乾依然是北海道的代名詞。隱藏玩法：在「白色戀人觀光工廠」，你可以提供自己的照片，現場印製一盒專屬於你的「原創鐵盒版白色戀人」，絕對是極具紀念價值的戰利品。",
    imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1000&auto=format&fit=crop",
    link: { name: "官方網站", url: "https://www.ishiya.co.jp/", type: "blog" }
  },
  {
    category: "🍰 經典必敗甜點",
    icon: Palmtree, color: "text-green-600", bg: "bg-green-50", border: "border-green-200",
    title: "柳月 (Ryugetsu)", subtitle: "在地人瘋搶的白樺樹年輪蛋糕",
    content: "相較於白色戀人，北海道在地人更愛買柳月的「三方六 (Sanporoku)」！這是一款外層塗有黑白巧克力的年輪蛋糕，完美仿造了北海道常見的白樺樹皮紋理，口感濕潤扎實，經常在當地超市或超商一上架就被掃空。",
    imageUrl: "https://images.unsplash.com/photo-1614145121029-83a9f7b68bf4?q=80&w=1000&auto=format&fit=crop",
    link: { name: "官方網站", url: "https://www.ryugetsu.co.jp/", type: "blog" }
  },
  {
    category: "🍰 經典必敗甜點",
    icon: Gift, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200",
    title: "Petite Merveille", subtitle: "函館發跡的金賞起士蛋糕",
    content: "函館發跡的起士蛋糕，連續多年獲得國際甜點大賞金賞，奶香濃郁、入口即化，是道南必買的招牌甜點！",
    imageUrl: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?q=80&w=1000&auto=format&fit=crop",
    link: { name: "官方網站", url: "https://www.petite-merveille.jp/", type: "web" }
  },
  {
    category: "🍰 經典必敗甜點",
    icon: Store, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200",
    title: "Snow Cheese", subtitle: "札幌車站超人氣排隊起司甜點",
    content: "近期在札幌車站引發排隊熱潮的新興人氣起司甜點「Snow Cheese」，外觀精緻且起司風味極度濃郁，是目前最難搶的夢幻伴手禮之一。",
    imageUrl: "https://images.unsplash.com/photo-1608830597654-055ee5a1dfc1?q=80&w=1000&auto=format&fit=crop",
    link: { name: "官方網站", url: "https://snowcheese.jp/", type: "web" }
  },
  {
    category: "🍰 經典必敗甜點",
    icon: Coffee, color: "text-sky-500", bg: "bg-sky-50", border: "border-sky-200",
    title: "KINOTOYA", subtitle: "極濃郁牛奶霜淇淋與半熟起司塔",
    content: "非常受歡迎的「半熟起司塔」與極濃郁的「牛奶霜淇淋」。在機場就可以輕鬆買到，現烤出爐的起司塔外酥內軟，絕對要趁熱吃！",
    imageUrl: "https://images.unsplash.com/photo-1555529733-0e670560f7e1?q=80&w=1000&auto=format&fit=crop",
    link: { name: "官方網站", url: "https://www.kinotoya.com/", type: "web" }
  },

  // 🍘 分類二：鹹食零嘴與在地挖寶
  {
    category: "🍘 鹹食零嘴與在地挖寶",
    icon: Store, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200",
    title: "北菓樓 (Kitakaro)", subtitle: "北海道開拓米菓 (下酒神物)",
    content: "除了甜點，北菓樓的「開拓米菓」絕對是鹹食控的救星！將北海道各地的頂級海鮮（如枝幸帆立貝、增毛秋鮭、襟裳甜蝦）揉入米菓中，經過七天繁複工序製成。口感極度酥脆，海味濃郁，是配啤酒的完美神物！",
    imageUrl: "https://images.unsplash.com/photo-1599598425947-330026e16a5a?q=80&w=1000&auto=format&fit=crop",
    link: { name: "官方網站", url: "https://www.kitakaro.com/", type: "web" }
  },
  {
    category: "🍘 鹹食零嘴與在地挖寶",
    icon: Fish, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200",
    title: "頂級道產乾海鮮", subtitle: "干貝糖與日高昆布 (長輩最愛)",
    content: "不知道要送長輩什麼？去函館朝市或小樽三角市場買「乾海產」就對了！北海道的日高昆布是熬煮日式高湯的頂級靈魂；而一顆顆金黃飽滿的「帆立貝柱（干貝糖）」，鮮甜無比，不管當零嘴直接吃或熬海鮮粥都超級適合。",
    imageUrl: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=1000&auto=format&fit=crop",
    link: { name: "必買海味特搜", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("北海道 干貝糖 必買")}`, type: "youtube" }
  },
  {
    category: "🍘 鹹食零嘴與在地挖寶",
    icon: Utensils, color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200",
    title: "YOSHIMI 札幌燒玉米仙貝", subtitle: "鹹食救星 Oh! 焼きとうきび",
    content: "吃膩了甜食伴手禮？這款代表札幌大通公園夏日風情的「燒玉米仙貝」是鹹食救星！濃郁的醬油烤玉米香氣，裡面還真的吃得到乾燥的玉米粒，口感酥脆鹹甜交織，絕對是回台後配啤酒的最佳零嘴。",
    imageUrl: "https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?q=80&w=1000&auto=format&fit=crop",
    link: { name: "官方網站", url: "https://www.yoshimi-ism.com/", type: "blog" }
  },
  {
    category: "🍘 鹹食零嘴與在地挖寶",
    icon: ShoppingBag, color: "text-red-500", bg: "bg-red-50", border: "border-red-200",
    title: "名店湯咖哩調理包", subtitle: "把北海道靈魂滋味帶回家",
    content: "吃完 GARAKU 或 Suage+ 意猶未盡嗎？各大超市或狸小路唐吉訶德都有販售名店授權的「湯咖哩調理包」！回台灣只要自己加點高麗菜、馬鈴薯和雞肉，就能完美神還原北海道的感動，是送給愛下廚朋友的最強禮物。",
    imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1000&auto=format&fit=crop",
    link: { name: "湯咖哩料理教學", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("北海道 湯咖哩 調理包")}`, type: "youtube" }
  },
  {
    category: "🍘 鹹食零嘴與在地挖寶",
    icon: Store, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200",
    title: "Seicomart 獨家商品", subtitle: "北海道限定的最強便利商店",
    content: "到了北海道，別只逛 7-11！這家橘色招牌的道民專屬超商，藏著許多平價寶藏。必買：Secoma 自家品牌 100% 北海道豐富町產的鮮奶、哈密瓜霜淇淋，以及高CP值的百元泡麵，完全展現了北海道農牧大國的實力。",
    imageUrl: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1000&auto=format&fit=crop",
    link: { name: "官方網站", url: "https://www.seicomart.co.jp/", type: "blog" }
  },
  {
    category: "🍘 鹹食零嘴與在地挖寶",
    icon: Package, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200",
    title: "北海道頂級乳製品", subtitle: "在地起司與發酵奶油",
    content: "北海道的自然資源豐富，各種真空包裝的北海道在地起司、發酵奶油絕對不可錯過。有些店家甚至提供冷凍宅配包裝讓旅客帶回，是品嚐農牧大國實力的最佳選擇。",
    imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=1000&auto=format&fit=crop",
    link: { name: "北海道乳製品推薦", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("北海道 起司 奶油 推薦")}`, type: "youtube" }
  },

  // 🍶 分類三：在地特色酒類
  {
    category: "🍶 在地特色酒類",
    icon: Droplets, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200",
    title: "網走流冰啤酒", subtitle: "夢幻湛藍色的流冰系啤酒",
    content: "除了經典的 Sapporo Beer 之外，特別推薦外觀呈現夢幻藍色的「網走流冰啤酒」！使用鄂霍次克海的流冰釀製，口感清爽又超級吸睛，是打卡與送禮的神物。",
    imageUrl: "https://images.unsplash.com/photo-1614316279149-f9fbdbfca2d3?q=80&w=1000&auto=format&fit=crop",
    link: { name: "網走啤酒官網", url: "https://www.takahasi.co.jp/beer/", type: "web" }
  },
  {
    category: "🍶 在地特色酒類",
    icon: Wine, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200",
    title: "北海道知名地酒", subtitle: "國稀、千歲鶴、小林酒造",
    content: "北海道有許多使用優質水源釀造的知名酒造，例如增毛町的「國稀」、札幌的「千歲鶴」，以及栗山町的「小林酒造」。帶一瓶純正的北海道清酒回台，是品味北國風情的最高境界。",
    imageUrl: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=1000&auto=format&fit=crop",
    link: { name: "北海道地酒推薦", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("北海道 必買 清酒 地酒")}`, type: "youtube" }
  },

  // 💊 分類四：藥妝保養與限定香氛
  {
    category: "💊 藥妝保養與限定香氛",
    icon: Pill, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200",
    title: "日本必買常備藥妝", subtitle: "EVE / 合利他命 / 若元錠",
    content: "狸小路上的大國藥妝、松本清，或是札幌車站的 Bic Camera 是主要戰場。台灣人最愛的合利他命EX PLUS、EVE止痛藥都有驚人的價差！⚠️注意：部分熱門感冒藥有「每人限購一盒」規定，且退稅藥妝會被封死，絕對不能在日本境內拆開！",
    imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=1000&auto=format&fit=crop",
    link: { name: "日本藥妝退稅規定", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("日本藥妝 退稅規定 2026")}`, type: "youtube" }
  },
  {
    category: "💊 藥妝保養與限定香氛",
    icon: Sparkles, color: "text-fuchsia-500", bg: "bg-fuchsia-50", border: "border-fuchsia-200",
    title: "SHIRO", subtitle: "北海道發跡的頂級極簡香氛",
    content: "近年在日本與台灣瘋搶的高級香氛品牌 SHIRO，其實正是發跡於北海道砂川市！品牌堅持使用當地自然素材（如昆布、酒粕）。最推薦他們的「Savon（皂香）」與「白百合」香水與護手霜，香氣高級且不撞香，在札幌大丸百貨就能買到。",
    imageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop",
    link: { name: "SHIRO 官方網站", url: "https://shiro-shiro.jp/", type: "web" }
  },
  {
    category: "💊 藥妝保養與限定香氛",
    icon: Leaf, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200",
    title: "北見薄荷通商", subtitle: "北海道必買的萬用薄荷神油",
    content: "北見市曾是全球最大的薄荷產地！這款包裝復古的「天然薄荷油」是道民家家戶戶的常備良藥。不僅可以防蚊叮咬、提神醒腦、滴入浴缸泡澡，甚至達到食品級可滴在紅茶中飲用。噴霧小瓶裝非常適合隨身攜帶。",
    imageUrl: "https://images.unsplash.com/photo-1608523126868-b76985a97576?q=80&w=1000&auto=format&fit=crop",
    link: { name: "官方網站", url: "https://kitami-hakka.jp/", type: "web" }
  },
  {
    category: "💊 藥妝保養與限定香氛",
    icon: Package, color: "text-pink-500", bg: "bg-pink-50", border: "border-pink-200",
    title: "LuLuLun 北海道限定面膜", subtitle: "地區限定的香氣保養",
    content: "日本藥妝店必掃的 LuLuLun 面膜，到了北海道有超狂的「地區限定版」！包含了富良野薰衣草、夕張哈密瓜、甚至昆布精華口味。包裝精美且是一片片獨立或小包裝，拿來當作辦公室「伴手禮分送」面子十足又實用。",
    imageUrl: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=1000&auto=format&fit=crop",
    link: { name: "LuLuLun 官方網站", url: "https://lululun.com/", type: "web" }
  },
  {
    category: "💊 藥妝保養與限定香氛",
    icon: Droplet, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200",
    title: "北海道天然純馬油", subtitle: "日高純馬油 / 尊馬油",
    content: "北海道氣候極度乾燥，當地出產的馬油純度極高（推薦選購 100% 純馬油），其脂肪酸成分與人體皮脂相近，吸收極快且完全不黏膩。拿來擦拭身體乾燥處、護手，甚至當作護唇膏都非常適合，是送給長輩最貼心的保養品。",
    imageUrl: "https://images.unsplash.com/photo-1608248593802-8637cb2f43d8?q=80&w=1000&auto=format&fit=crop",
    link: { name: "馬油挑選教學", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("北海道 純馬油 推薦")}`, type: "youtube" }
  },
  {
    category: "💊 藥妝保養與限定香氛",
    icon: Gem, color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-200",
    title: "北海道薰衣草精油香氛", subtitle: "富良野的天然放鬆香氣",
    content: "北海道的薰衣草享譽國際，雖然四月看不到花海，但在狸小路或機場的土產店都能買到來自富良野農場的純天然「薰衣草精油、護手霜或安眠眼罩」。其天然的舒緩香氣，絕對是都市人下班後提升睡眠品質的療癒神物。",
    imageUrl: "https://images.unsplash.com/photo-1498084393753-b411b2d26b34?q=80&w=1000&auto=format&fit=crop",
    link: { name: "富田農場線上商店", url: "https://www.farm-tomita.co.jp/", type: "web" }
  },

  // 🎐 分類五：精緻工藝品與紀念物
  {
    category: "🎐 精緻工藝品與紀念物",
    icon: Sparkles, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200",
    title: "小樽玻璃工藝品 (硝子)", subtitle: "北一硝子與大正硝子館",
    content: "小樽的「北一硝子」與「大正硝子館」擁有規模龐大的玻璃工坊，從精美花瓶、和風玻璃杯到各式小掛飾擺件，造型獨特又浪漫，絕對值得帶回家收藏。",
    imageUrl: "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=1000&auto=format&fit=crop",
    link: { name: "北一硝子官網", url: "https://kitaichiglass.co.jp/", type: "web" }
  },
  {
    category: "🎐 精緻工藝品與紀念物",
    icon: Gift, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200",
    title: "小樽音樂盒堂", subtitle: "日本規模最大的音樂盒專賣店",
    content: "「小樽音樂盒堂」是日本歷史最悠久、規模最大的音樂盒專賣店。館內有數千種款式，從木製古典造型到華麗的水晶款式，非常有紀念價值。",
    imageUrl: "https://images.unsplash.com/photo-1510251101908-51f67fecb5eb?q=80&w=1000&auto=format&fit=crop",
    link: { name: "小樽音樂盒堂官網", url: "https://www.otaru-orgel.co.jp/", type: "web" }
  },

  // 🥐 分類六：限定爆紅美食
  {
    category: "🥐 限定爆紅美食",
    icon: Store, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200",
    title: "Truffle BAKERY", subtitle: "木村拓哉也愛的白松露鹽奶油捲",
    content: "這家東京大排長龍的名店在北海道也有分店！木村拓哉也超愛的「白松露鹽奶油捲」，松露香氣濃郁搭配鹹香口感。如果您有安排前往北廣島市的 F VILLAGE 棒球園區，千萬別錯過，強烈建議多買幾個！",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop",
    link: { name: "Truffle BAKERY 介紹", url: `https://www.youtube.com/results?search_query=${encodeURIComponent("Truffle BAKERY 北海道")}`, type: "youtube" }
  }
];

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
      <footer className="text-center py-8 text-gray-400 text-sm bg-gray-100 mt-8"><p>Enjoy Your Trip ✈️ Designed exclusively for your Hokkaido Journey.</p></footer>
    </div>
  );
}