export default function Hero({ onExploreMenu }) {
    return (
        <section className="hero">
            <div className="hero-content">
                <div className="hero-subtitle">Cuisine Japonaise Raffinée</div>
                <h1>Miya Sushi</h1>
                <p>L'art du sushi dans sa forme la plus pure</p>
                <button type="button" className="btn btn-primary" onClick={onExploreMenu}>
                    Explorer la Carte
                </button>
            </div>
        </section>
    );
}
