import '../index.css';
import { Link } from 'react-router-dom';
import { useT } from '../i18n/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { ThemeToggle } from '../components/ThemeToggle';
import { Logo } from '../components/Logo';

const Header = () => {
    const t = useT();
    return (
        <header className="site-header">
            <div className="page bar">
                <Link to="/" className="brand" aria-label={t('header.homeAria')}>
                    <Logo />
                </Link>
                <nav className="nav" aria-label={t('nav.primaryAria')}>
                    <LanguageToggle />
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
}

export { Header };
