import { ExtensionContext, WorkspaceConfiguration } from "vscode";
import { ITrackingRecorderFactory } from "../../trackingRecorder";
import IRecorderConfiguration, { fromWorkspaceConfiguration } from "../../../config/recorderConfiguration";
import { promises as asyncfs } from "fs";
import { Database } from 'sqlite3';
import { join as joinPath} from 'path';
import { DBContext, mkContext } from "./dbContext";
import sql from 'sql-template-tag';

// TODO: implement & add commands to aggregate activity
type SQLiteRecorderFactory = ITrackingRecorderFactory<SQLiteRecorderConfiguration>;

export interface SQLiteRecorderConfiguration extends IRecorderConfiguration {

}

const key = 'sqlite';
const name = "SQLite Activity Recording";
const idAdditionalDataKey = 'sqlite.id';

const defaultConfiguration: SQLiteRecorderConfiguration = {

};

const activityTableName = 'activities';
const tagsTableName = 'tags';
const activityTagsTableName = 'activityTags';

const create = 
    async (ctx: ExtensionContext, cfg: WorkspaceConfiguration) => {
        const configuration: SQLiteRecorderConfiguration = fromWorkspaceConfiguration(
            key, defaultConfiguration, cfg
        );

        const storageFolder = ctx.globalStoragePath;
        createFolderIfNotExists(storageFolder);
        const dbFileName = 'activity.sqlite';
        const dbFilePath = joinPath(storageFolder, dbFileName);
        const db = new Database(dbFilePath);

        const context = mkContext(db);
        ensureTableCreated(context);
};

const createFolderIfNotExists = async (path: string) => {
    await asyncfs.mkdir(path, {recursive: true});
};

const ensureTableCreated = async (context: DBContext) => {
    const activityTableQuery = sql`CREATE TABLE IF NOT EXISTS ${activityTableName} (
        id INTEGER PRIMARY KEY,
        start INTEGER NOT NULL,
        stop INTEGER,
        projectName TEXT,
    )`;

    const tagsTableQuery = sql`CREATE TABLE IF NOT EXISTS ${tagsTableName} (
        id INTEGER PRIMARY KEY,
        key TEXT NOT NULL,
    )`;

    const activityTagsTableQuery = sql`CREATE TABLE IF NOT EXISTS ${activityTagsTableName} (
        id INTEGER PRIMARY KEY,
        activityId INTEGER NOT NULL,
        tagId INTEGER NOT NULL,
        value TEXT NOT NULL,
    )`;

    await context.query(activityTableQuery);
    await context.query(tagsTableQuery);
    await context.query(activityTagsTableQuery);
};
