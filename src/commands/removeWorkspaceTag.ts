import { QuickPickItem, window } from "vscode";
import TWCommand, { CommandCallback } from "./twCommand";
import { Tag, getWorkspaceTags, setWorkspaceTags, toString } from "../tags/tag";

const removeWorkspaceTag: CommandCallback = async (ctx, appState) => {
    const tags = appState.projectTags;
    const pickItems = tags.map(x => toQuickPickItem(x));
    const selectedChoice = await window.showQuickPick<Tag & QuickPickItem>(
        pickItems
    );

    if (!selectedChoice) { return appState; }

    const newTags = tags.filter(x => x.key !== selectedChoice.key);
    setWorkspaceTags(ctx, newTags);
    return {...appState, projectTags: newTags};
    
};

const toQuickPickItem = (tag: Tag): Tag & QuickPickItem => {
    return {...tag, label: toString(tag)};
};

const removeWorkspaceTagCommand: TWCommand = {
    commandName: "Remove project tag from workspace",
    commandId: "timeyWimey.removeTag",
    commandCallback: removeWorkspaceTag,
};

export default removeWorkspaceTagCommand;
