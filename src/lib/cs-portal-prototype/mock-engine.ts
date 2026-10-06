export type PortalContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "check_list"; items: string[] }
  | { type: "image"; src: string; alt: string }
  | { type: "link_button"; label: string; href: string };

export type PortalArticle = {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  href: string;
};

export type PortalCta = {
  key: string;
  label: string;
  articles: PortalArticle[];
};

export type PortalHighlight = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
};

export type PortalProduct = {
  id: string;
  modelName: string;
  category: string;
  serialNumber: string;
  warrantyExpiry: string | null;
  warrantyStatus: "active" | "expired" | "unknown";
  imageSrc: string;
  imageAlt: string;
  ctas: PortalCta[];
  highlights: PortalHighlight[];
};

export type PortalScenarioState =
  | "linked_with_products"
  | "linked_without_products"
  | "unlinked"
  | "upstream_error";

export type PortalScenario = {
  requestedUuid: string;
  resolvedUuid: MockUuid;
  label: string;
  description: string;
  state: PortalScenarioState;
  initialView: "home" | "register";
  profile: { displayName: string } | null;
  products: PortalProduct[];
  registerPage: {
    title: string;
    lead: string;
    blocks: PortalContentBlock[];
  };
  errorMessage?: string;
  fallbackNotice?: string;
};

export const MOCK_SCENARIOS = [
  {
    uuid: "test-default",
    label: "Standard · 2 products",
    description: "Linked member with two products, CTAs and highlights.",
  },
  {
    uuid: "test-dynamic-content",
    label: "Dynamic register content",
    description: "All five typed content blocks on the register page.",
  },
  {
    uuid: "test-10-cta",
    label: "Stress · 10 CTAs",
    description: "One product with ten mapped CTA actions.",
  },
  {
    uuid: "test-many-products",
    label: "Stress · many products",
    description: "Five products to check long-page behavior.",
  },
  {
    uuid: "test-no-product",
    label: "Edge · no products",
    description: "Linked member with no registered products.",
  },
  {
    uuid: "test-no-line-uuid",
    label: "Edge · not linked",
    description: "LINE session exists but no linked My Sony account.",
  },
  {
    uuid: "test-api-error",
    label: "Edge · API error",
    description: "My Sony upstream is temporarily unavailable.",
  },
  {
    uuid: "test-no-content",
    label: "Edge · no mapped content",
    description: "Product resolves but has no CTA or carousel mapping.",
  },
  {
    uuid: "test-empty-article",
    label: "Edge · empty articles",
    description: "CTA resolves but its article selection is empty.",
  },
  {
    uuid: "test-long-content",
    label: "Edge · long content",
    description: "Long model and content labels for wrapping checks.",
  },
  {
    uuid: "test-expired-warranty",
    label: "Edge · expired warranty",
    description: "Product warranty is expired.",
  },
] as const;

export type MockUuid = (typeof MOCK_SCENARIOS)[number]["uuid"];

const articleLibrary: Record<string, PortalArticle[]> = {
  firmware: [
    {
      id: "article-firmware-1",
      title: "อัปเดตเฟิร์มแวร์ล่าสุดสำหรับ WF-1000XM5",
      summary: "ตรวจสอบเวอร์ชันและขั้นตอนการอัปเดตอย่างปลอดภัย",
      publishedAt: "2026-01-01",
      href: "https://www.sony.co.th/electronics/support",
    },
    {
      id: "article-firmware-2",
      title: "ก่อนเริ่มอัปเดตซอฟต์แวร์",
      summary: "เตรียมแบตเตอรี่และการเชื่อมต่อให้พร้อม",
      publishedAt: "2025-12-18",
      href: "https://www.sony.co.th/electronics/support",
    },
  ],
  setup: [
    {
      id: "article-setup-1",
      title: "เริ่มต้นใช้งานผลิตภัณฑ์ของคุณ",
      summary: "คู่มือเชื่อมต่อและตั้งค่าครั้งแรก",
      publishedAt: "2025-12-20",
      href: "https://www.sony.co.th/electronics/support",
    },
  ],
  feature: [
    {
      id: "article-feature-1",
      title: "ฟีเจอร์สำคัญที่คุณอาจยังไม่ได้ลอง",
      summary: "เรียนรู้ shortcut และการตั้งค่าที่เหมาะกับคุณ",
      publishedAt: "2025-12-15",
      href: "https://www.sony.co.th/electronics/support",
    },
  ],
  app: [
    {
      id: "article-app-1",
      title: "เชื่อมต่อ Sony Sound Connect",
      summary: "ดาวน์โหลดแอปและตั้งค่าเสียงส่วนตัว",
      publishedAt: "2025-12-10",
      href: "https://www.sony.co.th/electronics/support",
    },
  ],
  repair: [
    {
      id: "article-repair-1",
      title: "ตรวจสอบและขอรับบริการซ่อม",
      summary: "เตรียมข้อมูลผลิตภัณฑ์ก่อนติดต่อศูนย์บริการ",
      publishedAt: "2025-12-08",
      href: "https://www.sony.co.th/electronics/support",
    },
  ],
  tips: [
    {
      id: "article-tips-1",
      title: "เคล็ดลับดูแลผลิตภัณฑ์ให้ใช้งานได้นาน",
      summary: "คำแนะนำสั้น ๆ จากทีมสนับสนุน Sony",
      publishedAt: "2025-12-01",
      href: "https://www.sony.co.th/electronics/support",
    },
  ],
};

