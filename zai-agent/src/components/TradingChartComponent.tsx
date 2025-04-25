'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as echarts from "echarts";
import {useEffect, useRef} from "react";
import BigNumber from "bignumber.js";
import {
    formatNumber,
    formatPrice,
    formatTimestampToHours,
    formatTimestampToMouth,
    formatTimestampToYear, translateAmount
} from "@/utils/utils";
import dayjs from 'dayjs';

interface Props {
    list: any[];
    type: number;
    category: number;
}
let lineChart: echarts.ECharts | null = null;
const ChartComponent: React.FC<Props> = ({list, type, category}) => {
    const chartRef = useRef(null);

    let chartFirstPrice: any;
    let chartLastPrice: any;

    const initChart = () => {
        if (list.length === 0) return;
        const date = [];
        const data: any[] = [];
        const volumeData: any[] = [];

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            date.push(item.lastTimestamp);
            if (category === 1) {
                data.push([item.openPrice, item.closePrice, item.lowPrice, item.highPrice]);
                volumeData.push([i, item.volume, item.openPrice > item.closePrice ? 1 : -1]);
            } else {
                // data.push(item.mktCap);
                data.push([item.mktOpenPrice, item.mktClosePrice, item.mktLowPrice, item.mktHighPrice]);
                volumeData.push([i, item.volume, item.mktOpenPrice > item.mktClosePrice ? 1 : -1]);
            }

        }
        chartFirstPrice = data[0];
        chartLastPrice = data[data.length - 1];

        const convertedData = date.map((timestamp, index) => [timestamp, data[index][0], data[index][1], data[index][2], data[index][3]]);

        const lows = data.map(p => p[2]);
        const highs = data.map(p => p[3]);

        const minPrice = Math.min(...lows);
        const maxPrice = Math.max(...highs);
        console.log("minPrice: ", minPrice, maxPrice, (maxPrice - minPrice) / 4);

        const maxLabel = getMaxLabelWidth(data);
        const leftMargin = maxLabel + 20;

        // const max = Number(Math.max(...data));
        // const min = Number(Math.min(...data));
        if (!lineChart && chartRef.current) {
            echarts.dispose(chartRef.current);
            lineChart = echarts.init(chartRef.current, null, {
                renderer: "svg",
                useDirtyRect: false,
            });
            setChartListener();
        }
        const timeInterval =(convertedData[1][0] - convertedData[0][0]) / 3600000;
        // console.log("timeInterval: ", timeInterval);
        const option = {
            // animation: false,
            tooltip: {
                trigger: "axis",
                show: false,
                // showContent: true,
                confine: true,
                transitionDuration: 0,
                position: function (point: [any], _params: any, _dom: any, _rect: any, size: { contentSize: any; viewSize: any; }) {
                    const [x] = point;
                    const { contentSize, viewSize } = size;
                    const [boxWidth] = contentSize;
                    const [viewWidth] = viewSize;
                    let posX = 0;
                    const offset = 5;
                    if (x > viewWidth / 2) {
                        posX = x - boxWidth - offset;
                    } else {
                        posX = x + offset;
                    }
                    return [posX, "10%"];
                },
                axisPointer: {
                    type: "cross",
                    // axis: "x",
                    // link: {xAxisIndex: 'all'}
                },
                formatter: (params: any[]) => {
                    console.log("chartFormatter:", params[0].data);
                    // selectTokenPrice.value = formatPrice(params[0].data[1], 6);
                    // let firstPrice = data[0];
                    // let priceChange = params[0].data[1] - firstPrice;
                    // selectPriceChange.value = priceChange.toString();
                    // selectRisePercent.value = toDecimalsMul(toDecimalsDiv(priceChange, firstPrice), 100);
                    // console.log("chartFormatter selectRisePercent:", selectRisePercent.value);
                    let content = "";
                    switch (type) {
                        case 1:
                        case 2:
                        case 3:
                            content = `${formatTimestampToHours(params[0].data[0]).toString()}`;
                            break;
                        case 4:
                            content = `${formatTimestampToMouth(params[0].data[0]).toString()}`;
                            break;
                        case 5:
                        case 6:
                        case 7:
                            content = `${formatTimestampToYear(params[0].data[0]).toString()}`;
                            break;
                    }
                    return `${content} <br/> ${formatPrice(params[0].data[1], 6)}`;
                },
            },
            visualMap: {
                show: false,
                seriesIndex: 1,
                dimension: 2,
                pieces: [
                    {
                        value: 1,
                        color: "rgba(249, 32, 111, 0.5)"
                    },
                    {
                        value: -1,
                        color: "rgba(0, 192, 87, 0.5)"
                    }
                ]
            },
            grid: [
                {
                    left: leftMargin,
                    right: 0,
                    top: "10px",
                    bottom: "10px",
                    height: "85%"
                    // containLabel: true,
                },
                {
                    left: leftMargin,
                    right: 0,
                    top: '73%',
                    height: '16%'
                }
            ],
            xAxis: [
                {
                    type: "category",
                    // boundaryGap: "0.1%",
                    data: date,
                    axisLine: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                    axisPointer: {
                        show: true,
                        z: 100,
                        label: {
                            formatter: function (params: any) {

                                return dayjs(Number(params.value)).format("YYYY-MM-DD HH:mm:ss");
                            }
                        }
                    },
                    min: 'dataMin',
                    max: 'dataMax',
                    axisLabel: {
                        show: true,
                        // rotate: 38,
                        formatter: (value: any, index: number) => {
                            // const date1 = new Date(Number(value));
                            // console.log('x formatter', index, value);
                            // // if (timeInterval < 1) {
                            // const hour = String(date1.getHours()).padStart(2, "0");
                            // const minute = String(date1.getMinutes()).padStart(2, "0");
                            // return `${hour}:${minute}`;
                            // const time = dayjs(value).format("HH:mm");
                            // console.log('formatter', index, value, time);
                            // return time;
                            // }
                            // if (index === 1) {
                            //     const month = String(date.getMonth() + 1).padStart(2, "0");
                            //     const day = String(date.getDate()).padStart(2, "0");
                            //     return `${month}-${day}`;
                            // }

                            // const month = String(date.getMonth() + 1).padStart(2, "0");
                            // const day = String(date.getDate()).padStart(2, "0");
                            // return `${month}-${day}`;

                            if (timeInterval < 1) {
                                return dayjs(Number(value)).format("HH:mm")
                            }

                            return dayjs(Number(value)).format("MM-DD");
                        },
                        color: "#B6B6B6",
                        fontSize: 10,
                        margin: 15,
                        // max: date[date.length - 1],
                        // min: date[0],
                        // interval: (date[date.length - 1] - date[0]) / 10,
                        interval: function(index: any) {
                            const total = date.length;
                            const showEvery = Math.ceil(total / 10);
                            return index % showEvery === 0;
                        }
                    },
                    splitLine: {
                        show: false,
                    },
                    // max: date[date.length - 1],
                    // min: date[0],
                    // interval: (date[date.length - 1] - date[0]) / 10,
                    // min: minPrice,
                    // max: maxPrice,
                    // interval: 5,
                    // splitNumber: 20,
                },
                {
                    type: 'category',
                    gridIndex: 1,
                    data: date,
                    scale: true,
                    //boundaryGap: false,
                    axisLine: {onZero: false},
                    axisTick: {show: false},
                    splitLine: {show: false},
                    axisLabel: {show: false},
                    splitNumber: 20,
                    min: 'dataMin',
                    max: 'dataMax'
                }
            ],
            yAxis: [
                {
                    type: "value",
                    boundaryGap: 0,
                    axisLine: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                    axisLabel: {
                        show: true,
                        margin: 12,
                        interval: 0,
                        color: "#666666",
                        fontWeight: 600,
                        formatter: function (value: any) {
                            const price = formatPrice(value, 5);
                            if (Number(price) > 1) {
                                return translateAmount(Number(price));
                            }
                            // console.log("y formatter:", value, price , translateAmount(Number(price)))
                            return formatNumber(price);
                        }
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: "#0000000A",
                        }
                    },
                    axisPointer: {
                        show: true,
                        label: {
                            show: true,
                            formatter: function (value: any) {
                                const price = formatPrice(value.value, 5);
                                if (Number(price) > 1) {
                                    return translateAmount(Number(price));
                                }
                                return formatNumber(price);
                            }
                        }
                    },
                    // max: max,
                    // min: min,
                    // interval: (max - min) / 4,
                    // splitNumber: 4,
                    scale: true,
                    min: minPrice,
                    max: maxPrice,
                    interval: (maxPrice - minPrice) > 0 ? (maxPrice - minPrice) / 4 : maxPrice / 6,
                },
                {
                    scale: true,
                    gridIndex: 1,
                    splitNumber: 2,
                    axisLabel: {show: false},
                    axisLine: {show: false},
                    axisTick: {show: false},
                    splitLine: {show: false}
                }
            ],
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: [0, 1],
                    start: 30,
                    end: 100
                },
                {
                    show: false,
                    xAxisIndex: [0, 1],
                    type: 'slider',
                    top: '85%',
                    start: 30,
                    end: 100
                }
            ],
            series: [
                {
                    name: "",
                    symbol: "none",
                    type: "candlestick",
                    sampling: "lttb",
                    // itemStyle: {
                    //     color: getChartStatus() === 1 ? "#29CA53" : "#E42170",
                    // },
                    // areaStyle: {
                    //     color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    //         {
                    //             offset: 0,
                    //             color: getChartStatus() === 1 ? "rgba(0, 192, 87, 0.2)" : "rgba(249, 32, 111, 0.2)",
                    //         },
                    //         {
                    //             offset: 1,
                    //             color: getChartStatus() === 1 ? "rgba(0, 192, 87, 0)" : "rgba(249, 32, 111, 0)",
                    //         },
                    //     ]),
                    // },
                    data: data,
                    itemStyle: {
                        color: '#29CA53',
                        color0: '#E42170',
                        borderColor: '#29CA53',
                        borderColor0: '#E42170'
                    },
                    emphasis: {
                        // itemStyle: {
                        //     color: 'black',
                        //     color0: '#444',
                        //     borderColor: 'black',
                        //     borderColor0: '#444'
                        // }
                        disabled: true
                    }
                },
                // {
                //     type: "effectScatter",
                //     coordinateSystem: "cartesian2d",
                //     data: type === 1 ? [{ value: [date[date.length - 1], data[data.length - 1]], symbolSize: 8 }] : [],
                //     showEffectOn: "render",
                //     rippleEffect: {
                //         brushType: "stroke",
                //     },
                //     // hoverAnimation: true,
                //     emphasis: {
                //         scale: true,
                //     },
                //     itemStyle: {
                //         color: getChartStatus() === 1 ? "#29CA53" : "#E42170",
                //         shadowBlur: 30,
                //         shadowColor: getChartStatus() === 1 ? "#29CA53" : "#E42170",
                //     },
                //     zlevel: 1,
                // },
                {
                    name: 'Volume',
                    type: 'bar',
                    // barWidth : 30,
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: volumeData
                }
            ],
        };
        if (lineChart && option && typeof option === "object") {
            lineChart.setOption(option);
        }
    };

    function getChartStatus(): number {
        const price = new BigNumber(chartLastPrice).toFixed();
        const priceChange = Number(price) - chartFirstPrice;
        if (priceChange > 0) {
            return 1;
        } else if (priceChange < 0) {
            return 2;
        } else {
            return 0;
        }
    }

    function getMaxLabelWidth(data: number[][], font = '12px sans-serif'): number {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
            context.font = font;
            let maxWidth = 0;
            for (const item of data) {
                for (const num of item) {
                    const price = formatPrice(num, 5);
                    let result;
                    if (Number(price) > 1) {
                        result = translateAmount(Number(price));
                    } else {
                        result = formatNumber(price);
                    }
                    const width = context.measureText(result).width;
                    if (width > maxWidth) {
                        maxWidth = width;
                    }
                }
            }
            return maxWidth;
        }
        return 0;
    }


    const resizeListener = () => {
        lineChart?.resize();
    };

    const addResizeListener = () => {
        window.addEventListener("resize", resizeListener);
    };

    const removeResizeListener = () => {
        window.addEventListener("resize", resizeListener);
    };

    const setChartListener = () => {
        removeResizeListener();
        addResizeListener();
        lineChart?.on("globalout", () => {
            // console.log("33333333333333111111111");
            chartTouchEnd();
        });
        lineChart?.getZr().on("mousemove", () => {
            // console.log("222222222233333333333");
            chartTouchStart();
        });
    };

    const showChartTip = useRef<boolean>(false);
    const chartTouchStart = () => {
        if (!showChartTip.current) {
            showChartTip.current = true;
            // console.log("chartTouchStart111")
            lineChart?.dispatchAction({ type: "showTip" });
            lineChart?.setOption({
                xAxis: [
                    {
                        axisPointer: {
                            show: true,
                        },
                    }
                ],
                yAxis: [
                    {
                        axisPointer: {
                            show: true,
                        },
                    }
                ]
            });
        }
    };

    const chartTouchEnd = () => {
        // console.log("chartTouchEnd222")
        showChartTip.current = false;
        if (lineChart) {
            // console.log("chartTouchEnd333")
            lineChart.dispatchAction({ type: "hideTip" });
            lineChart.setOption({
                xAxis: [
                    {
                        axisPointer: {
                            show: false,
                        },
                    }
                ],
                yAxis: [
                    {
                        axisPointer: {
                            show: false,
                        },
                    }
                ]
            });
        }
    };

    useEffect(() => {
        initChart();
    }, [list, category]);

    useEffect(() => {
        return () => {
            removeResizeListener();
            if (lineChart) {
                lineChart.dispose();
            }
            lineChart = null;
        }
    }, []);

    return (
        <div ref={chartRef} id="container" className="w-full h-[325px]" onTouchStart={chartTouchStart} onTouchEnd={chartTouchEnd} onTouchCancel={chartTouchEnd}/>
    )
}

export default ChartComponent;