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
          bind(isExpanded).subscribe((e) => {
            if (e) {
              network.wifi?.scan();
              if (network.wifi.enabled) {
                // Clear any existing interval first to avoid duplicates
                if (refreshIntervalId.get())
                  clearInterval(refreshIntervalId.get());

                // Create new interval - refresh every 10 seconds
                const intervalId = setInterval(() => {
                  scanNetworks();
                  getSavedNetworks();
                  print("updated");
                }, 10000); // 10 seconds interval

                refreshIntervalId.set(intervalId);
              }
            } else {
              // Super cheap fix until the revealer bug is fixed
              // https://github.com/Aylur/astal/issues/258
              App.toggle_window("system-menu");
              App.toggle_window("system-menu");

              // Clear interval when collapsed
              if (refreshIntervalId.get()) {
                clearInterval(refreshIntervalId.get());
                refreshIntervalId.set(null);
              }
            }
          });
          const windowListener = App.connect("window-toggled", (_, window) => {
            if (window.name == "system-menu" && isExpanded.get()) {
              // Window was closed, make sure to collapse the revealer
              isExpanded.set(false);
            }
          });

          return () => {
            // Clean up the listener when component is destroyed
            App.disconnect(windowListener);
            if (refreshIntervalId.get()) {
              clearInterval(refreshIntervalId.get());
            }
          };
        }}
      >
        <box vertical cssClasses={["network-list"]}>
          {bind(showPasswordDialog).as((show) =>
            show ? <PasswordDialog /> : "",
          )}

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
                    <label label={ssid} hexpand={true} />
                    <button
                      label="Forget"
                      cssClasses={["forget-button"]}
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
          </box>
        </box>
      </revealer>
    </box>
  );
};
