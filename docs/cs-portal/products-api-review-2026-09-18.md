# รายงานรีวิว EX-16085 — My Sony API Integration

วันที่ 18 กันยายน 2026 · พร้อมรีวิวโค้ด · ยังไม่ commit งาน Products

## Requirement

[EX-16085 — [BE] SONY-09 My Sony API Integration](https://app.clickup.com/t/86d4a9789) ไม่มี description/comment เพิ่มเติม อ่าน parent [EX-13799](https://app.clickup.com/t/86d48ec6j) แล้ว: reuse Reward API ของ Digital Badge เพื่อดึง ownership/warranty ผ่าน LINE UUID รองรับ UUID+Product, UUID+NoProduct, NoUUID และรวมข้อมูลกับ Internal DB ส่วนเอกสาร Requirement Details/PRD ที่อ้างถึงไม่สามารถอ่านได้จากข้อมูล task

ตามแผนแบ่งงาน รอบนี้ทำ API สินค้าและสถานะบัญชี ส่งวันลงทะเบียนและหมดประกันจาก Sony ตรง ๆ การรวม canonical model/หลาย serial และ catalog จะทำใน Product Card/Home ตามลำดับ ยังไม่มี DB merge ใน task นี้ ส่วนการใช้สถานะร่วมกับ Badge เป็น task No LINE UUID ถัดไป

## สิ่งที่เปลี่ยน

เพิ่ม `GET /api/cs-portal/products` ใช้ signed LINE session เท่านั้น ไม่รับ query ใด ๆ รวมถึง lineuuid/debug จึงไม่สามารถเลือกสินค้าของคนอื่นผ่าน query ทุก response มี `Cache-Control: private, no-store`

| กรณี | HTTP | accountStatus | productState |
|---|---|---|---|
| Sony พบสินค้า | 200 | linked | has_products |
| Sony พบ customer แต่ products ว่าง | 200 | linked | no_products |
| Sony ตอบ 404 ตาม contract client เดิม | 200 | not_linked | not_applicable |
| session หาย/หมดอายุ | 401 | ไม่มี success payload | ไม่มี |
| query ไม่ถูกต้อง | 400 | ไม่มี success payload | ไม่มี |
| Sony error/network/timeout/JSON หรือ payload ผิด | 502 | ไม่มี success payload | ไม่มี |
| config/local error | 500 | ไม่มี success payload | ไม่มี |

`not_linked` หมายถึง upstream ตอบ customer-not-found ตามการตีความ 404 ที่ client เดิมใช้อยู่ ไม่ใช่หลักฐานว่าผู้ใช้ไม่มีบัญชี Sony ในทุกระบบ ต้องยืนยัน contract live กับ Sony อีกครั้ง

## โครงสร้างและ data flow

1. `src/app/api/cs-portal/products/route.ts` ตรวจ config/session/query แล้วเรียก service
2. `src/lib/cs-portal/products.ts` เรียก Sony client ด้วย UUID จาก session แปลงผลเป็น Portal response ไม่ส่ง customer ID/ชื่อ/UUID กลับ FE
3. `src/lib/sony-products-client.ts` reuse POST endpoint/config เดิม ส่ง `{countryCode, lineId}` และ APIM subscription key ฝั่ง server รองรับทั้ง `prodDetails` และ `customer/products`
4. `src/types/badge.ts` เพิ่ม optional warrantyExpiryDate ในชนิดข้อมูลสินค้าเดิม

Service เปิด timeout 10 วินาทีเฉพาะการเรียกจาก Portal และอนุญาต registration date ที่ขาดได้ Client เก็บวันที่ขาดเป็น string ว่างภายในเพื่อรักษา type เดิม แล้ว Portal แปลงเป็น null ค่า default ของ client ที่ Badge ใช้ยังปฏิเสธ registration date ที่ไม่มีเหมือนเดิม

Shared client ส่ง warrantyExpiryDate ต่อแล้ว, ตรวจ model ว่าไม่ว่าง, ตรวจ lineId ของ warranty row หากต้นทางส่งมา และลบ console.log ที่เคยพิมพ์ LINE UUID หาก customer.lineuuid ใน legacy response ไม่ตรง session ทาง Portal จะคืน 502 ไม่ส่งข้อมูลชุดนั้น

## ตัวอย่าง raw → response — MOCK

Raw upstream จำลอง:

```json
{"prodDetails":[{"lineId":"MOCK-OWNER","modelName":"ILME-FX2/QSYX","serialNumber":"MOCK-SERIAL","registrationDate":"2026-03-25","warrantyExpiryDate":"2027-06-23"}]}
```

Portal products item:

```json
{"sku":"ILME-FX2/QSYX","modelName":"ILME-FX2/QSYX","serialNumber":"MOCK-SERIAL","registeredAt":"2026-03-25","warrantyExpiryDate":"2027-06-23"}
```

วันไม่มีคืน null ไม่คำนวณ DO Date ไม่เติมเวลา ไม่คำนวณอายุประกันใหม่ ไม่รวม/ตัด serial ซ้ำ และยังคงลำดับสินค้าจาก upstream

Response มี `isMock` อิง SONY_PRODUCT_API_MODE หาก mock เป็น true ส่วน tests ที่ตั้ง mode live แต่ intercept fetch จะได้ false แม้ transport เป็น MOCK จึงห้ามใช้ field นี้อ้างว่า tests เรียก API จริง

## วิธีทดลองและจุดรีวิว

```bash
npm test -- src/app/api/cs-portal/products/route.test.ts src/lib/sony-products-client.test.ts
```

Tests เรียก route → service → Sony client จริง โดย mock เฉพาะ fetch และใช้ signed session จำลอง ตรวจ request body/timeout, raw-to-response, วันที่ขาด, รูปแบบ response เดิม, 404 เทียบ no-products, upstream 401/403/429/5xx, malformed payload, owner mismatch, session หมดอายุ และ query ปลอม UUID

หลังรันแอปและมี session เรียก `/api/cs-portal/products` ได้ ใช้ config Sony endpoint เดิม ไม่มี secret หรือ UUID อยู่ใน URL และไม่ต้องใช้ Portal DB สำหรับ endpoint นี้

## ผลตรวจและข้อจำกัด

- Vitest 246 tests / 37 files ผ่าน รวม Products route integration 24 tests และ regression Badge เดิม
- lint, production build และ git diff --check ผ่าน
- Build มี safeError UNKNOWN_ERROR ระหว่าง static generation เช่นรอบก่อน แต่จบ exit 0
- ไม่ได้ติดต่อ Sony live, login LIFF จริง, อ่าน/เขียน UAT DB หรือ deploy รอบนี้
- 404 → not_linked, response format, timeout และข้อมูลวันประกันพิสูจน์ด้วย mocked transport เท่านั้น ยังต้องยืนยันกับ upstream จริง
- Frontend placeholder, global footer, grouping serial/catalog และ shared not-found handling กับ Badge เป็นงานถัดไปตาม review gate

## Git และสถานะ

Articles ที่อนุมัติแล้ว commit/push `4ff02f3` (`Add session-protected Portal article selection API`) บน codex/sony-cs-portal-be ตรวจ remote SHA ตรง `4ff02f3253dcb541942fa3026c4384857d70021b` แล้ว ไม่ใช่ deploy

งาน My Sony Integration ยังไม่ commit/push ตั้งเป็น in review รอรีวิว/QA โดยไม่มี comment ใน ClickUp หยุดก่อน EX-16088 — No LINE UUID Placeholder Screen

## ผลทดสอบ Sony UAT จริงเพิ่มเติม

ตรวจ EX-10028 แล้วพบ Sony endpoint/key ในส่วน Env UAT (5/Aug/2026) และเพิ่มเฉพาะ SONY_PRODUCT_API_* ลง .env ที่ถูก ignore พร้อม permission 600 ไม่ได้นำ secret เข้า Git

เรียก POST QueryWarrantyMySonyByLine จริงด้วยค่า demo-line-earned จาก config (เป็น identifier จำลอง ไม่ใช่บัญชีผู้ใช้จริง): HTTP 200 ในประมาณ 1.6 วินาที แต่ body เป็น errorCode="100" และข้อความว่า Line ID ไม่พบในฐานข้อมูล ไม่มี prodDetails

จึงเพิ่ม mapping ใน shared Sony client ให้ response 200/code100 พร้อมรูปแบบข้อความ not-found ที่พบ กลายเป็น SonyCustomerNotFoundError เหมือน 404 เดิม Portal จะได้ not_linked ส่วน business error อื่นยังเป็น 502 ไม่ตีความเป็นบัญชียังไม่เชื่อมโดยอัตโนมัติ

หลักฐานนี้ยืนยัน endpoint/key ใช้เรียก UAT ได้และพบ not-found contract จริงเท่านั้น ยังไม่พิสูจน์กรณีบัญชีจริงมีสินค้า/ไม่มีสินค้า หรือข้อมูลวันประกันจริง ต้องใช้ LINE UUID ของบัญชีทดสอบที่เชื่อม Sony แล้ว ทดสอบแก้ไขด้วย 36 focused/regression tests ผ่าน (Products 25, Sony client 1, Badge route 10) การ map Portal response ยังทดสอบผ่าน mocked transport ไม่ใช่การ login LINE จริง
