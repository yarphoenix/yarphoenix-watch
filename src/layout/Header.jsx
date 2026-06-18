import '../index.css';
import { useT } from '../i18n/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { ThemeToggle } from '../components/ThemeToggle';
import { Logo } from '../components/Logo';

const Header = ({ onHome }) => {
    const t = useT();
    return (
        <header className="site-header">
            <div className="page bar">
                <button type="button" className="brand" onClick={onHome} aria-label={t('header.homeAria')}>
                    <Logo />
                </button>
                <nav className="nav" aria-label={t('nav.primaryAria')}>
                    <LanguageToggle />
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
}

export { Header };
