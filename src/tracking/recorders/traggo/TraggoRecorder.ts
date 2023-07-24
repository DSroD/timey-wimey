import IRecorderConfiguration from "../../../config/IRecorderConfiguration";
import { ITrackingRecorder, ITrackingRecorderFactory } from "../../ITrackingRecorder";

export type TraggoRecorderFactory = ITrackingRecorderFactory<TraggoRecorderConfiguration>;

export type TraggoRecorder = ITrackingRecorder<TraggoRecorderConfiguration>;

export interface TraggoRecorderConfiguration extends IRecorderConfiguration {
    apiEndpoint: string,
};

const key = 'traggo';
const name = 'Traggo Activity Recording';