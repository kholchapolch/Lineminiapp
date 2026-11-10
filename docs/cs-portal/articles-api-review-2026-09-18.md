# รายงานรีวิว EX-16070 — Article Selection Page

วันที่ 18 กันยายน 2026 · พร้อมรีวิวโค้ด · ยังไม่ commit งาน Articles

## Requirement ของ task

[EX-16070 — [BE] SONY-04 Article Selection Page](https://app.clickup.com/t/86d4a975t) ไม่มี description หรือ comment เพิ่มเติม จึงอ่าน parent [EX-13794](https://app.clickup.com/t/86d48ec23) ซึ่งระบุหน้าเปิดจาก CTA มี CTA Tab Navigator, รายการบทความเรียง PublishTime รองรับ Overlay/Popup และ 2-page fallback ส่วนเอกสาร Requirement Details/PRD ที่อ้างถึงไม่ได้เปิดอ่านจากข้อมูล task

ขอบเขต BE ตามแผนที่ตกลงคือ API เลือกบทความตาม model/action/locale พร้อมตัดซ้ำ เรียงลำดับ และคืนรายการว่างเมื่อไม่มีข้อมูล UI ของ tab/overlay/navigation เป็นงาน FE ใช้เอกสาร HTML ประกอบ contract โดยยึด session และ schema ที่ตกลงไว้แล้ว

## สิ่งที่ทำและพฤติกรรม

เพิ่ม `GET /api/cs-portal/articles?locale=th&modelKey=ILME-FX2&actionKey=firmware`

- ต้องมี signed LINE session ก่อนอ่าน DB; ไม่รับ LINE UUID หรือ dataset version จาก query
- ทั้งสาม query จำเป็นและรับอย่างละหนึ่งค่า locale เป็น th/en, modelKey ยาวไม่เกิน 191, actionKey ยาวไม่เกิน 100 และไม่รับค่าว่าง/control characters/เครื่องหมาย HTML
- ใช้ modelKey และ actionKey ที่ FE ได้จาก `/content` การเทียบ actionKey เป็นแบบตรงตัวหลัง trim ไม่เดา alias
- อ่าน active dataset ครั้งเดียว จับคู่ canonical model ด้วย exact/suffix logic เดิม
- รวมบทความที่ตรงภาษาและ action จาก model, category ที่ระบุไว้ตรงกับ catalog และ global ไม่ใช่การเลือก scope เดียวแทนกันแบบ CTA
- รุ่นที่ไม่รู้จักหรือกำกวมไม่ใช้ model/category แต่ยังใช้ global ของ action นั้นได้; ไม่อนุมานชื่อ category
- เรียง published_at ใหม่ก่อน วันที่ว่างท้ายสุด → sort_order น้อยก่อน → external_key ตามลำดับตัวอักษร ใช้ comparator เดียวกับ Carousel แต่ไม่จำกัด 5 รายการ
- ตัด URL ซ้ำหลังเรียง เก็บรายการแรก URL เปรียบเทียบผ่าน URL.href; query parameters และ fragment ยังมีความหมายต่างกัน ไม่มีการให้ model ชนะ global เมื่อ URL ซ้ำโดยอัตโนมัติ
- ตรวจ payload/URL ของทุกแถวที่เลือกก่อนตัดซ้ำ ใช้ validator ร่วมกับ import/CRUD
- ไม่มีรายการคืน 200 พร้อม items: []; ไม่มีการข้ามภาษา
- ทุก response มี Cache-Control: private, no-store; invalid query 400, session หาย/หมดอายุ 401, DB/payload ผิด 500 พร้อมข้อความที่ไม่เปิดเผยรายละเอียดภายใน

API กรองด้วย actionKey โดยตรง ไม่บังคับว่าต้องมี CTA row อยู่ใน dataset ด้วย จึงรองรับ URL ที่เปิดไว้ก่อนมีการเปลี่ยน CTA ได้ ถ้า action ไม่มีบทความจะคืนรายการว่าง

## ข้อมูลไหลผ่านโค้ด

1. `src/app/api/cs-portal/articles/route.ts`: ตรวจ session/query และแปลงผลหรือ error เป็น HTTP
2. `src/lib/cs-portal/content-repository.ts`: reuse การอ่าน active snapshot เดิม
3. `src/lib/cs-portal/articles.ts`: ตรวจ query, resolve model, รวมบทความ, เรียง, ตัดซ้ำ และจัด response
4. `scripts/db/cs-portal/dataset.mjs`: export validateArticlePayload จาก validation เดิม ไม่เปลี่ยน schema หรือ hash workflow
5. `src/lib/cs-portal/types.ts`: เพิ่ม ArticlePayload, ArticleItem และ ArticlesResponse

ไม่เปลี่ยน behavior ของ `/content`, Badge หรือ deployment workflows

## ตัวอย่าง response — MOCK สำหรับอธิบายเท่านั้น

```json
{
  "locale": "th",
  "modelKey": "ILME-FX2",
  "matchedCatalog": true,
  "actionKey": "firmware",
  "items": [{
    "key": "mock:latest",
    "title": "[MOCK] ตัวอย่างบทความ",
    "summary": "ข้อมูลจำลองสำหรับทดสอบ ไม่ใช่บทความ Sony ที่อนุมัติ",
    "imageUrl": "https://www.sony.co.th/th/mock-image",
    "imageAlt": "[MOCK] ตัวอย่างบทความ",
    "url": "https://www.sony.co.th/th/mock-article",
    "publishedAt": "2026-09-18 09:00:00.000",
    "isMock": true
  }]
}
```

URL ในตัวอย่างเป็นตัวอย่างโครงสร้าง ไม่ใช่หลักฐานว่ามีหน้า/รูปจริง PublishedAt ส่ง wall-clock ตาม DB ไม่เติม timezone และวันที่ไม่มีคืน null; summary มาจาก payload.description, imageAlt มาจาก title ส่วน imageUrl ใช้ contract ปัจจุบันที่ validator บังคับ URL ไม่ใช่ null

## วิธีทดลองและจุดตรวจ

```bash
npm test -- src/lib/cs-portal/articles.test.ts src/app/api/cs-portal/articles/route.test.ts
```

- Integration test เรียก `/content` แล้วนำ actionKey ของ CTA ไปเรียก handler `/articles` ตรวจชุดบทความตรงกันและอ่าน dataset หนึ่งครั้งต่อ request
- Resolver tests ตรวจบทความ 7 รายการไม่ถูกตัดเหลือ 5, วันที่เท่ากัน, วันที่ว่าง, URL ซ้ำข้าม scope, query/fragment ต่างกัน, ภาษา/action/รุ่นอื่น และ unsafe payload
- เมื่อรันแอปและมี session จริง เรียก URL ด้านบนได้ แต่ dataset ที่ไม่มีบทความจะคืน items ว่าง
- ชุดทดสอบสร้างบทความจาก fixture MOCK เดิมและ mock repository ไม่ได้ import หรือ activate ข้อมูลเหล่านี้ลง UAT

## ผลตรวจและขอบเขตหลักฐาน

- Vitest 222 tests / 36 files ผ่าน รวม Articles resolver 16 และ route 9 tests
- Node import tests 11 ผ่าน; lint, production build และ git diff --check ผ่าน
- Build ยังมี safeError UNKNOWN_ERROR ระหว่าง static generation เช่นรอบก่อน แต่จบ exit 0
- รอบนี้ไม่ได้เชื่อม UAT DB, ทำ live LINE login, ทดสอบ FE overlay/tab หรือ deploy
- ข้อมูลจริงยังต้องมี ID/PublishTime และ mapping ที่ยืนยันก่อนตรวจผล live ชุดทดสอบ MOCK ไม่ถือเป็นหลักฐานว่าข้อมูลพร้อม production

## Git และ gate รีวิว

งาน CTA ที่อนุมัติแล้ว commit/push เป็น `dcaec0c` (`Add category-aware Portal CTA resolution`) บน `codex/sony-cs-portal-be` ตรวจ remote ตรง `dcaec0c330a2be77cad99fe0948152579c38abaf` แล้ว ไม่ใช่การ deploy

Articles รอบนี้ยังไม่ commit/push ตั้ง task เป็น in review รอรีวิว/QA โดยไม่มี comment ใน ClickUp และหยุดก่อน EX-16085 — My Sony API Integration
