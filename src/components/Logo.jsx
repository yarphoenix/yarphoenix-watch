import logo from "../assets/yarphoenix-watch-logo.svg";
import {useT} from "../i18n/LanguageContext";

// Combined icon+wordmark mark in a single file — dark theme flips it to
// white via a CSS filter (see .brand-logo) rather than swapping source,
// since it's one flat black composition, not two theme-specific assets.
export const Logo = () => {
    const t = useT();
    return <img src={logo} alt={t('header.logoAlt')} className="brand-logo" />;
}
