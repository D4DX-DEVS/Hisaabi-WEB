import Link from "next/link";
import { motion } from "framer-motion";
import Art, { type Scene } from "./Art";

/** Photo card with the title set over a dark fade, linking to a page. */
const MotionLink = motion.create(Link);

export default function ImageTile({ href, img, scene, hue, title, sub, ratio = "4 / 3", className = "", enterDelay }: { href: string; img?: string; scene?: Scene; hue?: number; title: string; sub?: string; ratio?: string; className?: string; enterDelay?: number }) {
  return (
    <MotionLink href={href} className={`tile ${className}`} style={{ aspectRatio: ratio }} initial={enterDelay === undefined ? false : { opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: enterDelay ?? 0, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
      {scene ? <Art scene={scene} hue={hue} /> : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="" loading="lazy" />
      )}
      <div className="tile-label">
        <span className="display">{title}</span>
        {sub && <small>{sub}</small>}
      </div>
    </MotionLink>
  );
}
