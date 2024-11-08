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
if (firebaseAuth) {
    setPersistence(firebaseAuth, browserLocalPersistence).catch(error => {
        console.error('SetPersistence error', error);
    });
}

export const SignIn = async ({ email, password }: LoginFormValues) => {
    return firebaseAuth ? await signInWithEmailAndPassword(firebaseAuth, email, password) : {user: null};
};

export const SignUp = async ({ email, password }: UserFormValues) => {
    return firebaseAuth ? await createUserWithEmailAndPassword(firebaseAuth, email, password) : {user: null};
};

export const  SignOut  =  async () => {
    if (firebaseAuth) {
        await signOut(firebaseAuth);
    }
};
