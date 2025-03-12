import PowerProfiles from "gi://AstalPowerProfiles";
import { Gtk } from "astal/gtk3";
import { Variable, bind } from "astal";

const showList = Variable(false);
const powerprofiles = PowerProfiles.get_default();

const prettyName = (n: String) =>
  n.charAt(0).toUpperCase() + n.substring(1).replace("-", " ");


function Profile(args) {
  return (
    <eventbox hexpand={true} onClick={args.clickAction}>
      <box {...args.props} hexpand={true} halign={Gtk.Align.START}>
        <icon icon={args.icon ?? ""} />
        <label label={args.label ?? ""} />
      </box>
    </eventbox>
  );
}

const makeProfiles = (profiles: PowerProfiles.PowerProfiles) =>
  profiles.map((e: PowerProfiles.PowerProfiles) =>
    Profile({
      clickAction: () => {
        powerprofiles.set_active_profile(e.profile);
        showList.set(false);
      },
      icon: `power-profile-${e.profile}-symbolic`,
      label: prettyName(e.profile),
    }),
  );

const ActiveProfile = () =>
  Profile({
    props: {
      className: "current-profile",
    },
    clickAction: () => showList.set(!showList.get()),
    icon: bind(powerprofiles, "icon-name"),
    label: bind(powerprofiles, "active-profile").as((ap) => prettyName(ap)),
  });

const ProfileRevealer = () => {
  return (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
      transitionDuration={300}
      revealChild={bind(showList)}
    >
      <box vertical className="options">
        {makeProfiles(powerprofiles.get_profiles())}
      </box>
    </revealer>
  );
};

export const PowerBox = () => {
  return (
    <box vertical className="power-profiles">
      <box vertical>
        <ActiveProfile />
        <ProfileRevealer />
      </box>
    </box>
  );
};
