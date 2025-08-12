import AuthContextProviderMock from "./AuthContextProviderMock";
import ThemeContextProviderMock from "./ThemeContextProviderMock";
import ShopContextProviderMock from "./ShopContextProviderMock";

import type {ReactNode} from "react";
import type { Params } from 'react-router-dom';
import type {Mock} from 'vitest';
import { vi} from 'vitest'
import DBContextProviderMock from "./DBContextProviderMock.tsx";
import type {ContextData, ContextDataValueType} from "../../src/interfaces/firebase.ts";

const TestingPageProvider = ({
    children,
    ctxDataOverride,
    removeData= vi.fn(),
    setData= vi.fn(),
    refreshImagePointers= vi.fn(),
}: {
    children: ReactNode, ctxDataOverride?: ContextData,
    removeData?: Mock<()=>Promise<ContextDataValueType[] | null>>,
    setData?: Mock<()=>Promise<ContextDataValueType[] | null>>,
    refreshImagePointers?: Mock<()=>Promise<void>>,
}) => {

    vi.mock('react-router-dom', () => ({
        useParams: (): Readonly<Params<string>> => ({ taskId: '' }),
        useLocation: () => {
            return {
                pathname: '/?page='
            }
        },
        useSearchParams: () => [{'page': '', get: () => ''}]
    }));

    return (
        <AuthContextProviderMock>
            <ThemeContextProviderMock>
                <ShopContextProviderMock>
                    <DBContextProviderMock
                        removeData={removeData}
                        setData={setData}
                        refreshImagePointers={refreshImagePointers}
                        ctxDataOverride={ctxDataOverride}>
                        <div
                            className="w-full h-full m-auto flex flex-col text-black dark:text-white bg-[#ebebeb] dark:bg-black flex-1 min-h-svh">
                            <div className="main-container p-2 flex flex-col h-full flex-1">
                                {children}
                            </div>
                        </div>
                    </DBContextProviderMock>
                </ShopContextProviderMock>
            </ThemeContextProviderMock>
        </AuthContextProviderMock>
    )
}


export default TestingPageProvider;
