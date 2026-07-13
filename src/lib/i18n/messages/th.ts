import type { Messages } from "@/lib/i18n/messages/types";

export const th: Messages = {
  meta: {
    title: "Sony Badge Pilot",
    description: "แสดงเหรียญตรา Sony Thailand ผ่าน LINE LIFF",
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
      message: "หน้าเหรียญตรานี้เปิดได้เฉพาะจากแหล่งที่มาของแคมเปญ Sony ที่อนุมัติแล้วเท่านั้น",
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
    mockMode: "โหมดพรีวิวในเครื่อง ตั้งค่า NEXT_PUBLIC_LIFF_ID เพื่อทดสอบ LINE LIFF",
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
      description: "ดูเหรียญโปรดักต์และเหรียญภารกิจของคุณ",
    },
    productBadges: "เหรียญโปรดักต์",
    missionBadges: "เหรียญภารกิจ",
    myProductBadges: "เหรียญโปรดักต์ของฉัน",
    myMissionBadges: "เหรียญภารกิจของฉัน",
    viewAll: "ดูทั้งหมด",
    close: "ปิด",
  },
  myProducts: {
    meta: {
      title: "เหรียญโปรดักต์ของฉัน",
      description: "ดูเหรียญโปรดักต์ทั้งหมดที่คุณได้รับจากการลงทะเบียนสินค้า Sony",
    },
    title: "เหรียญโปรดักต์ของฉัน",
    description:
      "เหรียญโปรดักต์คือเหรียญที่ได้รับจากการลงทะเบียนสินค้า Sony ที่เข้าร่วมรายการ โดยแต่ละเหรียญจะแสดงตามประเภทของเลนส์หรือกล้องที่คุณเป็นเจ้าของ",
    filterLabel: "กรองตามประเภทสินค้า",
    backToMyBadges: "กลับหน้าหลัก",
    filters: {
      all: "ทั้งหมด",
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
      title: "แชร์เหรียญโปรดักต์",
      description: "ดูรายละเอียดและแชร์เหรียญโปรดักต์ของคุณ",
    },
    shareTitle: "แชร์เหรียญโปรดักต์",
    receivedTitle: "เหรียญโปรดักต์ที่ได้รับ",
    unlockedOn: "ปลดล็อคเมื่อ",
    quantity: "จำนวนที่มี",
    share: "แชร์ให้เพื่อน",
    backToMyBadges: "กลับหน้าหลัก",
  },
  myMissions: {
    meta: {
      title: "เหรียญภารกิจของฉัน",
      description: "ดูความคืบหน้าเหรียญภารกิจและเป้าหมายแต่ละระดับ",
    },
    title: "เหรียญภารกิจของฉัน",
    description:
      "เหรียญภารกิจคือเหรียญที่ได้รับจากการทำภารกิจตามเงื่อนไขของแต่ละหมวด โดยแต่ละภารกิจจะมีหลายระดับให้สะสมความคืบหน้า",
    backToMyBadges: "กลับหน้าหลัก",
    sections: {
      "portrait-master": {
        title: "Portrait Master",
        description:
          "สะสมเหรียญภารกิจจากการลงทะเบียนเลนส์ที่เหมาะกับการถ่ายภาพบุคคล ตามเงื่อนไขของแต่ละระดับ",
      },
      "wide-architect": {
        title: "Wide Architect",
        description:
          "สะสมเหรียญภารกิจจากการลงทะเบียนเลนส์มุมกว้าง ตามเงื่อนไขของแต่ละระดับ",
      },
    },
  },
  myMission: {
    meta: {
      title: "เหรียญภารกิจ",
      description: "ดูรายละเอียดและความคืบหน้าเหรียญภารกิจ",
    },
    receivedTitle: "เหรียญภารกิจที่ได้รับ",
    unlockedOn: "ปลดล็อคเมื่อ",
    share: "แชร์ให้เพื่อน",
    backToHome: "กลับหน้าหลัก",
    registerProduct: "ลงทะเบียนสินค้า",
    ticketMissionTitle: "ภารกิจเก็บ Ticket ของคุณ",
    productCode: "รหัสสินค้า",
    completed: "สำเร็จ",
    details: "รายละเอียด",
    back: "ย้อนกลับ",
  },
};
