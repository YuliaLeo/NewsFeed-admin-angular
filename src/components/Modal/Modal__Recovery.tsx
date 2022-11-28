import React, {useContext, useState} from "react";
import "./Modal__Recovery.scss"
import axios from "axios";
import { UserContext } from "../../Context/Context";

// Нужен рефакторинг классов
const Modal__Recovery = (props) => {
    const EMAIL_ERROR = "There is no user with this email"

    const setRecoveryUser = props.setUser

    const openNewPasswordModal =  useContext(UserContext).openNewPasswordModal;

    const [emailInputValue, setEmailInputValue] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const handleSubmit = (event) => {
        event.preventDefault();
        setEmailInputValue(emailInputValue.toLowerCase())

        const fetchData = async () => {
            const result = await axios(
                'http://localhost:3030/users',
            );
            /*  Это должен делать бэк
             */
            let userExist = false
            result.data.every(el => {
                if (el.email === emailInputValue.trim().toLowerCase()) {
                    userExist = true
                    setRecoveryUser(el.id)
                    openNewPasswordModal()
                    return false
                }
                return true
            })
            if (!userExist) {
                setErrorMessage(EMAIL_ERROR)
            }
        };
        fetchData();

    };

    return (
        <div>
            <div className="modal-window__main-title">
                Password Recovery
            </div>
            <form onSubmit={handleSubmit} className="modal-window__auth-form auth-form">
                <label className="auth-form__field form-field">
                    <span className="form-field__title">Email *</span>
                    <input type="email" className="form-field__input" required value={emailInputValue} onChange={(event) => {
                        setEmailInputValue(event.target.value)
                    }} />
                </label>
                {errorMessage && <div className="modal-window__error">{errorMessage}</div>}
                <button type="submit" className="auth-form__submit-button">Send an email</button>
            </form>
        </div>
    )
}

export default Modal__Recovery