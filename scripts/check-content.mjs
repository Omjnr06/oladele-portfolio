import { existsSync } from "node:fs";
import { join } from "node:path";
import { profile } from "../src/content/profile.js";
import { gallery } from "../src/content/gallery.js";
import { contact } from "../src/content/contact.js";
import { projects } from "../src/content/projects.js";
import { skills, experience, resumeProjects, education } from "../src/content/resume.js";
import { caseStudies } from "../src/content/caseStudies/index.js";
import { searchAliases } from "../src/content/searchAliases.js";

const BLOCK_TYPES = ["heading", "text", "tags", "points", "schema", "video", "screens", "compare", "image", "figure", "flow", "note", "link", "resources", "themeDemo"];
const ICONS = ["email", "linkedin", "github", "devpost", "instagram", "x"];
const SHOWCASES = ["vault-safe-to-spend"];
const COLOR = /^(accent|accent-2|ok|warn|err|muted|fg|#[0-9a-fA-F]{6})$/;
const ID = /^[a-z0-9][a-z0-9-]*$/;

const errors = [];
const fail = (path, msg) => errors.push(`${path} ${msg}`);

const str = (v, path, { optional = false } = {}) => {
  if (v === undefined && optional) return;
  if (typeof v !== "string" || !v.trim()) fail(path, "must be a non-empty string");
};
const list = (v, path, { min = 1 } = {}) => {
  if (!Array.isArray(v)) return fail(path, "must be a list"), false;
  if (v.length < min) fail(path, `needs at least ${min} item${min === 1 ? "" : "s"}`);
  return true;
};
const strings = (v, path) => list(v, path) && v.forEach((s, i) => str(s, `${path}[${i}]`));
const color = (v, path) => {
  if (typeof v !== "string" || !COLOR.test(v)) fail(path, `must be a colour token (accent, accent-2, ok, warn, err) or a #rrggbb hex, got ${JSON.stringify(v)}`);
};
const asset = (v, path) => {
  str(v, path);
  if (typeof v === "string" && v.startsWith("/") && !existsSync(join("public", v.split(/[?#]/)[0]))) fail(path, `points to ${v}, which is not in /public`);
};
const href = (v, path) => {
  str(v, path);
  if (typeof v === "string" && !/^(https?:|mailto:|\/)/.test(v)) fail(path, `must start with https://, mailto: or /, got ${JSON.stringify(v)}`);
  if (typeof v === "string" && v.startsWith("/assets/")) asset(v, path);
};
const uniqueIds = (items, path) => {
  const seen = new Set();
  items.forEach((it, i) => {
    if (typeof it?.id !== "string" || !ID.test(it.id)) fail(`${path}[${i}].id`, "must be lowercase-with-dashes (it's used for links and Ask Junior citations)");
    else if (seen.has(it.id)) fail(`${path}[${i}].id`, `"${it.id}" is used twice`);
    seen.add(it.id);
  });
};

str(profile.firstName, "profile.firstName");
str(profile.lastName, "profile.lastName");
str(profile.title, "profile.title");
str(profile.status, "profile.status");
str(profile.now, "profile.now", { optional: true });
str(profile.course, "profile.course", { optional: true });
if (profile.marginNotes !== undefined) {
  if (typeof profile.marginNotes !== "object" || profile.marginNotes === null) fail("profile.marginNotes", "must be an object like { home: \"...\" }");
  else Object.entries(profile.marginNotes).forEach(([k, v]) => str(v, `profile.marginNotes.${k}`));
}
list(profile.intro, "profile.intro") && profile.intro.forEach((p, i) => str(p.text, `profile.intro[${i}].text`));
asset(profile.resumePdf?.href, "profile.resumePdf.href");

list(gallery, "gallery") && uniqueIds(gallery, "gallery");
gallery.forEach((g, i) => asset(g.src, `gallery[${i}].src`));

list(contact, "contact") && uniqueIds(contact, "contact");
contact.forEach((c, i) => {
  str(c.label, `contact[${i}].label`);
  href(c.href, `contact[${i}].href`);
  if (!ICONS.includes(c.icon)) fail(`contact[${i}].icon`, `must be one of ${ICONS.join(", ")}`);
});

const caseSlugs = new Set(caseStudies.map((c) => c.slug));
const projectIds = new Set(projects.map((p) => p.id));

list(projects, "projects") && uniqueIds(projects, "projects");
projects.forEach((p, i) => {
  if (p.highlight !== undefined) str(p.tagline, `projects[${i}].tagline`);
  const at = `projects[${i}]`;
  str(p.code, `${at}.code`);
  str(p.title, `${at}.title`);
  strings(p.categories, `${at}.categories`);
  strings(p.stack, `${at}.stack`);
  str(p.summary, `${at}.summary`);
  if (p.caseStudy !== undefined && !caseSlugs.has(p.caseStudy)) fail(`${at}.caseStudy`, `"${p.caseStudy}" has no matching case study in src/content/caseStudies`);
  if (typeof p.links !== "object" || p.links === null) fail(`${at}.links`, "must be an object (use {} if there are none)");
  else Object.entries(p.links).forEach(([k, v]) => href(v, `${at}.links.${k}`));
  if (!p.media || (!p.media.image && !p.media.video)) fail(`${at}.media`, "needs an image or a video");
  else {
    if (p.media.image) asset(p.media.image, `${at}.media.image`);
    if (p.media.video) asset(p.media.video, `${at}.media.video`);
    if (p.media.poster !== undefined) asset(p.media.poster, `${at}.media.poster`);
    if (p.media.loop !== undefined) {
      asset(p.media.loop, `${at}.media.loop`);
      if (!p.media.video) fail(`${at}.media.loop`, "needs a video to loop from");
    }
    if (p.media.fit && !["cover", "contain"].includes(p.media.fit)) fail(`${at}.media.fit`, 'must be "cover" or "contain"');
    if (p.media.orientation && p.media.orientation !== "portrait") fail(`${at}.media.orientation`, 'can only be "portrait" (leave it out for landscape)');
  }
  if (p.featured !== undefined && !(Number.isInteger(p.featured) && p.featured > 0)) fail(`${at}.featured`, "must be a positive whole number (1 shows first)");
});

uniqueIds(skills, "skills");
skills.forEach((s, i) => {
  str(s.category, `skills[${i}].category`);
  strings(s.items, `skills[${i}].items`);
});

for (const [name, items] of [["experience", experience], ["resumeProjects", resumeProjects], ["education", education]]) {
  list(items, name) && uniqueIds(items, name);
}
experience.forEach((e, i) => {
  for (const k of ["role", "company", "date", "location"]) str(e[k], `experience[${i}].${k}`);
  if (e.highlight !== undefined) str(e.summary, `experience[${i}].summary`);
  if (e.logo !== undefined) asset(e.logo, `experience[${i}].logo`);
  strings(e.points, `experience[${i}].points`);
  if (e.project !== undefined && !projectIds.has(e.project)) fail(`experience[${i}].project`, `"${e.project}" is not a project id`);
});
resumeProjects.forEach((p, i) => {
  for (const k of ["title", "stack", "date"]) str(p[k], `resumeProjects[${i}].${k}`);
  strings(p.points, `resumeProjects[${i}].points`);
  if (p.project !== undefined && !projectIds.has(p.project)) fail(`resumeProjects[${i}].project`, `"${p.project}" is not a project id`);
});
education.forEach((e, i) => {
  for (const k of ["degree", "school", "date", "details"]) str(e[k], `education[${i}].${k}`);
});

function block(b, at) {
  if (!BLOCK_TYPES.includes(b?.type)) return fail(`${at}.type`, `must be one of ${BLOCK_TYPES.join(", ")}, got ${JSON.stringify(b?.type)}`);
  switch (b.type) {
    case "heading":
      str(b.text, `${at}.text`);
      color(b.color, `${at}.color`);
      break;
    case "text":
      str(b.body, `${at}.body`);
      if (b.variant !== undefined && !["lead", "light"].includes(b.variant)) fail(`${at}.variant`, 'must be "lead" or "light" (or left out)');
      break;
    case "tags":
      strings(b.items, `${at}.items`);
      break;
    case "points":
      if (!["accent", "neutral", "warn"].includes(b.tone)) fail(`${at}.tone`, 'must be "accent", "neutral" or "warn"');
      list(b.items, `${at}.items`) && b.items.forEach((it, j) => {
        str(it.title, `${at}.items[${j}].title`);
        str(it.body, `${at}.items[${j}].body`);
      });
      break;
    case "schema":
      list(b.groups, `${at}.groups`) && b.groups.forEach((g, j) => {
        str(g.name, `${at}.groups[${j}].name`);
        str(g.note, `${at}.groups[${j}].note`, { optional: true });
        list(g.tables, `${at}.groups[${j}].tables`) && g.tables.forEach((t, k) => {
          str(t.name, `${at}.groups[${j}].tables[${k}].name`);
          list(t.cols, `${at}.groups[${j}].tables[${k}].cols`) && t.cols.forEach((c, m) => {
            if (!Array.isArray(c) || c.length !== 2) fail(`${at}.groups[${j}].tables[${k}].cols[${m}]`, 'must be ["column", "type"]');
          });
        });
      });
      break;
    case "video":
      asset(b.src, `${at}.src`);
      str(b.caption, `${at}.caption`);
      break;
    case "screens":
    case "compare":
      list(b.items, `${at}.items`) && b.items.forEach((it, j) => {
        asset(it.src, `${at}.items[${j}].src`);
        str(it.label, `${at}.items[${j}].label`);
      });
      break;
    case "image":
    case "figure":
      asset(b.src, `${at}.src`);
      str(b.alt, `${at}.alt`);
      if (b.size !== undefined && b.size !== "sm") fail(`${at}.size`, 'can only be "sm" (leave it out for full width)');
      break;
    case "flow":
      list(b.steps, `${at}.steps`, { min: 2 }) && b.steps.forEach((s, j) => {
        str(s.label, `${at}.steps[${j}].label`);
        color(s.color, `${at}.steps[${j}].color`);
      });
      if (Array.isArray(b.steps) && b.steps.length > 5) fail(`${at}.steps`, "can have at most 5 steps");
      break;
    case "note":
      str(b.body, `${at}.body`);
      break;
    case "link":
      str(b.label, `${at}.label`);
      href(b.href, `${at}.href`);
      break;
    case "resources":
      list(b.items, `${at}.items`) && b.items.forEach((it, j) => {
        str(it.label, `${at}.items[${j}].label`);
        if (it.href) href(it.href, `${at}.items[${j}].href`);
        else str(it.value, `${at}.items[${j}].value`);
      });
      break;
    case "themeDemo":
      if (!b.themes || typeof b.themes !== "object" || !Object.keys(b.themes).length) fail(`${at}.themes`, "needs at least one theme");
      break;
  }
}

caseStudies.forEach((c, i) => {
  const at = `caseStudies.${c?.slug ?? i}`;
  if (!ID.test(c.slug ?? "")) fail(`${at}.slug`, "must be lowercase-with-dashes");
  if (c.id !== c.slug) fail(`${at}.id`, "must match the slug");
  if (!existsSync(join("src/app/projects", c.slug, "page.js"))) fail(`${at}.slug`, `needs a page at src/app/projects/${c.slug}/page.js (copy an existing one and change the slug)`);
  if (c.project !== undefined && !projectIds.has(c.project)) fail(`${at}.project`, `"${c.project}" is not a project id`);
  for (const k of ["title", "kicker", "summary"]) str(c[k], `${at}.${k}`);
  if (c.marginNote !== undefined) str(c.marginNote, `${at}.marginNote`);
  str(c.badge?.label, `${at}.badge.label`);
  color(c.badge?.color, `${at}.badge.color`);
  if (c.showcase !== undefined && !SHOWCASES.includes(c.showcase)) fail(`${at}.showcase`, `must be one of ${SHOWCASES.join(", ")}`);
  c.actions?.forEach((a, j) => {
    str(a.label, `${at}.actions[${j}].label`);
    href(a.href, `${at}.actions[${j}].href`);
  });
  str(c.modern?.file, `${at}.modern.file`);
  str(c.modern?.prompt, `${at}.modern.prompt`);
  list(c.sections, `${at}.sections`) && uniqueIds(c.sections, `${at}.sections`);
  c.sections?.forEach((s, j) => {
    str(s.label, `${at}.sections[${j}].label`);
    list(s.blocks, `${at}.sections[${j}].blocks`) && s.blocks.forEach((b, k) => block(b, `${at}.sections[${j}].blocks[${k}]`));
  });
});

for (const [name, items] of [["projects", projects], ["experience", experience]]) {
  const marks = items.filter((x) => x.highlight !== undefined);
  marks.forEach((x) => {
    if (!Number.isInteger(x.highlight) || x.highlight < 1 || x.highlight > 3) fail(`${name}.${x.id}.highlight`, "must be 1, 2 or 3 (its position on the home page)");
  });
  const seen = new Set();
  marks.forEach((x) => {
    if (seen.has(x.highlight)) fail(`${name}.${x.id}.highlight`, `${x.highlight} is used twice; each position can only hold one`);
    seen.add(x.highlight);
  });
}
str(profile.openTo, "profile.openTo");
strings(profile.locations, "profile.locations");
if (profile.musicRole !== undefined && !experience.some((e) => e.id === profile.musicRole)) fail("profile.musicRole", `"${profile.musicRole}" is not an id in resume.js experience`);

uniqueIds(searchAliases, "searchAliases");
const aliasSeen = new Map();
searchAliases.forEach((g, i) => {
  const at = `searchAliases[${i}]`;
  if (list(g.words, `${at}.words`, { min: 2 })) {
    g.words.forEach((w, j) => {
      if (typeof w !== "string" || w !== w.toLowerCase() || !w.trim()) return fail(`${at}.words[${j}]`, "must be a lowercase word or phrase");
      if (aliasSeen.has(w)) fail(`${at}.words[${j}]`, `"${w}" is already in ${aliasSeen.get(w)} (a word can only be in one group)`);
      aliasSeen.set(w, g.id);
    });
  }
});

if (errors.length) {
  console.error(`\ncheck-content found ${errors.length} problem${errors.length === 1 ? "" : "s"} in src/content:\n`);
  errors.forEach((e) => console.error(`  - ${e}`));
  console.error("\nSee src/content/README.md for the shape of each file.\n");
  process.exit(1);
}
console.log(`check-content: OK (${projects.length} projects, ${caseStudies.length} case studies, ${gallery.length} photos, ${experience.length} roles)`);
