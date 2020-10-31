import React from 'react';
import { Redirect } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

function ProtectedRoute({ component: Component }) {
	let isAuthenticated = false;
	const authToken = localStorage.AuthToken;

	if (authToken) {
		const decodedToken = jwtDecode(authToken);

		if (decodedToken.exp * 1000 < Date.now()) {
			isAuthenticated = false;
		} else {
			isAuthenticated = true;
		}
	}

	return isAuthenticated ? (
		<Component />
	) : (
		<Redirect to={{ pathname: '/signin' }} />
	);
}

export default ProtectedRoute;
