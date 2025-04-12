import { Gtk, hook } from "astal/gtk4";
import Pango from "gi://Pango";
import Variable from "astal/variable";
import Wp from "gi://AstalWp";
import Brightness from "utils/brightness";
import Bluetooth from "gi://AstalBluetooth";
import OSDManager from "utils/osd.ts";

export default function OnScreenProgress({
  visible,
}: {
  visible: Variable<boolean>;
}) {
  // Audio connections
  const speaker = Wp.get_default()!.get_default_speaker();
  const microphone = Wp.get_default()!.get_default_microphone();

  // Brightness
  let brightness: Brightness | null = null;
  try {
    brightness = Brightness.get_default();
  } catch (e) {
    console.log(
      "Brightness controls unavailable. If you're on desktop this is not an issue.",
    );
  }

  // Bluetooth
  const bluetooth = Bluetooth.get_default();

  const value = Variable(0);
  const labelText = Variable("");
  const iconName = Variable("");
  const showProgress = Variable(false);

  const osd = new OSDManager({
    visible,
    value,
    label: labelText,
    icon: iconName,
    showProgress,
  });

  return (
    <revealer
      transitionType={Gtk.RevealerTransitionType.CROSSFADE}
      transitionDuration={200}
      revealChild={visible()}
      setup={(self) => {
        const handleVolumeChange = (endpoint: Wp.Endpoint) => () => {
          {
            osd.show(
              endpoint.volume,
              endpoint.description || "",
              endpoint.volumeIcon,
            );
          }
        };
        if (brightness) {
          hook(self, brightness, "notify::screen", () =>
            osd.show(
              brightness.screen,
              "Screen Brightness",
              "display-brightness-symbolic",
            ),
          );
        }

        if (speaker) {
          hook(self, speaker, "notify::volume", handleVolumeChange(speaker));
        }
        if (microphone) {
          hook(
            self,
            microphone,
            "notify::volume",
            handleVolumeChange(microphone),
          );
        }
        if (bluetooth) {
          hook(self, bluetooth, "notify::devices", () => {
            bluetooth.devices.forEach((device) => {
              // Monitor connection state changes for new devices
              hook(self, device, "notify::connected", () => {
                if (device.connected) {
                  osd.show(
                    0,
                    `Connected: ${device.name || device.address}`,
                    device.icon,
                    false,
                  );
                } else {
                  osd.show(
                    0,
                    `Disconnected: ${device.name || device.address}`,
                    device.icon,
                    false,
                  );
                }
              });
            });
          });
        }
      }}
    >
      <box cssClasses={["osd"]}>
        <image iconName={iconName()} />

        <box vertical>
          <label
            label={labelText()}
            maxWidthChars={24}
            widthRequest={250}
            ellipsize={Pango.EllipsizeMode.END}
          />

          <levelbar
            valign={Gtk.Align.CENTER}
            value={value()}
            visible={showProgress()}
          />
        </box>
      </box>
    </revealer>
  );
}
