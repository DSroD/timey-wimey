import { AppState } from "../AppState";
import TWCommand from "./TWCommand";
import {
    startActivity as start,
    stopActivity as stop,
    getActivity as get,
} from '../tracking/Activity';
import IConfiguration from "../config/IConfiguration";
import { StatusBarItem, window } from 'vscode';
import ITrackingRecorder from "../tracking/ITrackingRecorder";
import { showTrackingOff, showTrackingOn } from "../statusbar/StatusBarButton";


const toggleActivity = async (appState: AppState): Promise<AppState> => {
    const projectName = appState.projectName;
    const statusButton = appState.statusBarItem;
    if (!projectName) {
        window.showErrorMessage("Project name is not specified!");
        return appState;
    }

    if (get()) {
        stopActivity(appState.activeRecorders, statusButton);
    }
    else {
        startActivity(projectName, appState.projectTags, statusButton);
    }
    return appState;
};

const startActivity = async (projectName: string, tags: string[], button: StatusBarItem) => {
    const newActivity = start(projectName, tags);
    window.showInformationMessage(`Started tracking ${newActivity.projectName}`);
    showTrackingOn(button);
};

const stopActivity = async (activeRecorders: ITrackingRecorder<IConfiguration>[], button: StatusBarItem) => {
    const oldActivity = stop();
    if (!!oldActivity) {
        activeRecorders.forEach(recorder => recorder.recordActivity(oldActivity));
        window.showInformationMessage(`Tracking stopped after ${(oldActivity.stop / 1000 - oldActivity.start / 1000).toFixed(0) } s for ${oldActivity.projectName}`);
        showTrackingOff(button);
    }
};

const toggleTrackingCommand: TWCommand = {
    commandName: "Toggle tracking",
    commandId: "timeyWimey.toggleTracking",
    commandCallback: toggleActivity,
};

export default toggleTrackingCommand;