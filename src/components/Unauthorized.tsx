import {useTranslation} from 'react-i18next';
import {useContext} from 'react';
import {AuthContext} from '../store/AuthContext.tsx';
import ScreenMessage from './ScreenMessage.tsx';

const UnauthorizedComponent = () => {
  const {t} = useTranslation();
  const {SignOut} = useContext(AuthContext);

  return (
    <ScreenMessage button={t('Logout')} onClick={() => SignOut()}>
      {t('401 Unauthorized - Your privileges has been revoked')}
    </ScreenMessage>
  );
};

export default UnauthorizedComponent;
