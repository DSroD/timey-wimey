import * as fs from 'fs';
import Activity, { toHumanReadableString } from "../../Activity";
import { ExtensionContext, WorkspaceConfiguration } from "vscode";
import * as path from 'path';
import IRecorderConfiguration, { fromWorkspaceConfiguration } from '../../../config/IRecorderConfiguration';
import { ITrackingRecorder, ITrackingRecorderFactory } from '../../ITrackingRecorder';
import { ExportFormatName, formaters } from './ExportFormat';

export type FileBackedRecorderFactory = ITrackingRecorderFactory<FileBackedRecorderConfiguration>;

export interface FileBackedRecorderConfiguration extends IRecorderConfiguration {
    savefile: string,
    format: ExportFormatName,
};

const key = 'filebacked';
const name = "Local FileBacked Activity Recording";

const create =
    async (ctx: ExtensionContext, cfg: WorkspaceConfiguration): Promise<ITrackingRecorder | null> => {
        
        const configuration: FileBackedRecorderConfiguration = fromWorkspaceConfiguration(
            key, defaultConfiguration, cfg,
        );

        const activityLogFilePath = configuration.savefile;
        const saveFolder = path.dirname(activityLogFilePath);

        const recordActivity = async (activity: Activity) => {
            await ensureFolderCreated(saveFolder);
            await ensureLogFileCreated(activityLogFilePath);

            const format = formaters.get(configuration.format) ?? toHumanReadableString;
            const formatedActivityString = format(activity);

            fs.promises.appendFile(activityLogFilePath, formatedActivityString);
        };

        const dispose = () => {
            
        };

        return ({
            recordActivity,
            dispose,
            key,
        });
    };

const ensureFolderCreated = async (saveFolder: string) => {
    if (!fs.existsSync(saveFolder)) {
        await fs.promises.mkdir(saveFolder, {recursive: true});
    }
};

const ensureLogFileCreated = async (activityFilePath: string) => {
    
    if(!fs.existsSync(activityFilePath)) {
        await fs.promises.writeFile(activityFilePath, "");
    }
};

const defaultConfiguration: FileBackedRecorderConfiguration = {
    savefile: '.vscode/tracking/timey-wimey/activity.log',
    format: 'human_readable'
};

const fileBackedRecorderFactory: FileBackedRecorderFactory = ({
    name,
    key,
    defaultConfiguration,
    create,
});

export default fileBackedRecorderFactory;