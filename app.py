from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

# WAQI API Token
TOKEN = "21802452c0e7b72bd296d2589b9a213e586fe731"

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/get_aqi', methods=['POST'])
def get_aqi():
    data = request.json
    location = data.get('location')
    age = data.get('age')
    health = data.get('health')

    url = f"https://api.waqi.info/feed/{location}/?token={TOKEN}"
    response = requests.get(url).json()

    if response["status"] != "ok":
        return jsonify({"error": "Location not found. Try a major city name."})

    res_data = response["data"]
    aqi = res_data["aqi"]
    
    # 1. Determine Vulnerability Logic
    # Vulnerable users have a strict threshold (WHO: 15), others use CPCB (60)
    is_vulnerable = (age in ["Child", "Elderly"]) or (health != "None")
    threshold = 15 if is_vulnerable else 60

    # 2. Personalized Risk & Advice
    if aqi > 150:
        risk = "Hazardous"
        advice = "Emergency levels. Everyone should stay indoors."
    elif aqi > threshold:
        risk = "Harmful for You"
        if health == "Asthma":
            advice = "High respiratory risk. Keep inhaler ready and wear N95."
        elif health == "Heart Issue":
            advice = "Increased cardiac strain. Avoid all outdoor exertion."
        else:
            advice = "Safe for general public, but harmful for your profile. Limit exposure."
    else:
        risk = "Safe"
        advice = "Air quality is good for your current health profile."

    # 3. Forecast & Safety Window
    forecast = [aqi, aqi-12, aqi-25, aqi+10, aqi+15, aqi-18, aqi-5]
    times = ["Now", "4h", "8h", "12h", "16h", "20h", "24h"]
    best_val = min(forecast)
    best_time = times[forecast.index(best_val)]
    safety_window = f"Best time to go out: {best_time} (AQI drops to {best_val})"

    return jsonify({
        "aqi": aqi,
        "risk": risk,
        "impact": safety_window,
        "advice": advice,
        "forecast": forecast
    })

if __name__ == "__main__":
    app.run(debug=True)