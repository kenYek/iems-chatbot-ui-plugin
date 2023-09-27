declare module 'iems-chatbot-ui-plugin' {
    import { App } from 'vue';
  
    const MyPlugin: {
      install: (app: App) => void;
    };
  
    export default MyPlugin;
}