import { useState, useEffect, useRef, useMemo } from "react"
import * as d3 from "d3";
import { AxisLeft, AxisBottom } from "./Axis"
import { useChartDimensions } from "../../utils/chart";

// TODO add "padding" to domain to not have points on axis, or maybe use padding in chartDimensions
export default function GeomLine({
    dataset = [],
    config = {},
    dimensions = {
        width: 500,
        height: 500
    }
}) {
    // config can contain the following:
    // config.x - dataset entry accessor name for horizontal axis
    // config.y - dataset entry accessor name for vertical axis
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
    }, [dms.boundedWidth, config.xScaleType])

    const yScale = useMemo(() => {
        const yScaleType = config.yScaleType ? config.yScaleType : d3.scaleLinear;

        return yScaleType()
            .domain(d3.extent(dataset, (d) => d[config.y]))
            .range([0, dms.boundedHeight]);
    }, [dms.boundedHeight, config.yScaleType])

    const linePath = d3.line((d) => xScale(d[config.x]), (d) => yScale(d[config.y]))(dataset)

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
                            {...(config.xTicks && { nTicks: config.xTicks })}
                            dimensions={dms}
                        />
                    </g>
                    <g>
                        <AxisLeft
                            scale={yScale}
                            {...(config.yLabel && { label: config.yLabel })}
                            {...(config.yTickFormat && { formatter: config.yTickFormat })}
                            dimensions={dms}
                        />
                    </g>
                    <path d={linePath} fill="none" stroke="steelblue" strokeWidth={1.5} transform={`scale(1, -1) translate(0, -${dms.boundedHeight})`} />
                </g>
            </svg>
        </div>
    )
}