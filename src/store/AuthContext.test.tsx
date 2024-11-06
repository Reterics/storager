import {vi, expect, describe, it, Mock} from "vitest";
import '../../tests/mocks/firebase.ts'
import {render, waitFor} from "@testing-library/react";
import { AuthContext } from "./AuthContext";
import AuthProvider from "./AuthContext";
import {currentUserMock} from "../../tests/mocks/userData.ts";
import {UserFormValues} from "../interfaces/interfaces.ts";

import { SignIn, SignUp, SignOut } from "../database/firebase/services/AuthService.ts";

// Mock Firebase and navigation functions
vi.mock("../database/firebase/services/AuthService.ts", () => ({
    SignIn: vi.fn(),
    SignUp: vi.fn(),
    SignOut: vi.fn(),
}));

vi.mock("../database/firebase/config.ts", () => ({
    firebaseAuth: () => {
        return {
            currentUser: currentUserMock,
        }
    },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    BrowserRouter: ({children}: {children: React.ReactNode})=><div>{children}</div>
}));

import {BrowserRouter as Router} from "react-router-dom";

describe("AuthContext", () => {
    it("should provide default auth values", async () => {
        const { getByText } = render(
            <Router>
                <AuthProvider>
                    <AuthContext.Consumer>
                        {value => (
                            <>
                                <div>{value.user ? "Logged In" : "Logged Out"}</div>
                                <div>{value.loading ? "Loading" : "Not Loading"}</div>
                            </>
                        )}
                    </AuthContext.Consumer>
                </AuthProvider>
            </Router>
        );

        expect(getByText("Logged In")).toBeInTheDocument();
        expect(getByText("Not Loading")).toBeInTheDocument();
    });

    it("should call SignIn with correct credentials and navigate on success", async () => {
        const mockCredentials = { email: "test@test.com", password: "password" };
        (SignIn as Mock).mockResolvedValueOnce({ user: { uid: "12345" } });

        const { getByText } = render(
            <Router>
                <AuthProvider>
                    <AuthContext.Consumer>
                        {({ SignIn }) => (
                            <button onClick={() => SignIn(mockCredentials)}>Sign In</button>
                        )}
                    </AuthContext.Consumer>
                </AuthProvider>
            </Router>
        );

        getByText("Sign In").click();

        await waitFor(() => {
            expect(SignIn).toHaveBeenCalledWith(mockCredentials);
            expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
        });
    });

    it("should handle sign-in error and set error state", async () => {
        const mockCredentials = { email: "error@test.com", password: "wrongpassword" };
        (SignIn as Mock).mockRejectedValueOnce({ code: "auth/wrong-password" });

        const { getByText, queryByText } = render(
            <Router>
                <AuthProvider>
                    <AuthContext.Consumer>
                        {({ SignIn, error }) => (
                            <>
                                <button onClick={() => SignIn(mockCredentials)}>Sign In</button>
                                <div>{error}</div>
                            </>
                        )}
                    </AuthContext.Consumer>
                </AuthProvider>
            </Router>
        );

        getByText("Sign In").click();

        await waitFor(() => {
            expect(SignIn).toHaveBeenCalledWith(mockCredentials);
            expect(queryByText("auth/wrong-password")).toBeInTheDocument();
        });
    });

    it("should call SignUp with correct credentials and navigate on success", async () => {
        const mockCredentials = { email: "signup@test.com", password: "newpassword" };
        (SignUp as Mock).mockResolvedValueOnce({ user: { uid: "67890" } });

        const { getByText } = render(
            <Router>
                <AuthProvider>
                    <AuthContext.Consumer>
                        {({ SignUp }) => (
                            <button onClick={() => SignUp(mockCredentials as UserFormValues)}>Sign Up</button>
                        )}
                    </AuthContext.Consumer>
                </AuthProvider>
            </Router>
        );

        getByText("Sign Up").click();

        await waitFor(() => {
            expect(SignUp).toHaveBeenCalledWith(mockCredentials);
            expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
        });
    });

    it("should call SignOut and navigate to /signin on success", async () => {
        (SignOut as Mock).mockResolvedValueOnce(null);

        const { getByText } = render(
            <Router>
                <AuthProvider>
                    <AuthContext.Consumer>
                        {({ SignOut }) => (
                            <button onClick={() => SignOut()}>Sign Out</button>
                        )}
                    </AuthContext.Consumer>
                </AuthProvider>
            </Router>
        );

        getByText("Sign Out").click();

        await waitFor(() => {
            expect(SignOut).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith("/signin", { replace: true });
        });
    });
});
