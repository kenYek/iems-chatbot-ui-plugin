<template>
  <div class="aiBot">
    <div class="chatContain">
      <div class="aiBotBox">
        <div class="boxContent">
          <div class="aiBotLogoArea"><img class="aiBotLogo" src="./assets/Icon.svg" /></div>
            <div class="chatArea">
              <span class="contentSpan">
                <span>{{ helloworld }}</span>
                <ul>
                  <li v-for="(message, index) in defaultMessage" :key="index" @click="pickMessage(message)">{{ message }}</li>
                </ul>
              </span>
            </div>
          <div class="date">{{ startTime }}</div>
        </div>
      </div>
      <div v-for="(message, index) in messages" :key="index" :class="{ aiBotBox: message.type === 'bot', selfBox: message.type === 'user' }">
        <div class="boxContent">
          <div class="aiBotLogoArea" v-if="message.type === 'bot'"><img class="aiBotLogo" src="./assets/Icon.svg" /></div>
          <div class="chatArea">
            <span class="contentSpanWithHelp" v-if="showHelpBlock && message.type === 'bot' && message.error === false" >
              <span class="contentSpan">{{ message.content }}</span>
              <div class="helpArea">
                <button class="blueplay"></button>
                <span> Was this helpful?</span>
                <button class="resBtn">Yes</button>
                <button class="resBtn">No</button>
              </div>
            </span>
            <span class="contentSpan" v-else>
              <span>{{ message.content }}</span>
            </span>
          </div>
          <div class="date">{{ message.timestamp }}</div>
        </div>
      </div>
    </div>
    <div class="chatInputArea">
      <div><span class="chatName" v-if="showName">{{ getFirstCharacter(username) }}</span></div>
        <div class="chatInputDiv">
          <input type="text" class="chatInput" :placeholder="placeholder" v-model="message" @keyup.enter="sendMessage"/>
        </div>
        <div>
          <button class="chatMic" v-show="showMic"></button>
        </div>
        <div>
          <button type="text" class="chatNext" @click="sendMessage"></button>
        </div>
      </div>
    </div>
</template>

