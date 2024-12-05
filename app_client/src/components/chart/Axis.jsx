// Adapted from https://2019.wattenberger.com/blog/react-and-d3
import { useMemo } from "react"

const niceNumberOfTicks = (range) => {
    const length = range[1] - range[0]
    const pixelsPerTick = 30
    return Math.max(
        1,
        Math.floor(
            length / pixelsPerTick
        )
    );
}

const scaleTicks = (scale) => {
    const domain = scale.domain();
    const range = scale.range();

    if (typeof scale.bandwidth === "function") {
        // scaleBand
        return domain.map((value) => ({
            value,
            offset: scale(value)
        }))
    }
    if (typeof scale.ticks === "function") {
        // scaleLinear or scaleTime
        const numberOfTicksTarget = niceNumberOfTicks(range);

        return scale.ticks(numberOfTicksTarget)
            .map(value => ({
                value,
                offset: scale(value)
            }));
    }

    throw Error("scale not implemented")
}

export function AxisLeft({ scale, formatter, dimensions, gridLines = false }) {
    const domain = scale.domain();
    const range = scale.range();

    const ticks = useMemo(() => scaleTicks(scale),
        [
            domain.join("-"),
            range.join("-")
        ]);

    return (
        <svg overflow={"visible"}>
            <path
                d={[
                    "M", -6, range[1],
                    "h", 6,
                    "v", -range[1],
                    "h", -6,
                ].join(" ")}
                fill="none"
                stroke="currentColor"
            />

            {ticks.map(({ value, offset }) => (
                <g
                    key={value}
                    transform={`translate(0, ${range[1] - offset})`}
                >
                    <line
                        x1="-6"
                        stroke="currentColor"
                    />
                    <text
                        key={value}
                        style={{
                            fontSize: "10px",
                            textAnchor: "middle",
                            transform: "translateX(-20px)"
                        }}>
                        {formatter ? formatter(value) : String(value)}
                    </text>
                    {gridLines && dimensions && <line
                        x2={dimensions.boundedWidth}
                        stroke="currentColor"
                        strokeOpacity={.2} />}
                </g>
            ))}
        </svg>
    )
}

export function AxisBottom({ scale, label, formatter, dimensions, gridLines = false }) {
    const domain = scale.domain();
    const range = scale.range();

    const ticks = useMemo(() => scaleTicks(scale),
        [
            domain.join("-"),
            range.join("-")
        ]);

    return (
        <svg overflow={"visible"}>
            <path
                d={[
                    "M", range[0], 6,
                    "v", -6,
                    "H", range[1],
                    "v", 6,
                ].join(" ")}
                fill="none"
                stroke="currentColor"
            />

            {ticks.map(({ value, offset }, index) => {
                if (index === 0) return;
                return <g
                    key={value}
                    transform={`translate(${offset}, 0)`}
                >
                    <line
                        y2="6"
                        stroke="currentColor"
                    />
                    <text
                        key={value}
                        style={{
                            fontSize: "10px",
                            textAnchor: "middle",
                            transform: "translateY(20px)"
                        }}>
                        {formatter ? formatter(value) : String(value)}
                    </text>
                    {gridLines && dimensions && <line
                        y2={-dimensions.boundedHeight}
                        stroke="currentColor"
                        strokeOpacity={.2} />}
                </g>
            })}

            {label && <text
                textAnchor="end"
                x={dimensions.boundedWidth / 2}
                y={40}>{label}</text>}
        </svg>
    )
}