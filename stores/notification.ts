export const useNotificationStore = defineStore('notification', {
  state: () => ({
    message: '',
    progress: 0,
    interval: null as null | number,
  }),
  actions: {
    show(message: string) {
      this.message = message;
      this.progress = 100;
      if (this.interval) clearInterval(this.interval);
      this.interval = window.setInterval(() => {
        this.progress--;
        if (this.progress <= 0) this.hide();
      }, 50);
    },
    hide() {
      this.progress = 0;
      if (this.interval) clearInterval(this.interval);
    },
  },
})
