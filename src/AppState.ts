import { StatusBarItem } from "vscode";
import IConfiguration from "./config/IConfiguration";
import ITrackingRecorder from "./tracking/ITrackingRecorder";

export type AppState = {
    activeRecorders: ITrackingRecorder<IConfiguration>[],
    projectName: string | null,
    projectTags: string[],
    statusBarItem: StatusBarItem,
};