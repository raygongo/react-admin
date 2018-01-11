const devURL = 'http://localhost:8081/plugin-workbench/'   // 开发地址
const proURL = '/plugin-workbench'   // 线上地址

// 配置 线上和线下接口开发地址
const baseURL = process.env.NODE_ENV === 'development' ? devURL : proURL

export default {
    baseURL:baseURL
}