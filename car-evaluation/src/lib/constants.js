export const DIMS = ['靠近车辆', '上车准备', '车辆行驶', '车内活动', '离车及车外活动']

export const L2_NAMES = ['远程查询控制', '解闭锁', '取放物品', '进入车辆', '设置与调节', '安全交互', '导航', '城郊通行', '城市通行', '高速通行', '夜间通行', '特殊环境通行', '特殊工况通行', '乘坐', '座椅休息', '成床休息', '车内观影', '音乐娱乐', '办公学习', '人员关怀', '生态拓展', '游戏娱乐', '手车交互', '停车', '下车离开', '餐饮', '清洁维护', '补能', '放电']

export const L3_MAP = {
  远程查询控制: ['手机APP远程查询', '手机APP 远程控制', '车辆授权'],
  解闭锁: ['寻车', '解锁', '闭锁'],
  取放物品: ['前备箱置物取物', '乘员舱取放物品', '行李箱取放物品', '特殊物品取放'],
  进入车辆: ['打开车门', '步入车内', '落座', '关闭车门'],
  设置与调节: ['乘坐位置调节', '视野调节', '温度调节', '空气调节', '声音调节'],
  安全交互: ['安全信息交互', '事故处理'],
  导航: ['设置目的地', '规划与路线选择', '导航中', '到达目的地'],
  城郊通行: ['连续山路通行', '坑洼破损路通行'],
  城市通行: ['车库通行', '小区及周边通行', '主干道通行'],
  高速通行: ['长时间通行', '高速行驶'],
  夜间通行: ['夜间照明与视野', '夜间驾驶舒适性', '夜间使用便利性', '夜间娱乐交互'],
  特殊环境通行: ['雨季用车', '冬季用车', '夏季用车'],
  特殊工况通行: ['赛道驾驶', '越野'],
  乘坐: ['前排乘坐', '二排乘坐', '三排乘坐'],
  座椅休息: ['休息准备', '休息中', '结束休憩，复原座椅'],
  成床休息: ['睡眠准备', '睡眠中', '成床状态下，中途上下车', '结束休憩，复原座椅'],
  车内观影: ['观影硬件配置', '观影软件资源', '观影控制调节', '观影视听体验'],
  音乐娱乐: ['查找资源', '感受音响效果', '调节与交互', '唱歌娱乐'],
  办公学习: ['放置办公用品', '车内会议', '办公设备充电'],
  人员关怀: ['车主关怀', '家人关怀', '儿童关怀', '宠物关怀'],
  生态拓展: ['车内拓展设备', '车外拓展设备'],
  游戏娱乐: ['车内单人游戏', '车内多人游戏'],
  手车交互: ['蓝牙通话', '手车互联', '手机投屏'],
  停车: ['手动泊车', '自动泊车'],
  下车离开: ['打开车门', '步出车辆', '离车提醒', '离车守护'],
  餐饮: ['餐饮用品存储', '就餐过程', '食品保存及加工', '餐后整理'],
  清洁维护: ['洗车', '维修'],
  补能: ['充电准备', '充电操作', '充电交互', '原地补能'],
  放电: ['车内放电', '车外放电'],
}

export const CAR_CATS = ['SUV', '轿车', 'MPV']
export const POWER_OPTIONS = ['纯电', '燃油', '插混', '增程']

export const SUPABASE_URL = 'https://ucsubgbnkcdjbgozqfaj.supabase.co'
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjc3ViZ2Jua2NkamJnb3pxZmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NTM4ODAsImV4cCI6MjEwMjMyOTg4MH0.gClpGM9iQDUc65ZEGJTVMmrqgQ788TtRAWfU3v6_eZU'

export const BLOB_URL = 'https://extendsclass.com/api/json-storage/bin/edfaeae'
export const CALENDAR_BLOB_URL = 'https://extendsclass.com/api/json-storage/bin/fdaedfe'
export const STORAGE_KEY = 'car_eval_v5'
export const CLOUD_PAYLOAD_VERSION = 1

// 登录态存储 key（与根 index.html 登录流程共用 localStorage，保持字符串一致）
export const AUTH_STORAGE_KEY = 'car_eval_auth_v1'

// 固定车型名 → 稳定 id 映射（与 Supabase 历史行 car_00..19 一致）。
// 按"名字"而非"数组位置"分配，杜绝删除/新增导致重排后错位覆盖。
export const KNOWN_IDS = {
  问界M9: 'car_00',
  路虎揽胜: 'car_01',
  极氪9X: 'car_02',
  智己LS9: 'car_03',
  理想L8: 'car_04',
  领克900: 'car_05',
  银河M9: 'car_06',
  深蓝S09: 'car_07',
  'Model Y': 'car_08',
  小米YU7: 'car_09',
  阿维塔07: 'car_10',
  '比亚迪 唐L': 'car_11',
  星越L: 'car_12',
  启源A06: 'car_13',
  深蓝L06: 'car_14',
  小鹏M03: 'car_15',
  CS75PLUS: 'car_16',
  启源Q06: 'car_17',
  星愿: 'car_18',
  启源Q05: 'car_19',
}
