import { App } from "astal/gtk4";
export default function OsIcon() {
  return (
    <button onClicked={
      () => App.toggle_window("launcher")
    }>
        <image iconName="nix-symbolic" cssClasses={["OsIcon"]} />
    </button>
  );
}
