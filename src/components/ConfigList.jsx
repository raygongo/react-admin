import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, notification, Radio } from 'antd';
import classNames from 'classnames'
import http from '@/ajax'
import Confirm from '@/components/Confirm.jsx'
import { editPortal, deletePortal, addPortal, findTerminalConfig } from '@/ajax/api'
import { message, Input, Select, Icon } from 'antd';
const Option = Select.Option;
const confirm = Confirm.message
const RadioGroup = Radio.Group;
const DEFAULT_STATE = 'DEFAULT'
const CUSTOM_STATE = 'CUSTOM'



export default class ConfigList extends Component {
    static contextTypes = {
        handelUpdateataByCid: PropTypes.func
    }
    constructor(props) {
        super(props)
        this.state = {
            listData: [],
            isAdding: false
        }
    }
    componentDidMount() {
        this.getListData()
    }
    /**
     * 获取数据
     */
    getListData() {
        let type = this.props.type
        // 获取pc端的 数据 并挂载到state上
        http.get(findTerminalConfig, {
            orgId: window.CONFIG.ORG_ID,
            terminal: type
        })
            .then(data => {
                // 找出对应的数据 单页 列表网格
                this.setState({
                    listData: data,
                    isAdding: false
                })

            })
    }

    /**
     * 查看是否有重复人员
     * @param {Array} staff 
     */
    checkRepeatPerson(staff, index) {
        const targetArr = this.state.listData

        return staff.some(({ cn }) => {

            return targetArr.some(({ auths }, i) => {
                if (i === index) return false
                return auths.some(item => item.cn === cn)
            })

        })

    }
    /**
     * 查看是否已经设置过默认页面
     */
    checkRepeatDefault(targetIndex) {
        return this.state.listData.some(({ state = '' }, index) => targetIndex === index ? false : state === DEFAULT_STATE)
    }
    /**
     * 查看是否已经设置相同url
     */
    checkRepeatURL(targetUrl, targetUrlState, targetIndex) {
        // 如果urlState是默认 则比较urlState
        return this.state.listData.some(({ urlState, url }, index) => {
            if (targetIndex === index) return false
            return targetUrlState === DEFAULT_STATE ? urlState === DEFAULT_STATE : targetUrl === url
        })
    }
    getItems() {
        return this.state.listData.map((itemData, index) => {
            itemData.urlState !== CUSTOM_STATE && (itemData.url = '')
            return (<ConfigListItem
                deleteConfigItem={this.deleteConfigItem.bind(this)}
                {...itemData}
                index={index}
                saveConfig={this.handelSaveConfigItem.bind(this)}
                key={itemData.id} />)
        })
    }
    /**
     * 添加新的单页配置
     */
    addNewConfig() {
        if (this.isAdding) return
        this.setState({
            listData: [
                ...this.state.listData,
                {
                    url: '',
                    id: false,
                    state: 'CUSTOM',
                    urlState: 'CUSTOM',
                    auths: [],
                    isEdit: true,
                    isAdd: true
                }
            ],
            isAdding: true
        })

    }
    /**
     * 保存配置项
     */
    handelSaveConfigItem({ state, props }) {
        // 判断是url的长度 需要先去掉 http
        let url = state.url
        let urlBody = ""
        if (/^(http:)/.test(url)) {
            urlBody = url.replace(/^(http:\/\/)/, "")
        } else if(/^(https:)/.test(url)){
            urlBody = url.replace(/^(https:\/\/)/, "")
        }
        if (state.urlState === CUSTOM_STATE && !urlBody.length) {
            notification.warning({
                message: '请填写链接地址!',
            });
            return
        }
        let title = '确定要保存修改?'
        state.isAdd && (title = '确定要新增?')
        // 进行校验 判断是否有重复的 人员
        if (this.checkRepeatPerson(state.staff, props.index)) {
            title = '已经设置了相同人员，是否替换？'
        }
        if (state.state === DEFAULT_STATE && this.checkRepeatDefault(props.index)) {
            title = '已设置默认页面，是否替换？'
        }

        confirm({
            title: title,
            closable: true,
            onOk: () => {
                this.saveOrUpdateConfigItem(state)
            }
        })

    }
    /**
     *  保存和编辑配置
     * @param {Obj} state 
     */
    saveOrUpdateConfigItem(state) {
        let params = {
            orgId: window.CONFIG.ORG_ID,
            state: state.state,
            urlState: state.urlState,
            terminal: this.props.type,
            url: state.urlState === 'CUSTOM' ? state.url : 'http://ff.fff.ff',
        }
        // 非默认下 才 传入选择的员工
        if (state.state === 'CUSTOM') {
            params.auths = state.staff
        }
        // 编辑
        if (state.id) {
            params.id = Number(state.id)
            delete params.terminal
            delete params.orgId

            http.post(editPortal, params)
                .then(data => {
                    // 提示
                    message.success('添加成功')

                    this.getListData()
                })
        } else {
            // 添加
            http.put(addPortal, params)
                .then(data => {
                    // 提示
                    message.success('编辑成功')

                    this.getListData()
                })
        }
    }
    /**
     *  删除单页配置项
     */
    deleteConfigItem(index, id) {
        let title = '确定要删除该条规则吗?'
        !id && (title = '确定要取消新增?')
        confirm({
            title: title,
            onOk: () => {
                // 分为两种情况删除 1. 本地删除 (添加配置未上传服务器)  2. 远程删除 已经保存 到服务器中
                // 1. 本地删除 (添加配置未上传服务器) 如果判断没有id
                // 2. 远程删除 

                if (id) {
                    // 如果该条配置有id 那对不起 说明 你是服务器上保存的 必须发请求删除
                    http.delete(deletePortal, Number(id))
                        .then(data => {
                            // 删除成功
                            message.success('删除成功')
                            // 成功后刷新数据
                            let list = this.state.listData

                            list.splice(index, 1)
                            this.setState({
                                listData: list
                            })
                        })
                } else {
                    // 删除 未保存的新增配置
                    let list = this.state.listData
                    list.splice(index, 1)
                    this.setState({
                        listData: list,
                        isAdding: false
                    })
                }

            }
        });
    }

