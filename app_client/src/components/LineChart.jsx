import { useEffect, useState } from "react";
import * as d3 from "d3";
import ChatController from "./ChatController";
import GeomLine from "./chart/GeomLine";
import Papa from 'papaparse'

export default function LineChart() {
    const [dataset, setDataset] = useState();
    const chartDimensions = {
        width: 700,
        height: 700,
        marginLeft: 55,
        marginRight: 30,
        marginBottom: 50,
    }
    const [chartConfig, setChartConfig] = useState({
        x: "Month",
        y: "Price",
        xScaleType: d3.scaleTime,
        xTickFormat: d3.timeFormat("%b-%Y"),
        xTicks: 12,
        xLabel: "Month",
        yLabel: "Oil Price ($)"
    })

    useEffect(() => {
        async function fetchDataset() {
            const fileResponse = await fetch("http://localhost:3000/api/files?name=LineChart.csv")
            const file = await fileResponse.json();

            const response = await fetch(`http://localhost:3000/api/files/${file[0]._id}`)
            const csvData = await response.text()
            Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                transform: (value, field) => {
                    if (field === "Month") {
                        return d3.timeParse("%b-%Y")(value)
                    }
                    return value;
                },
                complete: function (results) {
                    setDataset(results.data);
                }
            })
        }
        fetchDataset();
    }, []);

    function onChangeNli(config) {
        console.log("NLI control information: ", config);

        const changes = {};
        if (config.x) {
            changes["x"] = config.x;
        }
        if (config.y) {
            changes["y"] = config.y;
        }
        setChartConfig(prev => { return { ...prev, ...changes } })
    }

    return (
        <>
            <div className="flex w-full h-full pl-1">
                {/* Chat Component */}
                <div className="w-2/6 h-screen">
                    <ChatController
                        defaultLLM={"IEEE Vis Line Chart Example"}
                        onChangeNli={onChangeNli} />
                </div>
                {/* Vis Component */}
                <div className="w-full bg-gray-50 flex items-center pl-2">
                    {dataset && <GeomLine
                        dimensions={chartDimensions}
                        dataset={dataset}
                        config={chartConfig} />}
                </div>
            </div>

        </>
    )
}