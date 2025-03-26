import { useEffect, useState } from "react";
import * as d3 from "d3";
import ChatController from "./ChatController";
import GeomPoint from "./chart/GeomPoint"
import Papa from 'papaparse'

export default function ScatterPlot() {
    const [dataset, setDataset] = useState();
    const [highlight, setHighlight] = useState();
    const chartDimensions = {
        width: 700,
        height: 700,
        marginLeft: 50,
        marginRight: 30,
        marginBottom: 50,
    }
    const [chartConfig, setChartConfig] = useState({
        x: "height(cm)",
        y: "weight(kg)",
        // xLabel: "Height (cm)",
        // yLabel: "Weight (kg)"
    })

    useEffect(() => {
        async function fetchDataset() {
            const fileResponse = await fetch("http://localhost:3000/api/files?name=scatter.csv")
            const file = await fileResponse.json();

            const response = await fetch(`http://localhost:3000/api/files/${file[0]._id}`)
            const csvData = await response.text()
            Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
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
        } else if (config.highlight && config.highlight.length === 0) {
            setHighlight(Array(dataset.length).fill(true))
        }

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
                        defaultLLM={"IEEE Vis Scatterplot Example"}
                        onChangeNli={onChangeNli} />
                </div>
                {/* Vis Component */}
                <div className="w-full bg-gray-50 flex items-center pl-2">
                    {dataset && <GeomPoint
                        dimensions={chartDimensions}
                        dataset={dataset}
                        highlight={highlight}
                        config={chartConfig} />}
                </div>
            </div>

        </>
    )
}