    render() {
        const typeClass = classNames({
            'mobile-single': this.props.type === 'MOBILE',
        })
        return (
            <div style={{ height: 'calc(100% - 0px)', overflowY: 'auto' }} className={typeClass}>
                {this.getItems()}
                {
                    this.state.isAdding
                        ? null
                        : <div className="add-status-model" onClick={this.addNewConfig.bind(this)}>
                            <span className="add-config-text">添加</span>
                        </div>

                }
            </div>
        )
    }
}

/**
 *  单页模式下的 item
 */
class ConfigListItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isEdit: props.isEdit,
            url: props.url,
            staff: props.auths,
            id: props.id,
            state: props.state,
            urlState: props.urlState,
        }
    }
    componentWillReceiveProps({ isEdit, url, auths, id, state }) {
        this.setState({
            isEdit,
            url,
            staff: auths,
            id,
            state
        })
    }


    /**
     *  删除配置人员
     * @param {string} obj
     */
    deletePerson(person) {
        // 找到 想通的cn 将其删除
        this.setState({
            staff: this.state.staff.filter(({ cn }) => person.cn !== cn)
        })
    }

    /**
     * 取消编辑 恢复数据
     */
    cancelEdit() {
        if (this.props.isAdd) {
            this.props.deleteConfigItem(this.props.index, this.state.id)
        } else {
            this.setState({
                ...this.props,
                isEdit: false
            })
        }

    }

    /**
     * 调用组织架构选择器
     */
    handelOpenObjSelector() {
        window.$.objSelector({
            companyId: window.CONFIG.ORG_ID,//当前企业ID，必填
            type: "background",
            imgBasePath: "",//图片相对于当前项目到objselector目录的相对路径地址
            // picAddr:/*picAddr*/ + "http://192.168.1.14:55123/IMFileServer/ftp/file",
            personId: window.CONFIG.CN,//当前人员ID，必填
            token: 11111,//token，必填
            selectDept: true,//是否可以选择整个部门，默认true
            selectGroup: false,//是否可以选择整个工作组，默认true
            //            selectDeptWay:"user",//无用
            //            selectGroupWay:"group",//无用
            needLayer: true,//是否需要遮罩层，默认false
            linkMan: false,//是否显示联系人，默认true
            workGroup: false,//是否显示工作组，默认true
            organize: true,//是否显示组织架构，默认true
            dealDeptName: true,//是否处理组织架构的名称，截取
            dealJid: true,//是否处理jid，如果这样该值为true，则返回的数据会将jid的@部分去掉，原jid会保存为exJid
            //initData:initData,//已选择的数据，该数据要严格按照上面的格式书写，如果dealJid为true，则users中的jid须去掉@后面的部分
            // alert: $.alert,//你自己想要的弹出框的方法，该方法要求只传一条信息，如：alert("sfr234")，默认为alert
            maxSelect: {},//{ num: 5, unit: "人", msg: "不能选择超过5人的项目" },//最大选择数的限制，num为最大数量，如果该值为0或maxSelect为空或空对象，将不限制最大选择数量,unit，为单位，msg为超过最大选择限制的提示信息
            dataUrl: window.CONFIG.DATA_URL,//数据源的服务器地址以及项目地址，例：http://192.168.1.12:7001/ServerConsole/service/IMPortalService    ps：最后不要"/"
            callback: (res) => {//点击确定的回调函数，res为返回的结果
                console.log(this, res)
                // 取出数据
                const selectData = []
                res.users.forEach(({ jid, name, dept_id, myEnterId }) => {
                    // 去重
                    if (!this.state.staff.some(({ cn }) => cn === jid)) {
                        selectData.push({
                            cn: jid,
                            userName: name,
                            orgId: myEnterId,
                            deptId: dept_id
                        })
                    }
                })
                this.setState({
                    staff: this.state.staff.concat(selectData)
                })

            },
            btns: [
                { title: "确定" },
                { title: "关闭" }
            ],
            afterConstruct: function () {//在构造完成窗体后执行的方法，一般用于修改窗体样式

            },
            afterClose: function (res) {//窗口关闭过后执行的方法,res为选中的数据
                //注：所有的关闭动作都将执行这个方法，请慎用
            }
        });
    }

    /**
     * 更换url模式
     * @param {obj} value 
     */
    handelChangeUrlState(value) {
        this.setState({
            urlState: value.target.value
        })
    }
    /**
     * 更换state
     * @param {Obj} value 
     */
    handelChangeConfigState(value) {
        this.setState({
            state: value.target.value
        })
    }
    getUrlHttp() {
        return /^(https:)/.test(this.state.url) ? "https://" : "http://"
    }
    changeUrlHttp(value) {
        let url = this.state.url
        if (/^(http:)/.test(url)) {
            url = url.replace("http://", value)
        } else if(/^(https:)/.test(url)) {
            url = url.replace("https://", value)
        }
        this.setState({
            url: url
        })
    }
    render() {
        const selectBefore = (
            <Select defaultValue={this.getUrlHttp()} 
                disabled={!this.state.isEdit}
                style={{ width: 80 }} 
                onChange={this.changeUrlHttp.bind(this)}>
                <Option value="http://">http://</Option>
                <Option value="https://">https://</Option>
            </Select>
        );
        let url = this.state.url
        let urlBody = ""
        if (/^(http:)/.test(url)) {
            urlBody = this.state.url.replace(/^(http:\/\/)/, "")
        } else if(/^(https:)/.test(url)){
            urlBody = this.state.url.replace(/^(https:\/\/)/, "")
        }
        return (
            <div className="status-model">
                <div className="model-img"></div>
                <div className="model-content">
                    <div className="edit-btn-info">
                        {
                            this.state.isEdit
                                ? <span>
                                    <Button type="primary" onClick={() => { this.props.saveConfig(this) }}>
                                        {
                                            this.props.isAdd ?
                                                '保存' : '确定'
                                        }</Button>
                                    <Button className="edit-cancel-btn" onClick={this.cancelEdit.bind(this)} type="primary" ghost>取消</Button>
                                </span>
                                : <span>
                                    <Button type="primary" onClick={() => { this.setState({ isEdit: true }) }}>编辑</Button>
                                    <Button className="edit-cancel-btn" onClick={() => { this.props.deleteConfigItem(this.props.index, this.state.id) }} type="primary" ghost>删除</Button>
                                </span>
                        }
                    </div>

                    <div className="model-info">
                        {
                            this.state.isEdit
                                ? <div className="model-info-line ">
                                    <RadioGroup name="radiogroup" defaultValue={this.state.urlState} onChange={this.handelChangeUrlState.bind(this)}>
                                        <Radio className="model-radio" value={'CUSTOM'}>设置工作台地址</Radio>
                                        <Radio value={'DEFAULT'}>启用工作台</Radio>
                                    </RadioGroup>
                                </div>
                                : null
                        }

                        <div className="model-info-line">
                            <span className="model-label">链接地址:</span>
                            <div className="model-url">
                                {
                                    this.state.urlState === 'CUSTOM'
                                        ? //  <input type="text" disabled={!this.state.isEdit} value={this.state.url} onChange={(e) => { this.setState({ url: e.target.value }) }} style={{ width: '100%' }} />
                                        <Input
                                            addonBefore={selectBefore}
                                            defaultValue={urlBody}
                                            disabled={!this.state.isEdit}
                                            onChange={(e) => { this.setState({ url: this.getUrlHttp() + e.target.value }) }} style={{ width: '100%' }}
                                        />
                                        : <span>工作台</span>
                                }
                            </div>
                        </div>
                        {
                            this.state.isEdit
                                ? <div className="model-info-line ">
                                    <RadioGroup name="radiogroup" defaultValue={this.state.state} onChange={this.handelChangeConfigState.bind(this)} >
                                        <Radio className="model-radio" value={'CUSTOM'}>选择启用人员</Radio>
                                        <Radio value={'DEFAULT'}>设为默认</Radio>
                                    </RadioGroup>
                                </div>
                                : null
                        }



                        {
                            this.state.state === 'CUSTOM'
                                ? <div className="model-info-line">
                                    <span className="model-label" style={{marginTop:12}}>人&emsp;&emsp;员:</span>
                                    <div className="model-detail" >
                                        {this.state.staff.map((person, index) => <ModelBlock
                                            deletePerson={this.deletePerson.bind(this)}
                                            isEdit={this.state.isEdit}
                                            key={person.cn}
                                            person={person}
                                        >{person.userName}</ModelBlock>)}
                                        {
                                            this.state.isEdit
                                                ? <span className="add-person" onClick={this.handelOpenObjSelector.bind(this)}></span>
                                                : null
                                        }
                                    </div>
                                </div>
                                :
                                this.state.isEdit
                                    ? <div className="model-info-line default-info">
                                        除了其他链接中设置的人员和不启用工作台的人员外，剩余所有人员都默认显示该链接页面。
                                 </div>
                                    : <div className="model-info-line default-page">
                                        默认页面
                                    </div>

                        }

                    </div>
                </div>
            </div>
        )
    }
}

const ModelBlock = ({ children, person, isEdit, deletePerson }) => {
    return (
        <div className="model-item-block">
            <span>{children}</span>
            {
                isEdit
                    ? <i className="iconfont icon-delete" onClick={() => { deletePerson(person) }}></i>
                    : null
            }
        </div>
    )
}