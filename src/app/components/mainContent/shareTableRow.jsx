/**
 * @component SharedFilesRow
 * @description SharedFilesRow
 * @time 2016-7-6
 * @author liuhua
 **/

'use strict';
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react';
import svg from '../../utils/SVGIcon';

class SharedFilesRow extends Component {
	constructor(props) {
        super(props);
        this.state = { deleteShow: false };
    }
	render() {
		let p = this.props;
		let item = p.item;
		return (
			<tr onDoubleClick={p.enterShare} onHover={this.hover}>
				<td>{item.name}</td>
				<td>{p.getShareUser(item.owner)}</td>
				<td  onMouseEnter={this.enter.bind(this)} onMouseLeave={this.leave.bind(this)} >
					<span>下载</span>
					<span style={this.state.deleteShow?{}:{display:'none'}}>删除</span>
				</td>
			</tr>
			)
	}

	enter() {
		this.setState({
			deleteShow:true
		});
	}

	leave() {
		this.setState({
			deleteShow:false
		});
	}
}

export default SharedFilesRow;