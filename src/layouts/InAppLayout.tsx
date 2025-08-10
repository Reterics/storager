import { FirebaseProvider } from '../database/firebase/FirebaseProvider.tsx';
import type { ReactNode } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../store/AuthContext.tsx';
import SignInComponent from '../components/SignIn.tsx';
import PageLoading from '../components/PageLoading.tsx';
import Header from '../components/Header.tsx';
import { Footer } from '../components/Footer.tsx';

export const InAppLayout = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useContext(AuthContext);

  if (!user) return <SignInComponent />;

  return (
    <FirebaseProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <div className="main-container p-2 flex flex-col flex-1 overflow-y-auto overflow-x-auto">
          {loading && <PageLoading />}

          {!loading && children}
        </div>
        <Footer />
      </div>
    </FirebaseProvider>
  );
};
