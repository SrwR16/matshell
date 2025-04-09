import PowerProfiles from "gi://AstalPowerProfiles";
import { Gtk } from "astal/gtk4";
import { Variable, bind } from "astal";

const isExpanded = Variable(false);
const powerProfiles = PowerProfiles.get_default();

const formatProfileName = (name: String) =>
  name.charAt(0).toUpperCase() + name.substring(1).replace("-", " ");

const ProfileItem = ({ icon, label, onClicked, cssClasses = [""] }) => (
  <button hexpand={true} onClicked={onClicked}>
    <box cssClasses={cssClasses} hexpand={true} halign={Gtk.Align.START}>
      <image iconName={icon} />
      <label label={label} />
    </box>
  </button>
);

export const PowerProfileBox = () => {
  const profiles = powerProfiles.get_profiles();

  return (
    <box vertical cssClasses={["power-profiles"]}>
      <ProfileItem
        cssClasses={["current-profile"]}
        icon={bind(powerProfiles, "icon-name")}
        label={bind(powerProfiles, "active-profile").as(formatProfileName)}
        onClicked={() => isExpanded.set(!isExpanded.get())}
      />
      <revealer
        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
        transitionDuration={300}
        revealChild={bind(isExpanded)}
      >
        <box vertical cssClasses={["profile-options"]}>
          {profiles.map((profile: PowerProfiles.PowerProfiles) => (
            <ProfileItem
              icon={`power-profile-${profile.profile}-symbolic`}
              label={formatProfileName(profile.profile)}
              onClicked={() => {
                powerProfiles.set_active_profile(profile.profile);
                isExpanded.set(false);
              }}
            />
          ))}
        </box>
      </revealer>
    </box>
  );
};
