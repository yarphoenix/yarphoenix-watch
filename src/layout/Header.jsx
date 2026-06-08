import '../index.css';
import phoenix from '../assets/phoenix-films.png';

const Header = ({ onHome, onFilter }) => {
    return (
        <header className="site-header">
            <div className="page bar">
                <button type="button" className="brand" onClick={onHome} aria-label="YARPHOENIX MOVIES — home">
                    <img src={phoenix} alt="YARPHOENIX logo" />
                    <span className="lockup">
                        <span className="name wordmark">Yarphoenix Films</span>
                    </span>
                </button>
                <nav className="nav" aria-label="Primary">
                    <button type="button" onClick={() => onFilter("movie")}>Films</button>
                    <button type="button" onClick={() => onFilter("series")}>Series</button>
                    <button type="button" onClick={() => onFilter("all")}>Browse all</button>
                </nav>
            </div>
        </header>
    );
}

export { Header };