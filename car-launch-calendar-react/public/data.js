/* =====================================================================
   新车上市日历 · 数据文件 (data.js)
   ---------------------------------------------------------------------
   由 AI 联网搜索汇总生成，每周更新。请勿修改本文件的数据结构。
   字段说明：
     id            唯一标识（品牌-车型-事件）
     brand         品牌（用于品牌筛选）
     model         车型名称
     type          车身类型：轿车 | SUV | MPV | 超跑 | 品牌（品牌=非具体车型的活动）
     eventType     事件类型（发布会细分）：上市发布会 | 预售发布会 | 技术发布会 | 新车发布会
    收录原则：仅收录车企官方已确认将举办或已举办的发布会；首秀仅在有发布会性质（首发+发布会）时保留，纯静态车展首秀不收录
    section       板块：upcoming=即将上市(未来约30天)
                         recent=最近上市(近7天)
                         future=更远预告(30天以外)
     date          日期：精确到日 "2026-09-02"；精确到月 "2026-09"；
                   季度 "2026-Q4"；半年 "2026-H2"
     dateConfirmed true=官方已公布该日期/时间窗口；false=媒体或行业预计
     price         价格字符串，如 "23-28万元"；未公布为 null
     priceNote     价格性质说明，如 "预售价"、"媒体预测"；无则为 null
     desc          一句话核心卖点（45字内）
     sourceName    来源媒体名称
     sourceUrl     来源链接
   ===================================================================== */

