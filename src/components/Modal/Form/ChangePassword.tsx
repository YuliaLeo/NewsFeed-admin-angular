import React, {useContext, useRef, useState} from "react";
import "./ChangePassword.scss"
import axios from "axios";
import {calculateHash} from "../../../encrypt/Hash"
import {validPassword} from "../../../Regex/Regex"
import classNames from "classnames";
import {userContext} from "../../../Context/UserContext";
import {modalContext} from "../../../Context/ModalContext";
import PulseLoader from "react-spinners/PulseLoader";

interface IUserIDProps {
    userID: number
}

const ChangePassword = (props: IUserIDProps) => {
    const PASSWORD_ERROR    = "The password must contain at least 6 valid characters"
    const PASSWORD2_ERROR   = "Passwords must match"

    const passwordInputDOM  = useRef<HTMLInputElement>(null)

    const recoveredUser = props.userID

    const logIn     = useContext(userContext).logIn;
    const hideModal = useContext(modalContext).hideModal;

    const [passwordInputValue, setPasswordInputValue]   = useState('')
    const [password2InputValue, setPassword2InputValue] = useState('')
    const [errorMessage, setErrorMessage]               = useState('')
    const [loading, setLoading]                         = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (passwordInputValue !== password2InputValue) {
            setErrorMessage(PASSWORD2_ERROR)
            setPasswordInputValue("")
            setPassword2InputValue("")
            passwordInputDOM.current!.focus();
        }
        else if (!validPassword.test(passwordInputValue)) {
            setErrorMessage(PASSWORD_ERROR)
            setPasswordInputValue("")
            setPassword2InputValue("")
            passwordInputDOM.current!.focus();
        }
        else {
            const fetchData = async () => {
                setLoading(true)
                const result = await axios(`http://localhost:3030/users/${recoveredUser}`)
                const user = {...result.data, password: await calculateHash(passwordInputValue)}
                await axios.put(`http://localhost:3030/users/${recoveredUser}`, user)
                setLoading(false)
                logIn(user)
                hideModal()
            };
            fetchData();
        }
    };

    const passwordFieldClass = classNames({
        "form-field": true,
        "form-field--error": !!errorMessage,
    })

    return (
        <form onSubmit={handleSubmit} className="modal-window__auth-form recoveryForm">
            <label className={passwordFieldClass}>
                <span className="form-field__title">New Password *</span>
                <input ref={passwordInputDOM} type="password" className="form-field__input" required value={passwordInputValue} onChange={(event) => {
                    setPasswordInputValue(event.target.value)
                }} />
            </label>
            <label className={passwordFieldClass}>
                <span className="form-field__title">Repeat New Password *</span>
                <input type="password" className="form-field__input" value={password2InputValue} onChange={(event) => {
                    setPassword2InputValue(event.target.value)
                }} />
            </label>
            {errorMessage && <div className="modal-window__error">{errorMessage}</div>}
            <button type="submit" className="recoveryForm__submitButton"
                disabled={(
                    !passwordInputValue ||
                    !password2InputValue ||
                    loading
                )}>
                Save new password
                <div className="recoveryForm__spinner">
                    <PulseLoader
                        color="#ffffff"
                        loading={loading}
                        size={10}
                    />
                </div>
            </button>
        </form>
    )
}

export default ChangePassword