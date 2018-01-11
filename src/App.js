import React, { Component } from 'react';
import { AppContainer } from './pages'
import '@/styles/common.less'
import '@/styles/objSelector-background.css'


console.log('修改后的页面')
class App extends Component {
  render() {
    return (
      <div style={{height:'100%'}}>
       <AppContainer />
      </div>
    );
  }
}

export default App;