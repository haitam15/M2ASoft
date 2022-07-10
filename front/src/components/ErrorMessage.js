import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const ErrorMessage = ({message}) => {
    return (
        <div style={{
            fontSize : "13px",
            color : "red",
            textAlign : "left",
            paddingBottom : "15px",
            paddingLeft : "10px"
        }}>
            <FontAwesomeIcon icon={faWarning} />
            {'\u00A0'} {message}
        </div>
    )
}

export default ErrorMessage;