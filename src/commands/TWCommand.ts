import { ExtensionContext } from "vscode";
import { AppState } from "../AppState";

interface TWCommand {
    commandName: string,
    commandId: string,
    commandCallback: (ctx: ExtensionContext, appState: AppState) => Promise<AppState>,
}

export default TWCommand;