window.CAR_DATA = {
  updatedAt: "2026-08-31",
  dataSource: "AI 联网搜索汇总（汽车之家、新浪汽车、新华网、易车、太平洋汽车、凤凰网汽车等公开报道）",
  events: [

    /* ============ 即将上市（未来约 30 天） ============ */

    {
      id: "byd-sealion08-launch",
      brand: "比亚迪",
      model: "海狮08",
      type: "SUV",
      eventType: "上市发布会",
      section: "upcoming",
      date: "2026-09-02",
      dateConfirmed: true,
      price: "23-28万元",
      priceNote: "预售价",
      desc: "中大型旗舰SUV，DM-i 插混 / 纯电双动力，纯电续航最高 900km",
      sourceName: "凤凰网汽车",
      sourceUrl: "https://auto.ifeng.com/c/8vt4XAsd8A2"
    },
    {
      id: "lixiang-mega-launch",
      brand: "理想",
      model: "新一代 MEGA",
      type: "MPV",
      eventType: "上市发布会",
      section: "upcoming",
      date: "2026-09-02",
      dateConfirmed: true,
      price: "55.98万元起",
      priceNote: "预计售价",
      desc: "焕新旗舰 MPV：108kWh 电池、后轮转向、4 颗激光雷达、800V 主动稳定杆",
      sourceName: "太平洋汽车",
      sourceUrl: "https://m.toutiao.com/group/7678277775786132031/"
    },
    {
      id: "xiaomi-n70-launch",
      brand: "小米",
      model: "澎程 N70",
      type: "SUV",
      eventType: "上市发布会",
      section: "upcoming",
      date: "2026-09",
      dateConfirmed: true,
      price: "25.99万元起",
      priceNote: "Max 版预售价",
      desc: "小米首款增程 SUV，大五座布局，基于昆仑架构，综合续航 1146km",
      sourceName: "极目新闻（引小米官方）",
      sourceUrl: "http://m.toutiao.com/group/7668319156432814638/"
    },
    {
      id: "xiaomi-n90-launch",
      brand: "小米",
      model: "澎程 N90",
      type: "SUV",
      eventType: "上市发布会",
      section: "upcoming",
      date: "2026-09",
      dateConfirmed: true,
      price: "29.99万元起",
      priceNote: "Max 版预售价",
      desc: "七座增程旗舰 SUV，家用大空间，CLTC 综合续航最高 1705km",
      sourceName: "极目新闻（引小米官方）",
      sourceUrl: "http://m.toutiao.com/group/7668319156432814638/"
    },
    {
      id: "leapmotor-techday",
      brand: "零跑",
      model: "2026 技术发布会",
      type: "品牌",
      eventType: "技术发布会",
      section: "upcoming",
      date: "2026-09-16",
      dateConfirmed: true,
      price: null,
      priceNote: null,
      desc: "官方财报官宣举办，发布第一梯队智驾世界模型与电池电驱最新成果",
      sourceName: "车东西",
      sourceUrl: "http://m.toutiao.com/group/7677624267118297627/"
    },
    {
      id: "xpeng-g9l-launch",
      brand: "小鹏",
      model: "G9L",
      type: "SUV",
      eventType: "上市发布会",
      section: "upcoming",
      date: "2026-09-21",
      dateConfirmed: true,
      price: "25.98万元起",
      priceNote: "预售价",
      desc: "800V 高压平台 + 空气悬架 + 后轮转向，大五座旗舰 SUV",
      sourceName: "小鹏汽车官网",
      sourceUrl: "https://www.xiaopeng.com/news/company_news/5584.html"
    },
    {
      id: "zhijie-rx-launch",
      brand: "智界",
      model: "智界 RX",
      type: "SUV",
      eventType: "上市发布会",
      section: "upcoming",
      date: "2026-09",
      dateConfirmed: true,
      price: "29.98-39.98万元",
      priceNote: "预售价",
      desc: "鸿蒙智行首款X序列轿跑SUV，L3级自动驾驶架构，8月20日已开启预售",
      sourceName: "快科技",
      sourceUrl: "https://news.mydrivers.com/1/1145/1145161.htm"
    },
    {
      id: "fangchengbao-s-launch",
      brand: "方程豹",
      model: "方程 S / S GT",
      type: "轿车",
      eventType: "上市发布会",
      section: "upcoming",
      date: "2026-09",
      dateConfirmed: true,
      price: "23-28万元",
      priceNote: "预订区间",
      desc: "官方官宣9月上旬上市并交付，一车双形态（轿车/猎装），云辇-M悬架",
      sourceName: "易车",
      sourceUrl: "https://hao.yiche.com/wenzhang/112165610/"
    },
    {
      id: "lingke-20-launch",
      brand: "领克",
      model: "领克 20",
      type: "SUV",
      eventType: "上市发布会",
      section: "upcoming",
      date: "2026-09",
      dateConfirmed: true,
      price: null,
      priceNote: null,
      desc: "精致驾趣纯电SUV，全系标配800V+6C超快充与激光雷达，成都车展已首发",
      sourceName: "央广网",
      sourceUrl: "http://auto.cnr.cn/cz/20260824/t20260824_527788979.shtml"
    },
    {
      id: "qiyuan-q06-launch",
      brand: "长安启源",
      model: "Q06",
      type: "SUV",
      eventType: "预售发布会",
      section: "upcoming",
      date: "2026-09-04",
      dateConfirmed: true,
      price: "15-20万元",
      priceNote: "媒体预测",
      desc: "增程/纯电双动力中型SUV，9月4日开启预售并发布天枢领航Ultra",
      sourceName: "今日头条",
      sourceUrl: "http://m.toutiao.com/group/7679031211779490355/"
    },
    {
      id: "zhiji-ls6-launch",
      brand: "智己",
      model: "全新一代 LS6",
      type: "SUV",
      eventType: "上市发布会",
      section: "upcoming",
      date: "2026-09",
      dateConfirmed: true,
      price: null,
      priceNote: null,
      desc: "NEXT·2028 战略首款车型，全系标配全线控底盘与 IM Claw 智能体",
      sourceName: "智己汽车官网",
      sourceUrl: "https://www.immotors.com/website/news_detail/237"
    },
    {
      id: "shenxingzhe-8-launch",
      brand: "神行者",
      model: "神行者 8",
      type: "SUV",
      eventType: "上市发布会",
      section: "upcoming",
      date: "2026-09-03",
      dateConfirmed: true,
      price: "32.99-40.99万元",
      priceNote: "预售权益价",
      desc: "奇瑞中大型六座增程SUV，896线激光雷达+华为ADS 5，9月3日全球上市",
      sourceName: "易车",
      sourceUrl: "https://news.yiche.com/xinchexiaoxi/20260828/16112646593.html"
    },
    {
      id: "yijing-x9-launch",
      brand: "东风奕境",
      model: "奕境 X9",
      type: "SUV",
      eventType: "上市发布会",
      section: "upcoming",
      date: "2026-09",
      dateConfirmed: true,
      price: "29.98-37.98万元",
      priceNote: "预售价",
      desc: "东风华为共创大六座旗舰SUV，全系ADS 5+鸿蒙座舱6，8月18日预售发布会24小时订单破2.1万台",
      sourceName: "新华网",
      sourceUrl: "http://www2.xinhuanet.com/auto/20260819/7f46734ba8c54d1eb44fed412e38a53f/c.html"
    },

    /* ============ 最近上市（近 7 天） ============ */

    {
      id: "zhiji-l6-launch",
      brand: "智己",
      model: "全新一代 L6",
      type: "轿车",
      eventType: "上市发布会",
      section: "recent",
      date: "2026-08-28",
      dateConfirmed: true,
      price: "19.99-25.99万元",
      priceNote: "限时权益价19.99万元起",
      desc: "20万级纯电轿跑，全系标配全线控底盘与800V，CLTC续航最高850km",
      sourceName: "智己汽车官网",
      sourceUrl: "https://www.immotors.com/website/news_detail/238"
    },
    {
      id: "geely-battleship700-tech",
      brand: "吉利银河",
      model: "战舰 700",
      type: "SUV",
      eventType: "技术发布会",
      section: "recent",
      date: "2026-08-28",
      dateConfirmed: true,
      price: "23.98万元起",
      priceNote: "预售价",
      desc: "AI 全地形硬派 SUV，8月28日举办越野技术发布会，兼顾越野与家用",
      sourceName: "新浪汽车",
      sourceUrl: "https://auto.sina.com.cn/news/2026-08-22/detail-inipeptu3169666.shtml"
    },
    {
      id: "greatwall-h9-linghun-launch",
      brand: "长城",
      model: "H9 力魂版",
      type: "SUV",
      eventType: "上市发布会",
      section: "recent",
      date: "2026-08-24",
      dateConfirmed: true,
      price: "21.49万元起",
      priceNote: "限时优惠价",
      desc: "专属定制车色+三把锁，柴汽油双动力越野专属升级",
      sourceName: "爱卡汽车",
      sourceUrl: "https://info.xcar.com.cn/202608/news_2082730_1.html"
    },
    {
      id: "firefly-xinchangluan-launch",
      brand: "萤火虫",
      model: "心海长夏特别版",
      type: "轿车",
      eventType: "上市发布会",
      section: "recent",
      date: "2026-08-28",
      dateConfirmed: true,
      price: "13.58万元",
      priceNote: "BaaS租电方案9.58万元，限量666台",
      desc: "心海长夏主题限量版上市，价格个位级切入代步市场",
      sourceName: "易车微博",
      sourceUrl: "https://m.weibo.cn/detail/5336868222140751"
    },
    {
      id: "ora5-gt-launch",
      brand: "欧拉",
      model: "5 GT / 5运动款",
      type: "轿车",
      eventType: "上市发布会",
      section: "recent",
      date: "2026-08-28",
      dateConfirmed: true,
      price: "8.18万元起",
      priceNote: "5运动款8.18万起 / GT版9.98万起",
      desc: "小钢炮双车上市，运动套件+低重心底盘调校，主打年轻人个性",
      sourceName: "今日头条",
      sourceUrl: "http://m.toutiao.com/group/7679025368258347571/"
    },
    {
      id: "chery-fengyun-t7",
      brand: "奇瑞",
      model: "风云 T7",
      type: "SUV",
      eventType: "上市发布会",
      section: "recent",
      date: "2026-08-26",
      dateConfirmed: true,
      price: "9.79-11.89万元",
      priceNote: "抢先置换价9.49-11.59万元",
      desc: "全系 600km 续航，65.05kWh 犀牛电池，全系 9 气囊",
      sourceName: "汽车之家",
      sourceUrl: "https://chejiahao.m.autohome.com.cn/pingan/chejiahao/detailinfo/26266034"
    },
    {
      id: "arcfox-alpha-t7-presale",
      brand: "极狐",
      model: "阿尔法 T7",
      type: "SUV",
      eventType: "预售发布会",
      section: "recent",
      date: "2026-08-26",
      dateConfirmed: true,
      price: "20.00-26.98万元",
      priceNote: "预售价",
      desc: "华为乾崑智驾 + 宁德时代电池 + 麦格纳制造",
      sourceName: "新浪汽车",
      sourceUrl: "https://auto.sina.com.cn/newcar/2026-08-22/detail-inipazsm1585550.shtml"
    },
    {
      id: "aion-ray7-launch",
      brand: "埃安",
      model: "Ray7",
      type: "轿车",
      eventType: "上市发布会",
      section: "recent",
      date: "2026-08-25",
      dateConfirmed: true,
      price: "14.98万元起",
      priceNote: "经销商行情价",
      desc: "800V 高压平台，700km 续航，溜背轿跑造型",
      sourceName: "易车",
      sourceUrl: "https://dealer.yiche.com/100139510/news/202608/1458515152_190586.html"
    },
    {
      id: "baojun-yueye-plus-2026",
      brand: "宝骏",
      model: "悦也Plus 2026款",
      type: "SUV",
      eventType: "上市发布会",
      section: "recent",
      date: "2026-08-25",
      dateConfirmed: true,
      price: "7.68-10.58万元",
      priceNote: null,
      desc: "7 万级方盒子 SUV 焕新，全能潮玩定位",
      sourceName: "易车",
      sourceUrl: "https://dealer.yiche.com/100071761/news/202608/1458650769.html"
    },

    /* ============ 更远预告（30 天以外） ============ */

    {
      id: "tengshi-z-launch",
      brand: "腾势",
      model: "腾势 Z",
      type: "超跑",
      eventType: "上市发布会",
      section: "future",
      date: "2026-Q4",
      dateConfirmed: true,
      price: null,
      priceNote: null,
      desc: "纯电超跑，三电机超1600匹马力，零百加速1秒级，成都车展已亮相",
      sourceName: "中国经营报",
      sourceUrl: "http://m.toutiao.com/group/7677435526873367050/"
    },
    {
      id: "byd-tang-3rd-gen-launch",
      brand: "比亚迪",
      model: "第三代唐",
      type: "SUV",
      eventType: "上市发布会",
      section: "future",
      date: "2026-Q4",
      dateConfirmed: true,
      price: null,
      priceNote: null,
      desc: "大型五座SUV，纯电续航最高850km，云辇-A双腔空悬+天神之眼B",
      sourceName: "中国经营报",
      sourceUrl: "http://m.toutiao.com/group/7677435526873367050/"
    }

  ]
};
