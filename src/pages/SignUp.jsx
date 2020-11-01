import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import {
	Row,
	Col,
	Avatar,
	Form,
	Input,
	Tooltip,
	Button,
	Checkbox,
	Alert
} from 'antd';
import {
	MailOutlined,
	LockOutlined,
	UserOutlined,
	QuestionCircleOutlined
} from '@ant-design/icons';
import './SignUp.scss';

function SignUp() {
	const initialSignUpValues = {
		email: '',
		password: '',
		confirmPassword: '',
		userName: '',
		agreement: false
	};
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

	const passwordsMatchValidate = ({ getFieldValue }) => ({
		validator(rule, value) {
			if (!value || getFieldValue('password') === value) {
				return Promise.resolve();
			}
			return Promise.reject('Do not match with your password');
		}
	});

	const confirmPasswordValidationRules = [
		{
			required: true,
			message: 'Please confirm your password'
		},
		passwordsMatchValidate
	];

	const userNameValidationRules = [
		{
			required: true,
			message: 'Please enter your username'
		},
		{
			whitespace: true,
			message: 'Enter your username without whitespaces'
		}
	];

	const handleSignUp = (userData) => {
		setLoading(true);

		const newUserData = {
			email: userData.email,
			password: userData.password,
			confirmPassword: userData.confirmPassword,
			userName: userData.userName
		};

		axios
			.post('/signup', newUserData)
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

	const handleSignUpFailed = (errorInfo) => {
		console.error('Failed', errorInfo);
	};

	const handleAlertClose = (event) => {
		setErrors(null);
	};

	return (
		<Row className='signup_row'>
			<Col className='signup_col' span={8} offset={8}>
				{errors && (
					<Alert
						type='error'
						message={`Error in ${errors.field.toLowerCase()} field`}
						description={errors.message}
						showIcon
						closable
						onClose={handleAlertClose}
					/>
				)}
				<div className='signup_card'>
					<Avatar
						shape='square'
						icon={<img src='logo.png' alt='Si' />}
						size={40}
					/>
					<h2 className='signup_text'>Welcome to Sociium</h2>
					<Form
						name='signup_form'
						className='signup_form'
						initialValues={initialSignUpValues}
						onFinish={handleSignUp}
						onFinishFailed={handleSignUpFailed}
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
								placeholder='Password'
								prefix={
									<LockOutlined className='form_item_icon' />
								}
							/>
						</Form.Item>
						<Form.Item
							className='confirmPassword_form_item'
							name='confirmPassword'
							dependencies={['password']}
							rules={confirmPasswordValidationRules}
							hasFeedback
						>
							<Input.Password
								placeholder='Confirm Password'
								prefix={
									<LockOutlined className='form_item_icon' />
								}
							/>
						</Form.Item>
						<Form.Item
							className='userName_form_item'
							name='userName'
							rules={userNameValidationRules}
							hasFeedback
						>
							<Input
								placeholder='Username'
								prefix={
									<UserOutlined className='form_item_icon' />
								}
								suffix={
									<Tooltip title='What do you want us to call you?'>
										<QuestionCircleOutlined />
									</Tooltip>
								}
							/>
						</Form.Item>
						<Form.Item className='agreement_form_item'>
							<Form.Item
								name='agreement'
								valuePropName='checked'
								noStyle
							>
								<Checkbox>Agree the terms and policy</Checkbox>
							</Form.Item>
						</Form.Item>
						<Form.Item className='signup_btn_form_item'>
							<Button
								className='signup_button'
								type='primary'
								htmlType='submit'
								loading={loading}
							>
								Sign Up
							</Button>
						</Form.Item>
						<Form.Item className='signin_text_form_item'>
							<span>Already have an account?</span>
							<span>
								<Link className='signin_link' to='/signin'>
									Sign In
								</Link>
							</span>
						</Form.Item>
					</Form>
				</div>
			</Col>
		</Row>
	);
}

export default SignUp;
