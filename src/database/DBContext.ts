import {createContext} from "react";
import {DBContextType} from "../interfaces/firebase.ts";

export const DBContext = createContext<DBContextType | null>(null)
