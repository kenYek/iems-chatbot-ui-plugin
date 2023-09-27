# xhihha1-vue-plugin

npm install: 

    npm install xhihha1-vue-plugin  

install:

    import { createApp } from 'vue';
    import MyPlugin from 'xhihha1-vue-plugin';

    const app = createApp(App);
    app.use(MyPlugin);

Use:

    <my-component></my-component>

在Vue 3应用中使用TypeScript引入自定义插件时，有时会出现找不到声明文件的问题。  
使用插件的Vue 3项目中添加声明文件： 确保你的Vue 3项目中也有一个声明文件（.d.ts）来引用你的插件  

    declare module 'my-vue-plugin';


# Vue Prop:  

prop 包含 `config`, `api`, `msg` 三個屬性  
    
    <second-component :api="api" :msg="msg"></second-component>

    config: {
        name: String,
        showName: Boolean,
        mic: Boolean,
        inputDefaultStr: String
    }

    api: {
        root: '', // 根路徑  
        chat: {  
            path: '/iems/chatbot',
            method: 'POST'
            params: {
                resourceId: "984"
            }
        } // chat 接口 api  
    }

    msg: {
        title: 'title', // Dialog title
        helloworld: String,
        list: Array String
    }