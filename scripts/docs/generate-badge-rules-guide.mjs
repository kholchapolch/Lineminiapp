import { readFile, writeFile } from "node:fs/promises";
import {
  appConfig,
  badgeConditions,
  badgeDisplayGroups,
  badgeRules,
  badgeThresholds,
} from "../db/seed-data.mjs";

const outputUrl = new URL("../../docs/badge-rules-migration-and-mock-guide.html", import.meta.url);
const badgeRulesVersion = new Map(appConfig).get("badge_rules_version") ?? "unknown";
const productRules = badgeRules.filter((rule) => rule.badgeType === "product");
const questRules = badgeRules.filter((rule) => rule.badgeType === "quest");
const allBadgeMockUrl = `http://localhost:3000/th/badges?mock=1&sku=${productRules
  .map((rule) => rule.productModelCode)
  .join(",")}`;

export function renderBadgeRulesGuide() {
  return `<!doctype html>
<html lang="th">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sony Badge Rules, Migration &amp; Mock Testing</title>
    <style>
      :root { color-scheme: light; --ink:#182230; --muted:#667085; --line:#d0d5dd; --panel:#fff; --soft:#f8fafc; --accent:#155eef; --ok:#067647; --warn:#b54708; }
      * { box-sizing: border-box; }
      body { margin:0; background:#f3f6fa; color:var(--ink); font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; line-height:1.6; }
      main { width:min(1160px,calc(100% - 32px)); margin:32px auto 64px; }
      header, section { background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:24px; margin-bottom:18px; }
      h1,h2,h3 { margin:0 0 12px; line-height:1.25; }
      h1 { font-size:clamp(28px,5vw,46px); }
      h2 { font-size:26px; }
      h3 { font-size:19px; }
      p { margin:0 0 12px; }
      a { color:var(--accent); }
      code,pre { font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace; }
      code { background:#eef2f6; border-radius:4px; padding:2px 5px; font-size:12px; }
      pre { overflow:auto; margin:12px 0 0; padding:15px; border-radius:8px; background:#101828; color:#f8fafc; font-size:12px; line-height:1.55; white-space:pre-wrap; overflow-wrap:anywhere; }
      .meta,.muted { color:var(--muted); }
      .stats,.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:12px; }
      .stat,.card { border:1px solid var(--line); border-radius:9px; padding:16px; background:var(--soft); }
      .stat strong { display:block; font-size:28px; }
      .pillRow,.skuList { display:flex; flex-wrap:wrap; gap:7px; }
      .pill,.sku { display:inline-flex; border:1px solid var(--line); border-radius:999px; padding:5px 9px; background:#fff; font-size:12px; }
      .pill.ok { border-color:#abefc6; color:var(--ok); background:#ecfdf3; }
      .quest { border-left:4px solid var(--accent); }
      .condition { margin-top:12px; padding-top:12px; border-top:1px solid var(--line); }
      .steps { counter-reset:step; list-style:none; padding:0; }
      .steps li { position:relative; padding:0 0 18px 42px; }
      .steps li::before { counter-increment:step; content:counter(step); position:absolute; left:0; top:0; width:28px; height:28px; display:grid; place-items:center; border-radius:50%; background:var(--accent); color:#fff; font-weight:700; }
      .notice { border-left:4px solid var(--warn); background:#fffaeb; padding:14px 16px; }
      .tableWrap { overflow-x:auto; }
      table { width:100%; min-width:720px; border-collapse:collapse; }
      th,td { padding:11px; border-bottom:1px solid var(--line); text-align:left; vertical-align:top; }
      th { background:#eef4ff; font-size:13px; }
      td { font-size:14px; }
      details { margin-top:12px; border:1px solid var(--line); border-radius:8px; padding:12px; }
      summary { cursor:pointer; font-weight:700; }
      .toc a { display:inline-block; margin:0 14px 8px 0; }
    </style>
  </head>
  <body>
    <main>
      <header>
        <p class="meta">Client-readable confirmed configuration / เอกสารสรุปกติกาที่ใช้จริง</p>
        <h1>Sony Badge Rules, Migration &amp; Mock Testing</h1>
        <p>เอกสารนี้อธิบาย Product Badge และ Quest Badge ทั้งหมดในภาษาที่อ่านง่าย พร้อมขั้นตอนย้ายข้อมูลและวิธีทดสอบด้วย SKU จำลอง โดยข้อมูลสร้างจากไฟล์เดียวกับระบบจริง</p>
        <div class="pillRow">
          <span class="pill ok">Rules version ${escapeHtml(badgeRulesVersion)}</span>
          <span class="pill">Case-insensitive SKU matching</span>
          <span class="pill">Unique model counting for Quests</span>
          <span class="pill">Local-only mock mode</span>
        </div>
      </header>

      <section class="toc">
        <h2>Contents</h2>
        <a href="#summary">Rule summary</a><a href="#products">Product Badges</a><a href="#quests">Quest Badges</a><a href="#migration">Migration</a><a href="#mock">Mock testing</a><a href="#acceptance">Acceptance checklist</a>
      </section>

      <section id="summary">
        <h2>1. Rule Summary / ภาพรวม</h2>
        <div class="stats">
          <div class="stat"><strong>${badgeDisplayGroups.length}</strong>display groups</div>
          <div class="stat"><strong>${productRules.length}</strong>Product Badge rules</div>
          <div class="stat"><strong>${questRules.length}</strong>Quest families</div>
          <div class="stat"><strong>${badgeThresholds.length}</strong>unlock thresholds</div>
        </div>
        <div class="notice" style="margin-top:16px">
          <strong>Counting rule:</strong> Product Badge มี 1 เหรียญต่อ 1 รุ่นสินค้า แม้มีหลาย Serial Number ส่วน Quest Badge นับรุ่นสินค้าไม่ซ้ำกัน และสินค้ารุ่นเดียวสามารถช่วยปลดล็อกได้หลาย Quest หากอยู่ในหลายรายการที่กำหนด
        </div>
      </section>

      <section id="products">
        <h2>2. Product Badge Rules</h2>
        <p>ลงทะเบียนสินค้าอย่างน้อย 1 Serial Number ของรุ่นที่ระบุเพื่อปลดล็อก Product Badge ของรุ่นนั้น การลงทะเบียนรุ่นเดิมเพิ่มจะเพิ่ม Quantity/Serial list แต่ไม่สร้างการ์ด Badge ซ้ำ</p>
        ${renderProductGroups()}
      </section>

      <section id="quests">
        <h2>3. Quest Badge Rules</h2>
        <p>Quest จะใช้จำนวนรุ่นที่ไม่ซ้ำกันตามเงื่อนไขด้านล่าง ระดับ Bronze/Silver/Gold ใช้ Badge family เดียวกันและหน้า Home แสดงเฉพาะระดับสูงสุดที่ได้รับแล้ว</p>
        <div class="grid">${questRules.map(renderQuestRule).join("")}</div>
      </section>

      <section id="migration">
        <h2>4. Data Migration / ขั้นตอนย้ายข้อมูล</h2>
        <ol class="steps">
          <li><strong>Backup rule tables.</strong><pre>${escapeHtml("mysqldump -u <user> -p <database> app_config badge_display_groups badge_rules badge_rule_thresholds badge_rule_conditions > badge-rules-backup.sql")}</pre></li>
          <li><strong>Review the source data.</strong> แก้ไขเฉพาะ <code>scripts/db/seed-data.mjs</code> แล้ว regenerate artifacts เพื่อไม่ให้ JavaScript, SQL และเอกสารไม่ตรงกัน.<pre>npm run db:seed:sql
npm run db:seed:sql:check
npm run docs:badge-rules
npm run docs:badge-rules:check</pre></li>
          <li><strong>Apply in staging first.</strong><pre>export DATABASE_URL=mysql://&lt;user&gt;:&lt;password&gt;@&lt;host&gt;:&lt;port&gt;/&lt;database&gt;
npm run db:seed:all</pre></li>
          <li><strong>Manual SQL alternative.</strong> ใช้เมื่อทีมลูกค้าต้องการรัน SQL เอง หลังจาก schema migration แล้ว.<pre>npm run db:migrate
mysql -u &lt;user&gt; -p &lt;database&gt; &lt; scripts/db/seed-all-rules.sql
npm run db:verify</pre></li>
          <li><strong>Verify counts and version.</strong><pre>SELECT COUNT(*) FROM badge_display_groups;      -- 6
SELECT COUNT(*) FROM badge_rules;               -- 64
SELECT COUNT(*) FROM badge_rule_thresholds;     -- 70
SELECT COUNT(*) FROM badge_rule_conditions;     -- 66
SELECT value FROM app_config WHERE \`key\` = 'badge_rules_version';</pre></li>
          <li><strong>Run acceptance tests.</strong> ทดสอบ SKU ตัวอย่างตามหัวข้อถัดไป แล้วตรวจ Product list, Quest progress, highest tier, latest-three ordering และ duplicate serials.</li>
        </ol>
        <div class="notice"><strong>Important:</strong> Seed เป็นแบบ idempotent และทำงานใน transaction แต่จะลบ rule/group เก่าที่ไม่อยู่ใน source ปัจจุบัน รางวัลผู้ใช้ไม่ได้เก็บถาวร ระบบคำนวณใหม่จากข้อมูลสินค้า Sony เมื่อเรียกใช้งาน</div>
      </section>

      <section id="mock">
        <h2>5. Mock Mode With Specific SKUs</h2>
        <p>ใช้ได้เฉพาะ <code>APP_ENV=local</code> และ <code>SONY_PRODUCT_API_MODE=mock</code> โดยข้าม LIFF ในเครื่อง local แต่ staging/production ยังบังคับใช้ LINE session ที่ server ตรวจสอบแล้ว</p>
        <pre>APP_ENV=local
SONY_PRODUCT_API_MODE=mock
DATABASE_URL=mysql://sony:sony@127.0.0.1:3307/sony_badges

npm run db:seed:all
npm run dev</pre>
        ${renderMockExamples()}
        <details>
          <summary>Open or copy: all ${badgeRules.length} badges (${productRules.length} Product + ${questRules.length} Quest)</summary>
          <p><a href="${escapeHtml(allBadgeMockUrl)}">Open complete catalog mock</a></p>
          <pre>${escapeHtml(allBadgeMockUrl)}</pre>
        </details>
        <div class="notice" style="margin-top:16px"><strong>Mock date behavior:</strong> ระบบสร้างวันลงทะเบียนตามลำดับ SKU ใน URL ดังนั้น SKU ด้านท้ายจะใหม่กว่า ใช้ SKU ซ้ำเพื่อจำลองหลาย Serial Number ของรุ่นเดียวกัน โดย Product Badge ยังมีเพียงหนึ่งการ์ด</div>
      </section>

      <section id="acceptance">
        <h2>6. Acceptance Checklist</h2>
        <div class="tableWrap"><table><thead><tr><th>Area</th><th>Expected result</th></tr></thead><tbody>
          <tr><td>Product ownership</td><td>1 model = 1 Product Badge; duplicate registrations show Quantity and all serials.</td></tr>
          <tr><td>Quest counting</td><td>นับ SKU/model ไม่ซ้ำ และใช้ any/all/min-count ตามแต่ละเงื่อนไข</td></tr>
          <tr><td>Tier display</td><td>แสดงระดับสูงสุดที่ได้รับแล้วต่อ Quest family; Bronze/Silver/Gold ไม่แสดงซ้ำใน Home</td></tr>
          <tr><td>Latest three</td><td>แต่ละ section เรียง earned date ใหม่ไปเก่า แล้วแสดงสูงสุด 3 การ์ด</td></tr>
          <tr><td>Security</td><td>Custom SKU mock and LIFF bypass work only in local mock configuration.</td></tr>
          <tr><td>Database</td><td>6 groups, 64 rules, 70 thresholds, 66 conditions and version ${escapeHtml(badgeRulesVersion)}.</td></tr>
        </tbody></table></div>
      </section>
    </main>
  </body>
</html>
`;
}

