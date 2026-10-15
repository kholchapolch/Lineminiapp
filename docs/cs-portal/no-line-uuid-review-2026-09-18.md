# รายงานรีวิว EX-16088 — No LINE UUID Placeholder Screen

วันที่ 18 กันยายน 2026 · พร้อมรีวิว BE · ยังไม่ commit งานนี้

## Requirement

[EX-16088 — [BE] SONY-10 No LINE UUID Placeholder Screen](https://app.clickup.com/t/86d4a978v) มี comment ขอให้ใช้กับ Digital Badge ด้วย อ่าน parent EX-13800 แล้วกำหนดให้เมื่อ Sony ไม่พบ LINE UUID แสดงคำแนะนำผูกบัญชี MSR, ไม่มี Footer Widget Bar และยังแสดง LINE Profile ได้

ขอบเขตรอบนี้คือ BE contract และ logic ร่วมสำหรับ Portal/Badge ตามแผนที่ตกลง ไม่สร้าง UI หน้า placeholder ไม่มีการแก้ ClickUp comment

## สิ่งที่ทำ

- แยก SonyCustomerNotFoundError, ตัวตรวจ error และตัวสร้าง placeholder ไว้ที่ `src/lib/sony-account.ts`
- Re-export class ผ่าน `sony-products.ts` และ helper ผ่าน `badge-result.ts` เพื่อให้ import เดิมยังใช้ได้
- Portal `/api/cs-portal/products` เพิ่ม placeholder เฉพาะ accountStatus=not_linked โดยคง HTTP 200 และ productState=not_applicable
- Badge `/api/customer-products` เพิ่ม accountStatus/placeholder เฉพาะ not-found โดยคง HTTP 404, code=CUSTOMER_NOT_FOUND และ message เดิม
- ข้อความแนะนำ TH/EN, showFooter=false, profileSource=liff และ action type=link_account ใช้ร่วมกัน

ไม่ตีความ `{}` หรือ payload เสียว่าเป็นบัญชีไม่เชื่อม: รองรับเฉพาะ Sony 404 หรือ HTTP 200/code100 พร้อมรูปแบบข้อความ not-found ที่ยืนยันจาก UAT ใน task ก่อน หากเป็นข้อมูลว่างผิด contract ยังคงเป็น upstream error

## ตัวอย่างและ contract สำหรับ FE

```json
{
  "code": "LINK_SONY_ACCOUNT",
  "showFooter": false,
  "profileSource": "liff",
  "title": {"th":"เชื่อมต่อบัญชี My Sony","en":"Link your My Sony account"},
  "message": {
    "th":"กรุณาเชื่อมต่อบัญชี My Sony กับ LINE เพื่อดูข้อมูลผลิตภัณฑ์ของคุณ",
    "en":"Please link your My Sony account to LINE to view your products."
  },
  "action": {"type":"link_account","label":{"th":"เชื่อมต่อบัญชี","en":"Link account"}}
}
```

วัตถุนี้อยู่ใน field `placeholder` ทั้งสอง API ข้อความเป็นข้อความที่เขียนสำหรับ contract รอบนี้ ยังไม่ใช่ copy/design ที่ Sony ยืนยัน FE เลือกข้อความตามภาษาและอ่าน profile จาก LIFF ไม่ส่ง profile จาก Sony customer ที่ไม่มีอยู่

`link_account` เป็น intent ให้ FE ใช้ link-account configuration ที่ยืนยันของ environment นั้น ไม่ส่ง URL สมมติหรือถือว่า product-register เป็น link-account โดยอัตโนมัติ ต้องตรวจลิงก์และการกลับเข้าแอปใน FE integration ก่อนใช้งานจริง

| สถานการณ์ | Portal | Badge | placeholder |
|---|---|---|---|
| Sony ไม่พบ customer | 200 / not_linked | 404 / CUSTOMER_NOT_FOUND | มี, ซ่อน footer |
| session หาย/หมดอายุ | 401 | 401 | ไม่มี |
| Sony API ขัดข้อง | 502 | 500 ตาม contract เดิม | ไม่มี |
| มีบัญชี ไม่มีสินค้า | 200 / linked / no_products | success ตาม Badge เดิม | ไม่มี |

## โครงสร้างและ data flow

Sony client แปลง not-found เป็น shared error → Portal service หรือ Badge route ตรวจด้วย helper เดียวกัน → createSonyAccountPlaceholder → FE ใช้ contract ร่วม

ไฟล์หลัก:
- `src/lib/sony-account.ts`: class/helper/placeholder กลาง ไม่ขึ้นกับ DB หรือ UI
- `src/lib/cs-portal/products.ts`: เพิ่ม placeholder ให้สถานะ not_linked
- `src/app/api/customer-products/route.ts`: เพิ่ม field สำหรับ Badge โดยรักษา error เดิม
- `src/lib/sony-products.ts`, `src/lib/badge-result.ts`: import compatibility
- `src/lib/sony-account.test.ts`: regression ทั้งสอง route

## วิธีทดลองและผลตรวจ

```bash
npm test -- src/lib/sony-account.test.ts src/app/api/cs-portal/products/route.test.ts src/app/api/customer-products/route.test.ts
```

ตรวจ 404 และ 200/code100 ให้ได้ placeholder เหมือนกันทั้งสอง API, error class import เดิมเป็นตัวเดียวกัน, ไม่เปิดเผย UUID ใน error, session หายไม่เรียก Sony, upstream error ไม่แสดงหน้าผูกบัญชี และ no-products ไม่กลายเป็น not_linked

- Vitest 253 tests / 38 files ผ่าน รวม shared contract ใหม่ 6 tests
- lint, build และ git diff --check ผ่าน (build มี safeError UNKNOWN_ERROR ช่วง static generation เช่นรอบก่อน แต่ exit 0)
- Tests ใช้ signed session จำลองและ mocked Sony HTTP response ไม่ใช่ LIFF login จริง
- รอบนี้ไม่ได้ยิง Sony live ซ้ำ, อ่าน/เขียน DB หรือ deploy; not-found contract live อ้างอิงการตรวจ UAT ใน task ก่อน
- ยังไม่ได้พิสูจน์ UI, LINE profile display, link-account URL และการกลับจากหน้าผูกบัญชีจริง

## Git และ review gate

My Sony Integration ที่ผ่านรีวิว commit/push แล้วเป็น `71a3709` บน codex/sony-cs-portal-be ตรวจ remote ตรง `71a370958ea23c140867ea33befe683743440700` รวมการรองรับ response ที่พบจาก UAT จริง ไม่มี secret เข้า Git และไม่ได้ deploy

งาน EX-16088 อยู่ in review รอรีวิว/QA ยังไม่ commit/push งานนี้ หยุดก่อน EX-16082 — No-Product State
