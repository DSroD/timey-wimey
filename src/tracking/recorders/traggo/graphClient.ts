import { GraphQLClient, RequestDocument, Variables } from "graphql-request";
import { ExtensionContext, SecretStorage, window } from "vscode";
import { LoginResponse } from "./traggoTypes";
import { loginMutation } from "./queries";
import { TWError, asTWError, errToTWError, isTWError } from "../../../errors/twError";

const userKey = "timeyWimey.recorders.traggo.username";
const passKey = "timeyWimey.recorders.traggo.password";

export const withCredentials = (ctx: ExtensionContext, client: GraphQLClient) => {

    const login = async (ctx: ExtensionContext, client: GraphQLClient) => {
        const credentials = await tryGetCredentials(ctx.secrets);
        if (!credentials) {
            return asTWError("Invalid login credentials.");
        }
        
        try {
            const session = await client.request<LoginResponse>(loginMutation, credentials);
            await ctx.secrets.store(userKey, credentials.user);
            await ctx.secrets.store(passKey, credentials.pass);
            return session.login;
        } catch (error) {
            return errToTWError(error);
        }
    };
    
    return async <TResponse> (document: RequestDocument, variables?: Variables | undefined): Promise<TResponse | TWError> => {
        try {
            return await client.request<TResponse>(document, variables);
        } catch (error: any) {
            if ("message" in error && typeof(error.message) === "string" && error.message.startsWith("you need to login")) {
                const session = await login(ctx, client);
                if (isTWError(session)) {
                    return session;
                }
                client.setHeader("Authorization", `traggo ${session.token}`);
            }
            else if ("message" in error) {
                return errToTWError(error);
            }
            else {
                return asTWError("Unknown error when requesting data from Traggo GQL");
            }
        }
        // Retry with auth header
        try {
            return await client.request<TResponse>(document, variables);
        }
        catch (error: any) {
            if ("message" in error) {
                return errToTWError(error);
            }
            return asTWError("Unknown error when requesting data from Traggo GQL");
        }
        
    };
};

const tryGetCredentials = async (storage: SecretStorage) => {
    const user = (await storage.get(userKey)) ?? (await askForCredential(
        "Traggo Username:", "Username", false));
    if (!user) {
        return null;
    }
    const pass = (await storage.get(passKey)) ?? (await askForCredential(
        "Traggo Password:", "Password", true));
    if (!pass) {
        return null;
    }
    return ({
        user,
        pass,
    });
};

const askForCredential = async (propmt: string, placeHolder: string, password: boolean) => {
    const input = await window.showInputBox(
        {
            prompt: propmt,
            placeHolder: placeHolder,
            password: password,
        }
    );
    return input;
};
