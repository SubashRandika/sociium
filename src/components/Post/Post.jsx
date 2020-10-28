import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link } from 'react-router-dom';
import { Comment, Tooltip, Avatar } from 'antd';
import { LikeOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons';

import './Post.scss';
import Actions from '../Actions/Actions';

function Post({ post }) {
	dayjs.extend(relativeTime);

	const {
		userName,
		body,
		userImage,
		likeCount,
		commentCount,
		createdAt
	} = post;

	const actions = [
		<Actions
			uniqueKey='likes-count'
			icon={<LikeOutlined />}
			value={likeCount}
			tooltipTitle='Like'
		/>,
		<Actions
			uniqueKey='comments-count'
			icon={<MessageOutlined />}
			value={commentCount}
			tooltipTitle='Comment'
		/>
	];

	return (
		<Comment
			className='post'
			actions={actions}
			author={
				<Link className='posted_user' to={`/users/${userName}`}>
					{userName}
				</Link>
			}
			avatar={
				<Link className='post_avatar' to={`/users/${userName}`}>
					{userImage ? (
						<Avatar src={userImage} alt={userName} />
					) : (
						<Avatar icon={<UserOutlined />} alt={userName} />
					)}
				</Link>
			}
			content={<p>{body}</p>}
			datetime={
				<Tooltip
					title={dayjs(createdAt).format('ddd, MMM DD, YYYY h:mm a')}
				>
					<span className='posted_date'>
						{dayjs(createdAt).fromNow()}
					</span>
				</Tooltip>
			}
		></Comment>
	);
}

export default Post;
