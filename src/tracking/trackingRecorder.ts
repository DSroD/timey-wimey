import { ExtensionContext, WorkspaceConfiguration } from "vscode";
import IRecorderConfiguration from "../config/recorderConfiguration";
import Activity from "./activity";

/**
 * Each recorder implements this interface.
 * It is also required to register configuration contribution, containing at least
 * [timeyWimey.{key}.{enabled}].
 */
export interface ITrackingRecorder {
    recordStartActivity: (activity: Activity) => Promise<void>,
    recordEndActivity: (activity: Activity) => Promise<void>,
    dispose: () => void,
    key: string,
}

// TODO: allow subscribtion to config dispatcher on creation (and unsubscribe on destruction automatically?)
export interface ITrackingRecorderFactory<TConfiguration extends IRecorderConfiguration> {
    create: (ctx: ExtensionContext, cfg: WorkspaceConfiguration) => Promise<ITrackingRecorder | null>;
    defaultConfiguration: TConfiguration;
    key: string;
    name: string;
}
