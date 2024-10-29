import {useContext, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {PageHead} from "../components/elements/PageHead.tsx";
import logo from "../assets/logo.svg";
import logoWhite from "../assets/logo_white.svg";
import FormRow from "../components/elements/FormRow.tsx";
import StyledFile from "../components/elements/StyledFile.tsx";
import AlertBox from "../components/AlertBox.tsx";
import {useTheme} from "../store/ThemeContext.tsx";
import {DBContext} from "../database/DBContext.ts";
import {downloadAsFile} from "../utils/general.ts";


function About() {
    const isDarkTheme = useTheme()?.theme === 'dark';
    const { t } = useTranslation();
    const [file, setFile] = useState<File|null>(null)
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const dbContext = useContext(DBContext);

    const exportData = async () => {
        downloadAsFile('export.json', JSON.stringify(dbContext?.data || null), 'application/json');
    };

    const applyUpdate = async () => {
        const csrfNode = document.getElementById('csrf_token') as HTMLInputElement | null;
        const csrfToken = csrfNode ? csrfNode.value : '';
        const formData = new FormData();
        if (file) {
            formData.append('zip_file', file);
        }
        formData.append('csrf_token', csrfToken);
        const response = await fetch('./api/update.php', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin' // Include cookies for session
        });

        if (response.ok) {
            setMessage(t('Upload successful. Application will reload in a couple of seconds'))
            setTimeout(() => window.location.reload(), 5000);

        } else {
            setError(t('Invalid file'))
        }
    }

    useEffect(() => {
        const csrfNode = document.getElementById('csrf_token') as HTMLInputElement | null;
        const csrfToken = csrfNode ? csrfNode.value : '';
        if (!csrfToken) {
            setError(t('The connection is not protected by the web server, hence you are not able to update the application through this page.'))
        }
    }, []);
    return (<>
        <PageHead title={"About"} />
        <div className={"bg-white rounded-lg shadow m-4 dark:bg-gray-800 p-4"}>
            <a href="https://reterics.com"
               className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white flex-col">
                <img src={isDarkTheme ? logoWhite : logo} className="h-40 mr-2" alt="Reterics logo"/>
                StorageR
            </a>
            <div className={"flex flex-row justify-between items-center w-fit m-auto mb-2"}>
                <div
                    className={"text-xl font-bold leading-none tracking-tight text-gray-900 md:text-3xl lg:text-2xl dark:text-white"}>
                    {"v" + import.meta.env.PACKAGE_VERSION}
                </div>
                <div
                    className={"font-bold leading-none tracking-tight text-gray-900 md:text-2xl lg:text-xl dark:text-white ms-4"}>
                    {t(import.meta.env.PACKAGE_DESCRIPTION)}
                </div>
            </div>
            {message && <AlertBox title={t('Server Message')} message={message} role='info'/>}
            {error && <AlertBox title={t('Server Message')} message={error} role='alert'/>}
            {!error && <FormRow>
                <div>
                    {t('If you have a newer version, you have the chance to update the StorageR Web Application')}
                    <br/>
                    <strong>{t('Be Cautious:')} </strong>
                    {t('Upload content only from secure sources, otherwise you can damage your system/data')}

                </div>
                <StyledFile name="model" label={t('Update')}
                            onChange={setFile}
                />
            </FormRow> }
            <div className="mt-8">
                {file && !error && <button
                    type="button"
                    onClick={() => applyUpdate()}
                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                    {t('Upload')}
                </button>}
                {<button
                    type="button"
                    onClick={() => exportData()}
                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">

                    {t('Export Data')}
                </button>}
            </div>
        </div>

        <div className={"flex-1"}></div>
    </>);
}

export default About;
