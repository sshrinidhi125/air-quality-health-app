async function getAQI() {

    let city = document.getElementById("city").value;
    let age = document.getElementById("age").value;
    let health = document.getElementById("health").value;

    let response = await fetch("/get_aqi", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            location: city,
            user_type: health
        })
    });

    let data = await response.json();

    if (data.error) {
        alert(data.error);
        return;
    }

    document.getElementById("aqi").innerText = data.aqi;
    document.getElementById("risk").innerText = data.risk;
    document.getElementById("advice").innerText = data.advice;

    document.getElementById("impact").innerText =
        "Air quality impact varies based on your profile.";
}
