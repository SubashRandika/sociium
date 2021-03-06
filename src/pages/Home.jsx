import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Layout, Row, Col, Skeleton } from 'antd';
import './Home.scss';

import Navbar from '../components/Navbar/Navbar';
import Post from '../components/Post/Post';

function Home() {
	const { Content } = Layout;
	const [posts, setPosts] = useState(null);
	const authToken = useState(localStorage.getItem('AuthToken'))[0];

	useEffect(() => {
		axios
			.get('/posts', {
				headers: { Authorization: authToken }
			})
			.then((res) => {
				setPosts(res.data);
			})
			.catch((err) => {
				console.error(err);
			});
	}, [authToken]);

	return (
		<div>
			<Layout className='layout'>
				<Navbar />
			</Layout>
			<Content className='content'>
				<Row gutter={[32, 0]}>
					<Col xs={24} sm={24} md={24} lg={6} xl={6}>
						Profile
					</Col>
					<Col xs={24} sm={24} md={24} lg={12} xl={12}>
						{posts
							? posts.map((post) => (
									<Post key={post.postId} post={post} />
							  ))
							: [1, 2, 3].map((item) => (
									<Skeleton
										key={item}
										className='post_skeleton'
										active
										avatar
									></Skeleton>
							  ))}
					</Col>
					<Col xs={24} sm={24} md={24} lg={6} xl={6}>
						Followers
					</Col>
				</Row>
			</Content>
		</div>
	);
}

export default Home;
