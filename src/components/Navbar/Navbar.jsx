import React from 'react';
import { Layout, Button, Avatar, Badge, Menu, Dropdown } from 'antd';
import { UserOutlined, BellOutlined } from '@ant-design/icons';
import './Navbar.scss';

function Navbar() {
	const { Header } = Layout;

	const menu = (
		<Menu>
			<Menu.Item>
				<a href='/#'>Your Profile</a>
			</Menu.Item>
			<Menu.Item>
				<a href='/#'>Settings</a>
			</Menu.Item>
		</Menu>
	);

	return (
		<Header className='navbar'>
			<div className='logo_container'>
				<Avatar
					shape='square'
					icon={<img src='logo.png' alt='Si' />}
					size={40}
				/>
				<span className='logo_text'>Sociium</span>
			</div>
			<div className='right_menu'>
				<Button className='signin-btn' ghost size='large' shape='round'>
					Log Out
				</Button>
				<Badge
					className='notification_counts'
					count={3}
					offset={[-22, 0]}
				>
					<BellOutlined className='notification_icon' />
				</Badge>
				<Dropdown overlay={menu}>
					<Badge
						className='online_dot'
						dot
						color='green'
						offset={[-2, 45]}
					>
						<Avatar
							className='avatar'
							icon={<UserOutlined />}
							size={40}
						/>
					</Badge>
				</Dropdown>
			</div>
		</Header>
	);
}

export default Navbar;
