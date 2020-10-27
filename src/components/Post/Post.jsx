import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { Comment, Tooltip, Avatar } from 'antd';
import { LikeOutlined, MessageOutlined } from '@ant-design/icons';

import './Post.scss';
import Actions from '../Actions/Actions';

function Post({ post }) {
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
				<Link to={`/users/${userName}`}>
					<Avatar src={userImage} alt={userName} />
				</Link>
			}
			content={<p>{body}</p>}
			datetime={
				<Tooltip title={moment(createdAt).format('llll')}>
					<span className='posted_date'>
						{moment(createdAt).fromNow()}
					</span>
				</Tooltip>
			}
		></Comment>
	);
}

export default Post;
