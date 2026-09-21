/**
 * Coordonnees du restaurant. Regroupees ici pour n'avoir qu'un seul endroit
 * a modifier si elles changent.
 */
const CONTACT = {
    address: 'Route KAID MHAMAD KM2 SFAX, Sidi Abbes, Sfax Sud, Sfax 3062',
    phoneDisplay: '+216 28 820 982',
    phoneHref: 'tel:+21628820982',
    email: 'miyasushi.tunisie@outlook.com',
};

const SOCIALS = [
    {
        name: 'Instagram',
        href: 'https://www.instagram.com/miyasushi_sfax/',
        icon: (
            <>
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
            </>
        ),
    },
];

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.address)}`;

function Icon({ children, label }) {
    return (
        <svg
            className="footer-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden={label ? undefined : 'true'}
            role={label ? 'img' : undefined}
            aria-label={label}
        >
            {children}
        </svg>
    );
}

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <img className="footer-logo" src="/images/logo-miya-sushi.png" alt="Miya Sushi" />
                    <p className="footer-tagline">L'art du sushi dans sa forme la plus pure.</p>
                </div>

                <div className="footer-col">
                    <h3 className="footer-title">Nous trouver</h3>
                    <ul className="footer-list">
                        <li>
                            <Icon>
                                <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
                                <circle cx="12" cy="10" r="2.6" />
                            </Icon>
                            <a
                                className="footer-link"
                                href={mapsHref}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {CONTACT.address}
                            </a>
                        </li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h3 className="footer-title">Nous contacter</h3>
                    <ul className="footer-list">
                        <li>
                            <Icon>
                                <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z" />
                            </Icon>
                            <a className="footer-link" href={CONTACT.phoneHref}>
                                {CONTACT.phoneDisplay}
                            </a>
                        </li>
                        <li>
                            <Icon>
                                <rect x="3" y="5" width="18" height="14" rx="2" />
                                <path d="m3.5 7 8.5 6 8.5-6" />
                            </Icon>
                            <a className="footer-link" href={`mailto:${CONTACT.email}`}>
                                {CONTACT.email}
                            </a>
                        </li>
                    </ul>

                    <h3 className="footer-title footer-title-social">Nous suivre</h3>
                    <div className="footer-socials">
                        {SOCIALS.map((social) => (
                            <a
                                key={social.name}
                                className="footer-social"
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={social.name}
                                title={social.name}
                            >
                                <Icon>{social.icon}</Icon>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <span>© {new Date().getFullYear()} Miya Sushi — Tous droits réservés.</span>
            </div>
        </footer>
    );
}
