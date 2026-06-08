import '../index.css';
import phoenix from '../assets/phoenix-films.png';
import { useT } from '../i18n/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';

const Header = ({ onHome, onFilter }) => {
    const t = useT();
    return (
        <header className="site-header">
            <div className="page bar">
                <button type="button" className="brand" onClick={onHome} aria-label={t('header.homeAria')}>
                    <img src={phoenix} alt={t('header.logoAlt')} />
                    <span className="lockup">
                        <span className="name wordmark">Yarphoenix Films</span>
                    </span>
                </button>
                <nav className="nav" aria-label={t('nav.primaryAria')}>
                    <button type="button" onClick={() => onFilter("movie")}>{t('nav.films')}</button>
                    <button type="button" onClick={() => onFilter("series")}>{t('nav.series')}</button>
                    <button type="button" onClick={() => onFilter("all")}>{t('nav.browseAll')}</button>
                    <LanguageToggle />
                </nav>
            </div>
        </header>
    );
}

export { Header };
