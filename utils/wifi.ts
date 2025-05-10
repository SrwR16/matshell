import { execAsync, Variable } from "astal";
import Network from "gi://AstalNetwork";

// State trackers
export const availableNetworks = Variable([]);
export const savedNetworks = Variable([]);
export const activeNetwork = Variable(null);
export const isConnecting = Variable(false);
export const showPasswordDialog = Variable(false);
export const errorMessage = Variable("");
export const isExpanded = Variable(false);
export const passwordInput = Variable("");
export const selectedNetwork = Variable(null);

// Function to scan for available networks
export const scanNetworks = () => {
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
export const getSavedNetworks = () => {
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

export const connectToNetwork = (ssid, password = null) => {
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
export const disconnectNetwork = (ssid) => {
  execAsync(["bash", "-c", `nmcli connection down "${ssid}"`])
    .then(() => {
      scanNetworks(); // Refresh network list
    })
    .catch((error) => {
      console.error("Disconnect error:", error);
    });
};

// Function to forget a saved network
export const forgetNetwork = (ssid) => {
  execAsync(["bash", "-c", `nmcli connection delete "${ssid}"`])
    .then(() => {
      getSavedNetworks(); // Refresh saved networks list
      scanNetworks(); // Refresh network list
    })
    .catch((error) => {
      console.error("Forget network error:", error);
    });
};
