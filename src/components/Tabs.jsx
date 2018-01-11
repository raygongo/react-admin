import React, { Component } from 'react'
import classNames from 'classnames'

export class TabPane extends Component {

    render() {
        const { classPrefix, className, isActive, children } = this.props

        const classes = classNames({
            [className]: className,
            [`${classPrefix}-panel`]: true,
            [`${classPrefix}-active`]: isActive
        })
        return (
            <div className={classes} aria-hidden={!isActive}>{children}</div>
        )
    }
}

export default class Tabs extends Component {

    // 默认属性
    static defaultProps = {
        classPrefix: 'tabs',
        onChange: () => { },
    }

    constructor(props) {
        super(props)

        this.handleTabClick = this.handleTabClick.bind(this)

        // 从porps中取出 属性
        let activeIndex = 0
        // 如果传入就用 没有 就设定
        if ('activeIndex' in this.props) {
            activeIndex = this.props.activeIndex
        }

        this.state = {
            activeIndex,
            prevIndex: activeIndex
        }
    }

    /**
     * tab点击事件
     * @param {Number} activeIndex 
     */
    handleTabClick(activeIndex) {

        const prevIndex = this.state.activeIndex;
        console.log(activeIndex)
        // 如果点击前后的index 不同 且 props中有activeIndex时 更新
        if (this.state.activeIndex !== activeIndex) {
            this.setState({
                activeIndex,
                prevIndex
            })
        }
        // 更新后 通知外界
        this.props.onChange({ activeIndex, prevIndex })
    }

    /**
     * 渲染导航区域
     */
    renderTabNav() {
        const { classPrefix, children, iconClass, title } = this.props

        return (
            <TabNav
                key="tabBar"
                classPrefix={classPrefix}
                onTabClick={this.handleTabClick}
                panels={children}
                activeIndex={this.state.activeIndex}
                iconClass={iconClass}
                title={title} 
            />
        )
    }

    /**
     * 渲染内容区域
     */
    renderTabContent() {

        const { classPrefix, children } = this.props
        // 取出属性 调用content组件
        return (
            <TabContent
                key="tabContent"
                classPrefix={classPrefix}
                panels={children}
                activeIndex={this.state.activeIndex}
            />
        )
    }

    // 如果是外部传入的 active 从外部取值 更新
    componentWillReceiveProps(nextProps) {
        if ('activeIndex' in nextProps) {
            this.setState({
                activeIndex: nextProps.activeIndex
            })
        }
    }

    render() {
        const { className } = this.props
        // 拿出类 进行 合并 类名
        const classes = classNames(className, 'ui-tabs-ray')
        return (
            <div className={classes}>
                {this.renderTabNav()}
                {this.renderTabContent()}
            </div>
        );
    }
}



class TabContent extends Component {

    getTabPanes() {
        const { classPrefix, activeIndex, panels } = this.props

        return React.Children.map(panels, child => {
            if (!child) { return }

            const order = parseInt(child.props.order, 10)
            const isActive = activeIndex === order

            return React.cloneElement(child, {
                classPrefix,
                isActive,
                children: child.props.children,
                key: `tabpane-${order}`
            })

        })
    }

    render() {
        const { classPrefix } = this.props

        const classes = classNames({
            [`${classPrefix}-content`]: true
        })
        return (
            <div className={classes}>
                {this.getTabPanes()}
            </div>
        )
    }
}

class TabNav extends Component {

    getTabsIcon() {

        const { iconClass, title, classPrefix } = this.props

        if (iconClass && title) {
            return (
                <li className={`${classPrefix}-title`}>
                    <span className={`${iconClass}`}>{title}</span>
                    <span className="split-line"></span>
                </li>
            )
        }
    }

    getTabs() {
        // 取出值
        const { classPrefix, activeIndex, panels } = this.props

        // 遍历取出 属于Nav的的属性
        return React.Children.map(panels, child => {
            if (!child) return

            const order = parseInt(child.props.order, 10)

            // 处理className
            let classes = classNames({
                [`${classPrefix}-tab`]: true,
                [`${classPrefix}-active`]: activeIndex === order,
                [`${classPrefix}-disabled`]: child.props.disabled,
            })

            const ref = {}
            if (activeIndex === order) {
                ref.ref = 'activeTab'
            }

            return (
                <li
                    role="tab"
                    aria-selected={activeIndex === order ? 'true' : 'false'}
                    onClick={this.props.onTabClick.bind(this, order)}
                    className={classes}
                    key={order}
                    {...ref}
                >
                    {child.props.tab}
                </li>
            )
        })
    }

    render() {

        const { classPrefix } = this.props
        const classes = classNames({
            [`${classPrefix}-nav`]: true
        })

        return (
            <ul className={classes}>
                {this.getTabsIcon()}
                {this.getTabs()}
            </ul>
        )
    }
}