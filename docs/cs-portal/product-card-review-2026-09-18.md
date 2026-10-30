# รายงานรีวิว EX-16064 — Product Card (Detail Page)

วันที่ 18 กันยายน 2026 · พร้อมรีวิว BE · ยังไม่ commit งานนี้

## Requirement

[EX-16064 — [BE] SONY-02 Product Card (Detail Page)](https://app.clickup.com/t/86d4a975e) ไม่มีรายละเอียด/comment เพิ่มเติม Parent EX-13792 ระบุรูปสินค้า ชื่อรุ่น serial หลายรายการ สถานะประกัน CTA/Carousel พร้อม sorting/grouping และ DI DO Date

ตามแผนที่ตกลง ใช้ warrantyExpiryDate จาก Sony ไม่คำนวณ DO Date เอง รอบนี้เพิ่ม grouping/catalog/warranty ต่อ serial ใน `/products` ส่วน CTA/Carousel ใช้ `/content` ที่ทำแล้ว และจะตรวจ contract ทั้งหน้าใน Home task ถัดไป ไม่สร้าง UI ในงาน BE นี้

## สิ่งที่เปลี่ยน

`/api/cs-portal/products` คง products ดิบเดิม และเพิ่ม productGroups:

- จับคู่ sku กับ canonical model ด้วย exact ก่อน suffix ที่มีอยู่ ไม่ใช้ชื่อการตลาด fuzzy match
- รุ่นเดียวกันรวมเป็นกลุ่มเดียว เก็บ registrations ทุกแถวรวมทั้ง serial ซ้ำหรือ null เพื่อไม่ทิ้ง ownership/warranty โดยพลการ
- รุ่นไม่ตรง catalog หรือกำกวมแยกตาม normalized SKU และ matchedCatalog=false; ไม่เดา category หรือรูป
- ชื่อกลุ่ม/รูป/category จาก active catalog; รุ่นไม่รู้จักใช้ modelKey เป็นชื่อกลุ่ม ส่วน modelName ต้นทางอยู่ใน registration
- ในกลุ่มเรียงวันลงทะเบียนใหม่ก่อน วันที่ขาดหรือไม่เข้า format อยู่ท้าย; วันที่เท่ากันใช้ serial แล้ว SKU หากยังเท่ากันคงลำดับต้นทาง
- กลุ่มเรียงตามวันลงทะเบียนใหม่ที่สุดของกลุ่ม แล้ว modelKey เมื่อเท่ากัน
- warrantyStatus ต่อ registration เป็น active/expired/unknown ไม่รวมวันประกันข้าม serial
- ไม่เติมเวลา ไม่แก้วันที่ต้นทาง ไม่สร้างวันหมดประกันขึ้นใหม่

รองรับวันแบบ YYYY-MM-DD ที่เป็นวันจริง และ ISO timestamp ที่ระบุ timezone ชัดเจน รูปแบบอื่นถือว่าไม่ทราบสำหรับ sorting/status แต่ยังส่งค่าต้นทางกลับมา

**กติกาวันหมดประกันที่ใช้ในรอบนี้:** วันที่อย่างเดียวมีผลจนจบวันนั้นตาม Asia/Bangkok; timestamp ที่มี timezone เทียบเวลาตรง ๆ วันที่ขาด/ผิด/ไม่ชัดเจนคืน unknown กติกานี้เป็น implementation assumption สำหรับรีวิว ยังไม่มีหลักฐานยืนยันกับ Sony live สำหรับบัญชีมีสินค้า

## Data flow และไฟล์หลัก

1. `src/app/api/cs-portal/products/route.ts` ตรวจ session/query → เรียก service Sony เดิม → ถ้ามีสินค้า โหลด active dataset หนึ่งครั้ง → groupPortalProducts → response
2. `src/lib/cs-portal/product-groups.ts` จับคู่ catalog จัดกลุ่ม เรียง และคำนวณสถานะจากวันหมดประกันที่มีอยู่
3. `src/lib/cs-portal/content-repository.ts` reuse active snapshot เดิม ไม่มี draft fallback
4. `src/lib/cs-portal/products.ts` คง service/raw ownership เดิม
5. `src/lib/cs-portal/product-groups.test.ts` และ `src/app/api/cs-portal/products/route.test.ts` ตรวจ grouping และ integration

เมื่อไม่มีสินค้า/ไม่เชื่อมบัญชีคืน productGroups=[] โดยไม่อ่าน DB; เมื่อมีสินค้าแต่ catalog อ่านไม่ได้คืน safe 500 PRODUCTS_UNAVAILABLE แยกจาก Sony failure 502 ไม่เปลี่ยนเป็น no-products หรือ not-linked

**Dependency ใหม่:** บัญชีมีสินค้าต้องเข้าถึง Portal DB และ active dataset ได้ จึงได้ productGroups การรัน local แบบ mock Sony แต่ไม่มี DB จะไม่คืน success สำหรับบัญชีมีสินค้า ใช้ repository mock ใน tests หรือเชื่อมฐานข้อมูลที่ตั้งค่าไว้

## ตัวอย่าง MOCK สำหรับรีวิว

| SKU ต้นทาง | Serial | registeredAt | warrantyExpiryDate |
|---|---|---|---|
| ILME-FX2/QSYX | MOCK-A | 2026-01-01 | 2025-01-01 |
| ilme-fx2 | MOCK-B | 2026-03-01 | 2027-01-01 |

เมื่อ catalog มี ILME-FX2 และประเมินวันที่ 18 กันยายน 2026 จะได้ productGroups 1 กลุ่ม:

```json
{
  "modelKey":"ILME-FX2",
  "matchedCatalog":true,
  "modelName":"FX2",
  "categoryCode":"DI",
  "imageUrl":null,
  "registrations":[
    {"sku":"ilme-fx2","modelName":"ilme-fx2","serialNumber":"MOCK-B","registeredAt":"2026-03-01","warrantyExpiryDate":"2027-01-01","warrantyStatus":"active"},
    {"sku":"ILME-FX2/QSYX","modelName":"ILME-FX2/QSYX","serialNumber":"MOCK-A","registeredAt":"2026-01-01","warrantyExpiryDate":"2025-01-01","warrantyStatus":"expired"}
  ]
}
```

ตัวอย่างทั้งหมดเป็น MOCK ไม่ใช่ข้อมูลบัญชีจริง หากมี image_url ใน active catalog จะส่งค่านั้น รวมถึง placeholder ที่ติดป้าย MOCK ซึ่งใช้ใน UAT ปัจจุบัน

FE ใช้ productGroups สร้างการ์ด แล้วนำ modelKey ไปขอ `/content?locale=th&modelKey=...` เพื่อรับ CTA/Carousel/footer โดย products ดิบยังคงเดิมสำหรับตรวจสอบ การอ่าน products/content เป็นคนละ request จึงอาจพบ dataset คนละ version หากมี activate คั่นกลาง ไม่ใช่ snapshot ร่วมทั้งหน้า

## วิธีทดลองและผลตรวจ

```bash
npm test -- src/lib/cs-portal/product-groups.test.ts src/app/api/cs-portal/products/route.test.ts
```

จุดตรวจ: suffix รุ่นเดียวกันหลาย serial, รุ่นไม่รู้จัก/กำกวม, วันที่ไม่มี/ไม่ถูกต้อง, serial ซ้ำ, ประกันหมดอายุ, ขอบเขตเที่ยงคืนไทย และ DB ล้มเหลว

- Vitest 275 tests / 40 files ผ่าน รวม grouping 11 และ products route 28 tests
- lint, production build และ git diff --check ผ่าน; safeError UNKNOWN_ERROR ช่วง static generation เป็นข้อความที่พบอยู่เดิม build จบ exit 0
- ใช้ mock Sony response และ mock repository ใน integration tests ไม่มีการอ่าน/เขียน DB หรือยิง live Sony รอบนี้
- ยังไม่ได้ทดสอบบัญชีจริงมีหลาย serial/วันหมดประกันจริง, FE UI หรือ deploy
- ไม่เปลี่ยน Badge routes หรือ workflows

## Git และ review gate

No-Product ที่อนุมัติ commit/push `5b56ccc` บน codex/sony-cs-portal-be แล้ว ตรวจ remote ตรง `5b56ccce3f0d0f04e5b7e6a9d9d5d3e086aa081b` ไม่ใช่ deploy

Product Card รอบนี้อยู่ in review รอรีวิว/QA ยังไม่ commit/push และไม่มี comment ใน ClickUp หยุดก่อน EX-16061 — Product Center (Home Page)
