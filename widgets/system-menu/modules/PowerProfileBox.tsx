import PowerProfiles from "gi://AstalPowerProfiles";
import { Gtk } from "astal/gtk3";
import { Variable, bind } from "astal";

const isExpanded = Variable(false);
const powerProfiles = PowerProfiles.get_default();

const formatProfileName = (name: String) =>
  name.charAt(0).toUpperCase() + name.substring(1).replace("-", " ");

const ProfileItem = ({ icon, label, onClick, className = "" }) => (
  <eventbox hexpand={true} onClick={onClick}>
    <box className={className} hexpand={true} halign={Gtk.Align.START}>
      <icon icon={icon} />
      <label label={label} />
    </box>
  </eventbox>
);

export const PowerProfileBox = () => {
  const profiles = powerProfiles.get_profiles();

  return (
    <box vertical className="power-profiles">
      <ProfileItem
        className="current-profile"
        icon={bind(powerProfiles, "icon-name")}
        label={bind(powerProfiles, "active-profile").as(formatProfileName)}
        onClick={() => isExpanded.set(!isExpanded.get())}
      />
      <revealer
        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
        transitionDuration={300}
        revealChild={bind(isExpanded)}
      >
        <box vertical className="profile-options">
          {profiles.map((profile: PowerProfiles.PowerProfiles) => (
            <ProfileItem
              icon={`power-profile-${profile.profile}-symbolic`}
              label={formatProfileName(profile.profile)}
              onClick={() => {
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
