import React from "react";


export default abstract class DBModel {
    authProvider?: ({children}: { children: React.ReactNode }) => Element

    getAll(): unknown[] {
        return []
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    get(id: string): unknown {
        return null;
    }

}
