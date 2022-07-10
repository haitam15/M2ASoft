import { useState } from "react";
import { faEye,faEyeSlash,faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MessageErrorRequest from "./MessageErrorRequest";
import useAuth from '../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import jwt from 'jwt-decode';
import "../css/login.css";

const LoginA = () => {

    const { setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [username,setUsername] = useState("");
    const [password,setPassword] = useState("");
    const [usernameClass,setUsernameClass] = useState("input100");
    const [passwordClass,setPasswordClass] = useState("input100");
    const [passShow,setPassShow] = useState(false);
    const [errorUsername,setErrorUsername] = useState(false);
    const [errorPassword,setErrorPassword] = useState(false);
    const [error,setError] = useState("");
    const from = location.state?.from?.pathname || "/admin";


    const handleBlur = e => {
        if(e.target.name==="username") {
            if(!e.target.value.trim())
                setUsernameClass("input100")
            else
                setUsernameClass("input100 has-val")
        } else {
            if(!e.target.value.trim())
                setPasswordClass("input100")
            else
                setPasswordClass("input100 has-val")
        }
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setError("");
        if(!username)
            setErrorUsername(true)
        else if (!password)
            setErrorPassword(true)
        else {
            try {
                const response = await axios.post("Auth/loginA",
                    JSON.stringify({ username, password }),
                    {
                        headers: { 'Content-Type': 'application/json' },
                        withCredentials: true
                    }
                );
                console.log(JSON.stringify(response?.data));
                //console.log(JSON.stringify(response));
                const accessToken = response?.data;
                const token = jwt(accessToken);
                console.log(token);
                //const roles = [token.role];
                setAuth({ token, accessToken });
                navigate(from, { replace: true });
            } catch (err) {
                if (!err?.response) {
                    setError('No Server Response');
                } else if (err.response?.status === 400) {
                    setError(err.response?.data);
                } else if (err.response?.status === 401) {
                    setError('Unauthorized');
                } else {
                    setError('Login Failed');
                }
            }

            // setUsernameClass("input100")
            // setPasswordClass("input100")
            // setUsername("")
            // setPassword("");

        }
    }

    return (
        <div className="limiter" style={{fontFamily:"Poppins-Regular, sans-serif"}}>
            <div className="container-login100">
                <div className="wrap-login100">
                    <form className="login100-form validate-form" onSubmit={handleSubmit}>
                        <span className="login100-form-title" style={{paddingBottom:"26px"}}>
                            Welcome
                        </span>

                        { (error) && <MessageErrorRequest>{error}</MessageErrorRequest>}

                        <div className={(errorUsername) ? "wrap-input100 validate-input alert-validate" : "wrap-input100 validate-input"} data-validate = "Enter Username" style={{marginTop:"40px"}}>
                            <input className={usernameClass} type="text" name="username" value={username} onChange={e=>{setUsername(e.target.value);setErrorUsername(false)}} onBlur={handleBlur} />
                            <span className="focus-input100" data-placeholder="Username"></span>
                            { (errorUsername) && <FontAwesomeIcon icon={faExclamationCircle} className="warningAwesome"/> }
                        </div>

                        <div className={(errorPassword) ? "wrap-input100 validate-input alert-validate" : "wrap-input100 validate-input"} data-validate="Enter password">
                            <span className="btn-show-pass">
                                { (!errorPassword) && <FontAwesomeIcon icon={ (passShow) ? faEyeSlash : faEye} onClick={e=>setPassShow(!passShow)}/>}
                                {/* <i className="zmdi zmdi-eye"></i> */}
                            </span>
                            <input className={passwordClass} type={ (passShow) ? "text" :"password"} name="password" value={password} onChange={e=>{setPassword(e.target.value);setErrorPassword(false)}} onBlur={handleBlur}/>
                            <span className="focus-input100" data-placeholder="Password"></span>
                            { (errorPassword) && <FontAwesomeIcon icon={faExclamationCircle} className="warningAwesome"/> }
                        </div>

                        <div className="container-login100-form-btn" style={{marginBottom:"28%"}}>
                            <div className="wrap-login100-form-btn">
                                <div className="login100-form-bgbtn"></div>
                                <button className="login100-form-btn">
                                    Login
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default LoginA;