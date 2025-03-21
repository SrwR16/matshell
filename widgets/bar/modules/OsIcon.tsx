import { App } from "astal/gtk3";
export default function OsIcon() {
  return (
    <eventbox onClick={() => App.toggle_window("launcher")}>
        <icon icon="nix-symbolic" className="OsIcon" />;
    </eventbox>
  );
}
