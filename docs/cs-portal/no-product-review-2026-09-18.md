# รายงานรีวิว EX-16082 — No-Product State

วันที่ 18 กันยายน 2026 · พร้อมรีวิว BE · ยังไม่ commit งานนี้

## Requirement

[EX-16082 — [BE] SONY-08 No-Product State](https://app.clickup.com/t/86d4a977p) ไม่มีรายละเอียด/comment เพิ่มเติม อ่าน parent EX-13798 แล้วระบุว่าเมื่อเชื่อมบัญชีแล้วแต่ไม่มีสินค้าลงทะเบียน ให้แสดงข้อความชี้นำลงทะเบียนสินค้า สองภาษา และ Footer Widget Bar ยังแสดง

ขอบเขต BE รอบนี้: contract สำหรับ empty state และ global footer ผ่าน `/content` โดยไม่ต้องส่ง model ส่วนการวาดหน้าและปุ่มเป็นงาน FE

## สิ่งที่เปลี่ยน

1. `/api/cs-portal/products` เพิ่ม `emptyState` เฉพาะบัญชี linked ที่ products ว่าง โดยคง `productState=no_products`, products=[] และไม่มี placeholder ผูกบัญชี
2. emptyState มีข้อความ TH/EN, showFooter=true และ action internal ไป `/register-product` ข้อความรอบนี้เป็น copy สำหรับรีวิว ยังไม่ถือว่า Sony อนุมัติ
3. `/api/cs-portal/content?locale=th|en` เพิ่ม `footerItems` ระดับบน แม้ไม่ส่ง modelKey โดย models=[] ตามเดิม
4. Footer อ่านเฉพาะ active dataset / global target / ภาษาที่ขอ เรียง sort_order แล้ว external_key ตรวจ label และ Sony HTTPS URL ด้วย validator ร่วมกับ import/CRUD
5. ถ้าภาษานั้นไม่มี footer คืน [] ไม่ยืมภาษาอื่น และไม่สร้างลิงก์ขึ้นเอง กรณี payload ผิดคืน safe 500
6. Session และ private,no-store ของ content API ยังคงเดิม ไม่ต้องเรียก Sony ซ้ำเพื่อโหลด footer

## โครงสร้างและข้อมูลไหลผ่านโค้ด

- `src/lib/cs-portal/no-product-state.ts`: สร้างข้อความและ action ของ empty state
- `src/lib/cs-portal/products.ts`: ตรวจผล Sony ที่มีบัญชีแต่ products=[] แล้วเพิ่ม emptyState
- `src/lib/cs-portal/footer-content.ts`: เลือก global footer ตามภาษา เรียงและ validate
- `src/lib/cs-portal/cta-content.ts`: ประกอบ footerItems กับ models เดิมจาก active snapshot เดียวกัน
- `src/lib/cs-portal/types.ts`: เพิ่ม FooterItem และ field footerItems
- `scripts/db/cs-portal/dataset.mjs`: export validator footer เดิม ไม่เปลี่ยน schema/hash
- `src/lib/cs-portal/no-product-state.test.ts`: ทดสอบข้าม products/content routes และ resolver

FE เรียก products → ถ้า linked/no_products แสดง emptyState → เรียก content พร้อม locale โดยไม่ส่ง model → แสดง footerItems หาก accountStatus=not_linked ใช้ placeholder.showFooter=false จาก task ก่อน

Content API เป็นข้อมูล global ที่มี session ก็อ่านได้ ไม่ตรวจ account linkage และไม่ซ่อน footer บน server ตามบัญชี การตัดสินใจแสดงหรือซ่อนเป็นหน้าที่ FE จาก products response

## ตัวอย่างสำหรับรีวิว

บัญชีทดสอบ MOCK `demo-line-empty` คืน:

```json
{
  "accountStatus":"linked",
  "productState":"no_products",
  "isMock":true,
  "products":[],
  "emptyState":{
    "code":"REGISTER_PRODUCT",
    "showFooter":true,
    "title":{"th":"ยังไม่มีสินค้าที่ลงทะเบียน","en":"No registered products yet"},
    "message":{
      "th":"ลงทะเบียนผลิตภัณฑ์ Sony ของคุณเพื่อดูข้อมูลสินค้าและสิทธิประโยชน์",
      "en":"Register your Sony products to view product information and benefits."
    },
    "action":{"type":"internal","route":"/register-product","label":{"th":"ลงทะเบียนสินค้า","en":"Register product"}}
  }
}
```

`/content?locale=th` คืน models=[] และ footerItems ตาม workbook fixture:

| key | TH | EN |
|---|---|---|
| service-center | เช็คศูนย์ซ่อม | Service Center Locator |
| repair-status | เช็คสถานะการซ่อม | Repair Status |

แต่ละ item มี key, label, url และ isMock ลิงก์มาจาก workbook ที่เก็บใน repo ไม่ใช่การแต่ง URL ใหม่ ตัวอย่างบัญชีเป็น MOCK ส่วน footer fixture มาจากข้อมูล workbook; การทดสอบ repository เป็น mock จึงไม่ใช่หลักฐานการอ่าน DB live

## วิธีทดลองและจุดที่ควรตรวจ

```bash
npm test -- src/lib/cs-portal/no-product-state.test.ts src/app/api/cs-portal/content/route.test.ts src/app/api/cs-portal/products/route.test.ts
```

ตรวจบัญชีไม่มีสินค้าได้ footer แม้ไม่มี model, not_linked ไม่ได้ emptyState ลงทะเบียนสินค้า, บัญชีมีสินค้าไม่มี emptyState, TH/EN ไม่ปนกัน, ลำดับเมื่อ index เท่ากันแน่นอน, ไม่เอา footer ระดับ model มาใช้ และ unsafe URL/session หายถูกปฏิเสธ

ข้อจำกัดจากข้อมูลเดิม: หน้าข้อมูล Register Product ภาษาอังกฤษใน dataset ยังไม่มีและ API หน้านั้นคืน 404 ตาม contract เดิม FE ต้องจัดการกรณีนี้ก่อนปล่อย flow EN ครบวงจร action ในรอบนี้ไม่สร้างคำแปลเนื้อหาหน้าดังกล่าวแทน Sony

## ผลตรวจ

- Vitest 261 tests / 39 files ผ่าน รวม No-Product ใหม่ 8 tests
- Node import tests 11 ผ่าน
- lint, production build และ git diff --check ผ่าน; build มี safeError UNKNOWN_ERROR ระหว่าง static generation เช่นเดิม แต่ exit 0
- ไม่อ่าน/เขียน UAT หรือ production DB, ไม่ยิง Sony API live, ไม่ deploy และไม่เปลี่ยน UI ในรอบนี้
- กรณีบัญชีจริงมีสินค้า/ไม่มีสินค้ายังไม่พิสูจน์ เพราะไม่มี LINE UUID บัญชีทดสอบจริง

## Git และ review gate

งาน No LINE UUID ที่อนุมัติแล้ว commit/push `a148704` ไป codex/sony-cs-portal-be ตรวจ remote SHA ตรง `a148704f671f68f13ae7373e5660cf44129d3dc1` แล้ว ไม่ใช่การ deploy

งาน No-Product รอบนี้ยังไม่ commit/push ตั้ง task เป็น in review รอรีวิว/QA ไม่มี comment หยุดก่อน EX-16064 — Product Card (Detail Page)
