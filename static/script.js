let aqiChart;
let rawAQI = 0; 

async function getAQI() {
    let btn = document.getElementById("checkBtn");
    let city = document.getElementById("city").value;

    btn.disabled = true;
    btn.innerText = "Analyzing Air...";

    try {
        let response = await fetch("/get_aqi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                location: city, 
                age: document.getElementById("age").value, 
                health: document.getElementById("health").value 
            })
        });

        let data = await response.json();

        if (data.error) {
            document.getElementById("risk").innerText = data.error;
        } else {
            rawAQI = data.aqi; 
            document.getElementById("aqi").innerText = data.aqi;
            document.getElementById("risk").innerText = data.risk;
            document.getElementById("impact").innerText = data.impact;
            document.getElementById("advice").innerText = data.advice;

            updateUIColors(data.risk);
            renderChart(data.forecast);
        }
    } catch (e) { console.error(e); }

    btn.disabled = false;
    btn.innerText = "Check Air Quality";
}

function simulateMask(maskType) {
    let simulatedAQI = rawAQI;
    if (maskType === "N95") simulatedAQI = Math.round(rawAQI * 0.05);
    else if (maskType === "Cloth") simulatedAQI = Math.round(rawAQI * 0.5);

    document.getElementById("aqi").innerText = simulatedAQI;
    document.getElementById("risk").innerText = simulatedAQI < 50 ? "Protected (Safe)" : "Reduced Risk";
    document.getElementById("resultCard").style.boxShadow = "0 0 20px #fff";
}

function updateUIColors(risk) {
    let body = document.body;
    if (risk === "Hazardous") {
        body.style.background = "linear-gradient(135deg, #4b1248 0%, #f03030 100%)";
    } else if (risk === "Harmful / Caution") {
        body.style.background = "linear-gradient(135deg, #f09819 0%, #edde5d 100%)";
    } else {
        body.style.background = "linear-gradient(135deg, #1D976C 0%, #93F9B9 100%)";
    }
}

function renderChart(forecastData) {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();
    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Now', '4h', '8h', '12h', '16h', '20h', '24h'],
            datasets: [{
                label: '24h Trend',
                data: forecastData,
                borderColor: 'white',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            plugins: { legend: { labels: { color: 'white' } } },
            scales: {
                y: { ticks: { color: 'white' } },
                x: { ticks: { color: 'white' } }
            }
        }
    });
}