import React, { Component } from 'react';
import { Button, Modal } from 'antd';

export default class StatusBar extends Component {

    constructor(props) {
        super(props)
        this.state = {
            checked: this.props.checked,
            visible: false,
        }
    }
    changeStatus(e) {
        if (e.target.value === this.state.checked) return
        this.setState({
            checked: e.target.value
        })

    }
    /**
     * 提交修改状态的值
     */
    handleChangeStatus() {
        // 判断值是更改的才发送
        if (this.state.checked === this.props.checked) return
        Modal.confirm({
            title: this.state.checked == '1' ? '你确定要保存？' : '你确认要停用吗？',
            content: (this.state.checked == '1') && '该布局启用后其他已启用布局将自动停止!',
            onOk: () => {
                this.props.onChange(this.state.checked, this.props.cid, this.props.mode)
            }
        })

    }
    componentWillReceiveProps = ({ checked }) => {
        this.setState({
            checked: checked
        })
    }

    render() {
        return (
            <div className="status-bar" >
                状态:
            <label >
                    <input type="radio" value={1} onChange={this.changeStatus.bind(this)} checked={this.state.checked == 1} />
                    启用
                    </label>
                <label >
                    <input type="radio" value={0} onChange={this.changeStatus.bind(this)} checked={this.state.checked == 0} />
                    停用
                    </label>
                <Button type="primary" disabled={this.props.checked==this.state.checked} onClick={this.handleChangeStatus.bind(this)} style={{ float: 'right', top: '10px' }}>
                    保存
                    </Button>

            </div >
        )
    }
}