<script>
import chatbotAPI from './api/chatbot'
export default {
  props: {
    config: { type: Object },
    api: { type: Object },
    msg: {
      type: Object
    }
  },
  data() {
    let helloworld = '您好，我是智能AI專家，歡迎您使用AI智能服務。';
    let defaultMessageList = [
        "請問如何調整實際負載容量?",
        "該場域年度契約容量為何?",
        "請問哪台配備負載量最高?",
        "時間電價區間為何?",
    ];
    let placeholder = '請輸入訊息';
    let username = 'Guest';
    let showMic = true;
    let showName = true;
    let showHelpBlock = true;
    if (this.msg) {
      if (this.msg.helloworld) {
        helloworld = this.msg.helloworld;
      }
      if (Array.isArray(this.msg.list)) {
        defaultMessageList = this.msg.list;
      }
    }
    if (this.config) {
      if (this.config.name) {
        username = this.config.name;
      }
      if (typeof(this.config.showName) === 'boolean') {
        showName = this.config.showName;
      }
      if (typeof(this.config.mic)!== 'undefined') {
        showMic = this.config.mic;
      }
      if (this.config.inputDefaultStr) {
        placeholder = this.config.inputDefaultStr;
      }
      if (typeof(this.config.showHelpBlock) === 'boolean') {
        showHelpBlock = this.config.showHelpBlock;
      }
    }
    return {
      placeholder: placeholder,
      showName: showName,
      showHelpBlock: showHelpBlock,
      showMic: showMic,
      username: username,
      startTime: "",
      messages: [],
      message: "",
      helloworld: helloworld,
      defaultMessage: defaultMessageList,
      defaultApi: {
        root: '',
        chat: { path: '/iEMS/chatbot', method: 'POST' }
      }
    };
  },
  created() {
    this.startTime = this.getCurrentTime();
  },
  watch:{
    config: {
      function(newVal) {
        console.log('watch config c:', newVal)
        if (newVal && newVal.name) {
          this.username = newVal.name;
        }
        if (newVal && typeof(newVal.showName) === 'boolean') {
          this.showName = newVal.showName;
        }
        if (newVal && typeof(newVal.mic)!== 'undefined') {
          this.showMic = newVal.mic;
        }
        if (newVal && newVal.inputDefaultStr) {
          this.placeholder = newVal.inputDefaultStr;
        }
        if (newVal && typeof(newVal.showHelpBlock) === 'boolean') {
          this.showHelpBlock = newVal.showHelpBlock;
        }
      },
      deep: true
    },
    api () {

    },
    msg (newVal) {
      if (newVal && newVal.helloworld) {
        this.helloworld = newVal.helloworld;
      }
      if (newVal && Array.isArray(newVal.list)) {
        this.defaultMessage = newVal.list;
      }
    }
  },
  methods: {
    getFirstCharacter(username) {
      const name = username;
      // Check if the input name is not empty
      if (name && typeof name === 'string') {
        // Use the charAt(0) method to get the first character
        return name.charAt(0);
      } else {
        // Handle invalid input or empty string
        return 'U';
      }
    },
    objectToUrlParameters (obj) {
      return Object.entries(obj)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
    },
    getCurrentTime() {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    },
    pickMessage(askMsg) {
      this.message = askMsg
      this.sendMessage()
    },
    addMessage(message, type, err) {
      const msg = {}
      msg.content = message
      msg.type = type
      msg.error = err
      msg.timestamp = this.getCurrentTime()
      this.messages.push(msg)
    },
    async sendMessage () {
      if (this.message.trim() === '') {
        return false
      }
      // merge api.chat
      let mergedReq = this.defaultApi.chat;
      if (this.api &&　this.api.chat) {
        mergedReq = { ...mergedReq, ...this.api.chat };
      }
      let mergedRoot = this.defaultApi.root;
      if (this.api &&　this.api.root) {
        mergedRoot = this.api.root;
      }
      this.addMessage(this.message, "user")
      // var formData = new FormData();
      // formData.append('question', this.message);
      const reqData = {
        "messages": [
          {
            "role": "user",
            "content": this.message
          }
        ]
      }
      if (mergedReq.params) {
        reqData.params = mergedReq.params
      }
      const params = ""
      this.message = ""
      try {
        // const resp = await chatbotAPI.requestSearch(formData, params)
        let resp = '';
        if (mergedReq.method.toUpperCase === 'GET') {
          resp = await chatbotAPI.requestGET (mergedRoot + mergedReq.path, this.objectToUrlParameters(reqData.params))
        } else {
          resp = await chatbotAPI.requestPOST (mergedRoot + mergedReq.path, params, reqData)
        }
        if (resp.data != null && resp.data.isError === false && Array.isArray(resp.data.messages)) {
          for (let i = 0; i < resp.data.messages.length; i++) {
            this.addMessage(resp.data.messages[i].content, "bot", false)
          }
        } else {
          this.addMessage("Error fetching response", "bot", true)
        }
      } catch (error) {
        this.addMessage("Connection error", "bot", true)
      }
    }
  },
};
</script>


<style scoped>

