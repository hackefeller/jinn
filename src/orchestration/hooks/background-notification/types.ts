import type { BackgroundTask } from "../../../execution/background-agent";

export interface BackgroundNotificationHookConfig {
  formatNotification?: (tasks: BackgroundTask[]) => string;
}
