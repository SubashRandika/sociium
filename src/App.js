import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ProtectedRoute from './pages/ProtectedRoute';

import { Provider } from 'react-redux';
import store from './redux/store';

import './theme/custom-theme.css';
import './App.scss';

function App() {
	return (
		<Provider store={store}>
			<Router>
				<Switch>
					<ProtectedRoute exact path='/' component={Home} />
					<Route exact path='/signin' component={SignIn} />
					<Route exact path='/signup' component={SignUp} />
				</Switch>
			</Router>
		</Provider>
	);
}

export default App;