function renderProductGroups() {
  return badgeDisplayGroups
    .filter((group) => group.badgeType === "product")
    .map((group) => {
      const rules = productRules.filter((rule) => rule.displayGroupCode === group.code);
      return `<div class="card" style="margin-top:12px"><h3>${escapeHtml(group.displayName)} <span class="muted">(${rules.length})</span></h3><div class="skuList">${rules.map((rule) => `<span class="sku">${escapeHtml(rule.productModelCode)}</span>`).join("")}</div></div>`;
    })
    .join("");
}

function renderQuestRule(rule) {
  const thresholds = badgeThresholds
    .filter((threshold) => threshold.ruleCode === rule.code)
    .sort((left, right) => left.requiredCount - right.requiredCount);
  const conditions = badgeConditions.filter((condition) => condition.ruleCode === rule.code);

  return `<article class="card quest"><h3>${escapeHtml(rule.name)}</h3><p>${escapeHtml(rule.description)}</p><div class="pillRow">${thresholds.map((threshold) => `<span class="pill ok">${escapeHtml(threshold.displayName)}: ${threshold.requiredCount}</span>`).join("")}</div>${conditions.map((condition) => `<div class="condition"><strong>${escapeHtml(conditionSummary(condition))}</strong><p class="muted">${escapeHtml(condition.label)}</p><div class="skuList">${condition.sonySkus.map((sku) => `<span class="sku">${escapeHtml(sku)}</span>`).join("")}</div></div>`).join("")}</article>`;
}

