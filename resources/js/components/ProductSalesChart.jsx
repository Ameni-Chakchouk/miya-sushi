import { useMemo, useState } from 'react';

const CHART_WIDTH = 760;
const CHART_HEIGHT = 300;
const PADDING = { top: 20, right: 12, bottom: 52, left: 48 };
const GRID_LINES = 4;

const INNER_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right;
const INNER_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;

const productKey = (product) => (product.id !== null && product.id !== undefined ? `id:${product.id}` : `name:${product.name}`);

/** Arrondit l'axe vertical a une valeur lisible (5, 10, 25, 50...). */
function niceCeil(value) {
    if (value <= 5) {
        return 5;
    }

    const magnitude = 10 ** Math.floor(Math.log10(value));

    for (const step of [1, 2, 2.5, 5, 10]) {
        const candidate = step * magnitude;

        if (candidate >= value) {
            return candidate;
        }
    }

    return 10 * magnitude;
}

export default function ProductSalesChart({ stats }) {
    const [selectedKey, setSelectedKey] = useState('all');

    const months = stats?.months ?? [];
    const products = stats?.products ?? [];
    const allProducts = stats?.all_products ?? null;

    const selected = useMemo(() => {
        if (selectedKey === 'all') {
            return allProducts;
        }

        return products.find((product) => productKey(product) === selectedKey) ?? allProducts;
    }, [selectedKey, products, allProducts]);

    const series = selected?.monthly ?? [];
    const maxValue = series.length > 0 ? Math.max(...series) : 0;
    const axisMax = niceCeil(maxValue);

    const bestMonthIndex = useMemo(() => {
        if (series.length === 0 || maxValue === 0) {
            return -1;
        }

        return series.indexOf(maxValue);
    }, [series, maxValue]);

    if (months.length === 0) {
        return null;
    }

    const slotWidth = INNER_WIDTH / months.length;
    const barWidth = Math.min(slotWidth * 0.58, 44);
    const baseline = PADDING.top + INNER_HEIGHT;
    const hasData = (selected?.total_quantity ?? 0) > 0;

    return (
        <section className="sales-stats" aria-label="Statistiques de ventes par article">
            <div className="sales-stats-head">
                <div>
                    <h4 className="manager-subtitle">Ventes par article</h4>
                    <p className="sales-stats-hint">
                        Quantites vendues par mois, commandes validees uniquement.
                    </p>
                </div>

                <label className="sales-stats-picker">
                    <span>Article</span>
                    <select value={selectedKey} onChange={(event) => setSelectedKey(event.target.value)}>
                        <option value="all">Tous les articles</option>
                        {products.map((product) => (
                            <option key={productKey(product)} value={productKey(product)}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="sales-stats-kpis">
                <div className="sales-kpi">
                    <span className="sales-kpi-value">{selected?.total_quantity ?? 0}</span>
                    <span className="sales-kpi-label">Unites vendues</span>
                </div>
                <div className="sales-kpi">
                    <span className="sales-kpi-value">{Number(selected?.total_revenue ?? 0).toFixed(2)}€</span>
                    <span className="sales-kpi-label">Chiffre d'affaires</span>
                </div>
                <div className="sales-kpi">
                    <span className="sales-kpi-value">
                        {bestMonthIndex >= 0 ? months[bestMonthIndex].label : '—'}
                    </span>
                    <span className="sales-kpi-label">Meilleur mois</span>
                </div>
            </div>

            {hasData ? (
                <div className="sales-chart-wrapper">
                    <svg
                        className="sales-chart"
                        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                        role="img"
                        aria-label={`Ventes mensuelles : ${selected?.name ?? 'tous les articles'}`}
                    >
                        <defs>
                            <linearGradient id="salesBarGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--orange)" />
                                <stop offset="100%" stopColor="var(--red)" />
                            </linearGradient>
                        </defs>

                        {Array.from({ length: GRID_LINES + 1 }, (_, index) => {
                            const ratio = index / GRID_LINES;
                            const y = PADDING.top + INNER_HEIGHT * ratio;
                            const value = Math.round(axisMax * (1 - ratio));

                            return (
                                <g key={ratio}>
                                    <line
                                        x1={PADDING.left}
                                        y1={y}
                                        x2={CHART_WIDTH - PADDING.right}
                                        y2={y}
                                        className="sales-chart-grid"
                                    />
                                    <text x={PADDING.left - 10} y={y + 4} className="sales-chart-axis" textAnchor="end">
                                        {value}
                                    </text>
                                </g>
                            );
                        })}

                        {months.map((month, index) => {
                            const value = series[index] ?? 0;
                            const height = axisMax > 0 ? (value / axisMax) * INNER_HEIGHT : 0;
                            const x = PADDING.left + slotWidth * index + (slotWidth - barWidth) / 2;
                            const y = baseline - height;
                            const [monthName, year] = month.label.split(' ');
                            const showYear = index === 0 || months[index - 1].label.split(' ')[1] !== year;

                            return (
                                <g key={month.key}>
                                    {value > 0 && (
                                        <rect
                                            x={x}
                                            y={y}
                                            width={barWidth}
                                            height={height}
                                            rx="2"
                                            fill="url(#salesBarGradient)"
                                        >
                                            <title>{`${month.label} : ${value} unite(s)`}</title>
                                        </rect>
                                    )}

                                    {value > 0 && (
                                        <text
                                            x={x + barWidth / 2}
                                            y={y - 6}
                                            className="sales-chart-value"
                                            textAnchor="middle"
                                        >
                                            {value}
                                        </text>
                                    )}

                                    <text
                                        x={x + barWidth / 2}
                                        y={baseline + 18}
                                        className="sales-chart-axis"
                                        textAnchor="middle"
                                    >
                                        {monthName}
                                    </text>

                                    {showYear && (
                                        <text
                                            x={x + barWidth / 2}
                                            y={baseline + 34}
                                            className="sales-chart-year"
                                            textAnchor="middle"
                                        >
                                            {year}
                                        </text>
                                    )}
                                </g>
                            );
                        })}

                        <line
                            x1={PADDING.left}
                            y1={baseline}
                            x2={CHART_WIDTH - PADDING.right}
                            y2={baseline}
                            className="sales-chart-baseline"
                        />
                    </svg>
                </div>
            ) : (
                <div className="empty-state sales-stats-empty">
                    <div className="empty-state-icon">📈</div>
                    <p>Aucune vente validee sur cette periode</p>
                </div>
            )}

            {products.length > 0 && (
                <div className="sales-ranking">
                    <h5 className="sales-ranking-title">Classement sur 12 mois</h5>
                    <div className="sales-ranking-list">
                        {products.map((product, index) => {
                            const leader = products[0]?.total_quantity || 1;
                            const ratio = Math.max((product.total_quantity / leader) * 100, 2);
                            const isSelected = productKey(product) === selectedKey;

                            return (
                                <button
                                    type="button"
                                    key={productKey(product)}
                                    className={isSelected ? 'sales-ranking-row is-selected' : 'sales-ranking-row'}
                                    onClick={() => setSelectedKey(productKey(product))}
                                >
                                    <span className="sales-ranking-rank">{index + 1}</span>
                                    <span className="sales-ranking-name">{product.name}</span>
                                    <span className="sales-ranking-bar" aria-hidden="true">
                                        <span style={{ width: `${ratio}%` }} />
                                    </span>
                                    <span className="sales-ranking-qty">{product.total_quantity}</span>
                                    <span className="sales-ranking-revenue">
                                        {Number(product.total_revenue).toFixed(2)}€
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
}
