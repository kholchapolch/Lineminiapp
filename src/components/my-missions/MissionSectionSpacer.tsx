export function MissionSectionSpacer(): JSX.Element {
  return (
    <div className="missionSectionSpacer" aria-hidden="true">
      <div className="missionSection__edge missionSection__edge--top" />
      <div className="missionSectionSpacer__gap" />
      <div className="missionSection__edge missionSection__edge--bottom" />
    </div>
  );
}
