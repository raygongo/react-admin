/**
 * Created by dell on 2016-8-5.
 */
(function ($) {
    $.objSelector = function (parameter) {
        if ($(".objSelector").length > 0) {
            return;
        }

        parameter = parameter || {};
        parameter.contextPath = parameter.contextPath || "";
        parameter.imgBasePath = parameter.imgBasePath || "";

        var companyId = parameter.companyId,
            personId = parameter.personId,
            token = parameter.token;
        var cacheData_tree = { users: [], departments: [], groups: [], other: [] },//树的缓存数据
            selectedData = { users: [], departments: [], groups: [], other: [] };//已选择的数据

        selectedData = $.extend({}, selectedData, parameter.initData, true);

        var ctn = null,//整个组件的容器
            treeCtn = {};//树容器
        var dataType = { linkMan: "linkMan", organize: "organize", group: "group", other: "other" };//选项卡的数据类型
        var cacheDataType = { user: "user", department: "department", group: "group", other: "other" };//缓存的数据类型
        var setting = {};
        var dataUrl = parameter.dataUrl;
        var config = {};
        /*var settingHttp = "",//访问数据接口的域名或ip
            settingPath = "",//访问数据接口的项目名称
            picHttp = "",//头像url的域名或IP
            picPath = "",//头像url的项目名称
            picBasePath = "",
            picProjectPath = "";*/

        var methods = {
            /**
             * 初始化组件
             */
            init: function () {
                this.initSetting();

                if (setting.needLayer) {
                    $("body").append("<div class='objSelector--layer' style='z-index: " + (setting.zIndex - 1) + ";'></div>");
                }

                $("body").append("<div class='objSelector' style='width:" + setting.width + ";height:" + setting.height + ";z-index: " + setting.zIndex +
                    ";margin-top:-" + parseFloat(setting.height) / 2 + "px;margin-left:-" + parseFloat(setting.width) / 2 + "px;'><div class='os-head'></div>" +
                    "<div class='os-body'></div><div class='os-foot'></div></div>");

                ctn = $(".objSelector");

                //在构造完结构后再取设置
                config = exfun.getConfig();
				this.constructAll.call(this);
            },
            constructAll: function () {
                setting.search = exfun.getSearchSetting();//重新设置search的配置，主要是针对url
                setting.options = exfun.getOptionsSetting();//重新设置选项卡的配置，主要是针对数据源

                this.constructHead();
                this.constructFoot();
                this.constructBody();
                this.bindEvent();

                if (setting.afterConstruct) {
                    setting.afterConstruct.call(this);
                }
            },
            initSetting: function () {
                setting = exfun.getSetting();
                $.extend(true, setting, parameter, true);
            },
            /**
             * 构造头部
             */
            constructHead: function () {
                ctn.find(".os-head").append("<div class='os-head-logo'></div><div class='os-head-title'>" + setting.title + "</div>" +
                    "<div class='os-head-close'><div class='os-head-close-ico'></div></div>");//构造头部
            },
            /**
             * 构造主体内容框架
             */
            constructBody: function () {
                //构造内容框架
                ctn.find(".os-body").append("<div class='os-body-left'></div><div class='os-body-middle'></div><div class='os-body-right'></div>");

                this.constructLeft();
                this.constructRight();
            },
            /**
             * 构造主体左边
             */
            constructLeft: function () {
                if (setting.search) {
                    this.constructSearch();
                }

                this.constructContent();

                if (!setting.search) {
                    var height = ctn.find(".left-ct-ctn").height();
                    /**38为搜索框高度 */
                    height += 38;

                    ctn.find(".left-ct-ctn").css("height", height + "px");
                }
            },
            /**
             * 构造主体右边
             */
            constructRight: function () {
                var selectedNum = selectedData.users.length + selectedData.departments.length + selectedData.groups.length + selectedData.other.length;
                var selectHtml = "";

                if (setting.maxSelect && setting.maxSelect.num) {//如果最大选择不为空对象，或者最大选择数为不0，要做判定
                    selectHtml = "/<span class='selMaxNum'>" + setting.maxSelect.num + "</span>";
                }

                ctn.find(".os-body-right").append("<div class='os-body-right-top'></div><div class='os-body-right-content'></div>");
                ctn.find(".os-body-right-top").append("已选择数(<span class='selNum'>" + selectedNum + "</span>" + selectHtml + ")<div class='emptyAll'>清空列表</div>");

                var i = 0;
                var html = "", headPicHtml = "";

                for (i = 0; i < selectedData.users.length; i++) {
                    //头像的html，如果头像的地址为空，用默认的头像
                    if (selectedData.users[i].head_url != "") {
                        headPicHtml = "<img class='person-head-pic' alt='pic' onerror='javascript:this.src=\"" +
                            (selectedData.users[i].sex == 0 ? exfun.getImgSrcBase64().man : exfun.getImgSrcBase64().woman) + "\"' " +
                            "src='" + config.picAddr + "/" + selectedData.users[i].head_url + "' />";
                    }
                    else {
                        headPicHtml = "<img class='person-head-pic' src='" + (selectedData.users[i].sex == 0 ? exfun.getImgSrcBase64().man : exfun.getImgSrcBase64().woman) + "' />";
                    }

                    //type为user表示是用户类型的节点
                    html += "<div class='selectedNode' type='" + cacheDataType.user + "' mid='" + selectedData.users[i].jid + "' title='" +
                        selectedData.users[i].name + "'>" + headPicHtml + "<div class='person-info'><a>" + selectedData.users[i].name + "</a></div>" +
                        "</div>";
                }

                for (i = 0; i < selectedData.departments.length; i++) {
                    html += "<div type='" + cacheDataType.department + "' class='selectedNode' pid='" + selectedData.departments[i].pid + "' " +
                        "mid='" + selectedData.departments[i].dept_id + "' title='" + selectedData.departments[i].name + "'>" +
                        "<img src='" + exfun.getImgSrcBase64().group + "'" +
                        "class='dept-head-pic' />" +
                        "<div class='item-info-name'><a>" + selectedData.departments[i].name + "</a></div>" +
                        "</div>";
                }

                for (i = 0; i < selectedData.groups.length; i++) {
                    html += "<div class='selectedNode' type='" + cacheDataType.group + "' pid='null' mid='" + selectedData.groups[i].jid + "' title='" +
                        selectedData.groups[i].name + "'><img src='" + exfun.getImgSrcBase64().group + "' " +
                        "class='dept-head-pic' />" +
                        "<div class='item-info-name'><a>" + selectedData.groups[i].name + "</a></div>" +
                        "</div>";
                }

                ctn.find(".os-body-right-content").html(html);
            },
            /**
             * 构造搜索
             */
            constructSearch: function () {
                ctn.find(".os-body-left").append("<div class='os-search'><input class='os-search-input' maxlength='" +
                    (setting.search && setting.search.maxlength || 10) + "' placeholder='" + (setting.search && setting.search.placeholder || "") +
                    "' /><img class='os-search-ico' src='" + exfun.getImgSrcBase64().search + "'/>" +
                    // "<div class='os-search-line'></div><div class='os-search-sel'><div class='os-search-sel-arrow'>" +
                    "</div></div></div>");
            },
            /**
             * 构造内容
             */
            constructContent: function () {
                ctn.find(".os-body-left").append("<div class='os-body-left-content'><div class='os-nav'></div><div class='os-nav-line'></div>" +
                    "<div class='left-ct-ctn'></div></div>");

                setting.options.filter(function (item) {//构造选项卡
                    ctn.find(".os-nav").append("<div class='os-nav-item' name='" + item.name + "' style='width:" + parseFloat(100 / setting.options.length) +
                        "%;'>" + item.title + "</div>");
                });

                ctn.find(".os-nav-line").css("width", 100 / setting.options.length + "%");
                ctn.find(".os-nav-item").eq(0).addClass("os-nav-item-selected");
                this.loadContent(setting.options[0].name);//初始化树，加载第一个配置的树
            },
            bindEvent: function () {
                this.bindSearch();//绑定搜索事件的触发
                this.bindCancelSearch();//退出搜索
                this.bindCloseClick();//右上角关闭按钮
                this.bindNavItemClick();//选项卡的点击事件
                this.bindEmptyAllClick();//清空列表的点击事件
                this.bindSelectedNodeHover();//绑定已选中节点的hover事件
                this.bindRemoveSelectedNode();//绑定移除已选择的节点
            },
            bindSearch: function () {
                var objThis = this;

                ctn.find(".os-search-input").focus(function () {
                    if ($(this).siblings(".cancelSearch").length > 0) {
                        return;
                    }

                    $(this).after("<img class='cancelSearch' src='" + exfun.getImgSrcBase64().cancel + "' />")
                }).keydown(function (e) {
                    if (e.keyCode == 13) {
                        if (this.value != "") {
                            objThis.loadSearchContent(this.value);
                        }
                    }
                });
                ctn.find(".os-search-ico").click(function () {
                    objThis.loadSearchContent($(this).siblings(".os-search-input").val());
                });
            },
            bindCancelSearch: function () {
                ctn.find(".os-search").on("click", ".cancelSearch", function () {
                    ctn.find('.os-search-input').val("");
                    ctn.find(".os-body-searchContent").remove();
                    ctn.find(".os-body-left-content").show();
                    $(this).remove();
                });
            },
            loadSearchContent: function (val) {
                var objThis = this;

                if (val == "" || val == undefined) {
                    return;
                }

                $.ajax({
                    url: setting.search.url,
                    type: "post",
                    contentType: "application/json",
                    data: JSON.stringify({
                        searchText: val,
                        enterId: companyId + ""
                    }),
                    success: function (res) {
                        if (res && res.data && res.data) {
                            objThis.constructSearchItem(res.data.list);
                        }
                    },
                    error: function (a, b, c) {

                    },
                    complete: function () {

                    }
                });

                if (ctn.find('.os-body-searchContent').length == 0) {
                    ctn.find(".os-body-left-content").hide().after("<div class='os-body-searchContent'></div>");
                }
            },
            constructSearchItem: function (data) {
                var html = "";
                var headPicHtml = "";

                for (var i = 0; i < data.length; i++) {
                    tree.fillTreeDataInCache(data[i], cacheDataType.user);//存储信息到缓存里面

                    //头像的html，如果头像的地址为空，用默认的头像
                    if (data[i].head_url != "") {
                        headPicHtml = "<img class='person-head-pic' alt='pic' onerror='javascript:this.src=\"" +
                            (data[i].sex == "0" ? exfun.getImgSrcBase64().man : exfun.getImgSrcBase64().woman) + "\"' " +
                            "src='" + config.picAddr + "/" + data[i].head_url + "' />";
                    }
                    else {
                        headPicHtml = "<img class='person-head-pic' src='" + (data[i].sex == "0" ? exfun.getImgSrcBase64().man : exfun.getImgSrcBase64().woman) + "' />";
                        //headPicHtml = "<div class='person-head-pic " + (data[i].sex == "0" ? "head-male" : "head-female") + "'></div>";
                    }

                    //type为user表示是user类型的节点
                    html += "<div class='os-tree-item'>" +
                        "<div class='os-tree-item-info' type='" + cacheDataType.user + "' hasChild=false pid='' mid='" + data[i].jid + "' " +
                        "title='" + data[i].name + "'>" + headPicHtml + "<div class='person-info'><a>" + data[i].name + "</a></div>" +
                        "</div>" +
                        "</div>";
                }

                html += "</div>";


                ctn.find(".os-body-searchContent").html(html);
            },
            /**
             * 右上角的关闭按钮
             */
            bindCloseClick: function () {
                var objThis = this;

                ctn.find(".os-head-close").unbind("mousedown").bind("mousedown", function () {
                    $(this).css("background-color", "#c5484e");
                });
                ctn.find(".os-head-close").unbind("mouseleave").bind("mouseleave", function () {
                    $(this).css("background-color", "");
                });
                ctn.find(".os-head-close").unbind("mouseup").bind("mouseup", function () {
                    objThis.close();
                });
            },
            /**
             * 选项卡点击事件
             */
            bindNavItemClick: function () {
                var objThis = this;

                ctn.find(".os-nav-item").bind("click", function () {
                    var tabName = $(this).attr("name");
                    var tab_ctn = treeCtn[tabName];//所点击的选项卡对应的树的容器

                    ctn.find(".os-nav-line").css("margin-left", $(this).index() * 100 / setting.options.length + "%");//设置横线的位置
                    $(this).addClass("os-nav-item-selected").siblings().removeClass("os-nav-item-selected");//设置被选中选项卡的样式

                    ctn.find(".os-tree").hide();//先隐藏所有的树

                    if (!tab_ctn) {//如果该选项卡未加载过树，则加载树的内容
                        objThis.loadContent(tabName);
                    }
                    else {
                        tab_ctn.show();//显示当前选项卡对应的树
                    }
                });
            },
            /**
             * 清空列表点击事件
             */
            bindEmptyAllClick: function () {
                ctn.find(".os-body-right").off("click", ".emptyAll").on("click", ".emptyAll", function () {
                    selectedData = { users: [], departments: [], groups: [], other: [] };//初始化已选择的数据
                    ctn.find(".os-body-right-content").html("");
                    ctn.find(".selNum").html(0);
                });
            },
            /**
             * 绑定已选中节点的hover事件
             */
            bindSelectedNodeHover: function () {
                ctn.find(".os-body-right-content").off("mouseenter", ".selectedNode").on("mouseenter", ".selectedNode", function () {
                    $(this).append("<img class='delNode' src='" + exfun.getImgSrcBase64().del + "' />");
                }).off("mouseleave", ".selectedNode").on("mouseleave", ".selectedNode", function (e) {
                    $(this).find(".delNode").remove();
                });
            },
            /**
             * 绑定移除已选择的节点点击事件
             */
            bindRemoveSelectedNode: function () {
                ctn.find(".os-body-right-content").off("click", ".delNode").on("click", ".delNode", function () {
                    tree.removeSelectedDataInCache($(this).parent().attr("mid"), $(this).parent().attr("type"));//将该节点对应的缓存数据从缓存中移除
                    ctn.find(".selNum").html(parseInt(ctn.find(".selNum").html()) - 1);
                    $(this).parent().remove();
                });
            },
            loadContent: function (name) {
                tree.initTree(name, ctn.find(".left-ct-ctn"));
            },
            /**
             * 构造底部
             */
            constructFoot: function () {
                var objThis = this;

                setting.btns.filter(function (item) {
                    ctn.find(".os-foot").append("<div class='os-btn btn-" + item.name + "'>" + item.title + "</div>");
                    ctn.find(".btn-" + item.name).click(function () {
                        item.callback.call(objThis);
                    });
                });
            },
            alert: function (msg) {
                if (setting.alert) {
                    setting.alert(msg);
                }
                else {
                    alert(msg);
                }
            },
            close: function () {
                if (setting.afterClose) {
                    setting.afterClose.call(this, selectedData);
                }

                $(".objSelector").remove();
                $(".objSelector--layer").remove();

                //回收所有变量
                parameter = null;
                companyId = null;
                personId = null;
                token = null;
                config = null;
                /*settingHttp = null;
                settingPath = null;
                picHttp = null;
                picPath = null;*/
                cacheData_tree = null;
                selectedData = null;
                ctn = null;
                dataType = null;
                setting = null;
                methods = null;
                exfun = null;
            }
        };

        var tree = {
            initTree: function (optionName, container) {
                container.append("<div class='os-tree' name='" + optionName + "'></div>");
                treeCtn[optionName] = ctn.find(".os-tree[name='" + optionName + "']");
                setting.treeWidth = ctn.find(".os-tree")[0].clientWidth;

                var option = setting.options.filter(function (item) {
                    return item.name == optionName;
                });

                this.createTree(option[0]);
                this.bindTreeEvent();
            },
            createTree: function (option) {
                this.getData(option, this.constructItem, {
                    pNode: treeCtn[option.name],
                    level: 0,
                    pid: null,
                    isChildData: false//是否是加载子节点的数据
                });
            },
            bindTreeEvent: function () {
                this.bindNodeHover();//绑定节点的hover事件
                this.bindChooseDeptOrGroup();//绑定选择部门或群组
                this.bindNodeClick();//点击节点
            },
            getData: function (option, callback, param) {
                var objThis = this;

                $.ajax({
                    url: option.url,
                    type: option.type || "post",
                    success: function (res) {
                        if (res.code == 500) {
                            methods.alert("请求数据失败！");
                            return;
                        }
						
						if(typeof res === "string" && res !== ""){
							res = JSON.parse(res);
						}
						
                        callback.call(objThis, option, res, param);
                    },
                    error: function (a, b, c) {

                    },
                    complete: function () {

                    }
                });
            },
            constructItem: function (option, data, param) {
                if (param.pid == null) {//如果是加载根节点
                    param.pNode.append(this.getLiHtml(option, data, param));

                    if (!treeCtn[option.name].find(".os-tree-item-info").attr("hasLoaded")) {
                        treeCtn[option.name].find(".os-tree-item-info").eq(0).click();
                    }
                }
                else {
                    param.pNode.after(this.getLiHtml(option, data, param));
                }
            },
            getLiHtml: function (option, data, param) {
                if (!data || data.length == 0) return;

                var html = "";
                var n_data = {};

                switch (option.name) {
                    case dataType.linkMan:
                        n_data = { name: "我的联系人", pid: null, id: null, datas: data.data, level: 0 };
                        html = this.getLinkManHtml(option, n_data, param);
                        break;
                    case dataType.organize:
                        html = this.getOrganizeHtml(option, data.data, param);
                        break;
                    case dataType.group:
                        html = this.getWorkGroupHtml(option, data, param);
                        break;
                    default:
                        html = this.getDefaultHtml(option, data, param);
                        break;
                }

                return html;
            },
            getLinkManHtml: function (option, data, param) {
                //type为root表示是根节点，且不具有具体意义的类型
                var html = "<div class='os-tree-item' level='0'>" +
                    "<div class='os-tree-item-info' type='root' hasLoaded=true hasChild=true mid='" + data.id + "' pid='" + data.pid + "' level='" + data.level + "'>" +
                    "<div class='item-info-arrow item-info-arrow-right item-info-arrow-down'></div>" +
                    "<a class='item-info-name'>" + data.name + "</a>" +
                    "</div>";
                var headPicHtml = "";

                param.level++;

                //如果要显示人员
                if (!setting.hidePerson) {
                    for (var i = 0; i < data.datas.length; i++) {
                        this.fillTreeDataInCache(data.datas[i], cacheDataType.user);//存储联系人信息到缓存里面

                    //头像的html，如果头像的地址为空，用默认的头像
                    if (data.datas[i].head_url != "") {
                        headPicHtml = "<img class='person-head-pic' alt='pic' onerror='javascript:this.src=\"" +
                            (data.datas[i].sex == "0" ? exfun.getImgSrcBase64().man : exfun.getImgSrcBase64().woman) + "\"' " +
                            "src='" + config.picAddr + "/" + data.datas[i].head_url + "' />";
                    }
                    else {
                        headPicHtml = "<img class='person-head-pic' src='" + (data.datas[i].sex == "0" ? exfun.getImgSrcBase64().man : exfun.getImgSrcBase64().woman) + "' />";
                    }

                    //type为user表示是user类型的节点
                    html += "<div class='os-tree-item' level='" + param.level + "'>" +
                        "<div class='os-tree-item-info' type='" + cacheDataType.user + "' hasChild=false pid='" + data.datas[i].dept_id + "' mid='" + data.datas[i].jid + "' " +
                        "title='" + data.datas[i].name + "' level='" + param.level + "' style='padding-left:" + (param.level * 10 + 5) + "px;'>" +
                            headPicHtml + "<div class='person-info'><a style='width: " + this.getNameWidth(setting.treeWidth, param.level * 10) + ";'>" +
                        data.datas[i].name + "</a></div>" +
                        "</div>" +
                        "</div>";
                    }
                }

                html += "</div>";

                return html;
            },
            getOrganizeHtml: function (option, data, param) {
                var html = "";

                if (!param.isChildData) {
                    html = this.getOrganizeRootNodeHtml(option, data, param);
                }
                else {
                    html = this.getOrganizeChildNodeHtml(option, data, param);
                }

                return html;
            },
            getOrganizeRootNodeHtml: function (option, data, param) {
                data.name = data.dept_display_name;
                this.fillTreeDataInCache(data, cacheDataType.department);//存储组织架构信息到缓存里面

                //type为department表示是部门类型的节点
                return "<div class='os-tree-item' level='" + param.level + "'>" +
                    "<div class='os-tree-item-info' type='" + cacheDataType.department + "' hasChild=true pid='null' mid='" + data.dept_id + "' " +
                    "title='" + data.dept_display_name + "' level='" + param.level + "' style='padding-left:" + (param.level * 10 + 7) + "px;'>" +
                    "<span class='item-info-arrow item-info-arrow-right'></span>" +
                    "<div class='item-info-name'><a>" + data.dept_display_name + "</a></div>" +
                    "</div>" +
                    "</div>";
            },
            getOrganizeChildNodeHtml: function (option, data, param) {
                var html = "";
                var headPicHtml = "";

                param.level++;


                //如果要显示人员
                if (!setting.hidePerson) {
                    for (var i = 0; i < data.users.length; i++) {
                        this.fillTreeDataInCache(data.users[i], cacheDataType.user);//存储组织架构信息到缓存里面

                    //头像的html，如果头像的地址为空，用默认的头像
                    if (data.users[i].head_url != "") {
                        headPicHtml = "<img class='person-head-pic' alt='pic' onerror='javascript:this.src=\"" +
                            (data.users[i].sex == "0" ? exfun.getImgSrcBase64().man : exfun.getImgSrcBase64().woman) + "\"' " +
                            "src='" + config.picAddr + "/" + data.users[i].head_url + "' />";
                    }
                    else {
                        headPicHtml = "<img class='person-head-pic' src='" + (data.users[i].sex == 0 ? exfun.getImgSrcBase64().man : exfun.getImgSrcBase64().woman) + "' />";
                    }

                    //type为user表示是用户类型的节点
                    html += "<div class='os-tree-item' level='" + param.level + "'>" +
                        "<div class='os-tree-item-info' type='" + cacheDataType.user + "' mid='" + data.users[i].jid + "' title='" + data.users[i].name + "' " +
                        "level='" + param.level + "' style='padding-left:" + (param.level * 10 + 5) + "px;'>" + headPicHtml +
                            "<div class='person-info'><a style='width:" + this.getNameWidth(setting.treeWidth, param.level * 10) + "'>" +
                        data.users[i].name + "</a></div>" +
                        "</div>" +
                        "</div>";
                    }
                }

                for (i = 0; i < data.departments.length; i++) {
                    data.departments[i].name = data.departments[i].dept_display_name;
                    this.fillTreeDataInCache(data.departments[i], cacheDataType.department);//存储组织架构信息到缓存里面

                    html += "<div class='os-tree-item' level='" + param.level + "'>" +
                        "<div hasChild='true' type='" + cacheDataType.department + "' hasLoaded='false' class='os-tree-item-info' pid='" + data.departments[i].parent_id + "' " +
                        "mid='" + data.departments[i].dept_id + "' title='" + data.departments[i].dept_display_name + "' level='" + param.level + "' " +
                        "style='padding-left:" + (param.level * 10 + 5) + "px;'>" +
                        "<span class='item-info-arrow item-info-arrow-right'></span>" +
                        "<div class='item-info-name'><a style='width:" + this.getNameWidth(setting.treeWidth, param.level * 10) + "'>" +
                        data.departments[i].dept_display_name + "</a></div>" +
                        "</div>" +
                        "</div>";
                }

                return html;
            },
            getWorkGroupHtml: function (option, data, param) {
                var html = "";

                if (!param.isChildData) {
                    html = this.getWorkGroupRootNodeHtml(option, data.data, param);
                }
                else {
                    html = this.getWorkGroupChildNodeHtml(option, data.data, param);
                }

                return html;
            },
            getWorkGroupRootNodeHtml: function (option, data, param) {
                var html = "";
                var arrowHtml = "";

                for (var i = 0; i < data.length; i++) {
                    data[i].name = data[i].naturalname;
                    this.fillTreeDataInCache(data[i], cacheDataType.group);//存储组织架构信息到缓存里面

                    arrowHtml = data[i].membership == 0 ? "" : "<span class='item-info-arrow item-info-arrow-right'></span>";

                    html += "<div class='os-tree-item' level='" + param.level + "'>" +
                        "<div style='padding-left:" + (param.level * 10 + 5) + "px;' class='os-tree-item-info' type='" + cacheDataType.group + "' " +
                        "hasChild=" + (data[i].membership != "0") + " pid='null' mid='" + data[i].jid + "' title='" + data[i].naturalname + "' " +
                        "level='" + param.level + "'>" + arrowHtml + "<div class='item-info-name'><a style='width:" +
                        this.getNameWidth(setting.treeWidth, param.level * 10) + "'>" + data[i].naturalname + "</a></div>" +
                        "</div>" +
                        "</div>";
                }

                return html;
            },
            getWorkGroupChildNodeHtml: function (option, data, param) {
                var html = "";
                var headPicHtml = "";

                param.level++;

                //如果要显示人员
                if (!setting.hidePerson) {
                    for (var i = 0; i < data.length; i++) {
                        data[i].name = data[i].username;
                        this.fillTreeDataInCache(data[i], cacheDataType.user);//存储组织架构信息到缓存里面

                    //头像的html，如果头像的地址为空，用默认的头像
                    if (data[i].headImg != "") {
                        headPicHtml = "<img class='person-head-pic' alt='pic' onerror='javascript:this.src=\"" +
                            (data[i].sex == 0 ? exfun.getImgSrcBase64().man : exfun.getImgSrcBase64().woman)+ "\"' " +
                            "src='" + config.picAddr + "/" + data[i].headImg + "' />";
                    }
                    else {
                        headPicHtml = "<img class='person-head-pic' src='" + (data[i].sex == 0 ? exfun.getImgSrcBase64().man : exfun.getImgSrcBase64().woman) + "' />";
                    }

                    html += "<div class='os-tree-item' level='" + param.level + "'>" +
                        "<div class='os-tree-item-info' type='" + cacheDataType.user + "' mid='" + data[i].jid + "' title='" + data[i].username + "' " +
                        "level='" + param.level + "' style='padding-left:" + (param.level * 10 + 5) + "px;'>" + headPicHtml +
                            "<div class='person-info'><a style='width:" + this.getNameWidth(setting.treeWidth, param.level * 10) + "'>" +
                        data[i].username + "</a></div>" +
                        "</div>" +
                        "</div>";
                    }
                }

                html += "</div>";

                return html;
            },
            getDefaultHtml: function (option, data, param) {
                this.fillTreeDataInCache(data, cacheDataType.other);//存储组织架构信息到缓存里面

                return "";
            },
            fillTreeDataInCache: function (data, type) {
                switch (type) {
                    case cacheDataType.user:
                        if (setting.dealJid && data.jid && data.jid.indexOf("\@") > 0) {
                            data.exJid = data.jid;
                            data.jid = data.jid.substring(0, data.jid.lastIndexOf("\@"));
                        }
                        /*2016-11-29 18:29 刘宇来 处理*/
                        if (setting.dealDeptName && data.deptname && data.deptname.lastIndexOf("/") > 0) {
                            data.dept_display_name = data.deptname.substring(data.deptname.lastIndexOf("/") + 1, data.deptname.length);
                        }
                        cacheData_tree.users.push(data);
                        break;
                    case cacheDataType.department:
                        cacheData_tree.departments.push(data);
                        break;
                    case cacheDataType.group:
                        cacheData_tree.groups.push(data);
                        break;
                    case cacheDataType.other:
                        cacheData_tree.other.push(data);
                        break;
                    default: break;
                }
            },
            fillSelectedDataInCache: function (data, type) {
                /*var i = 0;
                /!* 将当前数据与已选择数据进行对比，如果有相同数据，表示该数据已经选过则该值为true，
                 * 如果没有相同数据，表示还未选过该数据，该值为false*!/
                var hasExist = false;*/

                switch (type) {
                    case cacheDataType.user:
                        selectedData.users.push(data);
                        break;
                    case cacheDataType.department:
                        selectedData.departments.push(data);
                        break;
                    case cacheDataType.group:
                        selectedData.groups.push(data);
                        break;
                    case cacheDataType.other:
                        selectedData.other.push(data);
                        break;
                    default: break;
                }
            },
            getCacheDataByIdAndType: function (id, type) {
                var i = 0;
                var ret = null;

                switch (type) {
                    case cacheDataType.user:
                        for (i = 0; i < cacheData_tree.users.length; i++) {
                            if (id == cacheData_tree.users[i].jid) {
                                ret = cacheData_tree.users[i];
                                break;
                            }
                        }
                        break;
                    case cacheDataType.department:
                        for (i = 0; i < cacheData_tree.departments.length; i++) {
                            if (id == cacheData_tree.departments[i].dept_id) {
                                ret = cacheData_tree.departments[i];
                                break;
                            }
                        }
                        break;
                    case cacheDataType.group:
                        for (i = 0; i < cacheData_tree.groups.length; i++) {
                            if (id == cacheData_tree.groups[i].jid) {
                                ret = cacheData_tree.groups[i];
                                break;
                            }
                        }
                        break;
                    case cacheDataType.other:
                        for (i = 0; i < cacheData_tree.other.length; i++) {
                            if (id == cacheData_tree.other[i].id) {
                                ret = cacheData_tree.other[i];
                                break;
                            }
                        }
                        break;
                    default: break;
                }

                return ret;
            },
            /**
             * 将数据从已选列表数据中移除
             * @param id 数据的id
             * @param type 节点类型
             */
            removeSelectedDataInCache: function (id, type) {
                var i = 0;

                switch (type) {
                    case cacheDataType.user:
                        for (i = 0; i < selectedData.users.length; i++) {
                            if (id == selectedData.users[i].jid) {
                                selectedData.users.splice(i, 1);
                                break;
                            }
                        }
                        break;
                    case cacheDataType.department:
                        for (i = 0; i < selectedData.departments.length; i++) {
                            if (id == selectedData.departments[i].dept_id) {
                                selectedData.departments.splice(i, 1);
                                break;
                            }
                        }
                        break;
                    case cacheDataType.group:
                        for (i = 0; i < selectedData.groups.length; i++) {
                            if (id == selectedData.groups[i].jid) {
                                selectedData.groups.splice(i, 1);
                                break;
                            }
                        }
                        break;
                    case cacheDataType.other:
                        for (i = 0; i < selectedData.other.length; i++) {
                            if (id == selectedData.other[i].id) {
                                selectedData.other.splice(i, 1);
                                break;
                            }
                        }
                        break;
                    default: break;
                }
            },
            checkNodeIsSelected: function (dataId, type) {
                var i = 0;
                var hasFound = false;

                switch (type) {
                    case cacheDataType.user:
                        for (i = 0; i < selectedData.users.length; i++) {
                            if (dataId == selectedData.users[i].jid) {
                                hasFound = true;
                                break;
                            }
                        }
                        break;
                    case cacheDataType.department:
                        for (i = 0; i < selectedData.departments.length; i++) {
                            if (dataId == selectedData.departments[i].dept_id) {
                                hasFound = true;
                                break;
                            }
                        }
                        break;
                    case cacheDataType.group:
                        for (i = 0; i < selectedData.groups.length; i++) {
                            if (dataId == selectedData.groups[i].jid) {
                                hasFound = true;
                                break;
                            }
                        }
                        break;
                    case cacheDataType.other:
                        for (i = 0; i < selectedData.other.length; i++) {
                            if (dataId == selectedData.other[i].id) {
                                hasFound = true;
                                break;
                            }
                        }
                        break;
                    default: break;
                }

                return hasFound;
            },
            bindNodeClick: function () {
                var objThis = this;

                ctn.find(".os-body-left").off("click", ".os-tree-item-info").on("click", ".os-tree-item-info", function (e) {
                    var nodeType = $(this).attr("type");//节点的类型，参见cacheDataType
                    var nodeId = $(this).attr("mid");//节点的id

                    if (setting.maxSelect && setting.maxSelect.num) {//如果最大选择不为空对象，或者最大选择数为不0，要做判定
                        if ((nodeType == cacheDataType.user || nodeType == cacheDataType.other) &&
                            ctn.find(".selectedNode").length >= setting.maxSelect.num) {//如果已选的节点数超过了最大限制
                            methods.alert(setting.maxSelect.msg || ("不能选择超过" + setting.maxSelect.num + setting.maxSelect.unit + "的项"));
                            return;
                        }
                    }

                    e.preventDefault();//阻止事件向下捕获
                    e.stopPropagation();

                    $(this).find(".item-info-arrow").toggleClass("item-info-arrow-down");//改变三角形的样式

                    if ($(this).attr("hasChild") == "true") {//如果是有子级数据的节点
                        if ($(this).attr("hasLoaded") == "true") {//如果子级节点的数据已经加载过了，则收起该节点
                            $(this).siblings().slideToggle("fast");

                            return;
                        }
                        else {//如果没有加载过子级数据，则要加载子级数据
                            var treeName = $(this).parents(".os-tree").attr("name");//树的名称，以便查找区分
                            var option = setting.options.filter(function (item) {
                                return treeName == item.name;
                            });

                            $(this).attr("hasLoaded", "true");//标识已经加载过子级数据了
                            option[0].url = option[0].getChildDataUrl(nodeId);

                            objThis.getData(option[0], objThis.constructItem, {
                                pNode: $(this),
                                level: parseInt($(this).attr("level")) + 1,
                                pid: $(this).attr("pid"),
                                isChildData: true//是否是加载子节点的数据
                            });
                        }
                    }
                    else {//如果不是有子级节点的数据，则把该节点移到右边
                        if (!objThis.checkNodeIsSelected(nodeId, nodeType)) {//如果该节点没有在已选列表中
                            var _cacheData = objThis.getCacheDataByIdAndType(nodeId, nodeType);

                            if (setting.dataCheck) {
                                var _result = setting.dataCheck.call(objThis, _cacheData);

                                if (!_result.isValid) {
                                    setting.alert(_result.msg);

                                    return;
                                }
                            }

                            objThis.fillSelectedDataInCache(_cacheData, nodeType);//将选中的节点的数据存入缓存
                            objThis.putNodeToRight($(this).clone(), nodeType);//将该节点放到已选列表中
                        }
                    }
                });
            },
            /**
             * 绑定左边节点的hover事件
             */
            bindNodeHover: function () {
                ctn.find(".left-ct-ctn").off("mouseenter", ".os-tree-item-info").on("mouseenter", ".os-tree-item-info", function () {
                    if (!setting.selectDept && $(this).attr("type") == cacheDataType.department) {
                        return;
                    }
                    if (!setting.selectGroup && $(this).attr("type") == cacheDataType.group) {
                        return;
                    }

                    if ($(this).attr("type") == cacheDataType.department || $(this).attr("type") == cacheDataType.group) {
                        $(this).append("<img class='selNode' src='" + exfun.getImgSrcBase64().nodeSel + "' />");
                    }
                }).off("mouseleave", ".os-tree-item-info").on("mouseleave", ".os-tree-item-info", function (e) {
                    if ($(this).attr("type") == cacheDataType.department || $(this).attr("type") == cacheDataType.group) {
                        $(this).find(".selNode").remove();
                    }
                });
            },
            /**
             * 选中节点为部门或者小组节点的事件
             */
            bindChooseDeptOrGroup: function () {
                var objThis = this;

                ctn.find(".left-ct-ctn").off("click", ".selNode").on("click", ".selNode", function (e) {
                    if (setting.maxSelect && setting.maxSelect.num) {//如果最大选择不为空对象，或者最大选择数为不0，要做判定
                        if (ctn.find(".selectedNode").length >= setting.maxSelect.num) {
                            methods.alert(setting.maxSelect.msg || ("不能选择超过" + setting.maxSelect.num + setting.maxSelect.unit + "的项"));
                            return;
                        }
                    }

                    e.stopPropagation();//阻止事件冒泡
                    e.preventDefault();

                    var nodeType = $(this).parent().attr("type");//节点的类型，参见cacheDataType
                    var nodeId = $(this).parent().attr("mid");//节点的id

                    if (!objThis.checkNodeIsSelected(nodeId, nodeType)) {//如果该节点没有在已选列表中
                        objThis.fillSelectedDataInCache(objThis.getCacheDataByIdAndType(nodeId, nodeType), nodeType);//将选中的节点的数据存入缓存
                        objThis.putNodeToRight($(this).parent().clone(), nodeType);//将该节点放到已选列表中
                    }
                });
            },
            /**
             * 将选中的节点移到右边
             * @param node 节点
             * @param type 节点类型，参见cacheDataType
             */
            putNodeToRight: function (node, type) {
                switch (type) {
                    case cacheDataType.user:
                        ctn.find(".os-body-right-content").append(node.attr("class", "selectedNode").removeAttr("style"));
                        break;
                    case cacheDataType.department:
                    case cacheDataType.group:
                        node.attr("class", "selectedNode").removeAttr("style").find(".item-info-arrow").remove();
                        node.find(".selNode").remove();
                        node.prepend("<img src='" + exfun.getImgSrcBase64().group + "' class='dept-head-pic' />");

                        ctn.find(".os-body-right-content").append(node);
                        break;
                    case cacheDataType.other:
                        break;
                    default: break;
                }

                ctn.find(".selNum").html(parseInt(ctn.find(".selNum").html()) + 1);
            },
            getNameWidth: function (maxWidth, exWidth) {
                var b_type = getBrowserType().type;
                var ex_val = (setting.type === "background" ? 63 : 53) + (b_type.match(/(ie|firefox|unknown)/i) ? 8 : 0);

                return parseFloat(maxWidth) - parseFloat(exWidth) - ex_val + "px";
            }
        };

        var exfun = {
            getConfig: function (callback) {
                // var dataParam = "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:com='http://www.123.com/'>" +
                //     "<soapenv:Header/><soapenv:Body><com:AllSysProperty></com:AllSysProperty></soapenv:Body></soapenv:Envelope>";

                // $.ajax({
                //     url: dataUrl,
                //     data: dataParam,
                //     type: "post",
                //     success: function (res) {
                //         var settingData = xmlObjToJson(res);

                //         for (var i = 0; i < settingData.length; i++) {
                //             if (settingData[i].propertyName == "OrgOrigin") {
                //                 settingHttp = settingData[i].propertyValue;
                //             }
                //             else if (settingData[i].propertyName == "OrgProjectContext") {
                //                 settingPath = settingData[i].propertyValue;
                //             }
                //             else if (settingData[i].propertyName == "PicOrigin") {
                //                 // picHttp = "http://192.168.1.14:55123"//settingData[i].propertyValue;
                //             }
                //             else if (settingData[i].propertyName == "DOWNLOAD_BASE_PATH") {
                //                 picProjectPath = settingData[i].propertyValue;
                //             }
                //             else if (settingData[i].propertyName == "HTTP_TRANSPORT_CONTEXT") {
                //                 picBasePath = settingData[i].propertyValue;
                //             }
                //             picHttp = "http://192.168.1.14:55123";
                //             picPath = picBasePath + picProjectPath;
                //         }
                //         callback.call(methods);
                //     },
                //     error: function (a, b, c) {

                //     },
                //     complete: function () {

                //     }
                // });

                return {
                    settingHttp: "",
                    settingPath: dataUrl,
                    picAddr: parameter.picOrigin
                }
            },
            /**
             * 获取配置
             */
            getSetting: function () {
                var height = parameter.type === "background" ? "420px" : "395px";

                return {
                    width: "451.5px",
                    height: height,
                    title: "选择联系人",
                    zIndex: 999,
                    maxSelect: { num: 1000, unit: "个", msg: "不能超出最大选择人员数的限制！" },
                    search: {},
                    needLayer: false,//是否需要遮罩层
                    linkMan: true,//是否需要联系人选项卡
                    workGroup: true,//是否需要工作组选项卡
                    organize: true,//是否需要组织架构选项卡
                    multiple: true,//是否多选，如果是单选，则没有右边的选择框
                    selectDept: true,
                    selectGroup: true,
                    selDept: "dept",//选择部门的方式，dept表示选择整个部门，user表示选择选择部门下所有的人
                    options: [],
                    btns: this.getBtnSetting()
                };
            },
            getSearchSetting: function () {
				var ret = null;
				
				if(!setting.hideSearch){
					ret =  {
						placeholder: "人员搜索",
						maxlength: "100",
						url: config.settingPath + "/enter/getUserInfoListBySearch&token=" + token + "&fromJid=" + personId
					}
				}
				
				return ret;
            },
            /**
             * 获取选项配置
             */
            getOptionsSetting: function () {
                var ret = [];

                if (setting.linkMan) {
                    ret.push(this.getLinkManSetting());
                }
                if (setting.workGroup) {
                    ret.push(this.getWorkGroupSetting());
                }
                if (setting.organize) {
                    ret.push(this.getOrganizeSetting());
                }

                return ret;
            },
            /**
             * 获取联系人配置
             */
            getLinkManSetting: function () {
                return {
                    name: dataType.linkMan,
                    title: "联系人",
                    needHeadPic: true,//是否加载头像的图片
                    expandChild: true,//是否默认展开子节点
                    showTotalCount: true,//是否展示人数总数
                    url: config.settingPath + "/roster/getRosterListByToken&fromJid=" + personId + "&token=" + token,
                    type: "post"
                };
            },
            /**
             * 获取工作组配置
             */
            getWorkGroupSetting: function () {
                return {
                    name: dataType.group,
                    title: "工作组",
                    needHeadPic: true,//是否加载头像的图片
                    expandChild: true,//是否默认展开子节点
                    showTotalCount: true,//是否展示人数总数
                    url: config.settingPath + "/muc/getMyGroupListByToken&fromJid=" + personId + "&token=" + token,
                    type: "post",
                    getChildDataUrl: function (mucId) {//子节点数据的url
                        return config.settingPath + "/muc/getMucMembersByToken&fromJid=" + personId + "&token=" + token + "&mucId=" + mucId;
                    }
                };
            },
            /**
             * 获取组织架构配置
             */
            getOrganizeSetting: function () {
                return {
                    name: dataType.organize,
                    title: "组织架构",
                    needHeadPic: true,//是否加载头像的图片
                    expandChild: true,//是否默认展开子节点
                    showTotalCount: true,//是否展示人数总数
                    url: config.settingPath + "/enter/getDepartInfoById&fromJid=" + personId + "&token=" + token + "&depid=" + companyId,
                    type: "post",
                    getChildDataUrl: function (depid) {//子节点数据的url
                        return config.settingPath + "/enter/getEnterListByTokenWithDepId&fromJid=" + personId + "&token=" + token + "&depid=" + depid;
                    }
                };
            },
            /**
             * 获取按钮配置
             */
            getBtnSetting: function () {
                var objThis = this;

                return [
                    {
                        name: "ok",
                        title: "确定",
                        callback: function () {
                            if (parameter.callback) {
                                parameter.callback.call(objThis, selectedData);
                            }

                            this.close();
                        }
                    },
                    {
                        name: "cancel",
                        title: "取消",
                        callback: function () {
                            this.close();
                        }
                    }
                ];
            },
            getImgSrcBase64:function(){
                return {
                    man:"data:image/png;base64,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",
                    woman:"data:image/png;base64,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",
                    group:"data:image/png;base64,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",
                    cancel:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo3NUJFRkZCRUIwNTdFNjExODg3REFEQUNEQ0FCM0YyNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3RDE4N0Q0QjU3QkQxMUU2QTg2NkVCNTBGRTc5NDM4QSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3RDE4N0Q0QTU3QkQxMUU2QTg2NkVCNTBGRTc5NDM4QSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjlGN0FDRDA5QkE1N0U2MTE4ODdEQURBQ0RDQUIzRjI3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjc1QkVGRkJFQjA1N0U2MTE4ODdEQURBQ0RDQUIzRjI3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Db9loQAAAZBJREFUeNqEkz1LA0EQhmePwCWnaCkWJp2NKKkFS0G0VCy0UIvYqWAhaOOliYhaiH9AwUqsBQvFykpE0T9g/MLOBLkLGO58Z3N7zsWPDDywu7fv7M57s6o6PkZN0Q3mAX/oAzZ4BufgEJzJzUokUGAZuKCd/o4TUAAvPLHEh12w3ULMMQouo5vGCWbAQuMeilQ6/UOl15Qy0xw4Zr0VnbhpxPZsgZzSDqmOzm8xxrxmzxVkkkEwxQkmQZfemHEoNZAnK5sjxy1poRZjzGup/rzeI2KRTWRnpxOnFTfI6slSUH7QaywOHsvkuWsUVt5lgsCK6okjrFbIW1/VAhb+IybjweevXodhciznMgN4SrgtauaTzU24LGmsLOEiFjttCTGXEpcDT3QS7BFxzQmOwJu+qe9R/f42FrMf0pP63Y3eI5vPtDI30r5spND3k42UyVBYq0kvuBuHTCcegD1jWLO4cTtfivn/ThgPTCyBFfDR4i2cRl342vyYOP0W6AVFcAX4KgEoRyUOgxHzEjm+BBgAZCKXOkmxUp4AAAAASUVORK5CYII=",
                    del:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Njg3NTU2NkQzMTVBMTFFNjlFQ0VDN0FGMDEyRjQ1OEIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Njg3NTU2NkUzMTVBMTFFNjlFQ0VDN0FGMDEyRjQ1OEIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2ODc1NTY2QjMxNUExMUU2OUVDRUM3QUYwMTJGNDU4QiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2ODc1NTY2QzMxNUExMUU2OUVDRUM3QUYwMTJGNDU4QiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Ps6c+FwAAAC1SURBVHjaxJOBCYMwEEVzoSukQ+gUikN0wrZLaKdIh9Ah4l35liPc1UKFCh8x+f9xd4lUSgm/PHQYYCGS14U1yqfjT6yBdUvIndSmhK+sJ6szIBJ+sBqWpO+yGJVhQriFMRnhFp7Ja+GMTTFmVBJUWNZ61ry1UAMsSKjDr5I+AGpIUNW857IBojPtr882Okele87OYE1AHe4gFxJ3wgvkQjRgwCXJxkXSkAbeY64y/f1vXAUYANS4WnmCibYgAAAAAElFTkSuQmCC",
                    nodeSel:"data:image/png;base64,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",
                    search:"data:image/png;base64,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"
                }
            }
        };

        methods.init();

        function getBrowserType() {
            var ret = {};
            var browserName = navigator.userAgent.toLowerCase();

            if (/msie/i.test(browserName) && !/opera/.test(browserName)) {
                ret.type = "ie";
                ret.version = browserName.match(/msie ([\d.]+)/)[1];
            }
            else if (/firefox/i.test(browserName)) {
                ret.type = "firefox";
                ret.version = browserName.match(/firefox\/([\d.]+)/)[1];
            }
            else if (/chrome/i.test(browserName) && /webkit/i.test(browserName) && /mozilla/i.test(browserName)) {
                ret.type = "chrome";
                ret.version = browserName.match(/chrome\/([\d.]+)/)[1];
            }
            else if (/opera/i.test(browserName)) {
                ret.type = "opera";
                ret.version = browserName.match(/opera.([\d.]+)/)[1];
            }
            else if (/webkit/i.test(browserName) && !(/chrome/i.test(browserName) && /webkit/i.test(browserName) && /mozilla/i.test(browserName))) {
                ret.type = "safari";
                ret.version = browserName.match(/safari.([\d.]+)/)[1];
            }
            else {
                ret.type = "unknown";
                ret.version = "";
            }

            return ret;
        }

        function xmlObjToJson(xmlObj) {
            var item = null, nodeName = "", ret = [];

            getObjs(xmlObj);

            function getObjs(xmlObjData) {
                if (xmlObjData.hasChildNodes()) {
                    for (var i = 0; i < xmlObjData.childNodes.length; i++) {
                        item = xmlObjData.childNodes.item(i);
                        nodeName = item.nodeName;

                        if (item.nodeType == 1 && item.nodeName == "ns2:SysProperty") {
                            getNodeInfo(item);
                        }
                        else {
                            getObjs(item);
                        }
                    }
                }
            }

            function getNodeInfo(nodeObj) {
                var t_obj = {}, node = null;

                for (var k = 0; k < nodeObj.childNodes.length; k++) {
                    node = nodeObj.childNodes.item(k);

                    if (node.nodeType == 1) {
                        t_obj[node.nodeName] = node.textContent;
                    }
                }

                ret.push(t_obj);
            }

            getObjs = null;
            getNodeInfo = null;

            return ret;
        }

        /**
         * 设置为loading状态
         * @param param 参数
         */
        function setLoading(param) {

        }

        function finishLoading(param) {

        }
    };
})(jQuery);