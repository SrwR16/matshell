import { App, Gtk } from "astal/gtk4";
import { bind, Variable } from "astal";

export function CategoryButton({
  title,
  icon = null,
  expanded = Variable(false),
  onToggle = () => {},
  children,
}) {
  return (
    <box vertical>
      <button onClicked={onToggle} cssClasses={["category-button"]}>
        <box hexpand={true}>
          {icon && <image iconName={icon} />}
          <label label={title} halign={Gtk.Align.START} hexpand={true} />
          <image
            iconName="pan-end-symbolic"
            cssClasses={bind(expanded).as((e) =>
              e ? ["arrow-indicator", "arrow-down"] : ["arrow-indicator"],
            )}
          />
        </box>
      </button>

      <revealer
        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
        transitionDuration={300}
        revealChild={bind(expanded)}
        setup={() => {
          const windowListener = App.connect("window-toggled", (_, window) => {
            window.name === "control-panel" &&
              expanded.get() &&
              expanded.set(false);
          });
          bind(expanded).subscribe((expanded) => {
            if (!expanded) {
              // Super cheap fix until the revealer bug is fixed:
              // https://github.com/Aylur/astal/issues/258

              // As this is one unified revealer button, collapsing any of these
              // will close the entire window and collapse all other revealers.

              // This is not very user friendly at the moment, but I prefer this
              // over the the mess that results from the revealer not retracting.
              App.toggle_window("control-panel");
              App.toggle_window("control-panel");
            }
          });

          return () => {
            // Clean up the listener when component is destroyed
            App.disconnect(windowListener);
            bind(expanded).unsubscribe();
          };
        }}
      >
        <box cssClasses={["category-content"]} vertical>
          {children}
        </box>
      </revealer>
    </box>
  );
}
