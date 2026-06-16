import phoenix from '../assets/phoenix-films.png';
import { useLang } from '../i18n/LanguageContext';
import { getProvider } from '../api';

const Footer = () => {
    const { lang, t } = useLang();
    const api = getProvider(lang);
    return (
        <footer className="site-footer">
            <div className="page inner">
                <div className="fbrand">
                    <img src={phoenix} alt="" />
                    <span className="wordmark" style={{ fontSize: "14px" }}>Yarphoenix Films</span>
                </div>
                <span className="fmark">© {new Date().getFullYear()} · {t("footer.tagline")} · {api.configured ? t("footer.viaApi") : t("footer.viaLocal")}</span>
            </div>
        </footer>
    );
}

export { Footer };
