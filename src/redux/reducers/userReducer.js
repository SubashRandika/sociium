import { SET_USER, SET_AUTHENTICATED, SET_UNAUTHENTICATED } from '../types';

const initialUserState = {
	isAuthenticated: false,
	credentials: {},
	likes: [],
	notifications: []
};

const userReducer = (state = initialUserState, action) => {
	switch (action.type) {
		case SET_AUTHENTICATED:
			return {
				...state,
				isAuthenticated: true
			};
		case SET_UNAUTHENTICATED:
			return initialUserState;
		case SET_USER:
			return {
				isAuthenticated: true,
				...action.payload
			};
		default:
			return state;
	}
};

export default userReducer;
