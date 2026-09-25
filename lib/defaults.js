// 首次啟動時寫入 data/db.json 的預設內容，之後全部可在後台修改
module.exports = () => ({
  settings: {
    siteName: 'Alpaca Lab Studio',
    tagline: '品牌設計 × 影像製作 × 數位行銷',
    logo: '',
    favicon: '',
    primaryColor: '#2f5d50',
    accentColor: '#e8b04b',
    bgColor: '#faf7f2',
    textColor: '#2b2b2b',
    fontFamily: "'Noto Sans TC', sans-serif",
    headingFont: "'Noto Serif TC', serif",
    email: 'hello@example.com',
    phone: '02-1234-5678',
    address: '台北市信義區示範路 100 號',
    businessHours: '週一至週五 10:00–19:00',
    lineUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    footerText: '用設計說好品牌的故事。',
    copyright: '© {year} Alpaca Lab Studio. All rights reserved.',
    metaDescription: '專注品牌識別、商品攝影與數位廣告素材製作的創意工作室。',
    metaKeywords: '品牌設計,商品攝影,廣告素材,網站設計',
    ogImage: '',
    gaId: '',
    gtmId: '',
    metaPixelId: '',
    customHeadCode: '',
    navItems: [
      { label: '首頁', url: '/' },
      { label: '關於我們', url: '/about' },
      { label: '服務項目', url: '/services' },
      { label: '作品集', url: '/works' },
      { label: '文章專欄', url: '/blog' },
      { label: '聯絡我們', url: '/contact' }
    ]
  },
  home: {
    heroTitle: '讓每個品牌\n都被好好看見',
    heroSubtitle: '從品牌識別、商品攝影到廣告素材，我們陪你把想法變成打動人心的畫面。',
    heroImage: '',
    heroButtonText: '預約諮詢',
    heroButtonUrl: '/contact',
    heroButton2Text: '看作品',
    heroButton2Url: '/works',
    showAbout: true,
    aboutTitle: '關於工作室',
    aboutText: '我們是一群熱愛設計與影像的創作者，相信好的視覺不只是好看，而是能讓對的人停下來、記住你、並採取行動。\n\n從前期的品牌策略梳理，到拍攝、設計、上線，我們提供一站式的創意服務。',
    aboutImage: '',
    aboutButtonText: '認識我們',
    aboutButtonUrl: '/about',
    showStats: true,
    stats: [
      { number: '120+', label: '合作品牌' },
      { number: '800+', label: '完成專案' },
      { number: '8', label: '年經驗' },
      { number: '98%', label: '客戶回購率' }
    ],
    showServices: true,
    servicesTitle: '服務項目',
    servicesSubtitle: '依品牌階段量身規劃，不做沒有目的的漂亮。',
    showWorks: true,
    worksTitle: '精選作品',
    worksSubtitle: '每一個案子，都是一個品牌的故事。',
    showPosts: true,
    postsTitle: '最新文章',
    postsSubtitle: '設計、拍攝與行銷的實戰筆記。',
    showCta: true,
    ctaTitle: '準備好開始你的下一個專案了嗎？',
    ctaText: '留下需求，我們會在 1 個工作天內回覆你。',
    ctaButtonText: '立即聯絡',
    ctaButtonUrl: '/contact'
  },
  pages: {
    about: {
      title: '關於我們',
      subtitle: 'About Us',
      image: '',
      content: '<h2>我們的故事</h2><p>Alpaca Lab Studio 成立於 2018 年，從一間小小的攝影棚開始，逐步發展為涵蓋品牌設計、影像製作與數位行銷的創意團隊。</p><h2>我們相信</h2><p>好的設計來自對品牌的深度理解。每一次合作，我們都會先花時間了解你的產品、你的客人，以及你想被記住的樣子。</p>'
    },
    contact: {
      title: '聯絡我們',
      subtitle: 'Contact',
      intro: '有任何合作想法，歡迎填寫表單，或直接透過以下方式聯繫我們。',
      showForm: true,
      mapEmbed: ''
    }
  },
  services: [
    { id: 's1', title: '品牌識別設計', icon: '✦', image: '', description: 'Logo、品牌色彩、字體規範與品牌手冊，建立一致且好辨識的品牌形象。', order: 1 },
    { id: 's2', title: '商品攝影', icon: '◎', image: '', description: '去背商品照、情境照、電商主圖，讓商品在第一眼就說服消費者。', order: 2 },
    { id: 's3', title: '廣告素材製作', icon: '▶', image: '', description: 'Meta / Google 廣告圖文與短影音素材，依受眾與漏斗階段設計多版本測試。', order: 3 },
    { id: 's4', title: '網站與電商設計', icon: '◇', image: '', description: '品牌官網、電商版型與活動頁設計，兼顧美感與轉換率。', order: 4 }
  ],
  works: [
    { id: 'w1', title: '手作甜點品牌重塑', slug: 'dessert-rebrand', category: '品牌設計', client: '示範甜點', image: '', description: '<p>為手作甜點品牌重新規劃品牌識別與包裝設計。</p>', featured: true, order: 1, createdAt: '2026-01-10T00:00:00.000Z' },
    { id: 'w2', title: '茶飲電商主圖拍攝', slug: 'tea-product-photo', category: '商品攝影', client: '示範茶飲', image: '', description: '<p>電商主圖與情境照拍攝，共 60 張成品。</p>', featured: true, order: 2, createdAt: '2026-02-12T00:00:00.000Z' },
    { id: 'w3', title: '週年慶廣告素材', slug: 'anniversary-ads', category: '廣告素材', client: '示範食品', image: '', description: '<p>週年慶 Meta 廣告素材，含 12 組圖文與 4 支短影音。</p>', featured: true, order: 3, createdAt: '2026-03-05T00:00:00.000Z' }
  ],
  categories: [
    { id: 'c1', name: '品牌設計', slug: 'branding' },
    { id: 'c2', name: '攝影技巧', slug: 'photography' },
    { id: 'c3', name: '數位行銷', slug: 'marketing' }
  ],
  posts: [
    {
      id: 'p1',
      title: '電商商品照怎麼拍？5 個讓點擊率提升的關鍵',
      slug: 'ecommerce-product-photo-tips',
      excerpt: '主圖是消費者對商品的第一印象，這 5 個拍攝重點能幫你的商品在列表中脫穎而出。',
      content: '<p>主圖是消費者對商品的第一印象。以下整理 5 個實戰重點：</p><h2>1. 主體佔畫面 70% 以上</h2><p>在手機列表中，縮圖非常小，主體太小會直接被滑過。</p><h2>2. 背景簡潔、與品牌色呼應</h2><p>乾淨的背景能讓商品本身成為焦點。</p><h2>3. 提供使用情境</h2><p>情境照幫助消費者想像擁有商品後的樣子。</p>',
      cover: '',
      categoryId: 'c2',
      tags: ['商品攝影', '電商'],
      status: 'published',
      featured: true,
      author: '編輯部',
      metaTitle: '',
      metaDescription: '',
      publishedAt: '2026-09-01T02:00:00.000Z',
      createdAt: '2026-09-01T02:00:00.000Z',
      updatedAt: '2026-09-01T02:00:00.000Z',
      views: 0
    },
    {
      id: 'p2',
      title: '品牌識別不只是 Logo：一套完整 CIS 包含哪些東西？',
      slug: 'what-is-brand-identity',
      excerpt: '很多品牌以為做完 Logo 就結束了，其實品牌識別系統涵蓋的範圍比你想的更廣。',
      content: '<p>品牌識別系統（CIS）通常包含：Logo 與變體、標準色、標準字、輔助圖形、應用規範等。</p><p>有了完整規範，設計團隊與外部廠商才能產出一致的品牌視覺。</p>',
      cover: '',
      categoryId: 'c1',
      tags: ['品牌'],
      status: 'published',
      featured: false,
      author: '編輯部',
      metaTitle: '',
      metaDescription: '',
      publishedAt: '2026-08-20T02:00:00.000Z',
      createdAt: '2026-08-20T02:00:00.000Z',
      updatedAt: '2026-08-20T02:00:00.000Z',
      views: 0
    }
  ],
  messages: [],
  media: [],
  users: []
});
