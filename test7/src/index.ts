const api = "e398c202c0f7421cb59115009230410";

const fetchWeather = async(InputCity:string)=>{
    let url = `https://api.weatherapi.com/v1/current.json?key=${api}&q=${InputCity}`;
    const res = await fetch(url).then(response=>response.json()).then(data=>data)
    console.log(res);
    
    const city = document.querySelector("#city");
    if(city)city.innerHTML = InputCity;

    const weather_img = document.querySelector("#weather_img");
    if(weather_img)weather_img.src = res.current.condition.icon;

    const day = document.querySelector("#day");
    if(day)day.innerHTML = res.current.condition.text;

    const time = document.querySelector("#time");
    if(time)time.innerHTML = res.location.localtime.split(' ')[1];

    const humidity = document.querySelector("#humidity");
    if(humidity)humidity.innerHTML = res.current.humidity;

    const wind = document.querySelector("#wind");
    if(wind)wind.innerHTML = res.current.wind_kph;

    const inDegree = document.querySelector("#inDegree");
    if(inDegree)inDegree.innerHTML = res.current.dewpoint_c;

    const date = document.querySelector(".date");
    if(date)date.innerHTML = res.location.localtime.split(' ')[0];
    

}
fetchWeather("indore")

const searchButton = document.querySelector("#search");
const InputCity = document.querySelector('input');
if(searchButton)
    searchButton.addEventListener("click",()=>{
        if(!InputCity)return;
        console.log(InputCity.value)
        fetchWeather(InputCity.value);  
})