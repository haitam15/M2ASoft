import useAxiosPrivate from "../hooks/useAxiosPrivate";
import '../css/login.css';
import { useState } from "react";
import MessageErrorRequest from "./MessageErrorRequest";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

const Admin = () => {

    const [email,setEmail] = useState("");
    const [emailClass,setEmailClass] = useState("input100");
    const [errorEmail,setErrorEmail] = useState(false);
    const [error,setError] = useState("");
    const axios = useAxiosPrivate();

    const handleBlur = e => {
        if(!e.target.value.trim())
            setEmailClass("input100")
        else
            setEmailClass("input100 has-val")
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setError("");
        if(!/\S+@\S+\.\S+/.test(email))
            setErrorEmail(true)
        else {

            try {
                const response = await axios.get(`User/email/${email}`);
                const uid = response.data?.uid;

                try {
                    const response = await axios.put(`User/validate/${uid}`);
                    console.log(JSON.stringify(response?.data));
                    //console.log(JSON.stringify(response));

                    setEmailClass("input100")
                    setEmail("")

                    alert("User has been validated")

                } catch (err) {
                    if (!err?.response) {
                        setError('No Server Response');
                    } else if (err.response?.status === 400) {
                        setError(err.response?.data);
                    } else if (err.response?.status === 401) {
                        setError('Unauthorized');
                    } else {
                        setError('Validation Failed');
                    }
                }
    
            }
            catch(err) {
                if (!err?.response) {
                    setError('No Server Response');
                } else if (err.response?.status === 400) {
                    setError(err.response?.data);
                } else if (err.response?.status === 401) {
                    setError('Unauthorized');
                } else {
                    setError('Getting Email Failed');
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
                            User Validation
                        </span>

                        { (error) && <MessageErrorRequest>{error}</MessageErrorRequest>}

                        <div className={(errorEmail) ? "wrap-input100 validate-input alert-validate" : "wrap-input100 validate-input"} data-validate = "Valid email is: a@b.c" style={{marginTop:"40px"}}>
                            <input className={emailClass} type="text" name="email" value={email} onChange={e=>{setEmail(e.target.value);setErrorEmail(false)}} onBlur={handleBlur} />
                            <span className="focus-input100" data-placeholder="Email"></span>
                            { (errorEmail) && <FontAwesomeIcon icon={faExclamationCircle} className="warningAwesome"/> }
                        </div>

                        <div className="container-login100-form-btn" style={{margin:"20% 5%"}}>
                            <div className="wrap-login100-form-btn">
                                <div className="login100-form-bgbtn"></div>
                                <button className="login100-form-btn">
                                    Validate
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default Admin;