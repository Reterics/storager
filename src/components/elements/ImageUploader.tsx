import { useState, useEffect } from 'react';
import StyledFile from './StyledFile.tsx';
import { useTranslation } from 'react-i18next';

export const ImageUploader = ({
  setFile,
  setLocalFile,
}: {
  setFile: (file: string | null) => void;
  setLocalFile: (file: File | null) => void;
}) => {
  const { t } = useTranslation();
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    void fetchImages();
  }, []);

  const fetchImages = async () => {
    const response = await fetch('./media.php', {
      credentials: 'same-origin',
    }).catch((error) => console.error('Failed to fetch images', error));
    if (response?.ok) {
      const data = await response
        .json()
        .catch((error) => console.error('Failed to parse images', error));
      setImages(data || []);
    }
  };

  return (
    <>
      <StyledFile
        name="model"
        label={t('Image')}
        onChange={setLocalFile}
        preview={true}
        accept=".jpg,.jpeg,.png,.bmp,.webp"
        defaultPreview={undefined}
      />
      <div className="flex flex-row max-w-[90vh] flex-wrap">
        {images.map((image, index) => (
          <img
            src={`./uploads/${image}`}
            alt={'Image_' + index}
            onClick={() => setFile(`./uploads/${image}`)}
            className="w-16 h-16 m-0.5 border bg-white border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600"
          />
        ))}
      </div>
    </>
  );
};
