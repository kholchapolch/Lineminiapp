# รายงานรีวิว EX-16073 — Product Carousel Area

วันที่ 18 กันยายน 2026 · สถานะส่งรีวิว · ยังไม่ commit งาน Carousel

## Requirement ของ task

[EX-16073 — [BE] SONY-05 Product Carousel Area](https://app.clickup.com/t/86d4a976j) ไม่มีรายละเอียดเพิ่มเติมหรือ comment ใน task BE จึงใช้ requirement ของ parent ประกอบแผนที่ตกลง: แสดง carousel ที่ Sony เลือกใต้ CTA ของแต่ละ Product Card, เลื่อนแนวนอน, เรียงตาม PublishTime, ประมาณ 3–5 รายการต่อรุ่น, ซ่อนช่องที่ไม่มีข้อมูล และมี gradient overlay

ขอบเขต BE รอบนี้คือส่งข้อมูลตามรุ่นและภาษา สูงสุด 5 รายการ หากมีน้อยกว่า 3 ส่งเท่าที่มี ไม่สร้างรายการเติมช่อง ส่วนการเลื่อนและ gradient เป็นงาน FE

## สิ่งที่ทำ

เพิ่ม `GET /api/cs-portal/content?locale=th&modelKey=ILME-FX2` ต้องมี signed LINE session อ่านเฉพาะ active dataset และคืน `Cache-Control: private, no-store` ทุกสถานะ

- รับ `locale=th|en` และ `modelKey` ซ้ำได้ สูงสุด 50 รุ่นที่ไม่ซ้ำกัน; ตัดรุ่นซ้ำโดยไม่สนตัวพิมพ์เล็กใหญ่
- จับคู่ canonical model ด้วย exact ก่อน แล้วใช้กติกา suffix เดิม; หากกำกวมจะไม่จับคู่
- เลือก carousel ตาม model และภาษาที่ขอเท่านั้น ไม่มีการข้ามภาษา หรือใช้ category/global แทน
- เรียง `published_at` ใหม่ก่อน → `sort_order` น้อยก่อน → `external_key` ตามลำดับตัวอักษร; วันที่ว่างอยู่ท้ายสุด แล้วจำกัด 5 รายการ
- คืน `carouselItems: []` เมื่อไม่มีข้อมูล และแยก `matchedCatalog` ให้ทราบว่ารู้จักรุ่นหรือไม่
- ส่ง `publishedAt` ตามค่าต้นทาง ไม่เติม timezone; ตรวจ payload และ URL ก่อนส่ง
- รุ่นที่รู้จักจะคืน `categoryCode` และ `fallbackImageUrl` จาก catalog ด้วย

รอบนี้ response มี `locale` และ `models` เท่านั้น ยังไม่มี CTA หรือ footer ซึ่งจะเพิ่มใน task ตามลำดับ เมื่อไม่ส่ง modelKey จะได้ `models: []`

## โครงสร้างและข้อมูลไหลผ่านโค้ด

1. `src/app/api/cs-portal/content/route.ts` รับ request ตรวจ session และ query จัดการ HTTP 200/400/401/500
2. `src/lib/cs-portal/content-repository.ts` ของ task ก่อน อ่าน active version ครั้งเดียวและโหลด products/contents ของ version นั้น
3. `src/lib/cs-portal/carousel-content.ts` จับคู่รุ่น เลือกภาษา เรียงลำดับ จำกัดจำนวน และสร้าง response
4. `src/lib/cs-portal/types.ts` กำหนดชนิดข้อมูล response; `scripts/db/cs-portal/dataset.mjs` ใช้ validator ร่วมกับงาน import

ไม่มีการแก้ route Badge เดิมหรือเขียนฐานข้อมูลใน task นี้

## ตัวอย่างและสิ่งที่ควรรีวิว

ข้อมูล UAT จริง: `ILME-FX2` ได้ `matchedCatalog: true`, category `DI`, รูป placeholder ที่มีข้อความ MOCK และ carousel ว่าง; `UNKNOWN` ได้ `matchedCatalog: false`, รูป/category เป็น null และ carousel ว่าง ดู response ใน `carousel-uat-empty-response-2026-09-18.json`

ข้อมูลจำลองใน `scripts/db/cs-portal/fixtures/carousel-e2e-mock.json` ใช้ทดสอบเท่านั้น ทุกหัวข้อขึ้นต้น `[MOCK]`, key ขึ้นต้น `mock:` และ API ส่ง `isMock: true` ไม่ใช่รายการที่ Sony เลือกจริง และไม่ได้ import/activate ลง UAT

สำหรับ ILME-FX2 ภาษาไทย fixture มี 7 รายการ ผลที่คาดไว้ 5 รายการคือ:

```text
mock:latest → mock:same-first → mock:same-a → mock:same-b → mock:old
```

จุดตรวจ: วันที่ใหม่มีความสำคัญก่อน sort_order, วันที่เท่ากันใช้ sort_order และ key ตัดสิน, รายการวันที่ว่างอยู่ท้าย, รุ่นที่ไม่มีรายการไม่ถูกเติมช่อง, ภาษาอังกฤษไม่ดึงภาษาไทยมาแทน และ URL ที่ไม่ปลอดภัยถูกปฏิเสธ

## วิธีทดลอง

```bash
npm test -- src/lib/cs-portal/carousel-content.test.ts src/app/api/cs-portal/content/route.test.ts
npm run dev
```

เมื่อมี LINE session cookie ที่ถูกต้อง เรียก `/api/cs-portal/content?locale=th&modelKey=ILME-FX2&modelKey=UNKNOWN` ใน origin เดียวกันได้ กรณีข้อมูลหลายรายการทดสอบผ่าน fixture ในชุด tests โดย repository เป็น mock จึงไม่จำเป็นต้องเปลี่ยนข้อมูล UAT

## ผลทดสอบและข้อจำกัด

- Focused tests ของ Carousel: 19 ผ่าน
- Vitest ทั้งโครงการ: 183 tests / 33 files ผ่าน
- ชุดทดสอบ import ด้วย Node: 11 ผ่าน
- `npm run lint`, `npm run build` และ `git diff --check` ผ่าน
- ทดสอบ HTTP จาก production build ที่รันในเครื่อง อ่าน UAT จริงผ่าน SSH tunnel: TH 200, EN 200, locale ผิด 400, session หมดอายุ 401; ตรวจ no-store และสถานะรุ่น/รายการว่างแล้ว
- Session ใน HTTP smoke เป็น signed session จำลองเฉพาะเครื่อง ไม่ใช่การ login LIFF จริง
- UAT ยังไม่มี carousel เพราะ workbook ขาด ID/PublishTime จึงพิสูจน์ข้อมูล carousel จริงจาก DB ไม่ได้ กรณีหลายรายการ/การเรียงใช้ fixture mock
- ไม่ได้ deploy, เปลี่ยน active dataset, แก้ข้อมูล UAT หรือทดสอบ UI FE

## ขอบเขต Git และขั้นตอนถัดไป

งาน Register Product ที่อนุมัติแล้ว commit เป็น `f27e655` (`Add session-protected Register Product content API`) ใน branch `codex/sony-cs-portal-be`; รอบนี้ยังไม่ได้ push

งาน Carousel ยังไม่ commit เพื่อให้รีวิวก่อน โดย task อยู่ `in review` รอ QA และไม่มี comment ใน ClickUp หยุดที่ gate นี้ก่อนเริ่ม EX-16067 — CTA Buttons
