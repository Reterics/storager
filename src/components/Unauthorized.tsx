import {useTranslation} from "react-i18next";
import logo from "/brand.svg";
import {SignOut} from "../firebase/services/AuthService.ts";


const UnauthorizedComponent = () => {
    const { t } = useTranslation();

    return (
        <div onClick={()=>SignOut()}
            className="page-loading fixed top-0 h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center z-50">

            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0 mb-8">
                <a href="https://reterics.com"
                   className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white flex-col">
                    <img src={logo} className="h-40 mr-2" alt="Reterics logo"/>
                    StorageR
                </a>


                <div className={"font-normal text-xl mt-2 text-center items-center"}>
                    {t('401 Unauthorized - Your privileges has been revoked')}
                </div>
            </div>

        </div>
    );
};


export default UnauthorizedComponent;
