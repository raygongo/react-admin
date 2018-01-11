import axios from 'axios';
import Qs from 'qs' 
import { message } from 'antd';
import config from '@/config'

const fetchAjax = options => {
	return new Promise((resolve, reject) => {

		const instance = axios.create({
			baseURL: config.baseURL,
			timeout: 30000,
		})

		instance.defaults.headers['Content-Type'] = 'application/json'

		/**
		 * 请求拦截
		 */
		instance.interceptors.request.use(config => {
			document.getElementById("loading-box").style.display = 'block'
			// config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
			// if (config.method === 'post') {
			// 	config.data = Qs.stringify({
			// 		...config.data
			// 	})
			// 	config.data = JSON.stringify(config.data)
			// }
			return config
		}, err => {
			return Promise.reject(err)
		})

		/**
		 * 响应拦截
		 */
		instance.interceptors.response.use(res => {
			document.getElementById("loading-box").style.display = 'none'
			// 接口测试mock假数据
			// return Mock.mock(res.data)
			if (res.status == 200 ){
				if(res.data.state == "CO2000"){
					return res.data
				}
			}
			// message.error(res.data.message || '网络错误!,请重试');
			
		}, err => {
			return Promise.reject(err)
		})
		/**
		 *  处理请求结果
		 */
		instance(options)
			.then(response => {
				const res = response.data

				resolve(res)
			})
			.catch(err => {
				document.getElementById("loading-box").style.display = 'none'
				message.error(  '网络错误!,请重试');
				// 同一错误处理

			})
	})
}

export default {
	get(url, params = {}) {
		return fetchAjax({
			method: 'GET',
			url,
			params:{
				...params,
				time:new Date().getTime()
			}
		})
	},

	post(url, data = {}) {
		return fetchAjax({
			method: 'POST',
			url,
			data
		})
	},
	put(url, data = {}) {
		return fetchAjax({
			method: 'PUT',
			url,
			data
		})
	},
	delete(url, data = {}) {
		return fetchAjax({
			method: 'DELETE',
			url,
			data
		})
	},
}
