import { useState } from "react";
import { faEye,faEyeSlash,faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MessageErrorRequest from "./MessageErrorRequest";
import useAuth from '../hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import jwt from 'jwt-decode';
import "../css/login.css";

const Login = () => {

    const { setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [emailClass,setEmailClass] = useState("input100");
    const [passwordClass,setPasswordClass] = useState("input100");
    const [passShow,setPassShow] = useState(false);
    const [errorEmail,setErrorEmail] = useState(false);
    const [errorPassword,setErrorPassword] = useState(false);
    const [error,setError] = useState("");
    //const errorMessage = useRef("");

    const handleBlur = e => {
        if(e.target.name==="email") {
            if(!e.target.value.trim())
                setEmailClass("input100")
            else
                setEmailClass("input100 has-val")
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
        if(!/\S+@\S+\.\S+/.test(email))
            setErrorEmail(true)
        else if (!password)
            setErrorPassword(true)
        else {
            try {
                const response = await axios.post("Auth/loginU",
                    JSON.stringify({ email, password }),
                    {
                        headers: { 'Content-Type': 'application/json' },
                        withCredentials: true
                    }
                );
                //console.log(JSON.stringify(response?.data));
                //console.log(JSON.stringify(response));
                const accessToken = response?.data;
                const token = jwt(accessToken);
                //console.log(token);
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

            // setEmailClass("input100")
            // setPasswordClass("input100")
            // setEmail("")
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

                        <div className={(errorEmail) ? "wrap-input100 validate-input alert-validate" : "wrap-input100 validate-input"} data-validate = "Valid email is: a@b.c" style={{marginTop:"40px"}}>
                            <input className={emailClass} type="text" name="email" value={email} onChange={e=>{setEmail(e.target.value);setErrorEmail(false)}} onBlur={handleBlur} />
                            <span className="focus-input100" data-placeholder="Email"></span>
                            { (errorEmail) && <FontAwesomeIcon icon={faExclamationCircle} className="warningAwesome"/> }
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

                        <div className="container-login100-form-btn">
                            <div className="wrap-login100-form-btn">
                                <div className="login100-form-bgbtn"></div>
                                <button className="login100-form-btn">
                                    Login
                                </button>
                            </div>
                        </div>

                        <div style={{paddingTop:"115px",textAlign:"center"}}>
                            <span className="txt1">
                                Don’t have an account?
                            </span>

                            <Link to={"/register"} className="txt2">Sign Up</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login;