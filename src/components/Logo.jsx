import whitePhoenix from "../assets/phoenix-films-white.png";
import phoenix from "../assets/phoenix-films.png";
import {useTheme} from "../theme/ThemeContext";
import {useT} from "../i18n/LanguageContext";

export const Logo = () => {
    const t = useT();
    const { theme } = useTheme();
    const dark = theme === "dark";

    return (
        <>
            <img src={dark ? whitePhoenix : phoenix} alt={t('header.logoAlt')} />
            <span className="lockup">
                        <span className="name wordmark" style={
                            {
                                display: "inline-block",
                                width: 50
                            }
                        }>
                            Yarphoenix Films
                        </span>
            </span>
        </>
    )
}