import Apps from "gi://AstalApps";
import { App, Astal, Gdk, Gtk, hook } from "astal/gtk4";
import { Variable } from "astal";

const MAX_ITEMS = 8;

function hide() {
  App.get_window("launcher")!.hide();
}

function AppButton({ app }: { app: Apps.Application }) {
  return (
    <button
      cssClasses={["AppButton"]}
      onClicked={() => {
        hide();
        app.launch();
      }}
    >
      <box>
        <image iconName={app.iconName} />
        <box valign={Gtk.Align.CENTER} vertical>
          <label cssClasses={["name"]} truncate xalign={0} label={app.name} />
          {app.description && (
            <label
              cssClasses={["description"]}
              wrap
              xalign={0}
              label={app.description}
            />
          )}
        </box>
      </box>
    </button>
  );
}

export default function Applauncher() {
  const { CENTER } = Gtk.Align;
  const apps = new Apps.Apps();
  const width = Variable(1000);

  const text = Variable("");
  const visible = Variable(false);
  const list = text((text) => apps.fuzzy_query(text).slice(0, MAX_ITEMS));
  const onEnter = () => {
    apps.fuzzy_query(text.get())?.[0].launch();
    hide();
  };

  return (
    <window
      name="launcher"
      visible={visible()}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      keymode={Astal.Keymode.ON_DEMAND}
      application={App}
      onShow={(self) => {
        width.set(self.get_current_monitor().geometry.width);
      }}
      onKeyPressed={(self, keyval) => {
        if (keyval === Gdk.KEY_Escape) self.hide();
      }}
    >
      <box>
        <button widthRequest={width((w) => w / 2)} expand onClicked={hide} />
        <box hexpand={false} vertical valign={Gtk.Align.CENTER}>
          <button onClicked={hide} />
          <box widthRequest={500} cssClasses={["applauncher"]} vertical>
            <box cssClasses={["search"]}>
              <image iconName="system-search-symbolic" />
              <entry
                placeholderText="Search..."
                text={text.get()}
                setup={(self) => {
                  hook(self, App, "window-toggled", (_, win) => {
                    const winName = win.name;

                    if (winName == "launcher") {
                      self.set_text("");
                      self.grab_focus();
                    }
                  });
                }}
                onNotifyText={(self) => text.set(self.text)}
                primary-icon-sensitive={true}
                onActivate={onEnter}
                hexpand={true}
              />
            </box>
            <box
              spacing={6}
              vertical
              cssClasses={["apps"]}
              visible={list.as((l) => l.length > 0)}
            >
              {list.as((list) => list.map((app) => <AppButton app={app} />))}
            </box>
            <box
              halign={CENTER}
              cssClasses={["not-found"]}
              vertical
              visible={list.as((l) => l.length === 0)}
            >
              <image iconName="system-search-symbolic" />
              <label label="No match found" />
            </box>
          </box>
          <button expand onClicked={hide} />
        </box>
        <button widthRequest={width((w) => w / 2)} expand onClicked={hide} />
      </box>
    </window>
  );
}
