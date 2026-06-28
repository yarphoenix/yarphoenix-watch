import { useLang } from "../i18n/LanguageContext";
import { Link } from "react-router-dom";

function NotFound() {
    const { t } = useLang();
    return (
        <div className="page">
            <div className="not-found" role="alert">
                <div className="not-found__code">404</div>
                <div className="not-found__description">
                    <p className="not-found__message">{t("notFound.message")}</p>
                    <Link className="not-fount__escape-btn chip" to="/">{t("detail.backToCatalogue")}</Link>
                </div>
            </div>
        </div>
    );
}

export { NotFound };