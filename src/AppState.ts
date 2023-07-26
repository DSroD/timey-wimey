import { StatusBarItem } from "vscode";
import { ITrackingRecorder } from "./tracking/ITrackingRecorder";
import { Tag } from "./tags/Tag";

export type AppState = {
    activeRecorders: ITrackingRecorder[],
    projectName: string | null,
    projectTags: Tag[],
    statusBarItem: StatusBarItem,
};