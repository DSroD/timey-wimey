import { StatusBarItem } from "vscode";
import IRecorderConfiguration from "./config/IRecorderConfiguration";
import { ITrackingRecorder } from "./tracking/ITrackingRecorder";
import { Tag } from "./tags/Tag";

export type AppState = {
    activeRecorders: ITrackingRecorder<IRecorderConfiguration>[],
    projectName: string | null,
    projectTags: Tag[],
    statusBarItem: StatusBarItem,
};