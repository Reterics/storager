import { createContext } from 'react';
import type { DBContextType } from '../interfaces/firebase.ts';

export const DBContext = createContext<DBContextType | null>(null);
