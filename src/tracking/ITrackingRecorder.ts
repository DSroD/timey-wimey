import { ExtensionContext, WorkspaceConfiguration } from "vscode";
import IRecorderConfiguration from "../config/IRecorderConfiguration";
import Activity from "./Activity";

/**
 * Each recorder implements this interface.
 * It is also required to register configuration contribution, containing at least
 * [timeyWimey.{key}.{enabled}].
 */
export interface ITrackingRecorder {
    recordActivity: (activity: Activity) => Promise<void>,
    dispose: () => void,
    key: string,
}

// TODO: Return config chagne dispatcher on creation
export interface ITrackingRecorderFactory<TConfiguration extends IRecorderConfiguration> {
    create: (ctx: ExtensionContext, cfg: WorkspaceConfiguration) => Promise<ITrackingRecorder | null>;
    defaultConfiguration: TConfiguration;
    key: string;
    name: string;
}