function conditionSummary(condition) {
  if (condition.matchType === "all") {
    return `ต้องมีครบทุกรุ่น / Own all ${condition.sonySkus.length} models`;
  }

  if (condition.matchType === "min_count") {
    return `มีอย่างน้อย ${condition.requiredCount} รุ่น / Own any ${condition.requiredCount} eligible models`;
  }

  return `มีอย่างน้อย ${condition.requiredCount} รุ่นจากกลุ่มนี้ / Own at least ${condition.requiredCount} from this group`;
}

function renderMockExamples() {
  const examples = [
    ["Single Product Badge", ["SEL2470GM2"]],
    ["Duplicate serials: one badge, Quantity 2", ["SEL2470GM2", "SEL2470GM2"]],
    ["Portrait Master Bronze", ["SEL35F14GM", "SEL50F14GM"]],
    ["Portrait Master Gold", ["SEL35F14GM", "SEL50F14GM", "SEL85F14GM2", "SEL135F18GM"]],
    ["Trinity Master", ["SEL1635GM2", "SEL2470GM2", "SEL70200GM2"]],
    ["Trinity Junior", ["SEL2450G", "SEL1625G", "SEL70200G2"]],
    ["All Rounder", ["SEL2070G", "SELP1635G", "SEL70200G"]],
    ["F2 Master", ["SEL2870GM", "SEL50150GM"]],
    ["The Magnifier", ["SEL90M28G"]],
  ];

  return `<div class="tableWrap" style="margin-top:16px"><table><thead><tr><th>Scenario</th><th>Mock URL</th></tr></thead><tbody>${examples.map(([label, skus]) => {
    const url = `http://localhost:3000/th/badges?mock=1&sku=${skus.join(",")}`;
    return `<tr><td>${escapeHtml(label)}</td><td><a href="${escapeHtml(url)}"><code>${escapeHtml(url)}</code></a></td></tr>`;
  }).join("")}</tbody></table></div>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const generatedHtml = renderBadgeRulesGuide();

if (process.argv.includes("--check")) {
  const currentHtml = await readFile(outputUrl, "utf8").catch(() => "");

  if (currentHtml !== generatedHtml) {
    throw new Error("Generated badge guide is stale. Run npm run docs:badge-rules.");
  }

  console.log("Verified generated badge rules guide is current.");
} else {
  await writeFile(outputUrl, generatedHtml, "utf8");
  console.log(`Generated ${outputUrl.pathname}.`);
}
