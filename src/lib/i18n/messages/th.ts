import type { Messages } from "@/lib/i18n/messages/types";

export const th: Messages = {
  meta: {
    title: "Sony Thailand",
    description: "แสดงเหรียญตรา Sony Thailand ผ่าน LINE LIFF",
  },
  shareOg: {
    title: "เหรียญของฉันจาก Sony (My badges from Sony)",
    description:
      "มาดูเหรียญที่ฉันปลดล็อกได้ในแคมเปญนี้! (Check out the badges I unlocked in this campaign!)",
  },
  hero: {
    eyebrow: "Sony Thailand",
    title: "เหรียญตราของฉัน",
    lead: "เหรียญตราสินค้าและภารกิจสำหรับผลิตภัณฑ์ Sony ที่ลงทะเบียนแล้ว",
  },
  loading: {
    title: "กำลังโหลดข้อมูลเหรียญตรา",
    message: "กำลังตรวจสอบสินค้า Sony และแคชเหรียญตราในเครื่อง",
  },
  errors: {
    accessBlocked: {
      title: "ไม่สามารถเข้าถึงได้",
      message:
        "หน้าเหรียญตรานี้เปิดได้เฉพาะจากแหล่งที่มาของแคมเปญ Sony ที่อนุมัติแล้วเท่านั้น",
    },
    dataUnavailable: {
      title: "ไม่สามารถโหลดข้อมูลเหรียญตราได้",
      message: "เราไม่สามารถโหลดข้อมูลเหรียญตราได้",
      fallback: "ไม่สามารถโหลดข้อมูลเหรียญตราได้",
    },
    cacheValidation: "ไม่สามารถตรวจสอบแคชเหรียญตราได้",
  },
  profile: {
    label: "โปรไฟล์",
    lineConnected: "เชื่อมต่อโปรไฟล์ LINE SDK แล้ว",
    sonyConnected: "เชื่อมต่อโปรไฟล์ Sony แล้ว",
    cache: "แคช",
  },
  shelf: {
    ariaLabel: "ชั้นแสดงเหรียญตราที่มีให้",
    badgeAlt: "เหรียญตรา {title}",
    fallbackCategory: "เหรียญตราความสำเร็จ",
    fallbackGroup: "เหรียญตรา",
  },
  support: {
    title: "ช่วยเหลือ",
    ownedProducts: "สินค้าที่เป็นเจ้าของ",
  },
  dateWindow: {
    always: "ตลอดเวลา",
    any: "ไม่จำกัด",
    to: "ถึง",
  },
  liff: {
    checkingSession: "กำลังตรวจสอบเซสชัน LIFF",
    mockMode:
      "โหมดพรีวิวในเครื่อง ตั้งค่า NEXT_PUBLIC_LIFF_ID เพื่อทดสอบ LINE LIFF",
    initializing: "กำลังเริ่มต้นเซสชัน LIFF",
    runningInLine: "กำลังทำงานใน LINE",
    initError: "ไม่สามารถเริ่มต้น LIFF ได้ ตรวจสอบ LIFF ID และ endpoint URL",
    verifying: "กำลังตรวจสอบ",
    continue: "ดำเนินการต่อ",
    sessionError: "ไม่สามารถยืนยันเซสชัน LINE ได้",
  },
  language: {
    label: "ภาษา",
    th: "ไทย",
    en: "English",
  },
  bottomBar: {
    ariaLabel: "เมนูหลัก",
    home: "หน้าแรก",
    register: "ลงทะเบียนสินค้า",
    inquiry: "สอบถามข้อมูล",
  },
  myBadges: {
    meta: {
      title: "เหรียญตราของฉัน",
      description: "ดูเหรียญผลิตภัณฑ์และเหรียญภารกิจของคุณ",
    },
    productBadges: "เหรียญผลิตภัณฑ์",
    missionBadges: "เหรียญภารกิจ",
    myProductBadges: "เหรียญผลิตภัณฑ์ของฉัน\n(My Product Badges)",
    myMissionBadges: "เหรียญภารกิจของฉัน\n(My Quest Badges)",
    viewAll: "ดูทั้งหมด",
    empty:
      "ลงทะเบียนสินค้าเพื่อเริ่มสะสมเหรียญของคุณ (Register your product to start collecting badges)",
    close: "ปิด",
  },
  myProducts: {
    meta: {
      title: "เหรียญผลิตภัณฑ์ของฉัน (My Product Badges)",
      description:
        "ดูเหรียญผลิตภัณฑ์ทั้งหมดที่คุณได้รับจากการลงทะเบียนสินค้า Sony",
    },
    title: "เหรียญผลิตภัณฑ์ของฉัน\n(My Product Badges)",
    description:
      "ซื้อเลนส์ Sony ที่ร่วมรายการและลงทะเบียน\nผลิตภัณฑ์ ตามเงื่อนไข เพื่อรับ Badge\nและเริ่มสะสมความสำเร็จของคุณ",
    filterLabel: "กรองตามประเภทสินค้า",
    backToMyBadges: "กลับหน้าหลัก",
    empty:
      "ลงทะเบียนสินค้าเพื่อเริ่มสะสมเหรียญของคุณ (Register your product to start collecting badges)",
    filters: {
      all: "All",
      "full-frame-camera": "Full Frame Camera",
      "prime-lens": "Prime Lens",
      "wide-normal-zoom-lens": "Wide & Normal Zoom Lens",
      "telephoto-super-telephoto-lens": "Telephoto & Super Telephoto Lens",
      "macro-lens": "Macro Lens",
    },
    categories: {
      "full-frame-camera": "Full Frame Camera",
      "prime-lens": "Prime Lens",
      "wide-normal-zoom-lens": "Wide & Normal Zoom Lens",
      "telephoto-super-telephoto-lens": "Telephoto & Super Telephoto Lens",
      "macro-lens": "Macro Lens",
    },
  },
  myProduct: {
    meta: {
      title: "แชร์เหรียญผลิตภัณฑ์",
      description: "ดูรายละเอียดและแชร์เหรียญผลิตภัณฑ์ของคุณ",
    },
    shareTitle: "แชร์เหรียญผลิตภัณฑ์",
    receivedTitle: "เหรียญผลิตภัณฑ์ที่ได้รับ",
    unlockedOn: "ปลดล็อคเมื่อ",
    quantity: "จำนวนที่มี",
    serialNumbers: "หมายเลขซีเรียล",
    share: "แชร์ (Share)",
    backToMyBadges: "กลับหน้าหลัก",
  },
  myMissions: {
    meta: {
      title: "เหรียญภารกิจของฉัน",
      description: "ดูความคืบหน้าเหรียญภารกิจและเป้าหมายแต่ละระดับ",
    },
    title: "เหรียญภารกิจของฉัน\n(My Quest Badges)",
    description:
      "ซื้อเลนส์ Sony ที่ร่วมรายการและลงทะเบียน\nผลิตภัณฑ์ ตามเงื่อนไข เพื่อรับ Badge\nและเริ่มสะสมความสำเร็จของคุณ",
    backToMyBadges: "กลับหน้าหลัก",
    empty:
      "ลงทะเบียนสินค้าเพื่อเริ่มสะสมเหรียญของคุณ (Register your product to start collecting badges)",
    sections: {
      "portrait-master": {
        title: "Portrait Master",
        description:
          "ลงทะเบียนสะสมเลนส์ Portrait ไม่ซ้ำกันให้ครบตามจำนวน และรุ่นที่กำหนดเพื่อปลดล็อกเหรียญรางวัลระดับต่างๆ",
      },
      "wide-architect": {
        title: "Wide Architect",
        description:
          "ลงทะเบียนสะสมเลนส์ Wide ไม่ซ้ำกันให้ครบตามจำนวน และรุ่นกำหนดเพื่อปลดล็อกเหรียญรางวัลระดับต่างๆ",
      },
      "the-visionary": {
        title: "The Visionary",
        description:
          "ลงทะเบียนสะสมเลนส์ Telephoto ไม่ซ้ำกันให้ครบตามจำนวน และรุ่นที่กำหนดเพื่อปลดล็อกเหรียญรางวัลระดับต่างๆ",
      },
      "trinity-master": {
        title: "Trinity Master",
        description:
          "ลงทะเบียนสะสมเลนส์ Gmaster 3 ชิ้นไม่ซ้ำกันจากรุ่นที่กำหนด เพื่อปลดล็อกเหรียญรางวัล",
      },
      "trinity-junior": {
        title: "Trinity G",
        description:
          "ลงทะเบียนสะสมเลนส์ G 3 ชิ้นไม่ซ้ำกันจากรุ่นที่กำหนด เพื่อปลดล็อกเหรียญรางวัล",
      },
      "all-rounder": {
        title: "All Rounder",
        description:
          "ลงทะเบียนสะสมเลนส์ G 3 ชิ้นไม่ซ้ำกันจากรุ่นที่กำหนด เพื่อปลดล็อกเหรียญรางวัล",
      },
      "f2-master": {
        title: "F2 Master",
        description:
          "ลงทะเบียนสะสมเลนส์ FE 28-70mm F2 GM และ FE 50-150 มม. F2 GM เพื่อปลดล็อกเหรียญรางวัลระดับต่างๆ",
      },
      "the-magnifier": {
        title: "The Magnifier",
        description:
          "ลงทะเบียนสะสมเลนส์ Macro 1 ชิ้นที่จากรุ่นกำหนด เพื่อปลดล็อกเหรียญรางวัล",
      },
    },
  },
  myMission: {
    meta: {
      title: "เหรียญภารกิจ",
      description: "ดูรายละเอียดและความคืบหน้าเหรียญภารกิจ",
    },
    shareTitle: "แชร์เหรียญภารกิจ",
    receivedTitle: "เหรียญภารกิจที่ได้รับ",
    unlockedOn: "ปลดล็อคเมื่อ",
    share: "แชร์ (Share)",
    backToHome: "กลับหน้าหลัก",
    registerProduct: "ลงทะเบียนสินค้า (Register Product)",
    ticketMissionTitle: "ภารกิจเก็บ Ticket ของคุณ",
    productCode: "รหัสสินค้า",
    completed: "สำเร็จ",
    details: "รายละเอียด",
    back: "ย้อนกลับ",
  },
};
