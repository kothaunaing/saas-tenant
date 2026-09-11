import Workspace from "@/tenant/components/workspace";
export function generateStaticParams() {
  return [
    "calendar",
    "appointments",
    "customers",
    "services",
    "staff",
    "loyalty",
    "analytics",
    "billing",
    "settings",
    "support",
  ].map((section) => ({ section }));
}
export const dynamicParams = false;
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return (
    <Workspace
      initialPage={section.charAt(0).toUpperCase() + section.slice(1)}
    />
  );
}
