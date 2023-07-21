import IConfiguration from "../config/IConfiguration";
import Activity from "./Activity";

export default interface ITrackingRecorder<TConfiguration extends IConfiguration> {
    initialize: (configuration: TConfiguration) => Promise<void>
    recordActivity: (activity: Activity) => Promise<void>
}