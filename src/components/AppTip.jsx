import React, { Component } from "react";
import className from "classnames";
import http from '@/ajax'
// import { getAppList } from '@/ajax/api'
export default class ConfigModal extends Component {
	constructor(props) {
		super(props)

		this.state = {
			tipData: []
		}
	}
	getItems(selectClass) {
		return this.state.tipData.map(({ url, ico, name, mark, pgeico }) => {
			return (
				<div className="app-modal-item" key={pgeico}>
					{this.props.mark === mark ? <i className={selectClass} /> : null}
					<img
						alt={name}
						src={ico}
						onClick={() => {
							this.props.handelChangeApp({url,pgeico,name,mark});
						}}
					/>
					<span className="app-modal-name">{name}</span>
				</div>
			);
		});
	}

	componentDidMount() {
		if (!window.tipData) {
			http.get(getAppList, { terminal: "PC", cn: '200196' })
				.then(data => {
					this.setState({
						tipData: data
					})
					window.tipData = data
				})
		}else{
			this.setState({
				tipData:window.tipData
			})
		}

	}

	render() {
		const selectClass = className({
			"app-select-icon": true,
		});
		return (
			<div className="app-modal-box">
				<div className="app-modal">
					<div className="app-modal-title">
						<span>小应用设置</span>
						<i
							className="iconfont icon-delete"
							onClick={this.props.handelClose}
						/>
					</div>
					<div className="app-modal-content">{this.getItems(selectClass)}</div>
				</div>
			</div>
		);
	}
}
