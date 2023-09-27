# iems-chatbot-ui-plugin

npm install: 

    npm install iems-chatbot-ui-plugin  

install:

    import { createApp } from 'vue';
    import MyPlugin from 'iems-chatbot-ui-plugin';

    const app = createApp(App);
    app.use(MyPlugin);

Use:

    <chatbotui></chatbotui>

在Vue 3应用中使用TypeScript引入自定义插件时，有时会出现找不到声明文件的问题。  
使用插件的Vue 3项目中添加声明文件： 确保你的Vue 3项目中也有一个声明文件（.d.ts）来引用你的插件  

    declare module 'iems-chatbot-ui-plugin';


# Vue Prop:  

prop 包含 `config`, `api`, `msg` 三個屬性  
    
    <chatbotui :api="api" :msg="msg" :config="config"></chatbotui>
    <drag-ctrl-chat-dialog :api="api" :msg="msg"></drag-ctrl-chat-dialog>

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