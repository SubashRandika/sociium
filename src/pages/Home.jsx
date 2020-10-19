import React from 'react';
import { Layout } from 'antd';

import Navbar from '../components/Navbar/Navbar';

function Home() {
	const { Content } = Layout;

	return (
		<div>
			<Layout className='layout'>
				<Navbar />
			</Layout>
			<Content>
				<h3>Home Page</h3>
			</Content>
		</div>
	);
}

export default Home;
