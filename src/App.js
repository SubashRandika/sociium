import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ProtectedRoute from './pages/ProtectedRoute';

import './theme/custom-theme.css';
import './App.scss';

function App() {
	return (
		<div className='App'>
			<Router>
				<Switch>
					<ProtectedRoute exact path='/' component={Home} />
					<Route exact path='/signin' component={SignIn} />
					<Route exact path='/signup' component={SignUp} />
				</Switch>
			</Router>
		</div>
	);
}

export default App;
