import { execAsync, bind, Variable } from "astal";
import Network from "gi://AstalNetwork";
import { App, Gtk } from "astal/gtk4";

// Variables to track state
const isExpanded = Variable(false);
const availableNetworks = Variable([]);
const savedNetworks = Variable([]);
const activeNetwork = Variable(null);
const passwordInput = Variable("");
const selectedNetwork = Variable(null);
const isConnecting = Variable(false);
const showPasswordDialog = Variable(false);
const errorMessage = Variable("");
const refreshIntervalId = Variable(null);

// Function to scan for available networks
const scanNetworks = () => {
  const network = Network.get_default();
  if (network && network.wifi) {
    network.wifi.scan();

    // Get available networks from access points
    const networks = network.wifi.accessPoints
      .map((ap) => ({
        ssid: ap.ssid,
        strength: ap.strength,
        secured: ap.flags !== 0,
        active: network.wifi.activeAccessPoint?.ssid === ap.ssid,
        accessPoint: ap,
        iconName: ap.iconName,
      }))
      .filter((n) => n.ssid);

    // Sort by signal strength
    networks.sort((a, b) => b.strength - a.strength);

    // Remove duplicates (same SSID)
    const uniqueNetworks = [];
    const seen = new Set();
    networks.forEach((network) => {
      if (!seen.has(network.ssid)) {
        seen.add(network.ssid);
        uniqueNetworks.push(network);
      }
    });

    availableNetworks.set(uniqueNetworks);

    // Update active network
    if (network.wifi.activeAccessPoint) {
      activeNetwork.set({
        ssid: network.wifi.activeAccessPoint.ssid,
        strength: network.wifi.activeAccessPoint.strength,
        secured: network.wifi.activeAccessPoint.flags !== 0,
      });
    } else {
      activeNetwork.set(null);
    }
  }
};

// Function to list saved networks
const getSavedNetworks = () => {
  execAsync(["bash", "-c", "nmcli -t -f NAME,TYPE connection show"])
    .then((output) => {
      if (typeof output === "string") {
        const savedWifiNetworks = output
          .split("\n")
          .filter((line) => line.includes("802-11-wireless"))
          .map((line) => line.split(":")[0].trim());
        savedNetworks.set(savedWifiNetworks);
      }
    })
    .catch((error) => console.error("Error fetching saved networks:", error));
};

// Function to connect to a network

const connectToNetwork = (ssid, password = null) => {
  isConnecting.set(true);
  errorMessage.set("");
  const network = Network.get_default();
  const currentSsid = network.wifi.ssid;

  // Function to perform the actual connection
  const performConnection = () => {
    let command = "";
    if (password) {
      // Connect with password
      command = `echo '${password}' | nmcli device wifi connect "${ssid}" --ask`;
    } else {
      // Connect without password (saved or open network)
      command = `nmcli connection up "${ssid}" || nmcli device wifi connect "${ssid}"`;
    }

    execAsync(["bash", "-c", command])
      .then(() => {
        showPasswordDialog.set(false);
        isConnecting.set(false);
        scanNetworks(); // Refresh network list
      })
      .catch((error) => {
        console.error("Connection error:", error);
        errorMessage.set("Failed to connect. Check password.");
        isConnecting.set(false);
      });
  };

  // If already connected to a network, disconnect first
  if (currentSsid && currentSsid !== ssid) {
    console.log(
      `Disconnecting from ${currentSsid} before connecting to ${ssid}`,
    );
    execAsync(["bash", "-c", `nmcli connection down "${currentSsid}"`])
      .then(() => {
        // Wait a moment for the disconnection to complete fully
        setTimeout(() => {
          performConnection();
        }, 500); // 500ms delay for clean disconnection
      })
      .catch((error) => {
        console.error("Disconnect error:", error);
        // Continue with connection attempt even if disconnect fails
        performConnection();
      });
  } else {
    // No active connection or connecting to same network (reconnect case)
    performConnection();
  }
};

// Function to disconnect from a network
const disconnectNetwork = (ssid) => {
  execAsync(["bash", "-c", `nmcli connection down "${ssid}"`])
    .then(() => {
      scanNetworks(); // Refresh network list
    })
    .catch((error) => {
      console.error("Disconnect error:", error);
    });
};

// Function to forget a saved network
const forgetNetwork = (ssid) => {
  execAsync(["bash", "-c", `nmcli connection delete "${ssid}"`])
    .then(() => {
      getSavedNetworks(); // Refresh saved networks list
      scanNetworks(); // Refresh network list
    })
    .catch((error) => {
      console.error("Forget network error:", error);
    });
};

// Network Item component
const NetworkItem = ({ network }) => {
  const isActive = bind(activeNetwork).as(
    (active) => active?.ssid === network.ssid,
  );

  return (
    <button
      hexpand
      onClicked={() => {
        if (isActive.get()) {
          // Already connected
          return;
        }

        // Check if the network is already saved
        const isSaved = savedNetworks.get().includes(network.ssid);

        if (network.secured && !isSaved) {
          // Show password dialog only for secured networks that are not saved
          selectedNetwork.set(network);
          showPasswordDialog.set(true);
          passwordInput.set("");
        } else {
          // Directly connect to: 1) open networks, or 2) saved networks
          connectToNetwork(network.ssid);
        }
      }}
    >
      <box cssClasses={["network-item"]} hexpand>
        <image iconName={network.iconName} />
        <label label={network.ssid} hexpand />
        {network.secured && (
          <image iconName="network-wireless-encrypted-symbolic" />
        )}
        {isActive.get() && <image iconName="emblem-ok-symbolic" />}
        {savedNetworks.get().includes(network.ssid) && !isActive.get() && (
          <image iconName="document-save-symbolic" />
        )}
      </box>
    </button>
  );
};

// Password dialog component
const PasswordDialog = () => {
  return (
    <box vertical cssClasses={["password-dialog"]}>
      <label
        label={`${selectedNetwork.get()?.ssid}`}
        cssClasses={["password-label"]}
      />
      <box cssClasses={["password-search"]}>
        <image iconName="network-wireless-encrypted-symbolic" />
        <entry
          placeholderText="Enter Password..."
          visibility={false}
          onChanged={(entry) => passwordInput.set(entry.text)}
          onActivate={() =>
            connectToNetwork(selectedNetwork.get()?.ssid, passwordInput.get())
          }
        />
      </box>
      {errorMessage.get() && (
        <label label={errorMessage.get()} cssClasses={["error-message"]} />
      )}
      <box>
        <button
          label={bind(isConnecting).as((c) =>
            c ? "Connecting..." : "Connect",
          )}
          cssClasses={["connect-button"]}
          sensitive={!isConnecting.get()}
          onClicked={() =>
            connectToNetwork(selectedNetwork.get()?.ssid, passwordInput.get())
          }
        />
        <button
          label="Cancel"
          halign={Gtk.Align.END}
          hexpand
          cssClasses={["cancel-button"]}
          onClicked={() => {
            showPasswordDialog.set(false);
            errorMessage.set("");
          }}
        />
      </box>
    </box>
  );
};

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
          <box hexpand={true} halign={Gtk.Align.START}>
            <label
              label={bind(network.wifi, "ssid").as(
                (ssid) =>
                  ssid || (network.wifi.enabled ? "Not Connected" : "WiFi Off"),
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
