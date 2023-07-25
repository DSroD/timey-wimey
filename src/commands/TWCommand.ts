import { ExtensionContext } from "vscode";
import { AppState } from "../AppState";

export type CommandCallback = (ctx: ExtensionContext, appState: AppState) => Promise<AppState>;

interface TWCommand {
    commandName: string,
    commandId: string,
    commandCallback: CommandCallback,
}

export default TWCommand;