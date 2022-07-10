import { useState, useRef, useEffect } from "react";
import axios from '../api/axios';
import { Link } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";
import MessageErrorRequest from "./MessageErrorRequest";
import "../css/register.css"

const EMAIL_REGEX = /\S+@\S+\.\S+/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[&(-_)!@#$%]).{8,24}$/;
const PHONE_REGEX = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

const Register = () => {

    const [field,setField] = useState(0);
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [confirmPassword,setConfirmPassword] = useState("");
    const [raisonSocial,setRaisonSocial] = useState("");
    const [responsable,setResponsable] = useState("");
    const [num,setNum] = useState("");
    const [gsm,setGsm] = useState("");
    const [domaineDactivite,setDomaineDactivite] = useState("");
    const [error,setError] = useState("0");
    const errorMessage = useRef("");

    const handleNext1 = e => {
        if(!email) {
            errorMessage.current = "Email is empty !"
            setError("11");
        }
        else if(!password) {
            errorMessage.current = "Password is empty !"
            setError("21");
        }
        else if(!confirmPassword) {
            errorMessage.current = "Confirm Password is empty !"
            setError("31");
        }
        else if (!EMAIL_REGEX.test(email)) {
            errorMessage.current = "Email is not valid !"
            setError("12");
        }
        else if (!PWD_REGEX.test(password)) {
            errorMessage.current = "Password is weak ! Please enter a password with 8 to 24 characters and included uppercase and lowercase letters, a number and a special character."
            setError("22");
        }
        else if (confirmPassword!=password) {
            errorMessage.current = "Confirm password and password are not the same !";
            setError("32");
        }
        else{
            errorMessage.current = "";
            setError("0");
            setField(1);
        }
    }

    const handleNext2 = e => {
        if(!raisonSocial) {
            errorMessage.current = "Raison Social is empty !"
            setError("4");
        }
        else if(!responsable) {
            errorMessage.current = "Responsable is empty !"
            setError("5");
        }
        else if(!num) {
            errorMessage.current = "Phone number is empty !"
            setError("61");
        }
        else if(!gsm) {
            errorMessage.current = "gsm is empty !"
            setError("71");
        }
        else if(!domaineDactivite) {
            errorMessage.current = "Domaine d'activité is empty !"
            setError("8");
        }
        else if (!PHONE_REGEX.test(num)) {
            errorMessage.current = "Phone number is invalid !";
            setError("62");
        }
        else if (!PHONE_REGEX.test(gsm)) {
            errorMessage.current = "GSM is invalid !";
            setError("72");
        }
        else {
            errorMessage.current = "";
            setError("0");
            setField(2);
        }

    }

    const handleSubmit = async e => {
        e.preventDefault();
        setError("0");
        try {
            const response = await axios.post("/Auth/register",
                JSON.stringify({ email, password, confirmPassword, raisonSocial, responsable, num, gsm, domaineDactivite }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            // TODO: remove console.logs before deployment
            //console.log(JSON.stringify(response?.data));
            const uid = response?.data?.uid;

            try {
                let formData = new FormData();
                let files = new Array();
                let inputFiles = document.querySelectorAll('input[type=file]');
                for(let i=0;i<3;i++)
                    formData.append("files", inputFiles[i].files[0]);
                const response = await axios.post(`/File/register/${uid}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        withCredentials: true
                    }
                })
                alert("Your request is sent ! we will send you an email after the validation from the admin");
                //clear state and controlled inputs
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setRaisonSocial('');
                setResponsable('');
                setNum('');
                setGsm('');
                setDomaineDactivite('');
                document.querySelectorAll("input[type=file]").forEach(inp=>inp.value="");
                setError('0');
                setField(0);    
            }
            catch(err) {
                //console.log(err);
                if (!err?.response) {
                    errorMessage.current = 'No Server Response';
                } else {
                    errorMessage.current = err?.response?.data;
                }
                await axios.delete(`User/${uid}`);
                setError("9");
            }

        } catch (err) {
            //console.log(err);
            if (!err?.response) {
                errorMessage.current = 'No Server Response';
            } else if (!err?.response?.data) {
                errorMessage.current = "Network Error";
            } else {
                errorMessage.current = err?.response?.data;
            }
            setError("9");
        }
    }

    return (
        // <!-- multistep form -->
        <form id="msform" onSubmit={handleSubmit}>
            {/* <!-- progressbar --> */}
            <ul id="progressbar">
                <li className={(field>=0) ? "active" : ""}>Accout Setup</li>
                <li className={(field>=1) ? "active" : ""}>Society Setup</li>
                <li className={(field===2) ? "active" : ""}>Documents</li>
            </ul>
            {/* <!-- fieldsets --> */}
            <fieldset style={{display: (field===0) ? "block" : "none"}}>
                <h2 className="fs-title">Create your account</h2>
                <h3 className="fs-subtitle">This is step 1</h3>
                <input type="email" name="email" placeholder="Email" value={email} onChange={e=>{setEmail(e.target.value)}}/>
                { (error[0]==1) && <ErrorMessage message={errorMessage.current}/>}
                <input type="password" name="pass" placeholder="Password" value={password} onChange={e=>{setPassword(e.target.value)}}/>
                { (error[0]==2) && <ErrorMessage message={errorMessage.current}/>}
                <input type="password" name="cpass" placeholder="Confirm Password" value={confirmPassword} onChange={e=>{setConfirmPassword(e.target.value)}}/>
                { (error[0]==3) && <ErrorMessage message={errorMessage.current}/>}
                <input type="button" name="next" className="next action-button" value="Next" onClick={handleNext1} />
                <div style={{paddingTop:"50px",textAlign:"center"}}>
                    <span className="txt1">
                        You already have an account
                    </span>

                    <Link to={"/login"} className="txt2">Login</Link>
                </div>
            </fieldset>
            <fieldset style={{display: (field===1) ? "block" : "none"}}>
                <h2 className="fs-title">Society Setup</h2>
                <h3 className="fs-subtitle">The neccessary informations for your society</h3>
                
                <input type="text" name="raisonSocial" placeholder="raison social" value={raisonSocial} onChange={e=>{setRaisonSocial(e.target.value)}}/>
                { (error[0]==4) && <ErrorMessage message={errorMessage.current}/>}
                <input type="text" name="responsable" placeholder="responsable" value={responsable} onChange={e=>{setResponsable(e.target.value)}}/>
                { (error[0]==5) && <ErrorMessage message={errorMessage.current}/>}
                <input type="tel" name="num" placeholder="numéro de téléphone" value={num} onChange={e=>{setNum(e.target.value)}}/>
                { (error[0]==6) && <ErrorMessage message={errorMessage.current}/>}
                <input type="tel" name="gsm" placeholder="gsm" value={gsm} onChange={e=>{setGsm(e.target.value)}}/>
                { (error[0]==7) && <ErrorMessage message={errorMessage.current}/>}
                <input type="text" name="domaineDactivite" placeholder="domaine d'activité" value={domaineDactivite} onChange={e=>{setDomaineDactivite(e.target.value)}}/>
                { (error[0]==8) && <ErrorMessage message={errorMessage.current}/>}
                <input type="button" name="previous" className="previous action-button" value="Previous"  onClick={e=>{setField(0)}} />
                <input type="button" name="next" className="next action-button" value="Next"  onClick={handleNext2}/>
                <div style={{paddingTop:"50px",textAlign:"center"}}>
                    <span className="txt1">
                        You already have an account
                    </span>

                    <Link to={"/login"} className="txt2">Login</Link>
                </div>
            </fieldset>
            <fieldset style={{display: (field===2) ? "block" : "none"}}>
                <h2 className="fs-title">Documents</h2>
                <h3 className="fs-subtitle">The neccessary documents</h3>
                { (error[0]==9) && <MessageErrorRequest>{errorMessage.current}</MessageErrorRequest> }
                <label>modèle J</label>
                <input type="file" name="modeleJ" accept=".jpg, .jpeg, .png, .pdf" required/>
                <label>statut</label>
                <input type="file" name="statut" accept=".jpg, .jpeg, .png, .pdf" required/>
                <label>CIN du gérant</label>
                <input type="file" name="cin" accept=".jpg, .jpeg, .png, .pdf" required/>
                <input type="button" name="previous" className="previous action-button" value="Previous"  onClick={e=>{setField(1)}} />
                <input type="submit" name="submit" className="submit action-button" value="Submit"/>
                <div style={{paddingTop:"50px",textAlign:"center"}}>
                    <span className="txt1">
                        You already have an account
                    </span>

                    <Link to={"/login"} className="txt2">Login</Link>
                </div>
            </fieldset>
        </form>
    )
}

export default Register;