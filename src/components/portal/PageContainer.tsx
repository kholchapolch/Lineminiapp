import "./page-container.css";

const PortalPageContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="portalPage__container">{children}</div>;
};

export default PortalPageContainer;
