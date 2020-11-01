import axios from 'axios';
import { SET_USER, SET_ERRORS, CLEAR_ERRORS, LOADING_UI } from '../types';

export const userSignIn = (userCredentials, history) => (dispatch) => {
	dispatch({
		type: LOADING_UI
	});

	axios
		.post('/signin', userCredentials)
		.then((res) => {
			const authToken = `Bearer ${res.data.token}`;
			localStorage.setItem('AuthToken', authToken);
			axios.defaults.headers.common['Authorization'] = authToken;

			dispatch(getUserData());
			dispatch({
				type: CLEAR_ERRORS
			});

			history.push('/');
		})
		.catch((err) => {
			dispatch({
				type: SET_ERRORS,
				payload: err.response.data
			});
		});
};

export const getUserData = () => (dispatch) => {
	axios
		.get('/users')
		.then((res) => {
			dispatch({
				type: SET_USER,
				payload: res.data
			});
		})
		.catch((err) => {
			console.error(err);
		});
};
