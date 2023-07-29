import * as vscode from 'vscode';
import IRecorderConfiguration from "./config/recorderConfiguration";
import fileBackedRecorderFactory from "./tracking/recorders/fileBacked/fileBackedRecorder";
import useStatusBarButton, { showTrackingOff, showTrackingOn } from './statusbar/statusBarButton';
import toggleTrackingCommand from './commands/toggleTrackingCommand';
import TWCommand from './commands/twCommand';
import { AppState } from './appState';
import { registerConfigurationKey } from './config/configChangeDispatcher';
import { initialize as initializeConfigDispatcher } from './config/configChangeDispatcher';
import { ITrackingRecorder, ITrackingRecorderFactory } from './tracking/trackingRecorder';
import { 
    startActivity as start,
    stopActivity as stop,
    getActivity, 
    activityLenghtSeconds
} from './tracking/activity';
import { Tag, getWorkspaceTags } from './tags/tag';
import addWorkspaceTagCommand from './commands/addWorkspaceTagCommand';
import removeWorkspaceTagCommand from './commands/removeWorkspaceTag';
import traggoRecorderFactory from './tracking/recorders/traggo/traggoRecorder';
import { initializeTimers } from './timers/timers';
import { initializeInactivityTimer, startActivityCheck, stopActivityCheck } from './timers/inactivityTimer';

const availibleRecorders: ITrackingRecorderFactory<IRecorderConfiguration>[]  = [
    fileBackedRecorderFactory,
    traggoRecorderFactory,
];

const commands: TWCommand[] = [
    toggleTrackingCommand,
    addWorkspaceTagCommand,
    removeWorkspaceTagCommand,
];

/**
 * Global state of the app - has to be initialized as soon as possible in activate!
 */
var appState: AppState;

export type Subscription = {dispose: () => any};

export async function activate(context: vscode.ExtensionContext) {
    const subscribe = (...subscription: Subscription[]) => {
        context.subscriptions.push(...subscription);
    };

    // Handle configuration changes
    const cfgChangeDispatcher = initializeConfigDispatcher();
    subscribe(cfgChangeDispatcher);
    vscode.workspace.onDidChangeConfiguration(e => cfgChangeDispatcher.dispatch(e));

    // Initialize timer subscription
    initializeTimers(subscribe);
    initializeInactivityTimer(
        vscode.workspace.onDidChangeTextDocument,
        vscode.workspace.onDidChangeNotebookDocument,
    );

    // Status bar button creation
    const projectName = getProjectName();
    const [statusBarButton] = useStatusBarButton(projectName);
    const projectTags = getWorkspaceTags(context);

    // Initialize app state
    appState = {
        activeRecorders: [],
        statusBarItem: statusBarButton,
        projectName: projectName,
        projectTags: projectTags,
    };

    // Register all recorder factories
    registerRecorderFactories(context);

    // Register command handlers
    registerCommands(context);

    // Show button
    statusBarButton.command = 'timeyWimey.toggleTracking';
    statusBarButton.show();
}

const registerCommands = (ctx: vscode.ExtensionContext) => {
    commands.forEach(x => {
        const cmd = vscode.commands.registerCommand(
            x.commandId, 
            () => x.commandCallback(ctx, appState).then(newAppState => { appState = newAppState; }));
            ctx.subscriptions.push(cmd);
        }
    );
};

const registerRecorderFactories = (ctx: vscode.ExtensionContext) => {
    availibleRecorders.forEach(registerRecorderFactory(ctx));
};

const registerRecorderFactory = (ctx: vscode.ExtensionContext) => (factory: ITrackingRecorderFactory<IRecorderConfiguration>) => {
    registerConfigurationKey(`recorders.${factory.key}.enabled`, async enabled => {
        if (enabled) {
            const cfg = vscode.workspace.getConfiguration('timeyWimey');
            await createRecorder(factory, ctx, cfg); 
            return;
        }
        await disableRecorder(factory.key, ctx);
    });

    const cfg = vscode.workspace.getConfiguration('timeyWimey');
    const isEnabled = cfg.get<boolean>(`recorders.${factory.key}.enabled`);

    if (isEnabled) {
        createRecorder(factory, ctx, cfg);
    }
};

const createRecorder = async (
    recorderFactory: ITrackingRecorderFactory<IRecorderConfiguration>,
    ctx: vscode.ExtensionContext,
    cfg: vscode.WorkspaceConfiguration
) => {
    const recorderKey = recorderFactory.key;
    const name = recorderFactory.name;
    // Already exists!
    if (!!appState.activeRecorders.find(x => x.key === recorderKey)) {
        vscode.window.showErrorMessage(`Error: ${name} is already active!`);
        return;
    }
    const newRecorder = await recorderFactory.create(ctx, cfg);
    if (!newRecorder) {
        vscode.window.showErrorMessage(`Error: ${name} could not be created!`);
        cfg.update(`recorders.${recorderKey}.enabled`, false);
        return;
    }
    const newActiveRecorderList = [...appState.activeRecorders, newRecorder];
    appState.activeRecorders = newActiveRecorderList;
    ctx.subscriptions.push(newRecorder);
};

const disableRecorder = async (
    recorderKey: string,
    ctx: vscode.ExtensionContext,
) => {
    const recorderToDisable: ITrackingRecorder | undefined = appState.activeRecorders.find(x => x.key === recorderKey);
    if (!recorderToDisable) {
        vscode.window.showErrorMessage(`Error: Recorder ${recorderKey} is not active`);
        return;
    }

    const currentActivity = getActivity();
    if (currentActivity) { await recorderToDisable.recordEndActivity(currentActivity); }

    const newRecorderList = appState.activeRecorders.filter(x => x.key !== recorderKey);
    appState.activeRecorders = newRecorderList;
};

const getProjectName = () => {
    return (vscode.workspace.name ?? null);
};

export const toggleActivity = () => {
    const projectName = appState.projectName;
    const statusButton = appState.statusBarItem;
    if (!projectName) {
        vscode.window.showErrorMessage("Project name is not specified!");
        return appState;
    }

    if (getActivity()) {
        stopActivity(appState.activeRecorders, statusButton);
    }
    else {
        startActivity(projectName, appState.projectTags, statusButton);
    }
};

const startActivity = async (projectName: string, tags: Tag[], button: vscode.StatusBarItem) => {
    const newActivity = start(projectName, tags);
    vscode.window.showInformationMessage(`Started tracking ${newActivity.projectName}`);
    startActivityCheck();
    showTrackingOn(button);
};

const stopActivity = async (activeRecorders: ITrackingRecorder[], button: vscode.StatusBarItem) => {
    const oldActivity = stop();
    if (!!oldActivity) {
        activeRecorders.forEach(recorder => recorder.recordEndActivity(oldActivity));
        const duration = activityLenghtSeconds(oldActivity);
        vscode.window.showInformationMessage(`Tracking stopped after ${toReadableDuration(duration)} s for ${oldActivity.projectName}`);
        stopActivityCheck();
        showTrackingOff(button);
    }
};

const toReadableDuration = (seconds: number) => {
    const overSeconds = seconds % 60;
    const minutes = Math.floor((seconds - overSeconds) / 60);
    const overMinutes = minutes % 60;
    const hours = Math.floor((minutes - overMinutes) / 60);
    const secondsString = `${overSeconds} seconds`;
    const minutesString = overMinutes > 0 ? `${overMinutes} minutes and ` : "";
    const hoursString = hours > 0 ? `${hours} hours ` : "";
    return `${hoursString}${minutesString}${secondsString}`;
};
