import { ExtensionContext, workspace } from "vscode";

export type Tag = {
    key: string,
    value: string,
};

export const toString = (tag: Tag) => `${tag.key}: ${tag.value}`;

export const getWorkspaceTags = (ctx: ExtensionContext) => {
    return ctx.workspaceState.get<Tag[]>('timeyWimey.tags') ?? [];
};

export const setWorkspaceTags = (ctx: ExtensionContext, tags: Tag[]) => {
    ctx.workspaceState.update('timeyWimey.tags', tags);
};
