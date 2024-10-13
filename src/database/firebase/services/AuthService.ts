import {
    browserLocalPersistence,
    createUserWithEmailAndPassword,
    setPersistence,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import {firebaseAuth} from '../config.ts';
import {LoginFormValues, UserFormValues} from "../../../interfaces/interfaces.ts";


//required if you want to keep logged in after user exits the browser or closes tab
setPersistence(firebaseAuth, browserLocalPersistence);

export const SignIn = async ({ email, password }: LoginFormValues) => {
    return await signInWithEmailAndPassword(firebaseAuth, email, password);
};

export const SignUp = async ({ email, password }: UserFormValues) => {
    return await createUserWithEmailAndPassword(firebaseAuth, email, password);
};

export const  SignOut  =  async () => {
    await signOut(firebaseAuth);
};
