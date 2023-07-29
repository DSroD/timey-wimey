import { Sql } from "sql-template-tag";
import { Database } from "sqlite3";

export interface DBContext {
    get <TResult> (query: Sql): Promise<TResult>,
    query (query: Sql): Promise<void>,
}

export const mkContext = (db: Database): DBContext => {
    return {
        get: mkGet(db),
        query: mkQuery(db),
    };
};

const mkGet = (db: Database) => <TResult> (query: Sql): Promise<TResult> => {
    return new Promise((resolve, reject) => {
        const queryString = query.sql;
        const params = query.values;
        db.get<TResult>(
            queryString,
            params,
            ((err: Error | null, row: TResult) => {
                if (!!err) {
                    reject(err);
                }
                resolve(row);
            }));
    });
};

const mkQuery = (db: Database) => (query: Sql): Promise<void> => {
    return new Promise((resolve, reject) => {
        const queryString = query.sql;
        const params = query.values;
        db.run(
            queryString,
            params,
            ((err: Error | null) => {
                if (!!err) { reject(err); }
                resolve();
            }));
    });
};