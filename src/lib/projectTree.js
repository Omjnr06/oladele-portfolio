const GROUPS = [
  { dir: "case-studies", label: "case studies", has: (p) => Boolean(p.caseStudy) },
  { dir: "side-projects", label: "side projects", has: (p) => !p.caseStudy && !p.hackathon },
  { dir: "hackathons", label: "hackathons", has: (p) => !p.caseStudy && Boolean(p.hackathon) },
];

export const groupProjects = (projects) => GROUPS.map(({ dir, label, has }) => ({ dir, label, items: projects.filter(has) })).filter((g) => g.items.length);

export const shortName = (p) => {
  const parts = p.id.split("-");
  return parts[0] === "the" ? parts[1] : parts[0];
};

export function buildBst(projects) {
  let root = null;
  const insert = (node, p, depth) => {
    if (!node) return { p, key: p.id, left: null, right: null, depth };
    if (p.id < node.key) node.left = insert(node.left, p, depth + 1);
    else node.right = insert(node.right, p, depth + 1);
    return node;
  };
  for (const p of projects) root = insert(root, p, 0);
  const nodes = [];
  const edges = [];
  let order = 0;
  const walk = (node, parent) => {
    if (!node) return;
    walk(node.left, node);
    nodes.push({ id: node.key, p: node.p, x: order++, depth: node.depth });
    walk(node.right, node);
    if (parent) edges.push([parent.key, node.key]);
  };
  walk(root, null);
  return { root, nodes, edges, depth: Math.max(0, ...nodes.map((n) => n.depth)) };
}

export function searchPath(root, key) {
  const path = [];
  for (let n = root; n; n = key < n.key ? n.left : n.right) {
    path.push(n.key);
    if (n.key === key) break;
  }
  return path;
}
