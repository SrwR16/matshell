import { Gtk } from "astal/gtk4";

export function Section({ title, children }) {
  return (
    <box vertical>
      <label label={title} halign={Gtk.Align.CENTER} cssClasses={["section-label"]} />
      <Gtk.Separator />
      {children}
    </box>
  );
}
