<template>
  <div>
    <div ref="buttonElement" class="draggable" v-show="!showChatbot">
      <div class="qrcodeArea">
        <div id="qrcode"></div>
      </div>
      <div>ChatBot</div>
    </div>
    <div class="fixDialog" v-show="showChatbot">
      <div class="fixDialogTitleArea">
        <span>{{ dialogTitle }}</span>
        <span class="fixDialogClose" @click="closeDone">&times;</span>
      </div>
      <div class="fixDialogContentArea">
        <chatbotui :api="api" :msg="msg"></chatbotui>
      </div>
    </div>
  </div>
</template>

<script>
import Chatbotui from './Chatbotui.vue'
export default {
  components: {
    Chatbotui,
  },
  props: {
    user: { type: Object },
    api: { type: Object },
    msg: {
      type: Object
    }
  },
  data() {
    let dialogTitle = '智能AI專家';
    if (this.msg && this.msg.title) {
      dialogTitle = this.msg.title;
    }
    return {
      showChatbot: false,
      chatbotWidth: 300,
      dialogTitle: dialogTitle,
      btnPosition: {
        x: '5px',
        y: '5px'
      }
    };
  },
  mounted() {
    this.makeCode();
    // this.updateUrlParameter('uuid', this.genUniqueId());
    const button = this.$refs.buttonElement;
    button.addEventListener('mousedown', this.onMouseDown);
    button.addEventListener('touchstart', this.onTouchStart);
  },
  beforeDestroy() {
    // Remove event listeners to prevent memory leaks
    const button = this.$refs.buttonElement;
    button.removeEventListener('mousedown', this.onMouseDown);
    button.removeEventListener('touchstart', this.onTouchStart);
  },
  methods: {
    closeDone() {
      this.showChatbot = false;
      this.resetBtnPosition();
    },
    toggleChatbot() {
      this.showChatbot = !this.showChatbot;
      if (this.showChatbot) {
        const button = this.$refs.buttonElement;
        this.btnPosition.x = button.style.left;
        this.btnPosition.y = button.style.top;
        console.log(this.btnPosition.x, this.btnPosition.y)
      }
    },
    resetBtnPosition () {
      const button = this.$refs.buttonElement;
      button.style.left = this.btnPosition.x;
      button.style.top = this.btnPosition.y;
    },
    makeCode() {},
    snapToEdge() {
      const button = this.$refs.buttonElement;
      var rect = button.getBoundingClientRect();
      var maxX = window.innerWidth - rect.width;
      var maxY = window.innerHeight - rect.height;
      if (this.showChatbot) {
        maxX = maxX - this.chatbotWidth - rect.width/2 - 8;
      }

      var leftDistance = rect.left;
      var rightDistance = maxX - rect.left;
      var topDistance = rect.top;
      var bottomDistance = maxY - rect.top;

      var minDistance = Math.min(leftDistance, rightDistance, topDistance, bottomDistance);

      if (minDistance === leftDistance) {
        button.style.left = '5px';
      } else if (minDistance === rightDistance) {
        button.style.left = (maxX - 5) + 'px';
      } else if (minDistance === topDistance) {
        button.style.top = '5px';
      } else {
        button.style.top = (maxY - 5) + 'px';
      }
    },
    onMouseDown(e) {
      e.preventDefault();
      const button = this.$refs.buttonElement;

      const offsetX = e.clientX - button.getBoundingClientRect().left;
      const offsetY = e.clientY - button.getBoundingClientRect().top;
      const oriLeft = button.getBoundingClientRect().left;
      const oriTop = button.getBoundingClientRect().top;
      const width = button.getBoundingClientRect().width;

      const onMouseMove = (e) => {
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;

        const maxX = window.innerWidth - button.offsetWidth;
        const maxY = window.innerHeight - button.offsetHeight;
        button.style.left = Math.min(maxX, Math.max(0, x)) + 'px';
        button.style.top = Math.min(maxY, Math.max(0, y)) + 'px';
      };

      const onMouseUp = (e) => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        if(oriLeft < e.clientX && e.clientX < oriLeft+width && oriTop+width> e.clientY &&  e.clientY > oriTop) {
          this.toggleChatbot()
        }
        this.snapToEdge();
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    onTouchStart(e) {
      e.preventDefault();

      const button = this.$refs.buttonElement;

      const touch = e.touches[0];
      const offsetX = touch.clientX - button.getBoundingClientRect().left;
      const offsetY = touch.clientY - button.getBoundingClientRect().top;

      const onTouchMove = (e) => {
        const touch = e.touches[0];
        const x = touch.clientX - offsetX;
        const y = touch.clientY - offsetY;

        const maxX = window.innerWidth - button.offsetWidth;
        const maxY = window.innerHeight - button.offsetHeight;

        button.style.left = Math.min(maxX, Math.max(0, x)) + 'px';
        button.style.top = Math.min(maxY, Math.max(0, y)) + 'px';
      };

      const onTouchEnd = () => {
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
        this.snapToEdge();
      };

      document.addEventListener('touchmove', onTouchMove);
      document.addEventListener('touchend', onTouchEnd);
    },
  }
}
</script>


<style scoped>
  .draggable {
    bottom: 5px;
    right: 5px;
    width: 96px;
    height: 96px;
    background-color: #007bff;
    border-radius: 50%;
    position: fixed;
    cursor: pointer;
    /* user-drag: none; */
    touch-action: none;
    background: conic-gradient(from 225.67deg at 50% 50%, #FF779B -86.46deg, #A85DE8 1.84deg, #2F79E9 93.43deg, #FFD40F 191.22deg, #FF779B 273.54deg, #A85DE8 361.84deg);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    color: #FFFFFF;
    font-family: Roboto;
    font-weight: 700;
    border: 4px solid #FFFFFF;
    box-shadow: 0px 2px 8px 0px #32323380;
    z-index: 1000;
  }

  /* Styles for the QR code area within the draggable button */
  .qrcodeArea {
    position: relative;
    width: 50px;
    height: 50px;
    box-sizing: border-box;
  }
  .fixDialog{
    position: fixed;
    bottom: 10px;
    right: 10px;
    width: 360px;
    height: 600px;
    display: flex;
    box-sizing: border-box;
    flex-direction:column;
    z-index: 500;
    border-radius: 8px;
    border: 1px solid;
    border-image-source: conic-gradient(from 225.67deg at 50% 50%, #FF779B -86.46deg, #A85DE8 1.84deg, #2F79E9 93.43deg, #FFD40F 191.22deg, #FF779B 273.54deg, #A85DE8 361.84deg);
    box-shadow: 0px 4px 20px 0px #00000080;
    background: conic-gradient(from 225.67deg at 50% 50%, #FF779B -86.46deg, #A85DE8 1.84deg, #2F79E9 93.43deg, #FFD40F 191.22deg, #FF779B 273.54deg, #A85DE8 361.84deg),
    linear-gradient(0deg, #FFFFFF, #FFFFFF);
    overflow: hidden;
  }
  .fixDialogTitleArea{
    position: relative;
    width: 100%;
    height: 50px;
    background: linear-gradient(0deg, #E1E1E1, #E1E1E1),linear-gradient(0deg, #FFFFFF, #FFFFFF);
    display: flex;
    box-sizing: border-box;
    flex-direction:row;
    justify-content: space-between;
    align-items: center;
    padding: 5px 10px;
    border-bottom: 1px solid #E1E1E1;
  }
  .fixDialogContentArea{
    position: relative;
    width: 100%;
    height: calc(100% - 50px);
    background-color: #FFFFFF;
  }
  .fixDialogClose {
    color: #C8C8C8;
    cursor: pointer;
    font-size: 24px;
    font-weight: bold;
    transition: color 0.3s ease;
  }

  .fixDialogClose:hover,
  .fixDialogClose:focus {
    color: #2A9ED7;
    text-decoration: none;
  }
</style>

