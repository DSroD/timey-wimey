import Activity, { toCsv, toHumanReadableString, toJson } from "../../Activity";

type ToStringFn = (activity: Activity) => string;

export type ExportFormatName = "human_readable" | "csv" | "json";

export const formaters: Map<ExportFormatName, ToStringFn> = new Map(
    [
        ["human_readable", toHumanReadableString],
        ["csv", toCsv],
        ["json", toJson],

]);

