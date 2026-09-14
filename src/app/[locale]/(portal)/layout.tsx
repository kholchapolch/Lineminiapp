const PortalLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-white">
      {children}
    </div>
  );
};

export default PortalLayout;
