import "./portal-box.css";
const PortalBox = ({ children }: { children: React.ReactNode }) => {
  return <div className="portalBox">{children}</div>;
};

export default PortalBox;
