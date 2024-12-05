import { useEffect, useState } from "react";
import * as d3 from "d3";
import ChatController from "./ChatController";
import CandlestickChart from "./chart/CandlestickChart";
import Papa from 'papaparse'

export default function Candlestick() {
    const [dataset, setDataset] = useState();
    const [highlight, setHighlight] = useState();
    const chartDimensions = {
        width: 1100,
        height: 850,
        marginLeft: 45,
        marginRight: 30,
        marginBottom: 50,
        marginTop: 50
    }
    const [chartConfig, setChartConfig] = useState({
        x: "Date",
        open: "Open",
        high: "High",
        low: "Low",
        close: "Close",
        xScaleType: d3.scaleBand,
        xTickFormat: d3.timeFormat("%V"),
        yTickFormat: (value) => `$${value}`,
        xLabel: "Calendar Week",
        fill: ["green", "red"]
    })

    useEffect(() => {
        async function fetchDataset() {
            const fileResponse = await fetch("http://localhost:3000/api/files?name=Volkswagen_Candlestick.csv")
            const file = await fileResponse.json();

            const response = await fetch(`http://localhost:3000/api/files/${file[0]._id}`)
            const csvData = await response.text()
            Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                transform: (value, field) => {
                    if (field === "Date") {
                        return d3.timeParse("%m/%d/%Y")(value)
                    }
                    return value;
                },
                complete: function (results) {
                    setDataset(results.data);
                    setHighlight(Array(results.data.length).fill(true))
                }
            })
        }
        fetchDataset();
    }, []);

    function onChangeNli(config) {
        console.log("NLI control information: ", config);

        if (config.highlight && config.highlight.length > 0) {
            const mask = Array(dataset.length).fill(false);
            config.highlight.map(index => { mask[index] = true });
            setHighlight(mask);
        } else {
            setHighlight(Array(dataset.length).fill(true))
        }
        if (config.fill) {
            setChartConfig(prev => { return { ...prev, fill: config.fill } })
        }
    }

    return (
        <>
            <div className="flex w-full h-full pl-1">
                {/* Chat Component */}
                <div className="w-1/5 ">
                    <ChatController
                        defaultLLM={"Eurovis Candlestick Chart"}
                        onChangeNli={onChangeNli} />
                </div>
                {/* Vis Component */}
                <div className="w-full bg-gray-50 flex items-center pl-2">
                    {dataset && <CandlestickChart
                        title={"Volkswagen AG's weekly stock price movements in 2024"}
                        dimensions={chartDimensions}
                        dataset={dataset}
                        highlight={highlight}
                        config={chartConfig} />}
                </div>
            </div>

        </>
    )
}