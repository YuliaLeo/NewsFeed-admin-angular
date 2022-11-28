import React, {useContext, useState} from "react";
import "./Modal__NewPassword.scss"
import axios from "axios";
import { calculateHash } from "../../encrypt/Hash"
import { validPassword } from "../../Regex/Regex"
import { UserContext } from "../../Context/Context";

// Нужен рефакторинг классов
const Modal__NewPassword = (props) => {
    const PASSWORD_ERROR = "The password must contain at least 6 valid characters"
    const PASSWORD2_ERROR = "Passwords must match"

    const recoveredUser = props.user

    const logIn = useContext(UserContext).logIn
    const hideModal =  useContext(UserContext).hideModal

    const [emailInputValue, setEmailInputValue] = useState('')
    const [passwordInputValue, setPasswordInputValue] = useState('')
    const [password2InputValue, setPassword2InputValue] = useState('')
    const [errorMessage, setErrorMessage] = useState('')


    const handleSubmit = (event) => {
        event.preventDefault()
        setEmailInputValue(emailInputValue.toLowerCase())
        if (passwordInputValue !== password2InputValue) {
            setErrorMessage(PASSWORD2_ERROR)
            setPasswordInputValue("")
            setPassword2InputValue("")
        }
        else if (!validPassword.test(passwordInputValue)) {
            setErrorMessage(PASSWORD_ERROR)
            setPasswordInputValue("")
            setPassword2InputValue("")
        }
        else {
            const fetchData = async () => {
                const result = await axios(`http://localhost:3030/users/${recoveredUser}`)
                const user = {...result.data, password: await calculateHash(passwordInputValue)}
                const response = await axios.put(`http://localhost:3030/users/${recoveredUser}`, user)
                logIn(user)
                hideModal()
            };
            fetchData();
        }
    };

    return (
        <div>
            <div className="modal-window__main-title">
                Set new Password
            </div>
            <form onSubmit={handleSubmit} className="modal-window__auth-form auth-form">
                <label className="auth-form__field form-field">
                    <span className="form-field__title">New Password *</span>
                    <input type="password" className="form-field__input" required value={passwordInputValue} onChange={(event) => {
                        setPasswordInputValue(event.target.value)
                    }} />
                </label>
                <label className="auth-form__field form-field">
                    <span className="form-field__title">Repeat New Password *</span>
                    <input type="password" className="form-field__input" required value={password2InputValue} onChange={(event) => {
                        setPassword2InputValue(event.target.value)
                    }} />
                </label>
                {errorMessage && <div className="modal-window__error">{errorMessage}</div>}
                <button type="submit" className="auth-form__submit-button">Sign Up</button>
            </form>
        </div>
    )
}

export default Modal__NewPassword