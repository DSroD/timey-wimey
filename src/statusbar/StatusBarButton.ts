import * as vscode from 'vscode';

const disabledBackground =  new vscode.ThemeColor('statusBarItem.errorBackground');
const statusBarButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
statusBarButton.backgroundColor = disabledBackground;

const useStatusBarButton = (projectName: string | null): [vscode.StatusBarItem] => {
    if (projectName) { statusBarButton.text = buttonText(projectName); }
    return [statusBarButton];
};

export const showTrackingOn = (statusBarButton: vscode.StatusBarItem) => {
    statusBarButton.backgroundColor = undefined;
};

export const showTrackingOff = (statusBarButton: vscode.StatusBarItem) => {
    statusBarButton.backgroundColor = disabledBackground;
};

const buttonText = (projectName: string | null) => {
    if (projectName) { return `Time Tracking (${projectName})`; }
    return `Time Tracking (no project)`;
};

export default useStatusBarButton;