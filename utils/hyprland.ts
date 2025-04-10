import { App, Gdk } from "astal/gtk4";
import Hyprland from "gi://AstalHyprland";

/* Match Hyprland monitor to GDK monitor
THIS MAY NOT WORK AS INTENDED IF YOU HAVE MONITORS OF THE SAME MODEL
I did not find a more elegant solution to this. 
On my setup GDK coordinates and hyprland coordinates are flipped,
so I cant match by coordinates. */

export function hyprToGdk(monitor: Hyprland.Monitor): Gdk.Monitor {
  const monitors = App.get_monitors();
  for (let gdkmonitor of monitors) {
    if (monitor.get_name() === gdkmonitor.get_connector()) return gdkmonitor;
  }
  // Default monitor
  return monitors[0];
}
