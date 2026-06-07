import phoenix from '../assets/phoenix.png';
import { FilmAPI } from '../api/filmApi';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="page inner">
                <div className="fbrand">
                    <img src={phoenix} alt="" />
                    <span className="wordmark" style={{ fontSize: "14px" }}>Yarphoenix Movies</span>
                </div>
                <span className="fmark">© {new Date().getFullYear()} · Catalogue in black &amp; white · via {FilmAPI.configured ? "API" : "local catalogue"}</span>
            </div>
        </footer>
    );
}

export { Footer };