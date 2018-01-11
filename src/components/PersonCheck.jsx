import React, { Component } from 'react';
import { Button, Modal } from 'antd';
import { deleteList, editDeleteList } from '@/ajax/api';
import { message } from 'antd';
import http from '@/ajax'
export default class PersonCheck extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isEdit: false,
            staffList: [],
            backupData: []
        }
    }

    componentDidMount() {
        this.getAllListPerson()
    }


    /**
     * 取消编辑
     */
    cancelEdit() {
        this.setState({
            staffList: [...this.state.backupData],
            isEdit: false
        })
    }
    /**
     * 获取 所有人员
     */
    getAllListPerson() {
        http.get(deleteList, {
            orgId: window.CONFIG.ORG_ID,
            terminal: this.props.type
        }).then(data => {
            this.setState({
                staffList: data,
                backupData: [...data]
            })
        })
    }
    /**
     * 渲染员工列表
     */
    getStaffItem() {

        return this.state.staffList.map((person, index) => {
            return (
                <ModelBlock
                    person={person}
                    key={person.cn ? person.cn : person.deptId}
                    isEdit={this.state.isEdit}
                    deletePerson={this.deletePerson.bind(this)} />
            )
        })
    }
    /**
     * 删除员工
     */
    deletePerson(person) {
        // 找到 想通的cn 将其删除
        this.setState({
            staffList: this.state.staffList.filter(({ cn, deptId }) => {
                return person.cn ? (cn ? person.cn !== cn : true) : (cn ? true : person.deptId !== deptId)
            })
        })
    }
    /**
     * 保存员工
     */
    handleSaveConfig() {
        http.post(editDeleteList
            , {
                orgId: window.CONFIG.ORG_ID,
                blacklists: this.state.staffList,
                terminal: this.props.type
            }
        ).then(data => {
            message.success('编辑成功');
            this.setState({
                backupData: [...this.state.staffList],
                isEdit: false
            })
        })
    }
    /**
     * 打开obj选人框
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
                // 取出员工数据
                const selectData = []
                // 取出部门数据
                res.departments.forEach(({ dept_display_name, dept_id }) => {
                    // 去重
                    if (!this.state.staffList.some(({ cn, deptId }) => cn ? false : deptId === dept_id)) {
                        selectData.push({
                            name: dept_display_name,
                            deptId: dept_id
                        })
                    }
                })
                res.users.forEach(({ jid, name, dept_id, myEnterId }) => {
                    // 去重
                    if (!this.state.staffList.some(({ cn }) => cn === jid)) {
                        selectData.push({
                            cn: jid,
                            name,
                            deptId: dept_id
                        })
                    }
                })

                this.setState({
                    staffList: this.state.staffList.concat(selectData)
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
    render() {
        return (
            <div>
                <div className="status-bar" >
                    以下人员不启用工作台门户
                    {
                        this.state.isEdit
                            ? <div style={{ float: 'right', top: '10px' }}>
                                <Button className="edit-cancel-btn" onClick={this.cancelEdit.bind(this)} type="primary" ghost style={{ float: 'right', top: '10px', marginLeft: 10 }}>取消</Button>
                                <Button type="primary" onClick={this.handleSaveConfig.bind(this)} style={{ float: 'right', top: '10px' }}>确定</Button>
                            </div>
                            :// <span className="edit-edit-btn status-edit-btn" onClick={() => { this.setState({ isEdit: true }) }} >编辑</span>
                            <Button type="primary" onClick={() => { this.setState({ isEdit: true }) }} style={{ float: 'right', top: '10px' }}>编辑</Button>
                    }
                </div >
                <div className="person-list">
                    <span className="person-list-label">人员:</span>
                    {this.getStaffItem()}
                    {
                        this.state.isEdit
                            ? <span className="add-person" onClick={this.handelOpenObjSelector.bind(this)}></span>
                            : null
                    }
                </div>
            </div>

        )
    }
}


const ModelBlock = ({ person, isEdit, deletePerson }) => {
    return (
        <div className="model-item-block">
            <span>{person.name}</span>
            {
                isEdit
                    ? <i className="iconfont icon-delete" onClick={() => { deletePerson(person) }}></i>
                    : null
            }
        </div>
    )
}