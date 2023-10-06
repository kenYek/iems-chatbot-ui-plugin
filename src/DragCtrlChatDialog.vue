<template>
  <div>
    <div ref="buttonElement" class="draggable" v-show="!showChatbot" >
      <div class="draggableColor">
        <div class="draggableIcon"></div>
        <div class="draggableText">ChatBot</div>
      </div>
    </div>
    <div class="fixDialog" v-show="showChatbot">
      <div class="fixDialogInner">
        <div class="fixDialogTitleArea">
          <div class="title">
            <span class="fixDialogTitle">{{ dialogTitle }}</span>
            <span class="fixDialogSubTitle">{{ dialogSubTitle }}</span>
          </div>
          <div class="titleBtn">
            <span class="addBtn" v-show="showAdd"></span>
            <span class="menuBtn" v-show="showMenu"></span>
            <span class="closeBtn" @click="closeDone"></span>
          </div>
        </div>
        <div class="fixDialogContentArea">
          <chatbotui :api="api" :msg="msg" :config="config"></chatbotui>
        </div>
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
    config: { type: Object },
    api: { type: Object },
    msg: {
      type: Object
    }
  },
  data() {
    let dialogTitle = 'Chat with Chatbot';
    let dialogSubTitle = 'New message';
    let showAdd = true;
    let showMenu = true;
    if (this.msg && this.msg.title) {
      dialogTitle = this.msg.title;
    }
    if (this.msg && this.msg.subtitle) {
      dialogSubTitle = this.msg.subtitle;
    }

    if (this.config) {
      if (typeof(this.config.addBtn)!== 'undefined') {
        showAdd = this.config.addBtn;
      }
      if (typeof(this.config.menuBtn)!== 'undefined') {
        showMenu = this.config.menuBtn;
      }
    }
    return {
      showAdd: showAdd,
      showMenu: showMenu,
      showChatbot: false,
      chatbotWidth: 300,
      dialogTitle: dialogTitle,
      dialogSubTitle: dialogSubTitle,
      btnPosition: {
        x: '0px',
        y: '0px'
      }
    };
  },
  watch:{
    config: {
      handler: function (newVal) {
        console.log('watch config d:', newVal)
        if (newVal && typeof(newVal.addBtn)!== 'undefined') {
          this.showAdd = newVal.addBtn;
        }
        if (newVal && typeof(newVal.menuBtn)!== 'undefined') {
          this.showMenu = newVal.menuBtn;
        }
      },
      deep: true
    },
    msg: {
      handler: function (newVal) {
        if (newVal && newVal.title) {
          this.dialogTitle = newVal.title;
        }
        if (newVal && newVal.title) {
          this.dialogSubTitle = newVal.subtitle;
        }
      },
      deep: true
    }
  },
  mounted() {
    this.makeCode();
    // this.updateUrlParameter('uuid', this.genUniqueId());
    const button = this.$refs.buttonElement;
    button.addEventListener('mousedown', this.onMouseDown);
    button.addEventListener('touchstart', this.onTouchStart);
    window.addEventListener('resize', this.onResize);
  },
  unmounted() {
    window.removeEventListener('resize', this.onResize);
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
    onResize () {
      this.snapToEdge();
    },
    makeCode() {},
    snapToEdge() {
      let shiftX = 24;
      if (window.matchMedia("(max-width: 1240px)").matches) {
        shiftX = 16;
      } else if (window.matchMedia("(max-width: 768px)").matches) {
        shiftX = 16;
      } else if (window.matchMedia("(max-width: 500px)").matches) {
        shiftX = 12;
      }
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
        button.style.left = shiftX + 'px';
      } else if (minDistance === rightDistance) {
        button.style.left = (maxX - shiftX) + 'px';
      } else if (minDistance === topDistance) {
        button.style.top = shiftX + 'px';
      } else {
        button.style.top = (maxY - shiftX) + 'px';
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
    position: fixed;
    /* background-image: url(./assets/start.png); */
    cursor: pointer;
    background-color: #FFFFFF;
    border-radius: 50%;
    box-shadow: 0px 2px 8px 0px #32323380;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .draggableColor{
    position: relative;
    width: 76px;
    height: 76px;
    margin: 0 auto;
    background-image: url(./assets/aiIcon.png),
    conic-gradient(from 225.67deg at 50% 50%, #FF779B -86.46deg, #A85DE8 1.84deg, #2F79E9 93.43deg, #FFD40F 191.22deg, #FF779B 273.54deg, #A85DE8 361.84deg);
    background-repeat: no-repeat;
    background-position: center -5px, center;
    background-size: contain;
    border: 0px solid #FFFFFF;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .draggableIcon{
    width: 41px;
    height: 41px;
  }
  .draggableText{
    color: #FFFFFF;
    font-family: Roboto;
    font-weight: 700;
    font-size: 14px;
    line-height: 20px;
    height: 20px;
  }

  .dark .draggable {
    /* background-image: url(./assets/startdark.png); */
    background-color: #000000;
    /* box-shadow: 0px 2px 8px 0px #FFFFFF; */
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
    justify-content: center;
    align-items: center;
    z-index: 500;
    border-radius: 8px;
    background: conic-gradient(from 225.67deg at 50% 50%, #FF779B -86.46deg, #A85DE8 1.84deg, #2F79E9 93.43deg, #FFD40F 191.22deg, #FF779B 273.54deg, #A85DE8 361.84deg),
    linear-gradient(0deg, #FFFFFF, #FFFFFF);
    overflow:hidden;
    box-shadow: 0px 4px 20px 0px #00000080;
  }
  .fixDialogInner{
    background:#FFF;
    width: calc(100% - 2px);
    height: calc(100% - 2px);
    border-radius: 8px;
    overflow: hidden;
  }
  .fixDialogTitleArea{
    position: relative;
    width: 100%;
    height: 50px;
    background: #FFFFFF;
    display: flex;
    box-sizing: border-box;
    flex-direction:row;
    align-items: center;
    padding: 5px 10px;
    border-bottom: 1px solid #E1E1E1;
  }

  .dark .fixDialogTitleArea{
    background: black;
  }

  .fixDialogTitle{
    font-family: Roboto;
    font-weight: bold;
    font-size: 16px;
    display:block;
  }

  .fixDialogSubTitle{
    font-family: Roboto;
    font-size: 1px;
    color: #a3a1a1;
    display:block;
    line-height:4px;
    margin-top: 4px;
  }

  .dark .fixDialogTitle{
    color: white
  }
  .fixDialogContentArea{
    position: relative;
    width: 100%;
    height: calc(100% - 50px);
    background-color: #FFFFFF;
  }

  .titleBtn {
    right: 8px;
    display: flex;
    position: absolute;
  }

  .addBtn {
    background-image: url(./assets/add.svg);
    width: 24px;
    height: 24px;
    margin-right: 4px;
    cursor: pointer;
  }

  .dark .addBtn {
    background-image: url(./assets/addDark.svg);
  }

  .menuBtn {
    background-image: url(./assets/menu.svg);
    width: 24px;
    height: 24px;
    margin-right: 4px;
    cursor: pointer;
  }

  .dark .menuBtn {
    background-image: url(./assets/menudark.svg);
  }

  .closeBtn {
    background-image: url(./assets/close.svg);
    width: 24px;
    height: 24px;
    cursor: pointer;
  }

  .dark .closeBtn {
    background-image: url(./assets/closedark.svg);
  }

  @media screen and (max-width: 1240px) {
    .draggable {
      width: 72px;
      height: 72px;
    }
    .draggableColor{
      width: 60px;
      height: 60px;
      background-position: center, center;
      background-size: 110%, contain;
    }
    .draggableText{
      display: none;
    }
  }
  @media screen and (max-width: 768px) {
    .draggable {
      width: 56px;
      height: 56px;
    }
    .draggableColor{
      width: 44px;
      height: 44px;
    }
  }
  @media screen and (max-width: 500px) {
    .draggable {
      width: 48px;
      height: 48px;
    }
    .draggableColor{
      width: 40px;
      height: 40px;
    }
  }
</style>

