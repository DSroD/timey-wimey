import { ExtensionContext } from "vscode";
import IConfiguration from "../config/IConfiguration";
import ITrackingRecorder from "./ITrackingRecorder";

export default interface ITrackingRecorderFactory<TConfiguration extends IConfiguration> {
    create: (ctx: ExtensionContext) => ITrackingRecorder<TConfiguration> | null;
    name: string;
    description: string;
}