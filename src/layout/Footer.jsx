import { useLang } from '../i18n/LanguageContext';
import { getProvider } from '../api';
import { Logo } from '../components/Logo';

const Footer = () => {
    const { lang, t } = useLang();
    const api = getProvider(lang);
    return (
        <footer className="site-footer">
            <div className="page inner">
                <div className="fbrand">
                    <Logo />
                </div>
                <span className="fmark">© {new Date().getFullYear()} · {t("footer.tagline")} · {api.configured ? t("footer.viaApi") : t("footer.viaLocal")}</span>
            </div>
        </footer>
    );
}

export { Footer };
