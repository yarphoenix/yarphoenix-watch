import '../index.css';
import phoenix from '../assets/phoenix-films.png';
import { useT } from '../i18n/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';

const Header = ({ onHome }) => {
    const t = useT();
    return (
        <header className="site-header">
            <div className="page bar">
                <button type="button" className="brand" onClick={onHome} aria-label={t('header.homeAria')}>
                    <img src={phoenix} alt={t('header.logoAlt')} />
                    <span className="lockup">
                        <span className="name wordmark" style={
                            {display: "inline-block",
                            width: 50}
                        }>
                            Yarphoenix Films
                        </span>
                    </span>
                </button>
                <nav className="nav" aria-label={t('nav.primaryAria')}>
                    <LanguageToggle />
                </nav>
            </div>
        </header>
    );
}

export { Header };
