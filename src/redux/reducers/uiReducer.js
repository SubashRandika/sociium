import { SET_ERRORS, CLEAR_ERRORS, LOADING_UI } from '../types';

const initialUIState = {
	loading: false,
	error: null
};

const uiReducer = (state = initialUIState, action) => {
	switch (action.type) {
		case SET_ERRORS:
			return {
				...state,
				loading: false,
				error: action.payload
			};
		case CLEAR_ERRORS:
			return {
				...state,
				loading: false,
				error: null
			};
		case LOADING_UI:
			return {
				...state,
				loading: true
			};
		default:
			return state;
	}
};

export default uiReducer;
