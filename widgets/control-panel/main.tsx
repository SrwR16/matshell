import { Astal, App, Gtk } from "astal/gtk4";
import { Variable, bind } from "astal";

import { OptionToggle } from "./modules/OptionToggle.tsx";
import { OptionSelect } from "./modules/OptionSelect.tsx";
import { Section } from "./modules/Section.tsx";
import { CategoryButton } from "./modules/CategoryButton.tsx";

import options from "options.ts";

export default function ControlPanel() {
  const { TOP, BOTTOM, LEFT } = Astal.WindowAnchor;

  const visible = Variable(false);
  const matshellSettingsExpanded = Variable(false);
  const barExpanded = Variable(false);
  const cavaExpanded = Variable(false);
  const systemMenuExpanded = Variable(false);

  const cavaStyleOptions = [
    "catmull_rom",
    "smooth",
    "bars",
    "jumping_bars",
    "dots",
    "circular",
    "particles",
    "wave_particles",
    "waterfall",
    "mesh",
  ];

  return (
    <window
      name="control-panel"
      cssClasses={["control-panel"]}
      anchor={bind(options["bar.position"]).as((pos) => {
        switch (pos) {
          case "top":
            return TOP | LEFT;
          case "bottom":
            return BOTTOM | LEFT;
          default:
            return TOP | LEFT;
        }
      })}
      exclusivity={Astal.Exclusivity.NORMAL}
      layer={Astal.Layer.TOP}
      application={App}
      visible={bind(visible)}
      widthRequest={285}
    >
      <box vertical>
        <button
          onClicked={() => App.toggle_window("launcher")}
          cssClasses={["category-button"]}
        >
          <box hexpand={true}>
            <image iconName={"view-grid-symbolic"} />
            <label label={"App Launcher"} halign={Gtk.Align.START} hexpand={true} />
          </box>
        </button>
        <Gtk.Separator />
        <CategoryButton
          title="Matshell Settings"
          icon="preferences-system-symbolic"
          expanded={matshellSettingsExpanded}
          onToggle={() =>
            matshellSettingsExpanded.set(!matshellSettingsExpanded.get())
          }
        >
          {/* Idk why, but children wont render if first child is a box */}
          <></>
          <box vertical>
            {/* Bar Settings Category */}
            <CategoryButton
              title="Bar"
              icon="topbar-show-symbolic"
              expanded={barExpanded}
              onToggle={() => barExpanded.set(!barExpanded.get())}
            >
              <></>
              <box vertical>
                <Section title="Bar Settings">
                  <OptionSelect
                    option="bar.position"
                    label="Position"
                    choices={["top", "bottom"]}
                  />
                  <OptionSelect
                    option="bar.style"
                    label="Style"
                    choices={["expanded", "floating"]}
                  />
                  <OptionToggle
                    option="bar.modules.showOsIcon"
                    label="Show OS Icon"
                  />
                </Section>
              </box>
            </CategoryButton>

            {/* Cava Settings Category */}
            <CategoryButton
              title="Cava"
              icon="audio-x-generic-symbolic"
              expanded={cavaExpanded}
              onToggle={() => cavaExpanded.set(!cavaExpanded.get())}
            >
              <></>
              <box vertical margin={10}>
                <Section title="Cava Settings Bar">
                  <OptionToggle option="bar.modules.cava.show" label="Enable" />
                  <OptionSelect
                    option="bar.modules.cava.style"
                    label="Cava Style"
                    choices={cavaStyleOptions}
                  />
                  <OptionToggle
                    option="bar.modules.media.cava.show"
                    label="Enable Cover Cava"
                  />
                </Section>
                <Section title="Cava Settings Music Player">
                  <OptionToggle
                    option="musicPlayer.modules.cava.show"
                    label="Enable"
                  />
                  <OptionSelect
                    option="musicPlayer.modules.cava.style"
                    label="Cava Style"
                    choices={cavaStyleOptions}
                  />
                </Section>
              </box>
            </CategoryButton>

            {/* System Menu Settings Category */}
            <CategoryButton
              title="System Menu"
              icon="emblem-system-symbolic"
              expanded={systemMenuExpanded}
              onToggle={() => systemMenuExpanded.set(!systemMenuExpanded.get())}
            >
              <></>
              <box vertical margin={10}>
                <Section title="System Menu Settings">
                  <OptionToggle
                    option="system-menu.modules.wifi.enableGnomeControlCenter"
                    label="WiFi Advanced Settings"
                  />
                  <OptionToggle
                    option="system-menu.modules.bluetooth.enableOverskride"
                    label="BT Advanced Settings"
                  />
                </Section>
              </box>
            </CategoryButton>
          </box>
        </CategoryButton>
      </box>
    </window>
  );
}
