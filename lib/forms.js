// 後台表單定義：新增欄位只要在這裡加一行，後台就會自動出現對應輸入框
// type: text | textarea | richtext | image | checkbox | color | pairs | code | map | number

const settings = [
  {
    title: '基本資訊',
    fields: [
      { name: 'siteName', label: '網站名稱', type: 'text' },
      { name: 'tagline', label: '標語', type: 'text' },
      { name: 'logo', label: 'Logo', type: 'image', help: '建議透明背景 PNG / SVG，高度 80px 以上。未上傳則顯示網站名稱文字' },
      { name: 'favicon', label: '網站小圖示 Favicon', type: 'image', help: '建議 512×512 PNG' }
    ]
  },
  {
    title: '外觀配色與字體',
    fields: [
      { name: 'primaryColor', label: '主色', type: 'color' },
      { name: 'accentColor', label: '強調色', type: 'color' },
      { name: 'bgColor', label: '背景色', type: 'color' },
      { name: 'textColor', label: '文字色', type: 'color' },
      {
        name: 'fontFamily',
        label: '內文字體',
        type: 'select',
        options: [
          ["'Noto Sans TC', sans-serif", '思源黑體 Noto Sans TC'],
          ["'Noto Serif TC', serif", '思源宋體 Noto Serif TC'],
          ["'LXGW WenKai TC', serif", '霞鶩文楷 LXGW WenKai TC'],
          ["system-ui, sans-serif", '系統預設字體']
        ]
      },
      {
        name: 'headingFont',
        label: '標題字體',
        type: 'select',
        options: [
          ["'Noto Serif TC', serif", '思源宋體 Noto Serif TC'],
          ["'Noto Sans TC', sans-serif", '思源黑體 Noto Sans TC'],
          ["'LXGW WenKai TC', serif", '霞鶩文楷 LXGW WenKai TC'],
          ["system-ui, sans-serif", '系統預設字體']
        ]
      }
    ]
  },
  {
    title: '導覽選單',
    fields: [
      {
        name: 'navItems',
        label: '選單項目',
        type: 'pairs',
        keys: ['label', 'url'],
        help: '一行一個，格式：顯示文字|連結。例如：文章專欄|/blog，外部連結請寫完整網址'
      }
    ]
  },
  {
    title: '聯絡資訊與社群',
    fields: [
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'phone', label: '電話', type: 'text' },
      { name: 'address', label: '地址', type: 'text' },
      { name: 'businessHours', label: '營業時間', type: 'text' },
      { name: 'lineUrl', label: 'LINE 官方帳號連結', type: 'text', help: '例如 https://lin.ee/xxxx' },
      { name: 'facebookUrl', label: 'Facebook 粉專連結', type: 'text' },
      { name: 'instagramUrl', label: 'Instagram 連結', type: 'text' },
      { name: 'youtubeUrl', label: 'YouTube 連結', type: 'text' }
    ]
  },
  {
    title: '頁尾',
    fields: [
      { name: 'footerText', label: '頁尾介紹文字', type: 'textarea' },
      { name: 'copyright', label: '版權文字', type: 'text', help: '{year} 會自動換成今年年份' }
    ]
  },
  {
    title: 'SEO 與分享',
    fields: [
      { name: 'metaDescription', label: '預設網站描述', type: 'textarea', help: 'Google 搜尋結果顯示的說明，建議 80–150 字' },
      { name: 'metaKeywords', label: '關鍵字', type: 'text', help: '以逗號分隔' },
      { name: 'ogImage', label: '預設分享圖（OG Image）', type: 'image', help: 'FB / LINE 分享預覽圖，建議 1200×630' }
    ]
  },
  {
    title: '追蹤碼',
    fields: [
      { name: 'gaId', label: 'Google Analytics 4 評估 ID', type: 'text', help: '格式 G-XXXXXXX' },
      { name: 'gtmId', label: 'Google Tag Manager ID', type: 'text', help: '格式 GTM-XXXXXXX。若已用 GTM 管理 GA4，GA4 欄位請留空以免重複計算' },
      { name: 'metaPixelId', label: 'Meta Pixel ID', type: 'text', help: '純數字，會自動送出 PageView；聯絡表單送出成功送出 Lead 事件' },
      { name: 'customHeadCode', label: '自訂 <head> 程式碼', type: 'code', help: '其他追蹤碼（如 LINE Tag）貼在這裡，會原樣輸出到每一頁' }
    ]
  }
];

