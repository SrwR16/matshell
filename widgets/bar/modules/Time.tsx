import { App, Gtk } from "astal/gtk4";
import { execAsync } from "astal/process";
import { interval } from "astal/time";
import { Variable, bind } from "astal";

export default function Time() {
  const time = Variable("");
  const revealPower = Variable(false);

  interval(1000, () => {
    execAsync(["date", "+%H 󰇙 %M"])
      .then((val) => time.set(val.trim()))
      .catch(console.error);
  });

  return (
    <box
      onHoverEnter={() => revealPower.set(true)}
      onHoverLeave={() => revealPower.set(false)}
    >
      <label cssClasses={["date"]} label={bind(time)} />
      <revealer
        transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
        transitionDuration={300}
        revealChild={bind(revealPower)}
      >
        <button
          cssClasses={["power-button"]}
          onClicked={() => App.toggle_window("logout-menu")}
        >
          <image iconName="system-shutdown-symbolic" />
        </button>
      </revealer>
    </box>
  );
}
