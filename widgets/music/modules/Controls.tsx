import Mpris from "gi://AstalMpris";
import { bind } from "astal";
import { mprisStateIcon } from "utils/mpris";

export function Controls({ player, widthRequest }: { player: Mpris.Player, widthRequest?: number }) {
  return (
    <centerbox className="controls"
      vexpand={true}
      widthRequest={widthRequest}>
      <button onClicked={() => player.previous()}>
        <image iconName="media-skip-backward-symbolic" />
      </button>
      <button onClicked={() => player.play_pause()}>
        <image iconName={bind(player, "playback_status").as(mprisStateIcon)} />
      </button>
      <button onClicked={() => player.next()}>
        <image iconName="media-skip-forward-symbolic" />
      </button>
    </centerbox>
  );
}
