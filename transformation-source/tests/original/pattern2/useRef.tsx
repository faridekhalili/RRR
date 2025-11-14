import React, {useEffect, useState} from 'react';

import './AgeStyle.css';
import Form from "../Form/Form";


const Age = () => {
    const [age, setAge] = useState({years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0});
    const [agePerson, setAgePerson] = useState();

    const [years, setYears] = useState(false);
    const [months, setMonths] = useState(false);
    const [days, setDays] = useState(false);
    const [hours, setHours] = useState(false);
    const [minutes, setMinutes] = useState(false);
    const [seconds, setSeconds] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            let birthday = new Date(agePerson);
            let now = new Date();
            let diff = Math.abs(now.getTime() - birthday.getTime());

            const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
            diff -= years * (1000 * 60 * 60 * 24 * 365.25);

            const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
            diff -= months * (1000 * 60 * 60 * 24 * 30.44);

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            diff -= days * (1000 * 60 * 60 * 24);

            const hours = Math.floor(diff / (1000 * 60 * 60));
            diff -= hours * (1000 * 60 * 60);

            const minutes = Math.floor(diff / (1000 * 60));
            diff -= minutes * (1000 * 60);

            const seconds = Math.floor(diff / 1000);

            setAge({years, months, days, hours, minutes, seconds});
        }, 1000);

        return () => clearInterval(interval);
    }, [agePerson]);

    useEffect(() => {
        const timerYears = setTimeout(() => {
            setYears(true);
        }, 1000);
        return () => clearTimeout(timerYears);
    }, []);

    useEffect(() => {
        const timerMonths = setTimeout(() => {
            setMonths(true);
        }, 2000);
        return () => clearTimeout(timerMonths);
    }, []);

    useEffect(() => {
        const timerDay = setTimeout(() => {
            setDays(true);
        }, 3000);
        return () => clearTimeout(timerDay);
    }, []);

    useEffect(() => {
        const timerHours = setTimeout(() => {
            setHours(true);
        }, 4000);
        return () => clearTimeout(timerHours);
    }, []);

    useEffect(() => {
        const timerMinutes = setTimeout(() => {
            setMinutes(true);
        }, 5000);
        return () => clearTimeout(timerMinutes);
    }, []);

    useEffect(() => {
        const timerSeconds = setTimeout(() => {
            setSeconds(true);
        }, 6000);
        return () => clearTimeout(timerSeconds);
    }, []);


    return (
        <div className={'age'}>
            <Form setAgePerson={setAgePerson}/>

            <div className={'textBlock'}>
                <div className={`textAge ${years ? "showAge" : ""}`}>
                    <p>Years:</p>
                    <p className={'infoAge'}>{agePerson ? age.years : 0}</p>
                </div>

                <div className={`textAge ${months ? "showAge" : ""}`}>
                    <p>Months:</p>
                    <p className={'infoAge'}>{agePerson ? age.months : 0}</p>
                </div>

                <div className={`textAge ${days ? "showAge" : ""}`}>
                    <p>Days:</p>
                    <p className={'infoAge'}>{agePerson ? age.days : 0}</p>
                </div>

                <div className={`textAge ${hours ? "showAge" : ""}`}>
                    <p>Hours:</p>
                    <p className={'infoAge'}>{agePerson ? age.hours : 0}</p>
                </div>

                <div className={`textAge ${minutes ? "showAge" : ""}`}>
                    <p>Minutes:</p>
                    <p className={'infoAge'}>{agePerson ? age.minutes : 0}</p>
                </div>

                <div className={`textAge ${seconds ? "showAge" : ""}`}>
                    <p>Seconds:</p>
                    <p className={'infoAge'}>{agePerson ? age.seconds : 0}</p>
                </div>
            </div>
        </div>
    );
};

export default Age;