const home = [
  {
    title: '主視覺（Hero）',
    fields: [
      { name: 'heroTitle', label: '大標題', type: 'textarea', help: '可換行' },
      { name: 'heroSubtitle', label: '副標題', type: 'textarea' },
      { name: 'heroImage', label: '背景圖片', type: 'image', help: '建議 1920×1080 以上橫式照片' },
      { name: 'heroButtonText', label: '主按鈕文字', type: 'text' },
      { name: 'heroButtonUrl', label: '主按鈕連結', type: 'text' },
      { name: 'heroButton2Text', label: '次按鈕文字', type: 'text', help: '留空則不顯示' },
      { name: 'heroButton2Url', label: '次按鈕連結', type: 'text' }
    ]
  },
  {
    title: '關於區塊',
    fields: [
      { name: 'showAbout', label: '顯示此區塊', type: 'checkbox' },
      { name: 'aboutTitle', label: '標題', type: 'text' },
      { name: 'aboutText', label: '內文', type: 'textarea' },
      { name: 'aboutImage', label: '圖片', type: 'image' },
      { name: 'aboutButtonText', label: '按鈕文字', type: 'text' },
      { name: 'aboutButtonUrl', label: '按鈕連結', type: 'text' }
    ]
  },
  {
    title: '數字亮點',
    fields: [
      { name: 'showStats', label: '顯示此區塊', type: 'checkbox' },
      { name: 'stats', label: '數字項目', type: 'pairs', keys: ['number', 'label'], help: '一行一個，格式：數字|說明，例如 120+|合作品牌' }
    ]
  },
  {
    title: '服務項目區塊',
    fields: [
      { name: 'showServices', label: '顯示此區塊', type: 'checkbox' },
      { name: 'servicesTitle', label: '標題', type: 'text' },
      { name: 'servicesSubtitle', label: '副標題', type: 'text' }
    ]
  },
  {
    title: '精選作品區塊',
    fields: [
      { name: 'showWorks', label: '顯示此區塊', type: 'checkbox', help: '顯示在「作品集」中勾選「首頁精選」的作品' },
      { name: 'worksTitle', label: '標題', type: 'text' },
      { name: 'worksSubtitle', label: '副標題', type: 'text' }
    ]
  },
  {
    title: '最新文章區塊',
    fields: [
      { name: 'showPosts', label: '顯示此區塊', type: 'checkbox' },
      { name: 'postsTitle', label: '標題', type: 'text' },
      { name: 'postsSubtitle', label: '副標題', type: 'text' }
    ]
  },
  {
    title: '行動呼籲（CTA）',
    fields: [
      { name: 'showCta', label: '顯示此區塊', type: 'checkbox' },
      { name: 'ctaTitle', label: '標題', type: 'text' },
      { name: 'ctaText', label: '說明文字', type: 'text' },
      { name: 'ctaButtonText', label: '按鈕文字', type: 'text' },
      { name: 'ctaButtonUrl', label: '按鈕連結', type: 'text' }
    ]
  }
];

const about = [
  {
    title: '頁面內容',
    fields: [
      { name: 'title', label: '頁面標題', type: 'text' },
      { name: 'subtitle', label: '英文副標', type: 'text' },
      { name: 'image', label: '橫幅圖片', type: 'image' },
      { name: 'content', label: '內文', type: 'richtext' }
    ]
  }
];

const contact = [
  {
    title: '頁面內容',
    fields: [
      { name: 'title', label: '頁面標題', type: 'text' },
      { name: 'subtitle', label: '英文副標', type: 'text' },
      { name: 'intro', label: '引言', type: 'textarea' },
      { name: 'showForm', label: '顯示聯絡表單', type: 'checkbox' },
      { name: 'mapEmbed', label: 'Google 地圖嵌入碼', type: 'map', help: 'Google 地圖 → 分享 → 嵌入地圖 → 複製 HTML 貼上' }
    ]
  }
];

const work = [
  {
    title: '作品資訊',
    fields: [
      { name: 'title', label: '作品名稱', type: 'text' },
      { name: 'slug', label: '網址代稱', type: 'text', help: '留空會依名稱自動產生，例如 dessert-rebrand' },
      { name: 'category', label: '分類', type: 'text', help: '例如：品牌設計、商品攝影。前台會依此自動產生篩選按鈕' },
      { name: 'client', label: '客戶名稱', type: 'text' },
      { name: 'image', label: '封面圖片', type: 'image', help: '建議 4:3 比例' },
      { name: 'description', label: '作品介紹', type: 'richtext' },
      { name: 'featured', label: '首頁精選', type: 'checkbox' },
      { name: 'order', label: '排序（數字小的在前）', type: 'number' }
    ]
  }
];

const service = [
  {
    title: '服務資訊',
    fields: [
      { name: 'title', label: '服務名稱', type: 'text' },
      { name: 'icon', label: '圖示符號', type: 'text', help: '可填一個 Emoji 或符號，例如 📷 ✦；有上傳圖片時優先顯示圖片' },
      { name: 'image', label: '圖片', type: 'image' },
      { name: 'description', label: '說明', type: 'textarea' },
      { name: 'order', label: '排序（數字小的在前）', type: 'number' }
    ]
  }
];

module.exports = { settings, home, about, contact, work, service };
