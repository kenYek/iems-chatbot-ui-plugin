<template>
  <div>
    <div ref="buttonElement" class="draggable" v-show="!showChatbot" ></div>
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
    let dialogTitle = '智能AI專家';
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
        button.style.left = '0px';
      } else if (minDistance === rightDistance) {
        button.style.left = maxX + 'px';
      } else if (minDistance === topDistance) {
        button.style.top = '0px';
      } else {
        button.style.top = maxY + 'px';
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
    width: 136px;
    height: 136px;
    position: fixed;
    background-image: url(./assets/start.png);
  }

  .dark .draggable {
    background-image: url(./assets/startdark.png);
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
    border: 1px solid transparent;
    border-radius: 8px;
    background: conic-gradient(from 225.67deg at 50% 50%, #FF779B -86.46deg, #A85DE8 1.84deg, #2F79E9 93.43deg, #FFD40F 191.22deg, #FF779B 273.54deg, #A85DE8 361.84deg),
    linear-gradient(0deg, #FFFFFF, #FFFFFF);
    border-image-source: conic-gradient(from 225.67deg at 50% 50%, #FF779B -86.46deg, #A85DE8 1.84deg, #2F79E9 93.43deg, #FFD40F 191.22deg, #FF779B 273.54deg, #A85DE8 361.84deg);
    border-image-slice: 30;
    overflow:hidden;
    box-shadow: 0px 4px 20px 0px #00000080;
  }
  .fixDialogInner{
    background:#FFF;
    width:100%;
    height:100%;
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
  }

  .dark .addBtn {
    background-image: url(./assets/addDark.svg);
  }

  .menuBtn {
    background-image: url(./assets/menu.svg);
    width: 24px;
    height: 24px;
    margin-right: 4px;
  }

  .dark .menuBtn {
    background-image: url(./assets/menudark.svg);
  }

  .closeBtn {
    background-image: url(./assets/close.svg);
    width: 24px;
    height: 24px;
  }

  .dark .closeBtn {
    background-image: url(./assets/closedark.svg);
  }
</style>

