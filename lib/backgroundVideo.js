export async function setBackgroundVideo() {
  function selectVideo(condition, isSnow, currentTime, sunrise, sunset) {
    const timeDiffFromSunset = Math.abs(currentTime - sunset);
    const isSunset = timeDiffFromSunset < 3600; // within an hour of sunset
    const isNight = currentTime < sunrise || currentTime > sunset;
    if (isSunset) {
      return isSnow ? "sunsetsnow.mp4" : "sunset.mp4";
    } else if (isNight) {
      return isSnow ? "nightsnow.mp4" : "night.mp4";
    } else if (condition === "Clouds") {
      return isSnow ? "cloudysnow.mp4" : "cloudy.mp4";
    } else {
      return isSnow ? "daysnow.mp4" : "day.mp4";
    }
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          // Fetch weather data from OpenWeather API.
          const apiKey = "c8a29e11a718a42b446433766a344643"; // Replace with your key.
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
          );
          const weather = await res.json();
          const condition = weather.weather[0].main;
          const isSnow = condition.toLowerCase() === "snow";
          const currentTime = Math.floor(Date.now() / 1000);
          const sunrise = weather.sys.sunrise;
          const sunset = weather.sys.sunset;
  
          // Determine the correct video file name.
          const videoFile = selectVideo(condition, isSnow, currentTime, sunrise, sunset);
          
          // Update the video element source.
          const sourceElement = document.getElementById("bgVideoSource");
          const videoElement = document.getElementById("bgVideo");
          sourceElement.src = `/bgvideos/${videoFile}`;
          videoElement.load();
          console.log("Selected video:", videoFile);
        } catch (error) {
          console.error("Error fetching weather data", error);
          // Fallback: force default to night.mp4 if API call fails.
          const sourceElement = document.getElementById("bgVideoSource");
          const videoElement = document.getElementById("bgVideo");
          sourceElement.src = "/bgvideos/night.mp4";
          videoElement.load();
          console.log("Fallback forced default video: night.mp4");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        // If location is denied, default to night.mp4.
        const sourceElement = document.getElementById("bgVideoSource");
        const videoElement = document.getElementById("bgVideo");
        sourceElement.src = "/bgvideos/night.mp4";
        videoElement.load();
        console.log("Location denied: defaulted to night.mp4");
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
    // If geolocation is not supported, default to night.mp4.
    const sourceElement = document.getElementById("bgVideoSource");
    const videoElement = document.getElementById("bgVideo");
    sourceElement.src = "/bgvideos/night.mp4";
    videoElement.load();
    console.log("Geolocation not supported: defaulted to night.mp4");
  }
}