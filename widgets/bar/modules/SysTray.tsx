import { Astal, Gdk, Gtk } from "astal/gtk4";
import Tray from "gi://AstalTray";
import { bind } from "astal";

function SysTrayItem({ item }) {
  return (
    <menubutton
      cssClasses={["tray-item"]}
      menuModel={bind(item, "menuModel")}
      actionGroup={bind(item, "actionGroup").as((ag) => ["dbusmenu", ag])}
      usePopover={false}
      tooltipMarkup={bind(item, "tooltipMarkup")}
      setup={(self) => {
        self.insert_action_group("dbusmenu", item.actionGroup);
      }}
    >
      <image gicon={bind(item, "gicon")} />
      {Gtk.PopoverMenu.new_from_model(item.menuModel)}
    </menubutton>
  );
}

export default function SysTray() {
  const tray = Tray.get_default();

  return (
    <box cssClasses={["tray", "module"]}>
      {bind(tray, "items").as((items) =>
        items.map((item) => <SysTrayItem item={item} />),
      )}
    </box>
  );
}
