import Link from "next/link";
import PageHead from "@/components/PageHead";

export default function NotFound() {
  return (
    <>
      <PageHead scene="moon" title="Page not found" sub="This page doesn't exist or has moved." />
      <Link href="/" className="btn">Go home</Link>
    </>
  );
}
