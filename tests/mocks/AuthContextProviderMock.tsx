import './firebase.ts';
import {AuthContext} from "../../src/store/AuthContext";
import type {IAuth} from "../../src/interfaces/interfaces";
import { vi } from 'vitest'
import {currentUserMock} from "./userData";


const AuthContextProviderMock = ({children}:{children: React.ReactNode}) => {
    const authValues: IAuth = {
        user: currentUserMock,
        loading: false,
        SignIn: vi.fn(),
        SignUp: vi.fn(),
        SignOut: vi.fn(),
        error: null
    }

    return (
        <AuthContext.Provider value={authValues}>{children}</AuthContext.Provider>
    )
}

export default AuthContextProviderMock;
