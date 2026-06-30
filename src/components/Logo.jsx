import whitePhoenix from "../assets/phoenix-watch-white.png";
import phoenix from "../assets/phoenix-watch.png";
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
                                width: "min-content",
                                whiteSpace: "normal",
                            }
                        }>
                            Yarphoenix Watch
                        </span>
            </span>
        </>
    )
}