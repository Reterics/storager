import {createContext} from "react";
import {FirebaseContextType} from "../interfaces/firebase.ts";


export const FirebaseContext = createContext<FirebaseContextType | null>(null)
