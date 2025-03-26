import { useState, useEffect, useRef, useMemo } from "react"
import * as d3 from "d3";
import { AxisLeft, AxisBottom } from "./Axis"
import { useChartDimensions } from "../../utils/chart";

// TODO add "padding" to domain to not have points on axis, or maybe use padding in chartDimensions
export default function GeomPoint({
    dataset = [],
    highlight,
    config = {},
    dimensions = {
        width: 500,
        height: 500
    }
}) {
    // highlight - dataset entries to highlight (bool array, same length as dataset)
    // config can contain the following:
    // config.x - dataset entry accessor name for horizontal axis
    // config.y - dataset entry accessor name for vertical axis
    // config.size - dataset entry accessor name for point size
    // config.fill - dataset entry accessor name for fill attribute
    // config.xScaleType - Horizontal scale type, needs to be a d3-scale, defaults to scaleLinear (function)
    // config.yScaleType - Vertical scale type, needs to be a d3-scale, defaults to scaleLinear (function)
    // config.xTickFormat - Horizontal axis tick format (function)
    // config.yTickFormat - Vertical axis tick format (function)
    // config.xLabel - Horizontal axis label (String)
    // config.yLabel - Vertical axis label (String)

    const ref = useRef()
    const dms = useChartDimensions(ref, dimensions)

    const xScale = useMemo(() => {
        const xScaleType = config.xScaleType ? config.xScaleType : d3.scaleLinear;

        return xScaleType()
            .domain(d3.extent(dataset, (d) => d[config.x]))
            .range([0, dms.boundedWidth]);
    }, [dms.boundedWidth, config.x, config.xScaleType])

    const yScale = useMemo(() => {
        const yScaleType = config.yScaleType ? config.yScaleType : d3.scaleLinear;

        return yScaleType()
            .domain(d3.extent(dataset, (d) => d[config.y]))
            .range([0, dms.boundedHeight]);
    }, [dms.boundedHeight, config.y, config.yScaleType])

    var zScale, fillScale;
    zScale = useMemo(() => {
        if ("size" in config) {
            const zScaleType = config.zScaleType ? config.zScaleType : d3.scaleLinear;

            return zScaleType()
                .domain(d3.extent(dataset, (d) => d[config.size]))
                .range([3, 30]);
        } else {
            return null;
        }
    }, [config.size, config.zScaleType])

    // TODO: different domain/range on different scale type
    fillScale = useMemo(() => {
        if ("fill" in config) {
            const fillScaleType = config.fillScaleType ? config.fillScaleType : d3.scaleOrdinal;

            return fillScaleType()
                .domain(new Set(dataset.map((d) => d[config.fill])))
                .range(d3.schemeSet2);
        } else {
            return null;
        }
    }, [config.fill, config.fillScaleType])


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
                            label={config.xLabel ? config.xLabel : config.x}
                            {...(config.xTickFormat && { formatter: config.xTickFormat })}
                            dimensions={dms}

                        />
                    </g>
                    <g>
                        <AxisLeft
                            scale={yScale}
                            label={config.yLabel ? config.yLabel : config.y}
                            {...(config.yTickFormat && { formatter: config.yTickFormat })}
                            dimensions={dms}
                        />
                    </g>
                    {dataset.map((d, i) => {
                        const opacity = highlight
                            ? highlight[i]
                                ? 1 : .15
                            : 1;
                        const tooltipContent = `x: ${d[config.x]}\ny: ${d[config.y]}`;
                        return <g key={i}>
                            <circle
                                opacity={opacity}
                                cx={xScale(d[config.x])}
                                cy={dms.boundedHeight - yScale(d[config.y])}
                                r={zScale ? zScale(d[config.size]) : "4"}
                                fill={fillScale ? fillScale(d[config.fill]) : "black"} />
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