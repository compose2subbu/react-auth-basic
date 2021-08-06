import React, { useCallback, useEffect, useState } from 'react';

let logoutTimer;

const AuthContext = React.createContext({
    token: '',
    isLoggedIn: false,
    login: (token) => {},
    logout: () => {},
});

const calculateRemainingTime = (expirationTime) => {
    const currentTime = new Date().getTime();
    //console.log('currentTime:'+currentTime)
    const adjExpirationTime = new Date(expirationTime).getTime();
    //console.log('adjExpirationTime:'+adjExpirationTime)
    const remainingDuration = adjExpirationTime - currentTime;
    //console.log('remainingDuration:'+remainingDuration)
    return remainingDuration;
};

const retrievesStoredToken = () => {
    const storedToken = localStorage.getItem('token');
    const storedExpirationDate = localStorage.getItem('expirationTime');
    const remainingTime = calculateRemainingTime(storedExpirationDate);
    if(remainingTime <= 60000){
        localStorage.removeItem('token');
        localStorage.removeItem('expirationTime');
        return null;
    }
    return {
        token: storedToken,
        duration: remainingTime
    };
};

export const AuthContextProvider = (props) => {
    const tokenData = retrievesStoredToken();
    let initialToken;
    if(tokenData){
        initialToken = tokenData.token;
    }
    initialToken = localStorage.getItem('token');
    const [token, setToken] = useState(initialToken);

    const userIsLoggedIn = !!token;
    //console.log('here')


    const logoutHandler = useCallback(() => {
        //console.log('heree')
        setToken(null);
        localStorage.removeItem('token')
        localStorage.removeItem('expirationTime')
        if(logoutTimer){
            //console.log('here')
            clearTimeout(logoutTimer);
        }
    }, []);

    const loginHandler = (token, expirationTime) => {
        //console.log('here1')
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('expirationTime',expirationTime);
        const remainingTime = calculateRemainingTime(expirationTime);
        //console.log(remainingTime);
        logoutTimer = setTimeout(logoutHandler, remainingTime);
    };

    useEffect(() => {
        if(tokenData){
            console.log(tokenData.duration)
            logoutTimer = setTimeout(logoutHandler, tokenData.duration);
        }
    }, [tokenData])

    const contextValue = {
        token: token,
        isLoggedIn: userIsLoggedIn,
        login: loginHandler,
        logout: logoutHandler,
    }

    return <AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>;
}

export default AuthContext;