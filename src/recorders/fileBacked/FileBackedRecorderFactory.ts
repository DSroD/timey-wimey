import * as fs from 'fs';
import Activity from "../../tracking/Activity";
import FileBackedRecorderConfiguration from "./FileBackedRecorderConfiguration";
import ITrackingRecorderFactory from "../../tracking/ITrackingRecorderFactory";
import { ExtensionContext, commands } from "vscode";
import path = require('path');

export type FileBackedRecorderFactory = ITrackingRecorderFactory<FileBackedRecorderConfiguration>;

const create =
    (ctx: ExtensionContext) => {
        const configuration: FileBackedRecorderConfiguration = getConfiguration(ctx);

        const saveFolder = ctx.globalStorageUri.fsPath;
        const activityLogFilePath = path.join(saveFolder, "timey-wimey.activity.log");

        const initialize = async (configuration: FileBackedRecorderConfiguration) => {
            ensureFolderCreated(saveFolder);
            ensureLogFileCreated(saveFolder);
        };

        const recordActivity = async (activity: Activity) => {
            
        };

        return ({
            initialize,
            recordActivity,
        });
    };

const getConfiguration = (ctx: ExtensionContext): FileBackedRecorderConfiguration => ({
    
});

const ensureFolderCreated = (saveFolder: string) => {
    if (!fs.existsSync(saveFolder)) {
        fs.mkdirSync(saveFolder);
    }
};

const ensureLogFileCreated = (activityFilePath: string) => {
    
    if(!fs.existsSync(activityFilePath)) {
        fs.writeFileSync(activityFilePath, "# Timey-Wimey activity log file");
    }
};

const fileBackedRecorderFactory: FileBackedRecorderFactory = ({
    name: "FileBacked recording",
    description: "Time tracking is saved to persistent file locally",
    create,
});

export default fileBackedRecorderFactory;