<template>
  <div class="aiBot">
    <div class="chatContain" :style="{ height: recordMode ? 'calc(100% - 240px)' : 'calc(100% - 56px)' }">
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
                <span> {{ helpString }}</span>
                <button v-for="(btn, idx) in defaultHelpChoice" :key="idx" class="resBtn">{{ btn }}</button>
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
    <div class="chatInputArea" v-if="!recordMode">
      <div><span class="chatName" v-if="showName">{{ getFirstCharacter(username) }}</span></div>
        <div class="chatInputDiv">
          <input type="text" class="chatInput" :placeholder="placeholder" v-model="message" @keyup.enter="sendMessage"/>
        </div>
        <div>
          <button class="chatMic" v-show="showMic" @click="toggleRecordMode"></button>
        </div>
        <div>
          <button type="text" class="chatNext" @click="sendMessage"></button>
        </div>
      </div>
      <div class="micInputArea" v-if="recordMode">
        <div class="micInputAreaTitle">
          <button class="closeBtn" @click="toggleRecordMode"></button>
        </div>
        <div class="micInputAreaBody">
          <div class="micText" v-if="!isMicrophoneReady">Microphone is not ready</div>
          <div class="micText" v-else-if="!isRecording && audioUrl==''">Tap the button to start recording</div>
          <div class="recordTime" v-else="isRecording || audioUrl!=''"> {{ formatTime(recordingTime) }}</div>
          <div class="micInputAreaButtons">
            <div class="discardRecord" v-if="!isRecording && audioUrl!=''" @click="discardRecording"></div>
            <div class="outcircle">
              <button class="circle" @click="record">
                <div class="mic" v-if="!isRecording && audioUrl==''"></div>
                <div class="stopRecord" v-if="isRecording"></div>
                <div class="playRecord" v-if="!isRecording && audioUrl!='' && !audioplaying"></div>
                <div class="pauseRecord" v-if="audioplaying"></div>
              </button>
            </div>
            <button class="sendRecord" v-if="!isRecording && audioUrl!=''" @click="sendRecord"></button>
          </div>
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
    let defaultHelpChoice = ["Yes", "No"]
    let placeholder = '請輸入訊息';
    let username = 'Guest';
    let showMic = true;
    let showName = false;
    let showHelpBlock = false;
    let helpString = 'Was this helpful?';
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
      if (this.config.helpString) {
        helpString = this.config.helpString;
      }
      if (typeof(this.config.showHelpBlock) === 'boolean') {
        showHelpBlock = this.config.showHelpBlock;
      }
      if (Array.isArray(this.config.helpChoice)) {
        defaultHelpChoice = this.config.helpChoice;
      }
    }
    return {
      placeholder: placeholder,
      helpString: helpString,
      showName: showName,
      showHelpBlock: showHelpBlock,
      showMic: showMic,
      username: username,
      startTime: "",
      messages: [],
      message: "",
      helloworld: helloworld,
      defaultMessage: defaultMessageList,
      defaultHelpChoice: defaultHelpChoice,
      defaultApi: {
        root: '',
        chat: { path: '/iEMS/chatbot', method: 'POST' },
        chatrecord: { path: 'iems/chatbot/record'}
      },
      recordMode: false,
      isMicrophoneReady: false,
      isRecording: false,
      mediaRecorder: null,
      audioChunks: [],
      audioUrl: '',
      recordingTime: 0,
      recordingTimer: null,
      audioplaying: false,
    };
  },
  created() {
    this.startTime = this.getCurrentTime();
  },
  watch:{
    config: {
      handler: function(newVal) {
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
        if (newVal && newVal.helpString) {
          this.helpString = newVal.helpString;
        }
        if (newVal && typeof(newVal.showHelpBlock) === 'boolean') {
          this.showHelpBlock = newVal.showHelpBlock;
        }
      },
      deep: true
    },
    api () {

    },
    msg: {
      handler: function(newVal) {
        if (newVal && newVal.helloworld) {
          this.helloworld = newVal.helloworld;
        }
        if (newVal && Array.isArray(newVal.list)) {
          this.defaultMessage = newVal.list;
        }
      },
      deep: true
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
    },
    async sendRecord() {
      if(this.audioUrl && !this.audioplaying) {
        // merge api.record
        let mergedReq = this.defaultApi.chatrecord;
        if (this.api && this.api.chatrecord) {
          mergedReq = { ...mergedReq, ...this.api.chatrecord };
        }
        let mergedRoot = this.defaultApi.root;
        if (this.api && this.api.root) {
          mergedRoot = this.api.root;
        }

        this.addMessage("Voice message", "user");

        const formData = new FormData();
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        formData.append('audio', audioBlob, 'recording.wav');
        const reqData = {};
        if (mergedReq.params) {
          reqData.params = mergedReq.params;
        }
        formData.append('json_data', JSON.stringify(reqData));
        this.discardRecording()

        try {
          let resp = '';
          resp = await chatbotAPI.requestRecord (mergedRoot + mergedReq.path, formData)
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
    toggleRecordMode() {
      this.recordMode = !this.recordMode
      if(this.recordMode) {
        this.checkMicrophone()
      }
    },
    record() {
      if(this.isRecording && this.audioUrl == '') {
        this.stopRecording()
      } else if(this.audioplaying) {
      } else if(!this.isRecording && this.audioUrl != '' ) {
        this.playRecording()
      } else {
        if(this.isMicrophoneReady) {
          this.startRecording()
        } else {
          this.checkMicrophone()
        }
      }
    },
    async checkMicrophone() {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          this.isMicrophoneReady = true
          return true;
      } catch (error) {
          this.isMicrophoneReady = false
          console.error('Microphone not accessible:', error);
          return false;
      }
    },
    startRecording() {
        this.isRecording = true;
        this.audioChunks = [];
        this.recordingTime = 0;
        // this.recordRecognition()
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            this.mediaRecorder = new MediaRecorder(stream);
            this.mediaRecorder.onstop = () => {
              const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
              this.audioUrl = URL.createObjectURL(audioBlob);
            };
            this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this);
            this.mediaRecorder.start();
            this.recordingTimer = setInterval(() => {
              this.recordingTime++;
            }, 1000);
          })
          .catch(function (error) {
          console.error('Error accessing microphone:', error);
        });
      },
      stopRecording() {
        this.mediaRecorder.stop();
        this.isRecording = false
        clearInterval(this.recordingTimer);
      },
      playRecording() {
        if (this.audioUrl) {
          this.audioplaying = true
          const audio = new Audio(this.audioUrl);

          const timeupdateHandler = () => {
            this.recordingTime = Math.floor(audio.currentTime);
          };

          const endedHandler = () => {
            this.audioplaying = false
            audio.removeEventListener('timeupdate', timeupdateHandler);
            audio.removeEventListener('ended', endedHandler);
          };

          audio.addEventListener('timeupdate', timeupdateHandler);
          audio.addEventListener('ended', endedHandler);

          audio.play();
        }
      },
      recordRecognition() {
        window.SpeechRecognition =
        window.SpeechRecognition || 
        window.webkitSpeechRecognition;
        const recognition = new window.SpeechRecognition();

        recognition.onerror = function(event) {
          console.error('Speech recognition error: ' + event.error);
        };
        recognition.onstart = function() {
          console.log('Start regonizing...');
        };

        recognition.onresult = function(event) {
          const transcript = event.results[0][0].transcript;
          console.log('Recognition result:', transcript)
        }

        recognition.start();
      },
      discardRecording() {
        if(!this.audioplaying) {
          this.audioChunks = [];
          this.audioUrl = '';
          this.mediaRecorder = null;
          this.recordingTime = 0;
        }
      },
      handleDataAvailable(blob) {
        this.audioChunks.push(blob.data);
      },
      formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');

        return `${formattedMinutes}:${formattedSeconds}`;
      },
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

  .micInputArea {
      position: absolute;
      bottom: 0px;
      width: 100%;
      height: 240px;
      box-sizing: border-box;
      border-top: 1px solid #C8C8C8;
      background-color: #ffffff;
  }

  .dark .micInputArea {
      background-color: black;
  }

  .micInputAreaTitle {
    width: 100%;
    height: 48px;
    border-bottom: 1px solid #C8C8C8;
    display: flex;
    align-items: center;
  }

  .micInputAreaBody {
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  .micInputAreaButtons {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .chatContain {
      position: absolute;
      box-sizing: border-box;
      padding: 24px 4px;
      overflow-y: auto;
      overflow-x: hidden;
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
      width: 27px;
  }
  .chatArea {
      box-sizing: border-box;
      color: #323233;
      /* width: calc(100% - 80px); */
  }

  .aiBotBox .chatArea {
    width: calc(100% - 80px);
  }
  .chatArea .contentSpan{
      display: inline-block;
      border-bottom-right-radius: 20px;
      border-bottom-left-radius: 20px;
      padding: 10px 12px;
      text-align: left;
      white-space: pre-line;
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
    text-align: left;
  }

  .aiBotBox .chatArea .contentSpanWithHelp .contentSpan{
    border-bottom-right-radius: 0px;
    border-bottom-left-radius: 0px;
    width:calc(100% - 27px);
  }
  .helpArea {
    background-color: #E1E1E1;
    border-bottom-right-radius: 20px;
    border-bottom-left-radius: 20px;
    padding: 10px 12px;
    width:calc(100% - 27px);
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
      background-repeat: no-repeat;
      background-size: contain;
      width: 24px;
      height: 24px;
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
      cursor: pointer;
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
      cursor: pointer;
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
      cursor: pointer;
  }

  .dark .chatMic{
      background-image: url(./assets/normalmicdark.svg);
  }
  .closeBtn {
    background-image: url(./assets/close.svg);
    width: 24px;
    height: 24px;
    cursor: pointer;
    background-color: transparent;
    border: 0;
    padding: 0;
    position: absolute;
    right: 8px;
  }

  .dark .closeBtn {
    background-image: url(./assets/closedark.svg);
  }

  .mic {
    background-image: url(./assets/mic/mic.svg);
    width: 40px;
    height: 40px;
    background-color: transparent;
    border: 0;
    background-repeat: no-repeat;
  }

  .dark .mic {
    background-image: url(./assets/mic/micdark.svg);
  }

  .stopRecord {
    background-image: url(./assets/mic/stop.svg);
    width: 40px;
    height: 40px;
    background-color: transparent;
    border: 0;
    background-repeat: no-repeat;
  }

  .dark .stopRecord {
    background-image: url(./assets/mic/stopdark.svg);
  }

  .playRecord {
    background-image: url(./assets/mic/play.svg);
    width: 40px;
    height: 40px;
    background-color: transparent;
    border: 0;
    background-repeat: no-repeat;
  }

  .dark .playRecord {
    background-image: url(./assets/mic/playdark.svg);
  }

  .pauseRecord {
    background-image: url(./assets/mic/pause.svg);
    width: 40px;
    height: 40px;
    background-color: transparent;
    border: 0;
    background-repeat: no-repeat;
  }

  .dark .pauseRecord {
    background-image: url(./assets/mic/pausedark.svg);
  }

  .circle {
    background-color: transparent;
    width: 100%;
    height: 100%;
    border: 1px solid #4679E1;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .dark .circle {
    border: 1px solid #3EA0FF;
  }

  .outcircle {
    background-color: transparent;
    width: 104px;
    height: 104px;
    border: 6px solid #A3BCF0;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 32px;
  }

  .dark .outcircle {
    border: 6px solid #2D5E8E;
  }
  .micText {
    color:#89898A;
    font-size: 14px;
    margin-top:20px;
    margin-bottom: 16px;
    height: 20px;
    width:100%;
    display: flex;
    justify-content: center;
  }

  .dark .micText {
    color:#c0c0c0;
  }

  .recordTime {
    color:#4679E1;
    font-weight: bold;
    font-size: 18px;
    margin-top:20px;
    margin-bottom: 16px;
    height: 20px;
    width:100%;
    display: flex;
    justify-content: center;
  }

  .dark .recordTime {
    color:#3EA0FF;
  }

  .discardRecord {
    background-color: transparent;
    border: 1px solid #C8C8C8;
    border-radius: 50%;
    padding: 0;
    margin: 0;
    background-image: url(./assets/mic/delete.svg);
    width: 44px;
    height: 44px;
    background-repeat: no-repeat;
    cursor: pointer;
    background-position: 50% 50%;
  }

  .dark .discardRecord {
    background-image: url(./assets/mic/deletedark.svg);
    border: 1px solid #89898A;
  }
  .sendRecord {
    background-color: transparent;
    border: 1px solid #C8C8C8;
    border-radius: 50%;
    padding: 0;
    margin: 0;
    background-image: url(./assets/normalnext.svg);
    width: 44px;
    height: 44px;
    background-repeat: no-repeat;
    cursor: pointer;
    background-position: 50% 50%;
  }

  .dark .sendRecord {
    background-image: url(./assets/normalnextdark.svg);
    border: 1px solid #89898A;
  }
</style>