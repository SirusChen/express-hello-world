(function () {
  const CommonRatio = 0.99;
  const defaultBuildFun = function(bld: any) {
    const game = window.game;
    const model = bld.model;
    for (let i = 0; i < model.prices.length; i ++) {
      const price = model.prices[i];
      const { value, maxValue } = game.resPool.resourceMap[price.name];
      if (value / maxValue < CommonRatio - 0.02) {
        return false;
      }
    }
    return true;
  }
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
            amount: 5,
          },
        ],
      },
      {
        key: 'iron',
        craft: [
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
          {
            key: 'blueprint',
            amount: 1,
          },
        ],
      },
    ];
    ratioList = [
      {
        src: 'furs',
        tar: 'parchment',
        ratio: 150
      },
      {
        src: 'beam',
        tar: 'scaffold',
        ratio: 50
      },
      {
        src: 'steel',
        tar: 'gear',
        ratio: 100
      },
    ];
    tradeList: {
      name: string,
      season?: string[],
      handler?: (options: { season: string; trade: (name: string) => void }) => boolean
    }[] = [
      // {
      //   name: 'dragons',
      // },
      {
        name: 'zebras',
        handler({ trade }) {
          const game = window.game;
          const { value, maxValue } = game.resPool.resourceMap['gold'];
          if (value / maxValue > CommonRatio) {
            let count = 0;
            // 多交易几次
            while (count < 5) {
              count++;
              trade(this.name);
              if (Math.random() > 0.8) {
                break;
              }
            }
          }
          return true;
        }
      },
      // {
      //   name: 'lizards',
      //   season: ['summer'],
      // },
      {
        name: 'sharks',
        season: ['winter'],
        handler ({ trade }) {
          const game = window.game;
          const catnip = game.resPool.resourceMap['catnip'];
          const seasonTotalCost = catnip.perTickCached * 5 * 200;
          if (catnip.perTickCached < 0 && catnip.value < Math.abs(seasonTotalCost)) {
            trade(this.name);
          }
          return true; // 直接跳出
        }
      },
      // {
      //   name: 'griffins',
      //   season: ['autumn'],
      // },
      {
        name: 'nagas',
        season: ['spring', 'summer'],
      },
      {
        name: 'spiders',
        season: ['autumn'],
      },
      // {
      //   race: 'leviathans',
      // },
    ];
    buildMap: {
      [name: string]: {
        handler?: (bld: any) => boolean
      }
    } = {
      workshop: {},
      unicornPasture: {},
      tradepost: {},
      lumberMill: {
        handler: defaultBuildFun,
      },
      mine: {
        handler: defaultBuildFun,
      },
    };
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
      game.diplomacyTab?.domNode.click()
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
      this.build();
      this.craftItemByRatio();
      this.craftItemByAmount();
      this.praise();
      this.trade();
      this.hunt();
      this.buildEmbassy();
      // @ts-ignore
      this.timer = setTimeout(this.iterate.bind(this), this.interval);
    }
    /** 信仰 → 虔诚 */
    praise() {
      const game = window.game;
      const { value, maxValue } = game.resPool.resourceMap['faith'];
      if (value / maxValue > 0.8) {
        game.religion.praise()
      }
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
      const trade = (raceName: string) => {
        // @ts-ignore
        const race = raceList.find(i => i.race.name === raceName);
        if (race && race.race.unlocked) {
          this.log(`trade ${raceName}`);
          race.tradeBtn.onClick();
        }
      }
      for (const item of this.tradeList) {
        // 判断特殊处理
        if (typeof item.handler === 'function') {
          const isTrade = item.handler({ season, trade });
          if (!isTrade) {
            break;
          }
        }
        // 一般逻辑处理
        if (value / maxValue > CommonRatio && (!item.season || item.season.includes(season))) {
          trade(item.name);
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
        if (value / maxValue > CommonRatio) {
          const craft = item.craft;
          for (const craftItem of craft) {
            this.log(`craft ${craftItem.key} ${craftItem.amount}`);
            game.craft(craftItem.key, craftItem.amount);
          }
        }
      }
    }
    /** 自动建造 */
    build() {
      const game = window.game;
      const list = game.bldTab.children;
      for (let i = 0, len = list.length; i < len; i++) {
        const bld = list[i];
        const model = bld.model;
        const metadata = model.metadata;
        if (model && metadata && model.enabled) {
          const config = this.buildMap[metadata.name];
          if (config) {
            if (!config.handler || config.handler(bld)) {
              bld.domNode.click();
            }
          }
        }
      }
    }
    /** 自动建造 embassy */
    buildEmbassy() {
      const game = window.game;
      const list = game.diplomacyTab.racePanels;
      for (let i = 0, len = list.length; i < len; i++) {
        const race = list[i];
        if (race.embassyButton.model.enabled) {
          race.embassyButton.domNode.click();
        }
      }
    }
  }

  clearTimeout(window.scientists?.timer);

  const client = new Client();
  client.load();
  window.scientists = client;

})();