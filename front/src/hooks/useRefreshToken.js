import axios from '../api/axios';
import useAuth from './useAuth';
import jwt from 'jwt-decode';

const useRefreshToken = () => {
    const { auth,setAuth } = useAuth();
    const REFRESH_URL = (auth?.token?.role === "Admin") ? `/Auth/refresh-token-admin/${auth.token.name}` : `/Auth/refresh-token/${auth.token.uid}`

    const refresh = async () => {
        const response = await axios.get(REFRESH_URL, {
            withCredentials: true
        });
        const accessToken = response?.data;
        const token = jwt(accessToken);
        setAuth(prev => {
            console.log(JSON.stringify(prev));
            console.log(response.data);
            return { token, accessToken}
        });
        return accessToken;
    }
    return refresh;
};

export default useRefreshToken;