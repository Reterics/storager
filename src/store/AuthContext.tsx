import {firebaseAuth} from '../firebase/BaseConfig';
import React, {createContext, useEffect, useState} from 'react';
import {IAuth, LoginFormValues, UserFormValues} from "../interfaces/interfaces.ts";
import {useNavigate} from 'react-router-dom';
import {SignIn, SignOut, SignUp} from "../firebase/services/AuthService.ts";
import {onAuthStateChanged, User} from 'firebase/auth';
import PageLoading from "../components/PageLoading.tsx";
import {FIREBASE_ERRORS} from "./FirebaseErrors.ts";

export const AuthContext = createContext<IAuth>({
    user: firebaseAuth.currentUser,
    loading: false,
    SignIn: () => {},
    SignUp: () => {},
    SignOut: () => {},
    error: null
});


const AuthProvider = ({children}: { children: React.ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
    const [error, setError] = useState<string|null>(null);
    const navigate = useNavigate();

    const setTranslatedError = (code: string) => {
        setError(FIREBASE_ERRORS[code as keyof typeof FIREBASE_ERRORS] || code);
    };

    const SignUpMethod = (credentials: UserFormValues) => {
        setIsLoading(true);
        SignUp(credentials)
            .then(async userCredential => {
                const {user} = userCredential; //object destructuring
                if (user) {
                    setCurrentUser(user);
                    //redirect the user on the targeted route
                    navigate('/', {replace: true});
                } else {
                    setTranslatedError("auth/user-not-found");
                }
                setIsLoading(false);
            })
            .catch(error => {
                setTranslatedError(error.code);
                // you can check for more error like email not valid or something
                setIsLoading(false);
            });
    }

    const SignInMethod = async (creds: LoginFormValues) => {
        console.log('Sign via', creds)
        setIsLoading(true);
        SignIn(creds)
            .then(userCredential => {
                const {user} = userCredential;
                if (user) {
                    setCurrentUser(user);
                    //redirect user to targeted route
                    navigate('/', {replace: true});
                } else {
                    setTranslatedError("auth/user-not-found");
                }
                setIsLoading(false);
            })
            .catch(error => {
                setTranslatedError(error.code);
                setIsLoading(false);
            });
    }

    const SignOutMethod = async () => {
        setIsLoading(true);
        try {
            await SignOut();
            setCurrentUser(null);
            setIsLoading(false);
            navigate('/signin', {replace: true});
        } catch (error) {
            setIsLoading(false);
            //show error alert
        }
    }
    //create Auth Values
    const authValues: IAuth = {
        user: currentUser,
        loading: isLoading,
        SignIn: SignInMethod,
        SignUp: SignUpMethod,
        SignOut: SignOutMethod,
        error: error
    }

    useEffect(() => {
        //onAuthStateChanged check if the user is still logged in or not
        return onAuthStateChanged(firebaseAuth, user => {
            setCurrentUser(user);
            setIsAuthLoading(false);
        });
    }, []);

    //If loading for the first time when visiting the page
    if (isAuthLoading) return <PageLoading/>;

    return (
        <AuthContext.Provider value={authValues}>{children}</AuthContext.Provider>
    );
};

export default AuthProvider;