import { Mail, MapPin, Phone } from "lucide-react";
import PageHead from "@/components/PageHead";

const ROWS = [
  { Icon: Phone, label: "Phone", value: "+91 99466 66139", href: "tel:+919946666139" },
  { Icon: Mail, label: "Email", value: "mail@d4dx.co", href: "mailto:mail@d4dx.co" },
  { Icon: MapPin, label: "Address", value: "D4DX Innovations LLP, AMH Tower, First Floor, 63/3965 B, Mavoor Rd, Thiruthiyad, Kozhikode 673004" },
];

export default function Contact() {
  return (
    <>
      <PageHead scene="lantern" title="Contact us" sub="We'd love to hear from you." />
      <div style={{ display: "grid", gap: 14, maxWidth: 640 }}>
        {ROWS.map(({ Icon, label, value, href }) => {
          const body = (
            <>
              <Icon size={22} color="var(--gold)" strokeWidth={1.6} style={{ flexShrink: 0 }} />
              <div><div className="muted" style={{ fontSize: ".8rem" }}>{label}</div><div style={{ fontSize: "1.05rem" }}>{value}</div></div>
            </>
          );
          const style = { display: "flex", gap: 18, alignItems: "center" } as const;
          return href ? <a key={label} href={href} className="card" style={style}>{body}</a> : <div key={label} className="card" style={style}>{body}</div>;
        })}
      </div>
    </>
  );
}
