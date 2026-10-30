import { LineSessionProvider } from "@/components/LineSessionProvider";
import { PortalDataLayerDebug } from "@/components/portal/PortalDataLayerDebug";
import { resolvePortalLiffId } from "@/lib/cs-portal/portal-liff-id";
import { inter, openSans, poppins, sst } from "@/lib/fonts";
import "./portal-layout.css";

const CSRPortalLayout = async ({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> => {
  const liffId = await resolvePortalLiffId();

  return (
    <LineSessionProvider liffId={liffId}>
      <div
        className={`portalLayout ${inter.variable} ${openSans.variable} ${poppins.variable} ${sst.variable}`}
      >
        {children}
        <PortalDataLayerDebug />
      </div>
    </LineSessionProvider>
  );
};

export default CSRPortalLayout;
