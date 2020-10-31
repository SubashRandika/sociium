import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import { Row, Col, Avatar, Form, Input, Button, Checkbox, Alert } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import './SignIn.scss';

function SignIn() {
	const initialSignInValues = { email: '', password: '', remember: false };
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState(null);
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
		setLoading(true);

		const userCredentials = {
			email: credentials.email,
			password: credentials.password
		};

		axios
			.post('/signin', userCredentials)
			.then((res) => {
				localStorage.setItem('AuthToken', `Bearer ${res.data.token}`);
				setLoading(false);
				history.push('/');
			})
			.catch((err) => {
				console.error(err.response.data);
				setErrors(err.response.data);
				setLoading(false);
			});
	};

	const handleSignInFailed = (errorInfo) => {
		console.error('Failed', errorInfo);
	};

	const handleAlertClose = (event) => {
		setErrors(null);
	};

	return (
		<Row className='signin_row'>
			<Col className='signin_col' span={8} offset={8}>
				{errors && (
					<Alert
						type='error'
						message={errors.code}
						description={errors.message}
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

export default SignIn;
