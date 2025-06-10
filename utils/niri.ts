import { execAsync, subprocess } from "astal/process";
import { Variable, GLib } from "astal";
import { App, Gdk } from "astal/gtk4";

export interface NiriWorkspace {
  id: number;
  name?: string;
  is_active: boolean;
  is_focused: boolean;
  output?: string;
}

export interface NiriOutput {
  name: string;
  make: string;
  model: string;
  serial: string;
  logical: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  current_mode?: {
    width: number;
    height: number;
    refresh_rate_millihertz: number;
  };
}

export interface NiriWindow {
  id: number;
  title: string;
  app_id: string;
  workspace_id: number;
  is_focused: boolean;
}

class NiriClient {
  private _workspaces = Variable<NiriWorkspace[]>([]);
  private _outputs = Variable<NiriOutput[]>([]);
  private _windows = Variable<NiriWindow[]>([]);
  private _focusedOutput = Variable<NiriOutput | null>(null);
  private _focusedWorkspace = Variable<NiriWorkspace | null>(null);
  private _focusedWindow = Variable<NiriWindow | null>(null);

  constructor() {
    this.startEventStream();
    this.updateState();
  }

  get workspaces() { return this._workspaces; }
  get outputs() { return this._outputs; }
  get windows() { return this._windows; }
  get focusedOutput() { return this._focusedOutput; }
  get focusedWorkspace() { return this._focusedWorkspace; }
  get focusedWindow() { return this._focusedWindow; }

  private async sendRequest(request: any): Promise<any> {
    const socketPath = GLib.getenv("NIRI_SOCKET");
    if (!socketPath) {
      throw new Error("NIRI_SOCKET environment variable not set");
    }

    try {
      const result = await execAsync([
        "socat", "-", `UNIX-CONNECT:${socketPath}`,
      ], { 
        input: JSON.stringify(request) + "\n" 
      });
      
      const response = JSON.parse(result);
      if (response.Err) {
        throw new Error(response.Err);
      }
      return response.Ok;
    } catch (error) {
      console.error("Niri IPC error:", error);
      throw error;
    }
  }

  private async startEventStream() {
    const socketPath = GLib.getenv("NIRI_SOCKET");
    if (!socketPath) {
      console.error("NIRI_SOCKET environment variable not set");
      return;
    }

    try {
      const proc = subprocess([
        "socat", "-", `UNIX-CONNECT:${socketPath}`
      ], {
        stdout: (line) => {
          try {
            const event = JSON.parse(line);
            this.handleEvent(event);
          } catch (error) {
            console.error("Failed to parse Niri event:", error);
          }
        },
        stderr: (error) => {
          console.error("Niri event stream error:", error);
        }
      });

      // Start the event stream
      proc.write(JSON.stringify("EventStream") + "\n");
    } catch (error) {
      console.error("Failed to start Niri event stream:", error);
    }
  }

  private handleEvent(event: any) {
    if (event.WorkspacesChanged) {
      this.updateWorkspaces();
    } else if (event.WindowsChanged) {
      this.updateWindows();
    } else if (event.OutputsChanged) {
      this.updateOutputs();
    } else if (event.WorkspaceActivated) {
      this.updateFocusedWorkspace();
    } else if (event.WindowFocusChanged) {
      this.updateFocusedWindow();
    }
  }

  private async updateState() {
    await Promise.all([
      this.updateWorkspaces(),
      this.updateOutputs(),
      this.updateWindows(),
      this.updateFocusedWorkspace(),
      this.updateFocusedWindow(),
    ]);
  }

  private async updateWorkspaces() {
    try {
      const workspaces = await this.sendRequest("Workspaces");
      this._workspaces.set(workspaces || []);
    } catch (error) {
      console.error("Failed to get workspaces:", error);
    }
  }

  private async updateOutputs() {
    try {
      const outputs = await this.sendRequest("Outputs");
      this._outputs.set(outputs || []);
    } catch (error) {
      console.error("Failed to get outputs:", error);
    }
  }

  private async updateWindows() {
    try {
      const windows = await this.sendRequest("Windows");
      this._windows.set(windows || []);
    } catch (error) {
      console.error("Failed to get windows:", error);
    }
  }

  private async updateFocusedWorkspace() {
    try {
      const focused = await this.sendRequest("FocusedWorkspace");
      this._focusedWorkspace.set(focused || null);
    } catch (error) {
      console.error("Failed to get focused workspace:", error);
    }
  }

  private async updateFocusedWindow() {
    try {
      const focused = await this.sendRequest("FocusedWindow");
      this._focusedWindow.set(focused || null);
    } catch (error) {
      console.error("Failed to get focused window:", error);
    }
  }

  async focusWorkspace(id: number) {
    try {
      await this.sendRequest({
        Action: {
          FocusWorkspace: {
            reference: { Id: id }
          }
        }
      });
    } catch (error) {
      console.error("Failed to focus workspace:", error);
    }
  }

  async focusWorkspaceByIndex(index: number) {
    try {
      await this.sendRequest({
        Action: {
          FocusWorkspace: {
            reference: { Index: index }
          }
        }
      });
    } catch (error) {
      console.error("Failed to focus workspace by index:", error);
    }
  }

  async closeWindow(id?: number) {
    try {
      await this.sendRequest({
        Action: {
          CloseWindow: id ? { id } : null
        }
      });
    } catch (error) {
      console.error("Failed to close window:", error);
    }
  }
}

// Global Niri client instance
let niriClient: NiriClient | null = null;

export function getNiriClient(): NiriClient {
  if (!niriClient) {
    niriClient = new NiriClient();
  }
  return niriClient;
}

// Match Niri output to GDK monitor
export function niriToGdk(output: NiriOutput): Gdk.Monitor | null {
  const monitors = App.get_monitors();
  if (!monitors || monitors.length === 0) return null;

  for (let gdkMonitor of monitors) {
    if (gdkMonitor && gdkMonitor.get_connector() === output.name) {
      return gdkMonitor;
    }
  }

  // Fallback to first monitor
  return monitors.length > 0 ? monitors[0] : null;
}

// Get the focused monitor as GDK monitor
export function getFocusedGdkMonitor(): Gdk.Monitor | null {
  const niri = getNiriClient();
  const focused = niri.focusedOutput.get();
  
  if (focused) {
    return niriToGdk(focused);
  }

  // Fallback to first available monitor
  const monitors = App.get_monitors();
  return monitors && monitors.length > 0 ? monitors[0] : null;
}
