import { Variable, execAsync, bind, interval } from "astal";
import Network from "gi://AstalNetwork";
import { App, Gtk } from "astal/gtk4";
import { NetworkItem } from "./modules/NetworkItem.tsx";
import { PasswordDialog } from "./modules/PasswordDialog.tsx";
import {
  availableNetworks,
  savedNetworks,
  activeNetwork,
  showPasswordDialog,
  scanNetworks,
  getSavedNetworks,
  disconnectNetwork,
  forgetNetwork,
  isExpanded,
} from "utils/wifi.ts";
import options from "options.ts";

// Main WiFi Box component
export const WiFiBox = () => {
  const network = Network.get_default();

  return (
    <box vertical cssClasses={["wifi-menu", "toggle"]}>
      {/* WiFi Toggle Header */}
      <box cssClasses={["toggle", "wifi-toggle"]}>
        <button
          onClicked={() => {
            if (network.wifi.enabled) {
              network.wifi.set_enabled(false);
            } else network.wifi.set_enabled(true);
          }}
          cssClasses={bind(network.wifi, "enabled").as((enabled) =>
            enabled ? ["button"] : ["button-disabled"],
          )}
        >
          <image iconName={bind(network.wifi, "icon_name")} />
        </button>
        <button
          hexpand={true}
          onClicked={() => {
            if (network.wifi.enabled) {
              isExpanded.set(!isExpanded.get());
              if (isExpanded.get()) {
                scanNetworks();
                getSavedNetworks();
              }
            }
          }}
        >
          <box hexpand={true}>
            <label
              hexpand={true}
              xalign={0}
              label={bind(network.wifi, "ssid").as(
                (ssid) =>
                  ssid || (network.wifi.enabled ? "Not Connected" : "WiFi Off"),
              )}
            />
            <image
              iconName="pan-end-symbolic"
              halign={Gtk.Align.END}
              cssClasses={bind(isExpanded).as((expanded) =>
                expanded
                  ? ["arrow-indicator", "arrow-down"]
                  : ["arrow-indicator"],
              )}
            />
          </box>
        </button>
      </box>

      {/* Networks List Revealer */}
      <revealer
        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
        transitionDuration={300}
        revealChild={bind(isExpanded)}
        setup={() => {
          const scanTimer = Variable(null);
          bind(isExpanded).subscribe((expanded) => {
            if (expanded) {
              // Cancel any existing timer first
              scanTimer.get()?.cancel();

              if (network.wifi?.enabled) {
                scanTimer.set(
                  interval(10000, () => {
                    scanNetworks();
                    getSavedNetworks();
                    print("updated, it works");
                  }),
                );
              }
            } else {
              // Cancel timer when collapsed
              scanTimer.get()?.cancel();
              scanTimer.set(null);

              // Apply revealer bug fix when collapsed
              App.toggle_window("system-menu");
              App.toggle_window("system-menu");
            }
          });

          // Monitor window toggling to prevent permanent network scan
          const windowListener = App.connect("window-toggled", (_, window) => {
            if (window.name === "system-menu" && isExpanded.get()) {
              isExpanded.set(false);
            }
          });

          return () => {
            scanTimer.get()?.cancel();
            scanTimer.set(null);
            App.disconnect(windowListener);
            bind(isExpanded).unsubscribe();
          };
        }}
      >
        <box vertical cssClasses={["network-list"]}>
          <box visible={bind(showPasswordDialog)}>
            <PasswordDialog />
          </box>

          {/* Available Networks */}
          <label label="Available Networks" cssClasses={["section-label"]} />
          {bind(availableNetworks).as((networks) =>
            networks.length === 0 ? (
              <label label="No networks found" cssClasses={["empty-label"]} />
            ) : (
              networks.map((network) => <NetworkItem network={network} />)
            ),
          )}

          {/* Saved Networks */}
          {bind(savedNetworks).as((networks) => {
            // Filter out networks already shown in available networks
            const filteredNetworks = networks.filter(
              (ssid) => !availableNetworks.get().some((n) => n.ssid === ssid),
            );

            // Only render the section if there are filtered networks to show
            return filteredNetworks.length > 0 ? (
              <box vertical>
                <label label="Saved Networks" cssClasses={["section-label"]} />
                {filteredNetworks.map((ssid) => (
                  <box cssClasses={["saved-network"]}>
                    <label label={ssid} />
                    <box hexpand={true} />
                    <button
                      label="Forget"
                      cssClasses={["forget-button", "button"]}
                      onClicked={() => forgetNetwork(ssid)}
                    />
                  </box>
                ))}
              </box>
            ) : (
              ""
            );
          })}

          <box hexpand>
            {/* Refresh Button */}
            <button
              halign={Gtk.Align.START}
              cssClasses={["refresh-button"]}
              onClicked={() => {
                scanNetworks();
                getSavedNetworks();
              }}
            >
              <image iconName="view-refresh-symbolic" />
            </button>
            {/* Connected Network Options */}
            <box hexpand>
              {bind(activeNetwork).as((active) =>
                active ? (
                  <box vertical cssClasses={["connected-network"]} hexpand>
                    <button
                      label="Disconnect"
                      cssClasses={["disconnect-button"]}
                      onClicked={() => disconnectNetwork(active.ssid)}
                    />
                  </box>
                ) : (
                  ""
                ),
              )}
            </box>
            {/* Advanced Settings Button */}
            {bind(
              options["system-menu.modules.wifi.enableGnomeControlCenter"],
            ).as((gcc) =>
              gcc ? (
                <button
                  cssClasses={["settings-button"]}
                  halign={Gtk.Align.END}
                  hexpand={false}
                  onClicked={() => {
                    execAsync([
                      "sh",
                      "-c",
                      "XDG_CURRENT_DESKTOP=GNOME gnome-control-center wifi",
                    ]);
                    isExpanded.set(false);
                  }}
                >
                  <image iconName={"emblem-system-symbolic"} />
                </button>
              ) : (
                ""
              ),
            )}
          </box>
        </box>
      </revealer>
    </box>
  );
};
