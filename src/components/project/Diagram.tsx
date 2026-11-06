import type { Diagram as DiagramData } from "@/content/projects";
import styles from "./Diagram.module.css";

/**
 * Data-driven conceptual diagram as inline SVG: theme-aware (CSS variables), crisp at
 * any size, and exposed as a single described image for assistive tech. It illustrates
 * the stack the owner stated for a project; it is never presented as a screenshot.
 */
export function Diagram({ diagram, title }: { diagram: DiagramData; title: string }) {
  const { nodes, edges, boundary } = diagram;
  const cols = Math.max(...nodes.map((n) => n.col)) + 1;
  const rows = Math.max(...nodes.map((n) => n.row ?? 0)) + 1;
  const longest = Math.max(...nodes.map((n) => Math.max(n.label.length * 9, (n.sub?.length ?? 0) * 7.6)));
  const W = Math.min(290, Math.max(170, Math.round(longest + 44)));
  const H = 76;
  const GX = 100;
  const GY = 62;
  const PAD = 30;
  const TOP = boundary ? 30 : 0;
  const width = PAD * 2 + cols * W + (cols - 1) * GX;
  const height = PAD * 2 + rows * H + (rows - 1) * GY + TOP;

  const at = new Map(
    nodes.map((n) => [n.id, { n, x: PAD + n.col * (W + GX), y: PAD + TOP + (n.row ?? 0) * (H + GY) }]),
  );
  const label = (id: string) => nodes.find((n) => n.id === id)?.label ?? id;
  const flow = edges.map((e) => `${label(e.from)} ${e.both ? "and" : "to"} ${label(e.to)}`).join("; ");

  const paths = edges.flatMap((e, i) => {
    const a = at.get(e.from);
    const b = at.get(e.to);
    if (!a || !b) return [];
    const sameRow = (a.n.row ?? 0) === (b.n.row ?? 0);
    const sameCol = a.n.col === b.n.col;
    let d: string;
    let lx: number;
    let ly: number;
    if (sameRow) {
      const dir = b.x > a.x ? 1 : -1;
      const x1 = a.x + (dir > 0 ? W : 0);
      const x2 = b.x + (dir > 0 ? 0 : W);
      const y = a.y + H / 2;
      d = `M${x1} ${y}H${x2}`;
      lx = (x1 + x2) / 2;
      ly = y - 10;
    } else if (sameCol) {
      const dir = b.y > a.y ? 1 : -1;
      const y1 = a.y + (dir > 0 ? H : 0);
      const y2 = b.y + (dir > 0 ? 0 : H);
      const x = a.x + W / 2;
      d = `M${x} ${y1}V${y2}`;
      lx = x + 10;
      ly = (y1 + y2) / 2 + 4;
    } else {
      const right = b.x > a.x;
      const x1 = a.x + (right ? W : 0);
      const x2 = b.x + (right ? 0 : W);
      const y1 = a.y + H / 2;
      const y2 = b.y + H / 2;
      const xm = (x1 + x2) / 2;
      d = `M${x1} ${y1}H${xm}V${y2}H${x2}`;
      lx = xm;
      ly = Math.min(y1, y2) - 10;
    }
    return [{ key: `${e.from}-${e.to}-${i}`, d, lx, ly, e }];
  });

  let box: { x: number; y: number; w: number; h: number } | null = null;
  if (boundary) {
    const pts = boundary.ids.map((id) => at.get(id)).filter((v): v is NonNullable<typeof v> => Boolean(v));
    if (pts.length) {
      const x1 = Math.min(...pts.map((p) => p.x)) - 14;
      const y1 = Math.min(...pts.map((p) => p.y)) - 14;
      const x2 = Math.max(...pts.map((p) => p.x + W)) + 14;
      const y2 = Math.max(...pts.map((p) => p.y + H)) + 14;
      box = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
    }
  }

  const uid = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-labelledby={`${uid}-t ${uid}-d`}
    >
      <title id={`${uid}-t`}>{`${title}: ${diagram.caption}`}</title>
      <desc id={`${uid}-d`}>{flow}</desc>
      <defs>
        <marker id={`${uid}-a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" className={styles.head} />
        </marker>
      </defs>

      {box ? (
        <g>
          <rect className={styles.boundary} x={box.x} y={box.y} width={box.w} height={box.h} rx="14" />
          <text className={styles.boundaryLabel} x={box.x + 14} y={box.y - 9}>
            {boundary?.label}
          </text>
        </g>
      ) : null}

      {paths.map(({ key, d, lx, ly, e }) => (
        <g key={key}>
          <path
            className={styles.edge}
            d={d}
            markerEnd={`url(#${uid}-a)`}
            markerStart={e.both ? `url(#${uid}-a)` : undefined}
          />
          {e.label ? (
            <text className={styles.edgeLabel} x={lx} y={ly} textAnchor="middle">
              {e.label}
            </text>
          ) : null}
        </g>
      ))}

      {[...at.values()].map(({ n, x, y }) => (
        <g key={n.id} className={styles.node} data-kind={n.kind ?? "service"}>
          <rect x={x} y={y} width={W} height={H} rx="10" />
          <rect className={styles.tick} x={x} y={y + 18} width="4" height={H - 36} />
          <text className={styles.label} x={x + 22} y={y + (n.sub ? 33 : 44)}>
            {n.label}
          </text>
          {n.sub ? (
            <text className={styles.sub} x={x + 22} y={y + 54}>
              {n.sub}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}
