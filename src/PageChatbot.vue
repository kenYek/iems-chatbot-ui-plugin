<template>
  <div class="fixDialog" :class="{openSide: openSide}">
    <div class="fixDialogSide">
      <div class="fixDialogTitleArea">
        <div class="title">
          <span class="fixDialogTitle">{{ dialogHistoryTitle }}</span>
        </div>
        <div class="titleBtn">
          <span class="addBtn" v-show="showAdd"></span>
        </div>
      </div>
      <div class="fixDialogContentArea">
        <ul class="historyListUl">
          <li class="historyListLi">
            <div class="historyItemTitle">Message</div>
            <div class="historyItemDate">2023/09/27</div>
            <div class="historyItemOption"></div>
          </li>
        </ul>
      </div>
    </div>
    <div class="fixDialogInner">
      <div class="fixDialogTitleArea">
        <div class="title">
          <span class="fixDialogTitle">{{ dialogTitle }}</span>
          <span class="fixDialogSubTitle">{{ dialogSubTitle }}</span>
        </div>
        <div class="titleBtn">
          <span class="menuBtn" v-show="showMenu" @click="showHistory"></span>
          <span class="closeBtn" @click="closeDone"></span>
        </div>
      </div>
      <div class="fixDialogContentArea">
        <chatbotui :api="api" :msg="msg" :config="config"></chatbotui>
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
    let dialogHistoryTitle = 'History';
    let dialogSubTitle = 'New message';
    let showAdd = true;
    let showMenu = true;
    if (this.msg && this.msg.title) {
      dialogTitle = this.msg.title;
    }
    if (this.msg && this.msg.subtitle) {
      dialogSubTitle = this.msg.subtitle;
    }
    if (this.msg && this.msg.history && this.msg.history.title) {
      dialogHistoryTitle = this.msg.history.title;
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
      openSide: false,
      showAdd: showAdd,
      showMenu: showMenu,
      showChatbot: false,
      chatbotWidth: 300,
      dialogTitle: dialogTitle,
      dialogSubTitle: dialogSubTitle,
      dialogHistoryTitle: dialogHistoryTitle,
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
    window.addEventListener('resize', this.onResize);
  },
  unmounted() {
    window.removeEventListener('resize', this.onResize);
  },
  beforeDestroy() {
  },
  methods: {
    onResize () {
    },
    showHistory () {
      this.openSide = !this.openSide;
    }
  }
}
</script>

<style scoped>
  .fixDialog{
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    box-sizing: border-box;
    flex-direction:row;
    overflow:hidden;
  }
  .fixDialogInner{
    background:#FFF;
    width:100%;
    height:100%;
  }
  .openSide.fixDialog .fixDialogInner{
    width: calc(100% - 320px);
  }
  .fixDialogSide{
    position: relative;
    width: 320px;
    height: 100%;
    box-sizing: border-box;
    border-right: 1px solid #E1E1E1;
    display: none;
  }
  .openSide.fixDialog .fixDialogSide{
    display: block;
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

  .historyListUl {
    list-style: none;
    padding: 0px;
    margin: 0px;
    position: relative;
    width: 100%;
  }
  .historyListLi {
    position: relative;
    width: 100%;
    height: 48px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .historyListLi:hover::before {
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 4px;
    content: " ";
    background-color: #4679E1;
  }
  .historyItemTitle{
    width: calc(100% - 88px);
    text-align: left;
    color: #000000;
    text-overflow: ellipsis;
    overflow: hidden;
    padding: 0 5px 0 20px;
  }
  .historyItemDate{
    width: 64px;
    font-size: 12px;
    text-align: right;
    color: #89898A;
  }
  .historyItemOption{
    width: 24px;
  }
</style>
