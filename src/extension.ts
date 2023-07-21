import * as vscode from 'vscode';
import IConfiguration from "./config/IConfiguration";
import fileBackedRecorderFactory from "./recorders/fileBacked/FileBackedRecorderFactory";
import ITrackingRecorderFactory from "./tracking/ITrackingRecorderFactory";
import useStatusBarButton from './statusbar/StatusBarButton';
import toggleTrackingCommand from './commands/ToggleTrackingCommand';
import TWCommand from './commands/TWCommand';
import { AppState } from './AppState';

const availibleRecorders: ITrackingRecorderFactory<IConfiguration>[]  = [
    fileBackedRecorderFactory
];

const commands: TWCommand[] = [
    toggleTrackingCommand
];

/**
 * Global state of the app - has to be initialized as soon as possible in activate!
 */
var appState: AppState;

export async function activate(context: vscode.ExtensionContext) {
    // Status bar button creation
    const projectName = getProjectName();
    const [statusBarButton] = useStatusBarButton(projectName);

    appState = {
        activeRecorders: [],
        statusBarItem: statusBarButton,
        projectName: projectName,
        projectTags: [],
    };

    registerCommands(context.subscriptions);
    statusBarButton.command = 'timeyWimey.toggleTracking';
    statusBarButton.show();
}

function registerCommands(subscriptions: { dispose(): any; }[]) {
    commands.forEach(x => {
        const cmd = vscode.commands.registerCommand(
            x.commandId, 
            () => x.commandCallback(appState).then(newAppState => appState = newAppState));
            subscriptions.push(cmd);
        }
    );
}

function getProjectName(): string | null {
    return (vscode.workspace.name ?? null);
}