import * as vscode from 'vscode';
import IRecorderConfiguration from "./config/IRecorderConfiguration";
import fileBackedRecorderFactory from "./tracking/recorders/fileBacked/FileBackedRecorder";
import useStatusBarButton from './statusbar/StatusBarButton';
import toggleTrackingCommand from './commands/ToggleTrackingCommand';
import TWCommand from './commands/TWCommand';
import { AppState } from './AppState';
import { registerConfigurationKey } from './config/ConfigChangeDispatcher';
import { initialize as initializeConfigDispatcher } from './config/ConfigChangeDispatcher';
import { ITrackingRecorder, ITrackingRecorderFactory } from './tracking/ITrackingRecorder';
import { getActivity } from './tracking/Activity';
import { getWorkspaceTags } from './tags/Tag';
import addWorkspaceTagCommand from './commands/AddWorkspaceTagCommand';
import removeWorkspaceTagCommand from './commands/RemoveWorkspaceTag';
import traggoRecorderFactory from './tracking/recorders/traggo/TraggoRecorder';

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

export async function activate(context: vscode.ExtensionContext) {
    const subscribe = (...subscription: {dispose: () => any}[]) => {
        context.subscriptions.push(...subscription);
    };

    // Handle configuration changes
    const cfgChangeDispatcher = initializeConfigDispatcher();
    subscribe(cfgChangeDispatcher);
    vscode.workspace.onDidChangeConfiguration(e => cfgChangeDispatcher.dispatch(e));

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
    const recorderToDisable: ITrackingRecorder<IRecorderConfiguration> | undefined = appState.activeRecorders.find(x => x.key === recorderKey);
    if (!recorderToDisable) {
        vscode.window.showErrorMessage(`Error: Recorder ${recorderKey} is not active`);
        return;
    }

    const currentActivity = getActivity();
    if (currentActivity) { await recorderToDisable.recordActivity(currentActivity); }

    const newRecorderList = appState.activeRecorders.filter(x => x.key !== recorderKey);
    appState.activeRecorders = newRecorderList;
};

const getProjectName = () => {
    return (vscode.workspace.name ?? null);
};
