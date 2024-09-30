import React from "react";


export default abstract class DBModel {
    authProvider?: ({children}: { children: React.ReactNode }) => Element

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAll(table: string): Promise<unknown[]> {
        return Promise.resolve([]);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    get(id: string, table: string): Promise<unknown> {
        return Promise.resolve(null);
    }

}
