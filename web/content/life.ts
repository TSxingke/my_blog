import { readBooks, type BookEntry } from "./books";

export type { BookEntry } from "./books";

export type LifeImage = {
  src: `/life/${string}`;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

export type BilibiliVideo = {
  bvid: string;
  page?: number;
  title: string;
  cover: LifeImage;
  originalUrl: `https://www.bilibili.com/${string}`;
};

export type PlayingCard = {
  id: string;
  name: string;
  image: LifeImage;
  note?: string;
};

export type LifeContent = {
  hero: {
    eyebrow: string;
    title: string;
    summary: string;
    image?: LifeImage;
  };
  cycling: {
    intro: string;
    videos: BilibiliVideo[];
    gallery: LifeImage[];
    equipment: LifeImage[];
    equipmentNote: string;
  };
  badminton: {
    title: string;
    text: string;
    image?: LifeImage;
  };
  cards: {
    intro: string;
    items: PlayingCard[];
  };
  reading:
    | { status: "preparing"; note: string }
    | { status: "ready"; books: BookEntry[] };
};

function createPlayingCard(
  id: string,
  name: string,
  filename: string,
  width: number,
  height: number,
): PlayingCard {
  return {
    id,
    name,
    image: {
      src: `/life/cards/${filename}`,
      alt: `${name}主题收藏纸牌的横向陈列`,
      width,
      height,
    },
  };
}

/**
 * 生活页首版内容。
 *
 * 展示内容与页面结构分离；后续新增素材时优先扩展本文件，
 * 不需要改动页面组件。
 */
export const lifeContent: LifeContent = {
  hero: {
    eyebrow: "Life / Beyond the Screen",
    title: "技术之外，也有一些缓慢积累的热爱。",
    summary:
      "从骑行出发，经过很少被记录的羽毛球日常，在纸牌收藏里停留片刻，最后回到阅读。",
    image: {
      src: "/life/cycling/hero.jpg",
      alt: "骑行者与公路车的合影",
      width: 4095,
      height: 2730,
    },
  },
  cycling: {
    intro:
      "从北京的公园与地标出发，一路经过机场、新城和路上的风。视频留下完整路程，照片则记住那些短暂的瞬间。",
    videos: [
      {
        bvid: "BV12BVD6xEu6",
        title: "北京—雄安骑行，还有“前方施工”",
        cover: {
          src: "/life/cycling/xiongan-departure.jpg",
          alt: "骑行途中驶向雄安的道路",
          width: 1280,
          height: 960,
        },
        originalUrl: "https://www.bilibili.com/video/BV12BVD6xEu6/",
      },
      {
        bvid: "BV1bLpwz8E25",
        title: "大兴机场—白天",
        cover: {
          src: "/life/cycling/daxing-airport.jpg",
          alt: "白天骑行到北京大兴国际机场",
          width: 1280,
          height: 960,
        },
        originalUrl: "https://www.bilibili.com/video/BV1bLpwz8E25/",
      },
      {
        bvid: "BV1Y8eEz5EPg",
        title: "南海子公园—白天",
        cover: {
          src: "/life/cycling/nanhaizi-park.jpg",
          alt: "白天骑行经过南海子公园",
          width: 1280,
          height: 960,
        },
        originalUrl: "https://www.bilibili.com/video/BV1Y8eEz5EPg/",
      },
      {
        bvid: "BV12EtdzRE8a",
        title: "南海子公园—夜晚",
        cover: {
          src: "/life/cycling/nanhaizi-park.jpg",
          alt: "南海子公园骑行视频封面",
          width: 1280,
          height: 960,
        },
        originalUrl: "https://www.bilibili.com/video/BV12EtdzRE8a/",
      },
      {
        bvid: "BV1gLajzFEtw",
        title: "善良贪吃的 AED 探店",
        cover: {
          src: "/life/cycling/speed.jpg",
          alt: "城市道路上的骑行瞬间",
          width: 853,
          height: 1280,
        },
        originalUrl: "https://www.bilibili.com/video/BV1gLajzFEtw/",
      },
    ],
    gallery: [
      {
        src: "/life/cycling/birds-nest.jpg",
        alt: "鸟巢前的公路车",
        width: 1280,
        height: 960,
        caption: "鸟巢之下 / 北京",
      },
      {
        src: "/life/cycling/nanhaizi-park.jpg",
        alt: "南海子公园的骑行留影",
        width: 1280,
        height: 960,
        caption: "南海子公园 / 公园",
      },
      {
        src: "/life/cycling/daxing-airport.jpg",
        alt: "北京大兴国际机场前的骑行留影",
        width: 1280,
        height: 960,
        caption: "大兴机场 / 机场",
      },
      {
        src: "/life/cycling/xiongan-departure.jpg",
        alt: "骑行途中驶向雄安的道路",
        width: 1280,
        height: 960,
        caption: "驶向雄安 / 出发",
      },
      {
        src: "/life/cycling/xiongan-arrival.jpg",
        alt: "到达雄安后的骑行留影",
        width: 1280,
        height: 960,
        caption: "雄安 / 抵达",
      },
      {
        src: "/life/cycling/speed.jpg",
        alt: "车流旁的骑行瞬间",
        width: 853,
        height: 1280,
        caption: "疾驰 / 速度",
      },
    ],
    equipment: [
      {
        src: "/life/cycling/bike.jpg",
        alt: "陪伴日常骑行的公路车",
        width: 1280,
        height: 960,
      },
    ],
    equipmentNote: "没有复杂的参数表，只记录这辆陪着我穿过城市、公园与城际道路的车。",
  },
  badminton: {
    title: "持续在打，但很少记录",
    text: "羽毛球是生活里的固定活动，只是镜头很少出现。先留下一张小卡，等真正值得记录的片段自然发生。",
    image: {
      src: "/life/badminton/court.jpg",
      alt: "羽毛球场边的两支球拍和粉色球桶",
      width: 720,
      height: 1280,
    },
  },
  cards: {
    intro:
      "先从十一副收藏开始，按照一份可持续增长的索引陈列。不追求炫技的翻牌动画，只留下名字与设计本身。",
    items: [
      createPlayingCard("wang-zhaojun", "王昭君", "wang-zhaojun.jpg", 4096, 3072),
      createPlayingCard("king-arthur", "亚瑟王", "king-arthur.jpg", 4096, 3072),
      createPlayingCard("assassins-creed", "刺客信条", "assassins-creed.jpg", 4096, 3072),
      createPlayingCard("caged-bird", "困兽笼中鸟", "caged-bird.jpg", 4096, 3072),
      createPlayingCard("serenity-v3", "静谧 V3", "serenity-v3.jpg", 4096, 3072),
      createPlayingCard("black-forest", "黑森林", "black-forest.jpg", 1920, 1080),
      createPlayingCard("white-snake", "白蛇", "white-snake.jpg", 1440, 810),
      createPlayingCard("zinnia", "百日菊", "zinnia.jpg", 1920, 1080),
      createPlayingCard("van-gogh", "梵高", "van-gogh.jpg", 1920, 1080),
      createPlayingCard("cuckoo-duck", "咕咕鸭", "cuckoo-duck.jpg", 4096, 3072),
      createPlayingCard("captain-america", "美国队长", "captain-america.jpg", 4096, 3072),
    ],
  },
  reading: {
    status: "ready",
    books: readBooks,
  },
};
