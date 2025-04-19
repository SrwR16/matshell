import { Gtk } from "astal/gtk4";
import Tray from "gi://AstalTray";
import { bind } from "astal";

const tray = Tray.get_default();

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

export const hasTrayItems = bind(tray, "items").as((items) => items.length > 0);

export function SysTray() {
  return (
    <box cssClasses={["SysTray", "module"]}>
      {bind(tray, "items").as((items) =>
        items.map((item) => <SysTrayItem item={item} />),
      )}
    </box>
  );
}
