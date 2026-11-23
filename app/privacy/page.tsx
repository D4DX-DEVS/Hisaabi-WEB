import { ExternalLink } from "lucide-react";
import PageHead from "@/components/PageHead";

// The privacy policy is published by D4DX, the same page the mobile app opens.
const URL = "https://d4dx.co/privacy-policy/";

export default function Privacy() {
  return (
    <>
      <PageHead scene="arch" title="Privacy" sub="How Hisaabi handles your information." />
      <div className="card" style={{ maxWidth: 640, display: "grid", gap: 14 }}>
        <p>The full privacy policy is published by D4DX and applies to both the Hisaabi app and this website.</p>
        <p className="muted">On this website, your settings, saved items, tasbeeh count and reading position are stored in your browser. When you sign in, your saved items and prayer settings are also kept in your Hisaabi account.</p>
        <a className="btn" href={URL} target="_blank" rel="noopener noreferrer" style={{ justifySelf: "start" }}>Read the privacy policy <ExternalLink size={16} /></a>
      </div>
    </>
  );
}
