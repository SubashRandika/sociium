import React from 'react';
import { PropTypes } from 'prop-types';
import { Link, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { Row, Col, Avatar, Form, Input, Button, Checkbox, Alert } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import './SignIn.scss';
import { userSignIn } from '../redux/actions/userActions';
import { clearErrorAlert } from '../redux/actions/uiActions';

function SignIn({ ui: { loading, error }, userSignIn, clearErrorAlert }) {
	const initialSignInValues = { email: '', password: '', remember: false };
	const history = useHistory();

	const emailValidationRules = [
		{
			type: 'email',
			message: 'Email is not a valid one'
		},
		{
			required: true,
			message: 'Please enter your email'
		}
	];

	const passwordValidationRules = [
		{
			required: true,
			message: 'Please enter your password'
		}
	];

	const handleSignIn = (credentials) => {
		const userCredentials = {
			email: credentials.email,
			password: credentials.password
		};

		userSignIn(userCredentials, history);
	};

	const handleSignInFailed = (errorInfo) => {
		console.error('Failed', errorInfo);
	};

	const handleAlertClose = (event) => {
		clearErrorAlert();
	};

	return (
		<Row className='signin_row'>
			<Col className='signin_col' span={8} offset={8}>
				{error && (
					<Alert
						type='error'
						message={error.code}
						description={error.message}
						showIcon
						closable
						onClose={handleAlertClose}
					/>
				)}
				<div className='signin_card'>
					<Avatar
						shape='square'
						icon={<img src='logo.png' alt='Si' />}
						size={40}
					/>
					<h2 className='signin_text'>Welcome to Sociium</h2>
					<Form
						className='signin_form'
						name='signin_form'
						initialValues={initialSignInValues}
						onFinish={handleSignIn}
						onFinishFailed={handleSignInFailed}
					>
						<Form.Item
							className='email_form_item'
							name='email'
							rules={emailValidationRules}
							hasFeedback
						>
							<Input
								prefix={
									<MailOutlined className='form_item_icon' />
								}
								placeholder='Email'
							/>
						</Form.Item>
						<Form.Item
							className='password_form_item'
							name='password'
							rules={passwordValidationRules}
							hasFeedback
						>
							<Input.Password
								prefix={
									<LockOutlined className='form_item_icon' />
								}
								placeholder='Password'
							/>
						</Form.Item>
						<Form.Item className='remember_form_item'>
							<Form.Item
								name='remember'
								valuePropName='checked'
								noStyle
							>
								<Checkbox>Remember me</Checkbox>
							</Form.Item>
							<Link className='signin_form_forgot' to='/signin'>
								Forgot password?
							</Link>
						</Form.Item>
						<Form.Item className='signin_btn_form_item'>
							<Button
								className='signin_button'
								type='primary'
								htmlType='submit'
								loading={loading}
							>
								Sign In
							</Button>
						</Form.Item>
						<Form.Item className='signup_text_form_item'>
							<span>Do not have an account?</span>
							<span>
								<Link className='signup_link' to='/signup'>
									Sign Up
								</Link>
							</span>
						</Form.Item>
					</Form>
				</div>
			</Col>
		</Row>
	);
}

SignIn.propTypes = {
	user: PropTypes.object.isRequired,
	ui: PropTypes.object.isRequired,
	userSignIn: PropTypes.func.isRequired,
	clearErrorAlert: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
	user: state.user,
	ui: state.ui
});

const mapDispatchToProps = (dispatch) => ({
	userSignIn: (userCredentials, history) =>
		dispatch(userSignIn(userCredentials, history)),
	clearErrorAlert: () => dispatch(clearErrorAlert())
});

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);
