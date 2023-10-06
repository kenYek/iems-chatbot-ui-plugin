import MyComponent from './MyComponent.vue';
import Chatbotui from './Chatbotui.vue';
import DragCtrlChatDialog from './DragCtrlChatDialog.vue';
import PageChatbot from './PageChatbot.vue';

const MyPlugin = {
  install(app) {
    app.component('my-component', MyComponent);
    app.component('chatbotui', Chatbotui);
    app.component('drag-ctrl-chat-dialog', DragCtrlChatDialog);
    app.component('page-chatbot', PageChatbot);
  },
};

export default MyPlugin;