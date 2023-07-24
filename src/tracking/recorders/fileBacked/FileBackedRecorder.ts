import * as fs from 'fs';
import Activity, { getActivity, toHumanReadableString } from "../../Activity";
import { ExtensionContext, WorkspaceConfiguration, commands } from "vscode";
import path = require('path');
import IRecorderConfiguration, { fromWorkspaceConfiguration } from '../../../config/IRecorderConfiguration';
import { ITrackingRecorder, ITrackingRecorderFactory } from '../../ITrackingRecorder';

export type FileBackedRecorderFactory = ITrackingRecorderFactory<FileBackedRecorderConfiguration>;

export type FileBackedRecorder = ITrackingRecorder<FileBackedRecorderConfiguration>;

export interface FileBackedRecorderConfiguration extends IRecorderConfiguration {
    savefile: string,
};

const key = 'filebacked';
const name = "Local FileBacked Activity Recording";

const create =
    async (ctx: ExtensionContext, cfg: WorkspaceConfiguration) => {
        
        const configuration: FileBackedRecorderConfiguration = fromWorkspaceConfiguration(
            key,
            defaultConfiguration,
            cfg
        );

        const activityLogFilePath = configuration.savefile;
        const saveFolder = path.dirname(activityLogFilePath);

        const recordActivity = async (activity: Activity) => {
            await ensureFolderCreated(saveFolder);
            await ensureLogFileCreated(activityLogFilePath);

            const readableActivity = toHumanReadableString(activity);

            fs.promises.appendFile(activityLogFilePath, readableActivity);
        };

        const dispose = async () => {
            
        };

        return ({
            recordActivity,
            dispose,
            key
        });
    };

const ensureFolderCreated = async (saveFolder: string) => {
    if (!fs.existsSync(saveFolder)) {
        await fs.promises.mkdir(saveFolder, {recursive: true});
    }
};

const ensureLogFileCreated = async (activityFilePath: string) => {
    
    if(!fs.existsSync(activityFilePath)) {
        await fs.promises.writeFile(activityFilePath, "# timey-wimey activity log file\n");
    }
};

const defaultConfiguration: FileBackedRecorderConfiguration = {
    savefile: '.vscode/tracking/timey-wimey/activity.log',
};

const fileBackedRecorderFactory: FileBackedRecorderFactory = ({
    name,
    key,
    defaultConfiguration,
    create,
});

export default fileBackedRecorderFactory;