import { getNiriClient } from "utils/niri.ts";
import { bind } from "astal";

// May implement this later
function FocusedClient() {
  const niri = getNiriClient();
  const focused = bind(niri.focusedWindow);

  return (
    <box cssClasses={["Focused"]} visible={focused.as(Boolean)}>
      {focused.as(
        (window) => {
          if (window) {
            return <label label={window.title} />;
          }
          return null;
        },
      )}
    </box>
  );
}

export default function Workspaces() {
  const niri = getNiriClient();

  return (
    <box cssClasses={["Workspaces"]}>
      {bind(niri.workspaces).as((workspaces) => {
        // Sort workspaces by ID and show up to 10
        const sortedWorkspaces = workspaces
          .sort((a, b) => a.id - b.id)
          .slice(0, 10);

        return [...Array(10)].map((_, i) => {
          const index = i + 1;
          const ws = sortedWorkspaces.find((w) => w.id === index);
          const hasWorkspace = ws !== undefined;
          
          return (
            <button
              visible={hasWorkspace || index <= Math.max(1, sortedWorkspaces.length)}
              cssClasses={bind(niri.focusedWorkspace).as((focused) => {
                const classes: string[] = [];
                if (ws?.is_focused) {
                  classes.push("focused");
                }
                if (ws?.is_active) {
                  classes.push("active");
                }
                return classes;
              })}
              onClicked={() => {
                niri.focusWorkspaceByIndex(index - 1);
              }}
            >
              {index}
            </button>
          );
        });
      })}
    </box>
  );
}
