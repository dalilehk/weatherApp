import React, { Component } from 'react';
import './App.css';
import Form from './Form';
// import Result from './Result';
import LocationDate from './LocationDate';
import CurrentTemp from './CurrentTemp';
import CurrentStats from './CurrentStats';
import NextDays from './NextDays';
const APIKey = 'cd89e16113fe3e44eacf3e7726ef8614';

class App extends Component {
	state = {
		value: '',
		err: '',
		err2: '',

		locationDate: {
			currentTime: new Date(),
			city: '',
			country: '',
			lat: '',
			lon: '',
		},
		currentWeather: {
			sunrise: '',
			sunset: '',
			temp: '',
			tempMax: '',
			tempMin: '',
			pressure: '',
			wind: '',
			icon: '',
			description: '',
		},

		forecast: {
			days: [],
		},
	};

	handleInputChange = (e) => {
		this.setState({
			value: e.target.value,
		});
	};

	componentDidUpdate(prevProps, prevState) {
		let lat = this.state.locationDate.lat;
		let lon = this.state.locationDate.lon;
		if (this.state.value.length < 2) return;
		if (prevState.value !== this.state.value) {
			const API = `http://api.openweathermap.org/data/2.5/weather?q=${this.state.value}&appid=${APIKey}&units=metric`;
			// const API = `http://api.openweathermap.org/data/2.5/weather?q=Sidney&appid=${APIKey}&units=metric&lang=en`;

			const API2 = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&appid=${APIKey}&units=metric&lang=en`;

			// API - current Weather
			fetch(API)
				.then((response) => {
					if (response.ok) {
						return response;
					}
					throw Error(`Fail. Didn't find the city:"${this.state.value}"`);
				})
				.then((response) => response.json())
				.then((data) => {
					console.log('API 1:');
					console.log(data);
					const time = new Date();
					this.setState((prevState) => ({
						err: false,

						locationDate: {
							currentTime: time,
							city: prevState.value,
							country: data.sys.country,
							lat: data.coord.lat,
							lon: data.coord.lon,
						},
						currentWeather: {
							sunrise: data.sys.sunrise,
							sunset: data.sys.sunset,
							temp: Math.round(data.main.temp),
							tempMax: Math.round(data.main.temp_max),
							tempMin: Math.round(data.main.temp_min),
							pressure: data.main.pressure,
							wind: Math.round(data.wind.speed),
							icon: data.weather[0].icon,
							description: data.weather[0].description,
						},
					}));
				})
				.catch((err) => {
					console.log('error1');
					this.setState((prevState) => ({
						err: true,
						currentWeather: {
							city: prevState.value,
						},
						locationDate: {
							lat: '',
							lon: '',
						},
					}));
				});

			// API2 - hourly, daily forecast
			if (!this.state.err) {
				fetch(API2)
					.then((response) => {
						if (response.ok) {
							return response;
						}
						throw Error(`Fail. Didn't find the city:"${this.state.value}"`);
					})
					.then((response) => response.json())
					.then((data2) => {
						console.log('API 2:');
						console.log(data2);

						const days = data2.daily;
						this.setState({
							err: false,
							forecast: {
								days: [...days],
							},
						});
					})
					.catch((err2) => {
						console.log('error2');
						this.setState((prevState) => ({
							err2: true,
						}));
					});
			}
		}
	}

	render() {
		let result = null;
		if (!this.state.err && this.state.locationDate.city) {
			result = (
				<>
					<LocationDate locationDate={this.state.locationDate} error={this.state.err} />
					<CurrentTemp weather={this.state.currentWeather} />
					<CurrentStats weather={this.state.currentWeather} />
					<NextDays locationDate={this.state.locationDate} forecast={this.state.forecast} />
				</>
			);
		}
		return (
			<div className="App">
				<Form
					value={this.state.value}
					change={this.handleInputChange}
					submit={this.handleCitySubmit}
				/>
				<div className="result">
					{this.state.error
						? `in our database there is no city: ${this.state.locationDate.city}`
						: result}
				</div>
			</div>
		);
	}
}

export default App;

//1. Dlaczego nie wyświetla diva result i komunikatu z warunku linia 160?
// 2. fetch API2 bazuje na danych wyplutych z API1, co oznacza, że dopiero przy kolejnym renderze są te dane spójne. Jak to naprawić ?  Jak to się objawia?...: np. wpisać miasto WAR (pojawią się pola generowane przez API1, ale już nie pojawi się Forecast generowany przez API2, bo ten fetch otrzyma dane wejściowe dopiero przy kolejnym renderze...)... w zwiazku z tym, jak bedziemy pisać dalej i np. napiszemy "WARSZAWA" to dane na kolejnych 5 dni będą niewłaściwe, bo będą odnosić się do stanu który był odnaleziony poprzednio (tutaj miasto "WAR")
// 3. Problem z pobraniem (przekonwertowaniem) daty z API2(dzień i miesiąć) . Patrze data w forecast na kolejne 5 dni. Komponent: NextDays.js
//
