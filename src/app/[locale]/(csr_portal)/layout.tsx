import { LineSessionProvider } from "@/components/LineSessionProvider";
import { inter, openSans, poppins, sst } from "@/lib/fonts";
import "./portal-layout.css";

const CSRPortalLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <LineSessionProvider liffId={process.env.NEXT_PUBLIC_CSR_PORTAL_LIFF_ID}>
      <div
        className={`portalLayout ${inter.variable} ${openSans.variable} ${poppins.variable} ${sst.variable}`}
      >
        {children}
      </div>
    </LineSessionProvider>
  );
};

export default CSRPortalLayout;
