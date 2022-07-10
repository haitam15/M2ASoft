import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const Weather = () => {

    const axios = useAxiosPrivate();
    const {auth} = useAuth();

    const getWeather = async () => {
        const response = await axios.get("Auth");
        console.log(auth)
        console.log(response.data);
    }

    return (
        <button onClick={getWeather}>Weather</button>
    )
}

export default Weather;