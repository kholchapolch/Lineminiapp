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
};
