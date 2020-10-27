import React from 'react';
import { Tooltip } from 'antd';
import './Actions.scss';

function Actions({ uniqueKey, icon, value, tooltipTitle }) {
	return [
		<Tooltip key={uniqueKey} title={tooltipTitle}>
			<span className='action icon'>{icon}</span>
			<span className='action value'>{value}</span>
		</Tooltip>
	];
}

export default Actions;
