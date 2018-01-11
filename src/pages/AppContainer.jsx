import React, { Component } from 'react';
import PropTypes from 'prop-types'
import http from '@/ajax'
import { message } from 'antd';
import { findTerminalConfig } from '@/ajax/api'
import {
    ConfigList,
    MenuList,
    Menu,
    Tabs,
    TabPane,
    PersonCheck,
} from '@/components'

/**
 * 对应的几种模式 以服务器返回的数据为准
 */
const PC = {
    config: 'config_page',
    delete: 'page_page',
}
const MOBILE = {
    config: 'config_page',
    delete: 'page_page',
}

export default class AppContainer extends Component {

    static childContextTypes = {
        handelUpdateListData: PropTypes.func,       // 更新数据
    }


    constructor(props) {
        super(props)
        this.state = {
            showPCcontent: PC.config,
            showMOBILEcontent: MOBILE.config
        }
    }


    /**
     * menuList change事件
     * @param {string} 当前活动的tag 
     */
    handelMenuChange({ activeIndex, prevIndex }) {
        this.setState({
            showPCcontent: activeIndex
        })
    }
    /**
     * 监听切换移动端menuList 更改数据
     * @param {} param0 
     */
    handelMobileMenuChange({ activeIndex, prevIndex }) {
        // 切换menuList 做的事情
        // 1.获取最新数据
        this.setState({
            showMOBILEcontent: activeIndex
        })
    }

    /**
     * 获取pc端右侧内容
     */
    getPCcontent() {
        switch (this.state.showPCcontent) {
            case PC.config:
                return <ConfigList key="pc" type={'PC'}></ConfigList>
            case PC.delete:
                return <PersonCheck key='22222_pc' type={'PC'}/>
        }
    }

    /**
     * 获取pc端右侧内容
     */
    getMOBILEcontent() {
        switch (this.state.showMOBILEcontent) {
            case MOBILE.config:
                return <ConfigList key="mobile" type={'MOBILE'} />
            case MOBILE.delete:
                return <PersonCheck key='1111_mobile' type={'MOBILE'}/>
        }
    }



    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <Tabs classPrefix={'tabs'} iconClass={'iconfont icon-config1'} title="界面设置">
                    <TabPane
                        order={0}
                        tab={<span>桌面端</span>}>

                        <MenuList
                            activeIndex={PC.config}
                            onChange={this.handelMenuChange.bind(this)}
                        >
                            <Menu text="工作台门户设置" index={PC.config} />
                            <Menu text="不启用人员" index={PC.delete} />
                        </MenuList>

                        <div style={{ height: '100%', overflow: 'hidden' }}>
                            {this.getPCcontent()}
                        </div>
                    </TabPane>

                    <TabPane
                        order={1}
                        tab={<span>移动端</span>}>

                        <MenuList
                            activeIndex={MOBILE.config}
                            onChange={this.handelMobileMenuChange.bind(this)}
                            checked={this.state.mbCheckedMode}>
                            <Menu text="工作台门户设置" index={MOBILE.config} />
                            <Menu text="不启用人员" index={MOBILE.delete} />
                        </MenuList>

                        <div style={{ height: '100%', overflow: 'hidden' }}>
                            {this.getMOBILEcontent()}
                        </div>
                    </TabPane>
                </Tabs>

            </div>
        )
    }

}