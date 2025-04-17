import {FirebaseProvider} from '../database/firebase/FirebaseProvider.tsx';
import {ReactNode, useContext} from 'react';
import {AuthContext} from '../store/AuthContext.tsx';
import SignInComponent from '../components/SignIn.tsx';
import PageLoading from '../components/PageLoading.tsx';
import Header from '../components/Header.tsx';
import {Footer} from '../components/Footer.tsx';

export const InAppLayout = ({children}: {children: ReactNode}) => {
  const {user, loading} = useContext(AuthContext);

  if (!user) return <SignInComponent />;

  return (
    <FirebaseProvider>
      <Header />
      <div className='main-container p-2 flex flex-col h-full flex-1'>
        {loading && <PageLoading />}

        {!loading && children}
      </div>
      <Footer />
    </FirebaseProvider>
  );
};