const standardCtas: PortalCta[] = [
  { key: "firmware", label: "Check Firmware", articles: articleLibrary.firmware },
  { key: "setup", label: "Finish Set Up", articles: articleLibrary.setup },
  { key: "feature", label: "Check Key Feature", articles: articleLibrary.feature },
  { key: "app", label: "Connect Essential App", articles: articleLibrary.app },
  { key: "repair", label: "Request Repair", articles: articleLibrary.repair },
  { key: "tips", label: "Tips & Tricks", articles: articleLibrary.tips },
];

const standardHighlights: PortalHighlight[] = [
  {
    id: "highlight-firmware",
    eyebrow: "New firmware",
    title: "อัปเดตพร้อมใช้งาน",
    description: "ดูสิ่งที่เปลี่ยนและขั้นตอนก่อนติดตั้ง",
    href: "https://www.sony.co.th/electronics/support",
  },
  {
    id: "highlight-tips",
    eyebrow: "Tips & tricks",
    title: "ตั้งค่าให้เหมาะกับคุณ",
    description: "คำแนะนำเริ่มต้นสำหรับผลิตภัณฑ์ที่ลงทะเบียน",
    href: "https://www.sony.co.th/electronics/support",
  },
];

const headphones: PortalProduct = {
  id: "product-wf-1000xm5",
  modelName: "WF-1000XM5",
  category: "Headphones",
  serialNumber: "1234567",
  warrantyExpiry: "01/10/2029",
  warrantyStatus: "active",
  imageSrc: "/cs-portal-prototype/headphones.svg",
  imageAlt: "Wireless headphones placeholder",
  ctas: standardCtas,
  highlights: standardHighlights,
};

const television: PortalProduct = {
  id: "product-xr-75x91l",
  modelName: "XR-75X91L",
  category: "Television",
  serialNumber: "7654321",
  warrantyExpiry: "01/10/2029",
  warrantyStatus: "active",
  imageSrc: "/cs-portal-prototype/tv.svg",
  imageAlt: "Television placeholder",
  ctas: standardCtas.slice(0, 5),
  highlights: standardHighlights,
};

const registerPage = {
  title: "Register More Product",
  lead: "Unlock more personalization & perks!",
  blocks: [
    { type: "heading", text: "Enjoy your membership-only benefits" },
    {
      type: "paragraph",
      text: "ลงทะเบียนผลิตภัณฑ์เพิ่ม เพื่อรับข้อมูลและบริการที่ตรงกับสินค้าของคุณ",
    },
    {
      type: "image",
      src: "/cs-portal-prototype/register-products.svg",
      alt: "Sony product registration placeholder",
    },
    {
      type: "check_list",
      items: [
        "Unlock personalized articles",
        "Extend free warranty up to 1 year",
        "Get personalized deals",
        "Access exclusive workshops and events",
      ],
    },
    {
      type: "link_button",
      label: "Register Now",
      href: "https://www.sony.co.th/mysony",
    },
  ] satisfies PortalContentBlock[],
};

function tenCtas(): PortalCta[] {
  const labels = [
    "Check Firmware",
    "Finish Set Up",
    "Check Key Feature",
    "Connect Essential App",
    "Request Repair",
    "Tips & Tricks",
    "Warranty Status",
    "How-to Videos",
    "Accessories",
    "Contact Support",
  ];

  return labels.map((label, index) => ({
    key: "stress-" + (index + 1),
    label,
    articles: [
      {
        id: "stress-article-" + (index + 1),
        title: label + " · demo article",
        summary: "บทความจำลองสำหรับทดสอบ CTA ลำดับที่ " + (index + 1),
        publishedAt: "2026-01-" + String(index + 1).padStart(2, "0"),
        href: "https://www.sony.co.th/electronics/support",
      },
    ],
  }));
}

function manyProducts(): PortalProduct[] {
  const products = [
    headphones,
    television,
    {
      ...headphones,
      id: "product-ilce-7m4",
      modelName: "ILCE-7M4",
      category: "Digital Imaging",
      serialNumber: "CAM-7001",
    },
    {
      ...television,
      id: "product-srs-xg300",
      modelName: "SRS-XG300",
      category: "Portable Audio",
      serialNumber: "AUD-3001",
    },
    {
      ...headphones,
      id: "product-ps5",
      modelName: "PlayStation 5",
      category: "PlayStation",
      serialNumber: "PS5-5001",
    },
  ];

  return products.map((product) => ({
    ...product,
    ctas: product.ctas.map((cta) => ({ ...cta })),
    highlights: product.highlights.map((highlight) => ({ ...highlight })),
  }));
}

