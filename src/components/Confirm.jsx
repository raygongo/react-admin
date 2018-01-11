import ReactDOM from 'react-dom';
import React, {  Component } from 'react'
import { Button} from 'antd';


class ConfirmBox extends Component {
    onOk(){
     this.props.onOk()
    this.cancel()
    }

    cancel(){
        this.props.cancel()
    }

    render() {
        return (
            <div className="confirm-wrap">
                <div className="confirm-box">
                    <div className="confirm-header">
                        <div className="confirm-title">
                            提&nbsp;&nbsp;示
                                </div>
                        <span className="confirm-close" onClick={() => { this.cancel() }}></span>
                    </div>
                    <div className="confirm-body">
                        <div className="confirm-content">
                            {this.props.title}
                        </div>
                    </div>

                    <div className="confirm-footer">
                        <Button type="primary" ghost style={{marginRight:20}} onClick={() => { this.onOk() }}>确定</Button>
                        <Button type="primary" ghost onClick={() => { this.cancel() }}>取消</Button>
                    </div>
                </div>
            </div>
        )
    }
}


export default  {
    message:({ title, onOk, }) => {
    let confirm = document.createElement("div")
    document.body.appendChild(confirm)
    ReactDOM.render(<ConfirmBox onOk={onOk} title={title} cancel={() => { document.body.removeChild(confirm) }} />, confirm);
}
}