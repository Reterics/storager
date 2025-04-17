import GeneralModal from './GeneralModal.tsx';
import {useTranslation} from 'react-i18next';
import TableViewComponent from '../elements/TableViewComponent.tsx';
import {ListModalArguments} from '../../interfaces/interfaces.ts';

export default function ListModal({
  lines,
  header,
  inPlace,
  title,
  buttons,
}: ListModalArguments) {
  const {t} = useTranslation();
  return (
    <GeneralModal
      buttons={buttons}
      inPlace={inPlace}
      title={title || t('List Modal')}
      id={'ListModal'}
    >
      <TableViewComponent lines={lines} header={header}></TableViewComponent>
    </GeneralModal>
  );
}
