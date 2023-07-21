import ITrackingRecorder from "../../tracking/ITrackingRecorder";
import FileBackedRecorderConfiguration from "./FileBackedRecorderConfiguration";

type FileBackedRecorder = ITrackingRecorder<FileBackedRecorderConfiguration>;

export default FileBackedRecorder;