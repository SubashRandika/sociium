import { CLEAR_ERRORS } from '../types';

export const clearErrorAlert = () => (dispatch) => {
	dispatch({
		type: CLEAR_ERRORS
	});
};
