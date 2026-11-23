import Link from "next/link";
import Art, { type Scene } from "./Art";

/** Photo card with the title set over a dark fade, linking to a page. */
export default function ImageTile({ href, img, scene, hue, title, sub, ratio = "4 / 3", className = "" }: { href: string; img?: string; scene?: Scene; hue?: number; title: string; sub?: string; ratio?: string; className?: string }) {
  return (
    <Link href={href} className={`tile ${className}`} style={{ aspectRatio: ratio }}>
      {scene ? <Art scene={scene} hue={hue} /> : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="" loading="lazy" />
      )}
      <div className="tile-label">
        <span className="display">{title}</span>
        {sub && <small>{sub}</small>}
      </div>
    </Link>
  );
}
