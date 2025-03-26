import { useState, useEffect, useRef, useMemo } from "react"
import * as d3 from "d3";
import { AxisLeft, AxisBottom } from "./Axis"
import { useChartDimensions } from "../../utils/chart";

// TODO add "padding" to domain to not have points on axis, or maybe use padding in chartDimensions
export default function GeomCandlestick({
    dataset = [],
    highlight,
    config = {},
    dimensions = {
        width: 500,
        height: 500,
        marginTop: 31,
        marginLeft: 50
    }
}) {
    // highlight - dataset entries to highlight (bool array, same length as dataset)
    // config can contain the following:
    // config.x - dataset entry accessor name for horizontal axis
    // config.open - dataset entry accessor name for open price
    // config.high - dataset entry accessor name for high price
    // config.low - dataset entry accessor name for low price
    // config.close - dataset entry accessor name for close price
    // config.xScaleType - Horizontal scale type, needs to be a d3-scale, defaults to scaleLinear (function)
    // config.yScaleType - Vertical scale type, needs to be a d3-scale, defaults to scaleLinear (function)
    // config.xTickFormat - Horizontal axis tick format (function)
    // config.yTickFormat - Vertical axis tick format (function)
    // config.xLabel - Horizontal axis label (String)
    // config.fill - candle color [close > open, open > close]
    const ref = useRef()
    const dms = useChartDimensions(ref, dimensions)

    const xScale = useMemo(() => {
        const xScaleType = config.xScaleType ? config.xScaleType : d3.scaleLinear;
        // add artificial value to domain to not have a candle on the vertical axis, diff is a heuristic, only works with evenly spaced values
        const diff = dataset.at(1)[config.x] - dataset.at(0)[config.x]
        const _domain = [dataset.at(0)[config.x] - diff, ...dataset.map((d) => d[config.x])]
        return xScaleType()
            .domain(_domain)
            .range([0, dms.boundedWidth]);
    }, [dms.boundedWidth, config.xScaleType])

    const y = [].concat(
        dataset.map((d) => d[config.open]),
        dataset.map((d) => d[config.high]),
        dataset.map((d) => d[config.low]),
        dataset.map((d) => d[config.close])
    )
    const yScale = useMemo(() => {
        const yScaleType = config.yScaleType ? config.yScaleType : d3.scaleLinear;

        return yScaleType()
            .domain(d3.extent(y))
            .range([0, dms.boundedHeight]);
    }, [dms.boundedHeight, config.yScaleType])

    return (
        <div ref={ref}>
            <svg width={dms.width} height={dms.height}>
                <g transform={`translate(${[
                    dms.marginLeft,
                    dms.marginTop
                ].join(",")})`}>
                    <g transform={`translate(${[
                        0,
                        dms.boundedHeight,
                    ].join(",")})`}>
                        <AxisBottom
                            scale={xScale}
                            {...(config.xLabel && { label: config.xLabel })}
                            {...(config.xTickFormat && { formatter: config.xTickFormat })}
                            dimensions={dms}
                        />
                    </g>
                    <g>
                        <AxisLeft
                            scale={yScale}
                            {...(config.yTickFormat && { formatter: config.yTickFormat })}
                            dimensions={dms}
                            gridLines={true}
                        />
                    </g>
                    {dataset.map((d, i) => {
                        const opacity = highlight
                            ? highlight[i]
                                ? 1 : .15
                            : 1;
                        const tooltipContent = `Open: ${d[config.open]}\nClose: ${d[config.close]}\nLow: ${d[config.low]}\nHigh: ${d[config.high]}`;
                        const color = {
                            up: config.fill && config.fill[0] ? config.fill[0] : "green",
                            down: config.fill && config.fill[1] ? config.fill[1] : "red"
                        }
                        return <g
                            key={i}
                            transform={`translate(${[xScale(d[config.x]), 0].join(",")})`}
                            stroke="black"
                            opacity={opacity}>
                            <line
                                y1={dms.boundedHeight - yScale(d[config.low])}
                                y2={dms.boundedHeight - yScale(d[config.high])} />
                            <line
                                y1={dms.boundedHeight - yScale(d[config.open])}
                                y2={dms.boundedHeight - yScale(d[config.close])}
                                strokeWidth={15}
                                stroke={d[config.open] > d[config.close]
                                    ? color.down
                                    : d[config.close] > d[config.open]
                                        ? color.up
                                        : "grey"} />
                            <title>
                                <text>{tooltipContent}</text>
                            </title>
                        </g>
                    })}
                </g>
            </svg>
        </div>
    )
}