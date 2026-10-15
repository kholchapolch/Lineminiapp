# รายงานรีวิว EX-16067 — CTA Buttons

วันที่ 18 กันยายน 2026 · พร้อมรีวิวโค้ด · ยังไม่ commit งาน CTA

## Requirement และขอบเขต

[EX-16067 — [BE] SONY-03 CTA Buttons](https://app.clickup.com/t/86d4a975n) ไม่มีรายละเอียดหรือ comment เพิ่มเติม จึงอ่าน parent [EX-13793](https://app.clickup.com/t/86d48ec19) ซึ่งระบุปุ่มตามหมวด DI=8, HE/PE/MC=5, PS=4 เรียงด้วย CTA Index รองรับ EN/TH และ link-out; View Service Center กับ Check Repair Status ย้ายไป Footer Widget Bar แล้ว ส่วน Requirement Details/PRD ที่อ้างถึงไม่สามารถอ่านได้จากข้อมูล task

ตามแผนที่ตกลง รอบ BE นี้ทำการเลือกปุ่มตาม model → category → global พร้อมภาษา ลำดับ และชนิด action ได้แก่ articles, external และ internal โดยใช้ contract ที่งาน CRUD รองรับอยู่แล้ว การคืนภาษาใช้ locale ที่ร้องขอทีละภาษา

**ข้อจำกัดสำคัญ:** ยังไม่ได้ยืนยันชุดปุ่มจริงให้ครบจำนวนตามหมวด ข้อมูล workbook ที่นำเข้าก่อนหน้านี้ยังไม่มี CTA เพราะ mapping อยู่ใน checkbox controls งานนี้ไม่เดาความหมายของ PE/MC/PS ให้เท่ากับ Personal Entertainment/Mobile/Game และไม่เติมปุ่มเพื่อให้ครบจำนวน ตัว resolver ใช้ category row ที่ระบุ target_key ตรงกับ catalog ใน active dataset เท่านั้น ผู้ดูแลต้องยืนยัน mapping ก่อน import/activate ข้อมูลจริง

## สิ่งที่เปลี่ยน

เพิ่ม `ctaItems` ภายในแต่ละรายการ `models` ของ `/api/cs-portal/content` โดยคง carousel และ metadata เดิม ใช้ session/query contract เดิม และอ่าน active dataset ครั้งเดียวต่อ request

1. เลือก CTA เฉพาะภาษาที่ขอ ไม่มี fallback ข้ามภาษา
2. เลือกผู้ชนะต่อ `action_key`: model ก่อน category ก่อน global การ override หนึ่ง action ไม่ซ่อนปุ่มอื่น
3. หาก scope เดียวกันมี action ซ้ำ ใช้ sort_order น้อยก่อน แล้ว external_key ตามลำดับตัวอักษรเป็นตัวตัดสิน
4. นำรายการที่เลือกแล้วมาเรียง sort_order (CTA Index) และ external_key โดยไม่จำกัดจำนวนตายตัวตามหมวด
5. รุ่นที่ไม่รู้จักหรือจับคู่กำกวมใช้เฉพาะ global; รุ่นที่ไม่มี category ไม่ใช้ category mapping
6. ไม่มี mapping จะได้ `ctaItems: []`; ไม่ส่ง modelKey จะได้ `models: []` เช่นเดิม
7. ตรวจ label/action ก่อนตอบ ใช้ Sony HTTPS allowlist สำหรับ external และอนุญาต internal route เฉพาะ `/my-badges`, `/register-product` หาก payload ไม่ถูกต้อง API คืน safe 500
8. ไม่เลือกแถวชนิด footer_link มาเป็น CTA

## โครงสร้างโค้ด

- `src/app/api/cs-portal/content/route.ts`: ตรวจ session/query → โหลด active dataset → เรียก resolver → ส่ง JSON พร้อม private, no-store
- `src/lib/cs-portal/cta-content.ts`: ประกอบข้อมูล carousel เดิมกับ CTA เลือก scope ต่อ action และเรียงลำดับ
- `src/lib/cs-portal/carousel-content.ts`: reuse การจับคู่ canonical model และข้อมูล catalog; ไม่เปลี่ยนกติกา Carousel
- `src/lib/cs-portal/types.ts`: ชนิด CtaAction/CtaPayload/CtaItem และ PortalContentResponse
- `scripts/db/cs-portal/dataset.mjs`: export validator CTA ที่มีอยู่แล้วให้ API ใช้ร่วมกับ import/CRUD
- `src/lib/cs-portal/cta-content.test.ts`: ข้อมูลจำลองและกรณีทดสอบ resolver
- `src/app/api/cs-portal/content/route.test.ts`: ตรวจ session/error เดิม และการรวม CTA/Carousel จาก snapshot เดียว

## ตัวอย่างสำหรับรีวิว — MOCK เท่านั้น

ชุดทดสอบสมมติ ILME-FX2 อยู่หมวด DI แล้วสร้าง action `support` ที่ global/category/model ผลคือเลือก model ส่วน `tips` ที่ category และ `badges` ที่ global ยังอยู่ เมื่อเรียงตาม index จะได้:

| ลำดับ | actionKey | source | เหตุผล |
|---|---|---|---|
| 1 | badges | global | ไม่มี override, index 0 |
| 2 | tips | category | mapping DI ที่ระบุไว้, index 2 |
| 3 | support | model | model ชนะ category/global, index 3 |

ตัวอย่าง item:

```json
{
  "key": "mock:model-support",
  "actionKey": "support",
  "label": "[MOCK] model-support",
  "action": { "type": "articles" },
  "source": "model",
  "isMock": true
}
```

`actionKey` ให้ FE ใช้เลือกบทความใน task ถัดไป; `source` ใช้อธิบายว่าได้ปุ่มเพราะ mapping ระดับใด ชื่อ/ความสัมพันธ์ในตัวอย่างทั้งหมดเป็น MOCK ไม่ใช่ข้อมูล Sony อนุมัติ ไม่ได้ import/activate ลง DB โดย isMock มาจาก prefix `mock:` ของ external_key ผู้สร้างข้อมูลจำลองต้องใช้ prefix นี้และติดป้าย `[MOCK]` ที่ label ด้วย

## วิธีทดลองและจุดตรวจ

```bash
npm test -- src/lib/cs-portal/cta-content.test.ts src/app/api/cs-portal/content/route.test.ts
```

ตรวจว่าการลบ model mapping ทำให้ support ใช้ category และลบ category ต่อแล้วใช้ global; สลับลำดับแถวต้องได้ผลเดิม; รุ่นไม่รู้จักมีเฉพาะ global; EN ไม่มีข้อมูลต้องไม่ยืม TH; footer ไม่กลายเป็นปุ่ม; unsafe URL และ internal route นอก allowlist ต้องถูกปฏิเสธ

หลังรันแอปในเครื่องและมี LINE session เรียก `/api/cs-portal/content?locale=th&modelKey=ILME-FX2` ได้ หาก dataset ไม่มี CTA จะเห็น `ctaItems: []` การทดสอบ positive mapping ในรอบนี้ใช้ mock repository/ข้อมูลใน tests

## ผลตรวจและสิ่งที่ยังไม่พิสูจน์

- Vitest 197 tests / 34 files ผ่าน รวม CTA resolver 12 และ content route 13 tests
- Node import tests 11 ผ่าน
- lint, production build, git diff --check ผ่าน (build มี safeError UNKNOWN_ERROR ระหว่าง static generation เช่นรอบก่อน แต่จบ exit 0)
- ไม่ได้อ่านหรือเขียน UAT DB ในรอบ CTA; ไม่ได้ทดสอบ live CTA จากฐานข้อมูล, login LIFF, FE navigation หรือ deploy
- จำนวนปุ่มและ mapping จริงตามหมวดยังต้องยืนยัน; API articles และ footer ยังเป็น task ถัดไป
- ไม่มีการเปลี่ยน workflow, runtime deployment หรือระบบ Badge

## Git และ review gate

งาน Carousel ที่อนุมัติแล้ว commit `259e79e` และ push พร้อม commit Register Product `f27e655` ไป `origin/codex/sony-cs-portal-be` แล้ว ตรวจ remote SHA ตรง `259e79ec4268eef43e426f0a25800e11ec30f364` ไม่ใช่การ deploy

งาน CTA รอบนี้ยังไม่ commit/push ตั้ง ClickUp เป็น in review รอรีวิว/QA ไม่มี comment และจะยังไม่เริ่ม Article Selection จนกว่าจะผ่าน gate นี้
