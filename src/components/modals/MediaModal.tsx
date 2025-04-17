import {
  GeneralModalButtons,
  MediaModalArguments,
} from '../../interfaces/interfaces.ts';
import {useTranslation} from 'react-i18next';
import GeneralModal from './GeneralModal.tsx';
import {ImageUploader} from '../elements/ImageUploader.tsx';
import {useState} from 'react';

export default function MediaModal({
  onClose,
  setFile,
  inPlace,
  title,
}: MediaModalArguments) {
  const {t} = useTranslation();
  const [localFile, setLocalFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!localFile) return false;

    const csrfNode = document.getElementById(
      'csrf_token'
    ) as HTMLInputElement | null;
    const csrfToken = csrfNode ? csrfNode.value : '';

    const formData = new FormData();
    formData.append('image', localFile);
    formData.append('csrf_token', csrfToken);

    try {
      const response = await fetch('./media.php', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      });
      const data = await response
        .json()
        .catch((error) => console.error('Failed to parse response', error));

      // Update CSRF token if provided in the response
      if (data && data?.token && csrfNode) {
        csrfNode.value = data.token;
      }

      if (!response.ok || !data || !data.fileName) {
        alert(data.error || 'Upload failed');
        return false;
      }
      console.log('Upload success:', data);
      setFile('./uploads/' + data.fileName);
    } catch (error) {
      console.error('Upload failed', error);
      alert((error as Error).message || 'Upload failed');
      return false;
    }
  };

  const buttons: GeneralModalButtons[] = [
    {
      primary: true,
      onClick: async () => {
        return await handleUpload();
      },
      value: t('Upload'),
    },
    {
      onClick: onClose,
      value: t('Cancel'),
    },
  ];

  return (
    <GeneralModal
      buttons={buttons}
      inPlace={inPlace}
      title={title || t('Media Browser')}
      id={'MediaModal'}
      onClose={onClose}
    >
      <div
        className={
          'flex flex-1 overflow-y-auto flex-wrap flex-row justify-center'
        }
      >
        <ImageUploader setFile={setFile} setLocalFile={setLocalFile} />
      </div>
    </GeneralModal>
  );
}

export function MediaBrowse({
  onClick,
  image,
}: {
  onClick: () => void;
  image?: string;
}) {
  const {t} = useTranslation();

  return (
    <div className='relative z-0 w-full group'>
      <div className='relative'>
        <label
          className='block mb-2 text-sm font-medium text-left text-gray-900 dark:text-gray-300'
          htmlFor={'galleryButton'}
        >
          {t('Image')}
        </label>
        {
          <input
            id={'galleryButton'}
            type='button'
            className='block w-full text-sm border border-gray-300 rounded-lg cursor-pointer bg-gray-50
                       text-gray-900 dark:text-gray-300 focus:outline-none dark:bg-gray-700 dark:border-gray-600
                       dark:placeholder-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0
                       file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-500 hover:file:bg-gray-300
                       dark:file:bg-gray-600 dark:file:text-gray-300 hover:dark:file:bg-gray-500'
            value={t('Browse')}
            onClick={() => onClick()}
          />
        }
      </div>

      {image && (
        <div className='mt-1 flex align-middle justify-center'>
          <img
            src={image}
            alt='Preview'
            className='max-w-full h-auto rounded-lg shadow-md max-h-32'
          />
        </div>
      )}
    </div>
  );
}
