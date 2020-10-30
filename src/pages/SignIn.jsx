import React from 'react';
import { Row, Col, Avatar, Form, Input, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import './SignIn.scss';

function SignIn() {
	return (
		<Row className='signin_row'>
			<Col className='signin_col' span={8} offset={8}>
				<div className='signin_card'>
					<Avatar
						shape='square'
						icon={<img src='logo.png' alt='Si' />}
						size={40}
					/>
					<h2 className='signin_text'>Welcome to Sociium</h2>
					<Form name='login_form' className='login_form'>
						<Form.Item
							className='username_form_item'
							name='username'
							rules={[
								{
									required: true,
									message: 'Please enter your Username!'
								}
							]}
						>
							<Input
								prefix={
									<UserOutlined className='form_item_icon' />
								}
								placeholder='Username'
							/>
						</Form.Item>
						<Form.Item
							className='password_form_item'
							name='password'
							rules={[
								{
									required: true,
									message: 'Please enter your Password!'
								}
							]}
						>
							<Input
								prefix={
									<LockOutlined className='form_item_icon' />
								}
								type='password'
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
							<a className='login_form_forgot' href='/'>
								Forgot password?
							</a>
						</Form.Item>
						<Form.Item className='signin_btn_form_item'>
							<Button
								className='signin_button'
								type='primary'
								htmlType='submit'
							>
								Sign In
							</Button>
						</Form.Item>
						<Form.Item className='signup_text_form_item'>
							<span>Do not have an account?</span>
							<span>
								<a className='login_signup' href='/signup'>Sign Up</a>
							</span>
						</Form.Item>
					</Form>
				</div>
			</Col>
		</Row>
	);
}

export default SignIn;