const scenarioBuilders: Record<MockUuid, () => Omit<PortalScenario, "requestedUuid" | "resolvedUuid">> = {
  "test-default": () => ({
    label: "Standard · 2 products",
    description: "Linked member with two products, CTAs and highlights.",
    state: "linked_with_products",
    initialView: "home",
    profile: { displayName: "Fuji Kase" },
    products: [headphones, television],
    registerPage,
  }),
  "test-dynamic-content": () => ({
    label: "Dynamic register content",
    description: "Shows heading, paragraph, image, checklist and link-button blocks.",
    state: "linked_with_products",
    initialView: "register",
    profile: { displayName: "Dynamic Content" },
    products: [headphones],
    registerPage,
  }),
  "test-10-cta": () => ({
    label: "Stress · 10 CTAs",
    description: "Checks wrapping and interaction with ten mapped actions.",
    state: "linked_with_products",
    initialView: "home",
    profile: { displayName: "Ten CTA" },
    products: [{ ...headphones, ctas: tenCtas() }],
    registerPage,
  }),
  "test-many-products": () => ({
    label: "Stress · many products",
    description: "Checks scrolling with five registered products.",
    state: "linked_with_products",
    initialView: "home",
    profile: { displayName: "Many Products" },
    products: manyProducts(),
    registerPage,
  }),
  "test-no-product": () => ({
    label: "Edge · no products",
    description: "Linked customer has no registered products.",
    state: "linked_without_products",
    initialView: "home",
    profile: { displayName: "No Product" },
    products: [],
    registerPage,
  }),
  "test-no-line-uuid": () => ({
    label: "Edge · not linked",
    description: "No My Sony account is linked to the LINE session.",
    state: "unlinked",
    initialView: "home",
    profile: null,
    products: [],
    registerPage,
  }),
  "test-api-error": () => ({
    label: "Edge · API error",
    description: "The My Sony service is temporarily unavailable.",
    state: "upstream_error",
    initialView: "home",
    profile: { displayName: "API Error" },
    products: [],
    registerPage,
    errorMessage: "ไม่สามารถโหลดข้อมูลผลิตภัณฑ์ได้ กรุณาลองใหม่อีกครั้ง",
  }),
  "test-no-content": () => ({
    label: "Edge · no mapped content",
    description: "Product is available but content mapping is empty.",
    state: "linked_with_products",
    initialView: "home",
    profile: { displayName: "No Mapping" },
    products: [{ ...headphones, ctas: [], highlights: [] }],
    registerPage,
  }),
  "test-empty-article": () => ({
    label: "Edge · empty articles",
    description: "CTA is visible but has no published articles.",
    state: "linked_with_products",
    initialView: "home",
    profile: { displayName: "Empty Article" },
    products: [
      {
        ...headphones,
        ctas: [{ key: "empty", label: "Open Empty Article List", articles: [] }],
      },
    ],
    registerPage,
  }),
  "test-long-content": () => ({
    label: "Edge · long content",
    description: "Long model and content labels for wrapping checks.",
    state: "linked_with_products",
    initialView: "home",
    profile: { displayName: "ชื่อสมาชิกที่ยาวมากเพื่อทดสอบการตัดบรรทัด" },
    products: [
      {
        ...headphones,
        id: "product-long",
        modelName: "WH-1000XM5 LIMITED COLLABORATION EDITION WITH EXTRA LONG MODEL NAME",
        ctas: [
          {
            key: "long",
            label: "ตรวจสอบรายละเอียดการอัปเดตเฟิร์มแวร์และคำแนะนำการใช้งานฉบับเต็ม",
            articles: articleLibrary.firmware,
          },
        ],
        highlights: [
          {
            ...standardHighlights[0],
            id: "highlight-long",
            title: "ประกาศข้อมูลผลิตภัณฑ์ที่มีหัวข้อยาวเพื่อทดสอบการแสดงผลหลายบรรทัด",
            description:
              "เนื้อหาจำลองแบบยาว ใช้ตรวจการตัดคำ ความสูงของการ์ด และปุ่มควบคุมบนหน้าจอขนาดเล็ก",
          },
        ],
      },
    ],
    registerPage,
  }),
  "test-expired-warranty": () => ({
    label: "Edge · expired warranty",
    description: "Product warranty is expired.",
    state: "linked_with_products",
    initialView: "home",
    profile: { displayName: "Expired Warranty" },
    products: [
      {
        ...headphones,
        warrantyExpiry: "01/02/2024",
        warrantyStatus: "expired",
      },
    ],
    registerPage,
  }),
};

export function resolvePortalScenario(uuid?: string | null): PortalScenario {
  const requestedUuid = uuid?.trim() || "test-default";
  const isKnown = MOCK_SCENARIOS.some((scenario) => scenario.uuid === requestedUuid);
  const resolvedUuid: MockUuid = isKnown ? (requestedUuid as MockUuid) : "test-default";
  const scenario = scenarioBuilders[resolvedUuid]();

  return {
    ...scenario,
    requestedUuid,
    resolvedUuid,
    fallbackNotice: isKnown
      ? undefined
      : "Unknown mock UUID '" + requestedUuid + "'. Showing test-default.",
  };
}
