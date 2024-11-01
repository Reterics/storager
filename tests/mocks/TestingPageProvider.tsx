import AuthContextProviderMock from "./AuthContextProviderMock";
import ThemeContextProviderMock from "./ThemeContextProviderMock";
import ShopContextProviderMock from "./ShopContextProviderMock";

import {ReactNode} from "react";
import { Params } from 'react-router-dom';
import { vi } from 'vitest'
import DBContextProviderMock from "./DBContextProviderMock.tsx";
import {ContextData} from "../../src/interfaces/firebase.ts";

const TestingPageProvider = ({children, ctxDataOverride}: {
    children: ReactNode, ctxDataOverride?: ContextData
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

    vi.mock('react-i18next', () => ({
        useTranslation: ()=>({ t: (s:string) => s, i18n: {language: 'en', changeLanguage: vi.fn()} })
    }));

    return (
        <AuthContextProviderMock>
            <ThemeContextProviderMock>
                <ShopContextProviderMock>
                    <DBContextProviderMock ctxDataOverride={ctxDataOverride}>
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
