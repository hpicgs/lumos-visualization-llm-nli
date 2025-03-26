import { useRef, useMemo } from "react"
import * as d3 from "d3";
import { useChartDimensions } from "../../utils/chart";

// TODO add "padding" to domain to not have points on axis, or maybe use padding in chartDimensions
export default function GeomChoropleth({
    dataset = [],
    highlight = [],
    config = {},
    dimensions = {
        width: 500,
        height: 500
    }
}) {
    // config can contain the following:
    // config.geoJSON - GeoJSON feature collection of the map
    // config.fill - dataset entry accessor name for fill attribute
    const ref = useRef()
    const dms = useChartDimensions(ref, dimensions)

    const fillScale = useMemo(() => {
        const fillScaleType = config.fillScaleType ? config.fillScaleType : d3.scaleSequential;

        return fillScaleType(d3.interpolateBlues)
            .domain([0, d3.max(dataset, (d) => d[config.fill])])
    }, [config.fill, config.fillScaleType])

    const projection = d3
        .geoAlbersUsa()
        .translate([dms.width / 2, dms.height / 2]);
    const path = d3.geoPath().projection(projection);
    const b = path.bounds(config.geoJSON);
    const scale = 1.03 * Math.max(
        (b[1][0] - b[0][0]),
        (b[1][1] - b[0][1])
    );
    projection.scale(scale);

    const geomap = new Map(config.geoJSON.features.map(d => [parseInt(d.id), d]));

    // Legend
    const legendWidth = 300;
    const legendHeight = 50;
    const legendMarginTop = 70;
    const legendMarginLeft = dms.width / 2;

    const legendScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, (d) => d[config.fill])])
        .range([0, legendWidth]);

    return (
        <div ref={ref}>
            <svg width={dms.width} height={dms.height}>
                {/* Plot */}
                <g transform={`translate(${[
                    dms.marginLeft,
                    dms.marginTop
                ].join(",")})`}>
                    {dataset.map((d, i) => {
                        const geo = geomap.get(d.id)

                        const opacity = highlight
                            ? highlight[i]
                                ? 1 : .15
                            : 1;
                        const borderColor = highlight.includes(false)
                            ? highlight[i]
                                ? "red" : "white"
                            : "white";
                        const tooltipContent = `${geo.properties.name}: ${d[config.fill]} %`;

                        return <g key={d.id}>
                            <path
                                fill={fillScale(d[config.fill])}
                                opacity={opacity}
                                stroke={borderColor}
                                strokeWidth={.5}
                                d={path(geo)}
                            />
                            <title>
                                {tooltipContent}
                            </title>
                        </g>
                    })}
                </g>
                {/* Legend */}
                <g transform={`translate(${legendMarginLeft}, ${legendMarginTop})`}>
                    <defs>
                        <linearGradient id="legendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: fillScale(0), stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: fillScale(legendScale.domain()[1]), stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>

                    {/* Rect for the gradient legend */}
                    <rect
                        x={0}
                        y={0}
                        width={legendWidth}
                        height={15}
                        fill="url(#legendGradient)"
                    />

                    {/* Legend scale ticks */}
                    {legendScale.ticks(5).map((tickValue, idx) => (
                        <g key={idx} transform={`translate(${legendScale(tickValue)}, 0)`}>
                            <line
                                y1={0}
                                y2={25}
                                stroke="#000"
                                strokeWidth={1}
                            />
                            <text
                                x={0}
                                y={36}
                                fontSize={12}
                                textAnchor="middle"
                            >
                                {Math.round(tickValue)}
                            </text>
                        </g>
                    ))}
                </g>
            </svg>
        </div>
    )
}