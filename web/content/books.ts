export type BookEntry = {
  id: string;
  title: string;
  note?: string;
};

/**
 * 已读书目按原始清单中的记录顺序排列。
 *
 * 清单没有提供作者、年份或分类，因此这里只保留可核验的书名与随记，
 * 避免为了展示效果补写不确定的元数据。
 */
export const readBooks: BookEntry[] = [
  { id: "book-001", title: "从一到无穷大" },
  { id: "book-002", title: "三体" },
  { id: "book-003", title: "三体II·黑暗森林" },
  { id: "book-004", title: "三体III·死神永生" },
  { id: "book-005", title: "迟来的翅膀" },
  { id: "book-006", title: "时间停止的那一天" },
  { id: "book-007", title: "漂亮朋友" },
  { id: "book-008", title: "生命的真谛" },
  { id: "book-009", title: "岛上书店", note: "能爱上读书真是太好了" },
  { id: "book-010", title: "银河帝国1：基地" },
  { id: "book-011", title: "银河帝国2：基地与帝国" },
  { id: "book-012", title: "胜者即是正义1" },
  { id: "book-013", title: "笑面人", note: "统治者永远不是哪个人，而是哪个阶级" },
  { id: "book-014", title: "胜者即是正义2", note: "真相？谁知道呢.正义？谁知道呢." },
  { id: "book-015", title: "十宗罪6", note: "以暴制暴最大的优点就是大快人心" },
  { id: "book-016", title: "银河帝国3 第二基地", note: "银河系边缘的另一端是中心" },
  { id: "book-017", title: "不思议图书馆", note: "书中各种千奇百怪的东西都有" },
  {
    id: "book-018",
    title: "神迹",
    note: "人们总将自己想看到而又无法解释的称为神迹，荒谬至极",
  },
  { id: "book-019", title: "2018", note: "谁也不知道科技最后究竟会带来什么" },
  { id: "book-020", title: "地球副本", note: "克隆绝不是谁是谁的副本" },
  { id: "book-021", title: "地光", note: "人类的历史：战争与和平" },
  { id: "book-022", title: "岛", note: "爱情：欲望与理智" },
  {
    id: "book-023",
    title: "银河帝国4 基地前奏",
    note: "“因为你不是人，对不对，夫铭/丹莫刺尔？你其实是个机器人。”",
  },
  { id: "book-024", title: "凛冬之棺", note: "咒杀或许远不如人心恐怖" },
  { id: "book-025", title: "人间观察日记", note: "新颖的形式与乏味的科幻" },
  { id: "book-026", title: "绑架游戏", note: "棋手与棋子，只有一个布局者" },
  { id: "book-027", title: "三色屋事件", note: "不是所有人都需要真相" },
  { id: "book-028", title: "双面恶魔", note: "最恐怖的是没有揭开面纱的恶魔" },
  { id: "book-029", title: "告别吧！", note: "自卑源于怪姐姐与家庭" },
  { id: "book-030", title: "告别吧！-完结篇", note: "要自己寻找自己的信仰" },
  { id: "book-031", title: "失意者酒馆", note: "宛如酒馆吧台讲述故事的老板" },
  { id: "book-032", title: "水星播种", note: "一些宗教只是利用信仰罢了" },
  { id: "book-033", title: "幸运合租屋", note: "典型的日式故事，小而感动" },
  { id: "book-034", title: "心理师1", note: "心理学或许更像是人体学的玄幻版" },
  { id: "book-035", title: "银河帝国5 迈向基地", note: "哈里·谢顿，凡纳比里·铎丝" },
  { id: "book-036", title: "袭击面包店", note: "不是饥饿引向恶，而是恶引向饥饿" },
  { id: "book-037", title: "天才在左，疯子在右", note: "疯子分两种，精神病与天才" },
  { id: "book-038", title: "东方快车谋杀案", note: "无比正统的推理故事" },
  { id: "book-039", title: "步履不停", note: "宛如昨日的母亲" },
  { id: "book-040", title: "无人生还", note: "精妙与永恒经典的孤岛杀人" },
  { id: "book-041", title: "指匠", note: "我的珍珠" },
  { id: "book-042", title: "挽救计划", note: "宇宙的浪漫，黑暗森林的另一面" },
  { id: "book-043", title: "白夜行", note: "如在白夜伴你而行，你如太阳，而又可悲" },
  { id: "book-044", title: "太白金星有点烦", note: "何时才能太上忘情，如何才算太上忘情" },
  {
    id: "book-045",
    title: "艰辛时刻",
    note: "危地马拉小姐与错综复杂的历史，一家公司开始的导火索",
  },
  { id: "book-046", title: "永恒的终结", note: "科幻的反乌托邦，银河帝国的起点" },
];
