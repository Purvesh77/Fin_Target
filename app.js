// app.js

const historicalData = {
    ethusdt: [],
    bnbusdt: [],
    dotusdt: []
};

let currentSymbol = 'ethusdt';
let currentInterval = '1m';
const ctx = document.getElementById('candlestickChart').getContext('2d');
let candlestickChart;

const createWebSocket = (symbol, interval) => {
    const url = `wss://stream.binance.com:9443/ws/${symbol}@kline_${interval}`;
    const ws = new WebSocket(url);

    ws.onopen = () => {
        console.log(`Connected to WebSocket for ${symbol} with interval ${interval}`);
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.e === "kline") {
            const kline = message.k;
            const candlestick = {
                t: kline.t,
                o: parseFloat(kline.o),
                h: parseFloat(kline.h),
                l: parseFloat(kline.l),
                c: parseFloat(kline.c),
                v: parseFloat(kline.v)
            };
            // Store the candlestick data in historicalData
            historicalData[symbol].push(candlestick);
            updateChart(symbol);
        }
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed. Reconnecting...');
        setTimeout(() => createWebSocket(symbol, interval), 1000);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
};

const updateChart = (symbol) => {
    const data = historicalData[symbol];
    const chartData = {
        datasets: [{
            label: symbol.toUpperCase(),
            data: data.map(candle => ({
                t: new Date(candle.t),
                o: candle.o,
                h: candle.h,
                l: candle.l,
                c: candle.c
            })),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1,
        }]
    };

    if (candlestickChart) {
        candlestickChart.data = chartData;
        candlestickChart.update();
    } else {
        candlestickChart = new Chart(ctx, {
            type: 'candlestick',
            data: chartData,
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute'
                        }
                    },
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }
};

const initialize = () => {
    const symbolSelect = document.getElementById('symbolSelect');
    const intervalSelect = document.getElementById('intervalSelect');

    symbolSelect.addEventListener('change', (event) => {
        currentSymbol = event.target.value;
        updateChart(currentSymbol); // Update chart with historical data
        createWebSocket(currentSymbol, currentInterval);
    });

    intervalSelect.addEventListener('change', (event) => {
        currentInterval = event.target.value;
        createWebSocket(currentSymbol, currentInterval);
    });

    createWebSocket(currentSymbol, currentInterval);
};

initialize();