.aiBot{
    position: relative;
    width: 100%;
    height: 100%;
  }
  .chatInputArea{
      position: absolute;
      bottom: 0px;
      width: 100%;
      height: 56px;
      box-sizing: border-box;
      border-top: 1px solid #C8C8C8;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #ffffff;
  }

  .dark .chatInputArea{
      background-color: black;
  }
  .chatContain {
      position: absolute;
      box-sizing: border-box;
      padding: 24px 4px;
      overflow-y: auto;
      overflow-x: hidden;
      height: calc(100% - 56px);
      width: 100%;
  }

  .dark .chatContain {
      background-color: black;
  }
  .chatBox{
      margin: 5px;
  }
  .selfBox {
      position: relative;
      display: flex;
      justify-content:flex-end;
      margin-top: 8px;
  }
  .selfBox .boxContent {
      max-width: calc(100% - 50px);
      display: flex;
      justify-content:flex-start;
      flex-direction:row-reverse;
  }
  .date {
      display: flex;
      color: #C8C8C8;
      align-items:flex-end;
      line-height: 16px;
      font-size: 12px;
      margin: 0px 2px;
  }
  .chatArea {
      box-sizing: border-box;
      color: #323233;
  }
  .chatArea .contentSpan{
      display: inline-block;
      border-bottom-right-radius: 20px;
      border-bottom-left-radius: 20px;
      padding: 10px 12px;
      text-align: left;
  }
  .selfBox .chatArea .contentSpan{
      background-color: #4679E1;
      border-top-left-radius: 20px;
      color: white;
  }

  .dark .selfBox .chatArea .contentSpan{
      background-color: #3EA0FF;
      color: black;
  }

  .aiBotBox {
      position: relative;
      display: flex;
      justify-content:flex-start;
      margin-top: 8px;
  }
  .aiBotBox .boxContent {
      max-width: calc(100% - 50px);
      display: flex;
      justify-content:flex-start;
  }
  .aiBotBox .chatArea .contentSpan{
      background-color: #EDEDED;
      border-top-right-radius: 20px;
  }

  .dark .aiBotBox .chatArea .contentSpan{
      background-color: #3E3E40;
      color:#FFFFFF;
  }

  .contentSpanWithHelp{
    display: inline-block;
    padding: 10px 12px;
    text-align: left;
  }

  .aiBotBox .chatArea .contentSpanWithHelp .contentSpan{
    border-bottom-right-radius: 0px;
    border-bottom-left-radius: 0px;
    width:100%;
  }
  .helpArea {
    background-color: #E1E1E1;
    border-bottom-right-radius: 20px;
    border-bottom-left-radius: 20px;
    padding: 10px 12px;
    width:100%;
    display: flex;
    align-items: center;
    color: #89898A;
    font-size: 13px;
  }

  .dark .helpArea {
    background-color: #7D7D7D;
    color: #c0c0c0;
  }

  .blueplay{
      background-color: transparent;
      border: 0;
      background-image: url(./assets/blueplay.svg);
      width: 20px;
      height: 20px;
      margin-right: 8px;
  }

  .dark .blueplay{
      background-image: url(./assets/blueplaydark.svg);
  }

  .resBtn{
    color:#4679E1;
    border: 0;
    background-color: transparent;
    font-size: 12px;
    font-weight: bold;
    padding: 0;
    margin-left: 8px;
  }

  .dark .resBtn {
    color:#3EA0FF;
  }

  .aiBotBox .chatArea ul{
      list-style: none;
      padding: 0px;
  }
  .aiBotBox .chatArea li{
      margin-top: 5px;
      border: 1px solid #4679E1;
      color: #4679E1;
      font-weight: bold;
      border-radius: 10px;
      background-color: #FFFFFF;
      box-sizing: border-box;
      padding: 5px 5px;
      text-align: left;
  }

  .dark .aiBotBox .chatArea li{
      border: 1px solid #3EA0FF;
      color: #3EA0FF;
      background-color: black;
  }
  .aiBotBox .chatArea li:hover{
      color: #FFFFFF;
      background-color: #4679E1;
  }

  .dark .aiBotBox .chatArea li:hover{
      background-color: #3EA0FF;
  }

  .aiBotLogoArea{
      position: relative;
      width: 50px;
      padding-left: 5px;
      padding-right: 5px;
      box-sizing: border-box;
  }
  .aiBotLogo{
      width: 40px;
      height: 40px;
      border-radius: 50px;
      background: conic-gradient(from 225.67deg at 50% 50%, #FF779B -86.46deg, #A85DE8 1.84deg, #2F79E9 93.43deg, #FFD40F 191.22deg, #FF779B 273.54deg, #A85DE8 361.84deg);
  }
  .chatName{
      display: flex;
      background-color: #C6E6F9;
      color: #4679E1;
      border-radius: 50px;
      width: 24px;
      height: 24px;
      text-align: center;
      align-items: center;
      justify-content:center;
  }
  .chatInputDiv{
      width: calc(100% - 100px);
      margin-right: 12px;
  }
  .chatInput{
      background-color: transparent;
      border: 0;
      width: 100%;
      height: 24px;
      outline: none;
      font-size: 16px;
      caret-color: #4679E1;
      color: black;
  }

  .dark .chatInput{
    caret-color: #3EA0FF;
    color: white;
  }
  .chatNext {
      background-color: transparent;
      border: 0;
      padding: 0;
      margin: 0;
      background-image: url(./assets/normalnext.svg);
      width: 24px;
      height: 24px;
      background-repeat: no-repeat;
  }

  .dark .chatNext {
      background-image: url(./assets/normalnextdark.svg);
  }
  .chatMic{
      background-color: transparent;
      border: 0;
      padding: 0;
      margin-right: 4px;
      background-image: url(./assets/normalmic.svg);
      width: 24px;
      height: 24px;
      background-repeat: no-repeat;
  }

  .dark .chatMic{
      background-image: url(./assets/normalmicdark.svg);
  }
</style>