import { execAsync, bind } from "astal";
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
  refreshIntervalId,
} from "utils/wifi.ts";
import options from "options.ts";

// Main WiFi Box component
export const WiFiBox = () => {
  const network = Network.get_default();

  // Initial scan when component is first used
  setTimeout(() => {
    scanNetworks();
    getSavedNetworks();
  }, 100);

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
          const clearScanInterval = () => {
            if (refreshIntervalId.get()) {
              clearInterval(refreshIntervalId.get());
              refreshIntervalId.set(null);
            }
          };
          bind(isExpanded).subscribe((expanded) => {
            // Clear existing interval
            clearScanInterval();

            if (expanded) {
              // Scan networks
              network.wifi?.scan();

              // Set up new interval if WiFi is enabled
              if (network.wifi?.enabled) {
                refreshIntervalId.set(
                  setInterval(() => {
                    scanNetworks();
                    getSavedNetworks();
                    print("updated");
                  }, 10000),
                );
              }
            } else {
              // Apply revealer bug fix when collapsed
              App.toggle_window("system-menu");
              App.toggle_window("system-menu");
            }
          });

          // Monitor window toggling
          const windowListener = App.connect("window-toggled", (_, window) => {
            if (window.name === "system-menu" && isExpanded.get()) {
              isExpanded.set(false);
            }
          });

          // Clean up resources when component is destroyed
          return () => {
            App.disconnect(windowListener);
            clearScanInterval();
            bind(isExpanded).unsubscribe();
          };
        }}
      >
        <box vertical cssClasses={["network-list"]}>
          <box visible={bind(showPasswordDialog)}>
            <PasswordDialog />
          </box>
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
