import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { firebaseAuth } from '../config.ts';
import type {
  LoginFormValues,
  UserFormValues,
} from '../../../interfaces/interfaces.ts';

// Persistence is configured centrally in firebase/config.ts using initializeAuth

export const SignIn = async ({ email, password }: LoginFormValues) => {
  return firebaseAuth
    ? await signInWithEmailAndPassword(firebaseAuth, email, password)
    : { user: null };
};

export const SignUp = async ({ email, password }: UserFormValues) => {
  return firebaseAuth
    ? await createUserWithEmailAndPassword(firebaseAuth, email, password)
    : { user: null };
};

export const SignOut = async () => {
  if (firebaseAuth) {
    await signOut(firebaseAuth);
  }
};
