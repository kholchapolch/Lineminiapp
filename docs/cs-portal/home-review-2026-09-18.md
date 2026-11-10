# รายงานรีวิว EX-16061 — Product Center (Home Page)

วันที่ 18 กันยายน 2026 · task สุดท้ายตามแผน BE · พร้อมรีวิว ยังไม่ commit

## Requirement

[EX-16061 — [BE] SONY-01 Product Center (Home Page)](https://app.clickup.com/t/86d4a9753) อ้างอิง parent EX-13791: หน้าหลักหลังยืนยันตัวตน แสดงสินค้าที่ลงทะเบียนทั้งหมดเป็น Product Card พร้อม CTA ตามหมวด, Article Carousel และ Footer Widget Bar อ่าน comment/replies แล้วเป็นเรื่อง config DB ไม่มี requirement เพิ่มเติม

ขอบเขตที่ตกลงคือยืนยัน contract รวมและ batch สูงสุด 50 รุ่นให้ FE ประกอบหน้าได้ ไม่สร้างหน้า FE ใหม่หรือแทน prototype ใน task BE นี้

## สิ่งที่ทำ

เพิ่ม `src/lib/cs-portal/home-contract.ts` เป็นตัวช่วยแบบ pure TypeScript ใช้ได้โดยไม่ผูกกับ React/server-only/network:

- `buildHomeContentRequests(products, locale)` สร้าง URL `/content` ทีละไม่เกิน 50 modelKey ด้วย URLSearchParams รองรับชื่อที่มี /, +, ช่องว่าง และ &
- มี 51 รุ่นแบ่ง 50+1 โดยไม่ตัดรายการสินค้า เมื่อไม่มีสินค้าเรียก content หนึ่งครั้งโดยไม่ส่ง model เพื่อโหลด footer
- บัญชี not_linked ไม่สร้าง content request และประกอบหน้าเป็น placeholder ไม่มี footer
- `composeProductCenter(products, locale, batches)` จับคู่ content ด้วย modelKey คงลำดับ productGroups ไม่อาศัยตำแหน่งแถว response
- รวม registrations/warranty/catalog กับ CTA/Carousel และ footer ชุดเดียว
- รูปใช้ content.fallbackImageUrl ก่อน group.imageUrl หากไม่มีทั้งคู่ส่ง imageState=missing ให้ FE แสดง empty-image ของตัวเอง หากมี URL ส่ง available ซึ่งไม่ได้แปลว่าโหลดรูปสำเร็จจริง FE ยังต้องรองรับ image onError
- หากจำนวน batch/model ไม่ครบ, locale ผิด, model ซ้ำ, canonical/category/matchedCatalog เปลี่ยน หรือ footer ต่างระหว่าง batch จะ throw HomeContentMismatchError ให้ FE แสดง retry และโหลดใหม่ ไม่แต่งข้อมูลที่ขาด

API routes ไม่เปลี่ยน contract ในรอบนี้ และ helper ยังไม่ได้ถูกต่อเข้าหน้าจอ prototype จึงไม่ถือว่าหน้า FE พร้อมใช้งานแล้ว

## โครงสร้างและการใช้ของ FE

1. ทำ LIFF token → `/api/line-session` ตาม task session เพื่อให้มี signed cookie
2. เรียก `/api/cs-portal/products` ตรวจ HTTP error ก่อนอ่าน success payload
3. ใช้ buildHomeContentRequests สร้างรายการ URL ตาม locale
4. เรียกแต่ละ URL ด้วย cookie origin เดียวกัน ตรวจ response.ok ทุกครั้ง แล้วรวบรวม batch ให้ครบ
5. ส่งผลให้ composeProductCenter; หาก HomeContentMismatchError ให้แสดง retry และโหลด products/content ใหม่ทั้งชุด
6. แสดง cards หรือ emptyState/placeholder ตาม state ใช้ LIFF แสดง LINE profile
7. action type=articles เรียก `/articles` ด้วย modelKey/actionKey/locale; external ใช้ URL ที่ API ให้; internal ให้ FE resolve locale ของ route

ไฟล์หลักที่อ่านประกอบ:
- `src/lib/cs-portal/home-contract.ts`: batching/composition และ ProductsApiResponse type
- `src/lib/cs-portal/home-contract.test.ts`: ทดสอบเรียก products handler → content handler → compose
- `src/app/api/cs-portal/products/route.ts`: ownership/grouping
- `src/app/api/cs-portal/content/route.ts`: CTA/Carousel/footer ของ active dataset
- `src/lib/cs-portal/product-groups.ts`: canonical model/serial/warranty

## ตัวอย่าง flow — MOCK

Sony จำลองคืน ILME-FX2/QSYX กับ UNKNOWN โดย UNKNOWN ลงทะเบียนใหม่กว่า:

- products คืน 2 กลุ่มเรียง UNKNOWN → ILME-FX2
- content รับ modelKey ทั้งสองใน request เดียว
- compose คงลำดับนั้น; ILME-FX2 มี CTA หมวด DI ที่ติดป้าย MOCK และ carousel สูงสุด 5 รายการ; UNKNOWN ไม่มีรูปจึง imageState=missing
- footer แสดง 2 รายการจาก workbook fixture ตาม locale

กรณี 51 SKU จำลอง: products คืนครบ 51 กลุ่ม → content 2 requests (50+1) → cards 51 และ footer ชุดเดียว ไม่สร้าง carousel/CTA เติมให้รุ่นที่ไม่มี mapping

## วิธีทดลองและผลตรวจ

```bash
npm test -- src/lib/cs-portal/home-contract.test.ts
```

- Home integration 9 tests ผ่าน: ownership/content join, TH/EN, no-products, not-linked, 50/51 limit, แบ่ง batch, URL encoding, response mismatch และรูป fallback
- Vitest ทั้งโครงการ 284 tests / 41 files ผ่าน
- Node import tests 11 ผ่าน; lint, production build, git diff --check ผ่าน
- Build ยังมี safeError UNKNOWN_ERROR ช่วง static generation เช่นเดิม แต่ exit 0
- Tests ใช้ signed session จำลอง, mock Sony fetch และ repository fixture ไม่ใช่ browser E2E หรือข้อมูลบัญชีจริง; isMock ใน payload อิง mode config ไม่ใช่ตัวตรวจว่าระบบทดสอบ intercept network หรือไม่
- รอบนี้ไม่อ่าน/เขียน DB, ไม่ยิง Sony live และไม่ deploy

## ข้อจำกัดที่ต้องรู้ก่อน UAT/production

- ข้อมูล CTA category mapping จริงยังไม่ยืนยัน และ article/carousel ยังขาด ID/PublishTime ชุด positive tests เป็น MOCK ไม่ใช่ Sony อนุมัติ
- รูปสินค้าชุด UAT ใช้ placeholder ที่เขียน MOCK; ไม่ถือเป็นรูป production
- Register Product EN ยังไม่มีข้อมูลและคืน 404 ตาม contract; FE ต้องรองรับหรือเติมข้อมูลที่อนุมัติก่อนปล่อย flow EN
- ยังไม่มี LINE UUID บัญชีจริงสำหรับพิสูจน์ ownership/warranty; การยิง Sony UAT ก่อนหน้าพิสูจน์เพียง not-found contract
- การผูกบัญชีและ profile/UI/navigation ต้องตรวจ FE integration จริง
- products และ content แต่ละ request อ่าน active version ครั้งเดียว แต่หลาย request ไม่ได้อยู่ใน snapshot เดียวทั้งหน้า Helper ตรวจจับความต่างที่เห็นใน metadata/footer ได้บางส่วน ไม่รับประกันตรวจพบทุกการ activate ระหว่าง requests หากต้องการ atomic ทั้งหน้าต้องออกแบบ version contract เพิ่ม
- วันที่หมดประกันแบบ date-only ใช้สิ้นวันไทยตามที่ส่งรีวิว Product Card แล้ว ไม่คำนวณ DO Date เอง

## Git และ review gate

Product Card ที่อนุมัติ commit/push `6e54dfc` บน codex/sony-cs-portal-be ตรวจ remote SHA ตรง `6e54dfc0cd207802a7b1108ae4f65aa4972163b0` แล้ว ไม่ใช่ deploy

Home รอบนี้ยังไม่ commit/push ตั้ง EX-16061 เป็น in review รอรีวิว/QA ไม่มี comment งานถึง review gate สุดท้ายของแผน BE แล้ว แต่ยังไม่ถือว่าผ่าน QA/UAT หรือพร้อม production จนกว่าจะปิดข้อจำกัดข้อมูลและทดสอบระบบจริง
