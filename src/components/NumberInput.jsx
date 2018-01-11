import React, { Component } from 'react'
import { Form, InputNumber } from 'antd';
const FormItem = Form.Item;

function validatePrimeNumber(number) {
	if (number <= 10 && number > 0) {
		return {
			validateStatus: 'success',
			errorMsg: null,
		};
	}
	return {
		validateStatus: 'error',
		errorMsg: '请输入1-10之间的数字',
	};
}

export default class NumberInput extends Component {
	state = {
		number: {
			value: this.props.number ,
		},
	};
	handleNumberChange = (value) => {
		this.setState({
			number: {
				...validatePrimeNumber(value),
				value,
			},
		});
	}
	/**
	 * 失去焦点的时候 出发事件
	 */
	handleBlurChange() {
		// 1.确保值有改变
		if (this.state.number.value !== this.props.number) {
			// 2.确保值是正确的
			if (!this.state.number.errorMsg) {
				// 3.将值传出去
				this.props.handleBlurChange(this.state.number.value)
			}

		}

	}
	render() {
		const number = this.state.number;
		const tips = '';
		return (
			<Form>
				<FormItem

					label="小应用最多添加个数"
					validateStatus={number.validateStatus}
					help={number.errorMsg || tips}
				>
					<InputNumber
						min={0}
						max={10}
						value={number.value}
						onChange={this.handleNumberChange}
						onBlur={this.handleBlurChange.bind(this)}
					/>
				</FormItem>
			</Form>
		);
	}
}