import { getLocalBusinessSchema, getWebsiteSchema } from "@/lib/structured-data";

export function StructuredData() {
  // These schemas contain only static, trusted data defined by developers
  const businessSchema = JSON.stringify(getLocalBusinessSchema());
  const websiteSchema = JSON.stringify(getWebsiteSchema());

  return (
    <>
      <script type="application/ld+json">{businessSchema}</script>
      <script type="application/ld+json">{websiteSchema}</script>
    </>
  );
}
