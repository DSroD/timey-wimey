import { StatusBarItem } from "vscode";
import { ITrackingRecorder } from "./tracking/trackingRecorder";
import { Tag } from "./tags/tag";

export type AppState = {
    activeRecorders: ITrackingRecorder[],
    projectName: string | null,
    projectTags: Tag[],
    statusBarItem: StatusBarItem,
};
