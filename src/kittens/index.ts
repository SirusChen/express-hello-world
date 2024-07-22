(function () {
  class Client {
    timer = 0;
    interval = 2000;
    prefix = '[kittens]';
    scriptURL = 'http://localhost:8001/dist/index.js';
    scanList = [
      {
        key: 'catnip',
        craft: [
          {
            key: 'wood',
            amount: 25,
          },
        ],
      },
      {
        key: 'wood',
        craft: [
          {
            key: 'beam',
            amount: 10,
          },
        ],
      },
      {
        key: 'minerals',
        craft: [
          {
            key: 'slab',
            amount: 10,
          },
        ],
      },
      {
        key: 'coal',
        craft: [
          {
            key: 'steel',
            amount: 1,
          },
        ],
      },
      {
        key: 'iron',
        craft: [
          // {
          //   key: 'steel',
          //   amount: 1,
          // },
          {
            key: 'plate',
            amount: 1,
          },
        ],
      },
      {
        key: 'culture',
        craft: [
          {
            key: 'manuscript',
            amount: 1,
          },
        ],
      },
      {
        key: 'science',
        craft: [
          {
            key: 'compedium',
            amount: 1,
          },
        ],
      },
    ];
    ratioList = [
      {
        src: 'furs',
        tar: 'parchment',
        ratio: 200
      },
      {
        src: 'beam',
        tar: 'scaffold',
        ratio: 50
      },
    ];
    tradeList = [
      // {
      //   name: 'dragons',
      // },
      {
        name: 'zebras',
      },
      {
        name: 'lizards',
        season: ['summer'],
      },
      {
        name: 'sharks',
        season: ['winter'],
      },
      {
        name: 'griffins',
        season: ['autumn'],
      },
      {
        name: 'nagas',
        season: ['spring'],
      },
      {
        name: 'spiders',
        season: ['autumn'],
      },
      // {
      //   race: 'leviathans',
      // },
    ];
    // --------------------------------------- 工具类 ---------------------------------------
    load() {
      if (typeof window.gamePage === 'undefined') {
        // 等待加载
        setTimeout(() => {
          this.load();
        }, this.interval);
      } else {
        // 运行
        this.run();
      }
    }
    updateSelf() {
      this.log('update self');
      const script = document.createElement('script');
      script.src = `${this.scriptURL}?t=${Date.now()}`;
      script.id='kittens';
      document.body.prepend(script);
    }
    log(...message: any[]) {
      console.log(`${this.prefix}`, ...message);
    }
    // --------------------------------------- 逻辑类 ---------------------------------------
    /** 程序入口 */
    run() {
      this.log('start runing');
      const game = window.game;
      game.diplomacyTab.domNode.click()
      game.bldTab.domNode.click()
      // 自更新
      setTimeout(() => {
        this.updateSelf();
      }, 10 * 60 * 1000);
      this.iterate();
    }
    /** 程序主循环 */
    iterate() {
      this.observeStars();
      this.craftItemByRatio();
      this.craftItemByAmount();
      this.trade();
      this.hunt();
      // @ts-ignore
      window.scientistsTimer = setTimeout(this.iterate.bind(this), this.interval);
    }
    /** 观测天文现象 */
    observeStars () {
      const game = window.game;
      if (game.calendar.observeBtn != null){
        game.calendar.observeHandler();
        this.log('observe stars');
      }
    }
    /** 外出打猎 */
    hunt () {
      const game = window.game;
      const { value, maxValue } = game.resPool.resourceMap['manpower'];
      if (value / maxValue > 0.8) {
        this.log(`hunt ${Math.floor(value / 100)} times`);
        game.village.huntAll();
      }
    }
    /** 进行贸易 */
    trade () {
      const game = window.game;
      const season: string = game.calendar.getCurSeason().name;
      const { value, maxValue } = game.resPool.resourceMap['gold'];
      const raceList = game.diplomacyTab.racePanels;
      if (value / maxValue > 0.8) {
        for (const item of this.tradeList) {
          if (!item.season || item.season.includes(season)) {
            // @ts-ignore
            const race = raceList.find(i => i.race.name === item.name);
            if (race && race.race.unlocked) {
              this.log(`trade ${item.name}`);
              race.tradeBtn.onClick();
            }
          }
        }
      }
    }
    /** 根据比例转化物品 */
    craftItemByRatio () {
      const game = window.game;
      for (const item of this.ratioList) {
        const { value: srcValue } = game.resPool.resourceMap[item.src];
        const { value: tarValue } = game.resPool.resourceMap[item.tar];
        if (srcValue / tarValue > item.ratio) {
          this.log(`craft ${item.src} ${item.tar}`);
          game.craft(item.tar, 1);
        }
      }
    }
    /** 根据物品数量转化物品 */
    craftItemByAmount() {
      const game = window.game;
      // 如果物品数量接近满值，制作下一阶段的物品
      for (const item of this.scanList) {
        const { value, maxValue } = game.resPool.resourceMap[item.key];
        if (value / maxValue > 0.8) {
          const craft = item.craft;
          for (const craftItem of craft) {
            this.log(`craft ${craftItem.key} ${craftItem.amount}`);
            game.craft(craftItem.key, craftItem.amount);
          }
        }
      }
    }
  }

  clearTimeout(window.scientistsTimer);

  const client = new Client();
  client.load();

})();