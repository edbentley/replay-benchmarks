import { makeSprite, t } from "@replay/core";
import { replayCore } from "@replay/core/dist/core.js";

const Game = makeSprite({
  init() {
    return { sprites: [], frame: 0 };
  },

  loop({ state }) {
    if (state.sprites.length > 10) {
      return {
        ...state,
        sprites: state.sprites.slice(5),
        frame: state.frame + 1,
      };
    }
    if (state.frame % 100 === 0) {
      return {
        ...state,
        sprites: [...state.sprites, { id: `Sprite-${state.frame}` }],
        frame: state.frame + 1,
      };
    }
    return { ...state, frame: state.frame + 1 };
  },

  render({ state }) {
    return [...state.sprites.map((s) => Sprite({ id: s.id }))];
  },
});

const Sprite = makeSprite({
  init() {
    return { x: 0 };
  },

  loop({ state, getInputs }) {
    if (getInputs().clicked) {
      return state;
    }
    return { ...state, x: state.x + 1 };
  },

  render({ state }) {
    return [
      t.circle({
        radius: 4,
        color: "red",
        x: state.x,
      }),
    ];
  }
})

async function runGame() {
  const platform = getBenchmarkPlatform();

  const { runNextFrame } = replayCore(
    platform,
    getNativeSpriteSettings(),
    Game(gameProps)
  );

  const oneFrameMs = 1000 / 60;
  const resetInputs = () => null;

  console.log("Starting");

  for (let i = 0; i < 1000000; i++) {
    runNextFrame(i * oneFrameMs, resetInputs);
  }
}

const gameProps = {
  id: "Game",
  size: {
    width: 300,
    height: 200,
  },
};

function getBenchmarkPlatform() {
  const inputs = {
    x: 0,
    y: 0,
    clicked: false,
  };

  const mutableTestDevice = {
    isTouchScreen: false,
    size: {
      width: 300,
      height: 200,
      widthMargin: 0,
      heightMargin: 0,
      deviceWidth: 500,
      deviceHeight: 300,
    },
    log: console.log,
    random: Math.random,
    timer: {
      start(callback) {
        setImmediate(callback);
        return "id";
      },
      cancel: () => null,
      resume: () => null,
      pause: () => null,
    },
    now: () => new Date(Date.UTC(1995, 12, 17, 3, 24, 0)),
    audio: () => ({
      getPosition: () => 50,
      play: () => null,
      pause: () => null,
    }),
    assetUtils: {
      imageElements: {},
      audioElements: {},
      loadImageFile: () => Promise.resolve("imageData"),
      loadAudioFile: () => Promise.resolve("audioData"),
      cleanupImageFile: () => null,
      cleanupAudioFile: () => null,
    },
    network: {
      get: (url, callback) => {
        callback(`GET-${url}`);
      },
      post: (url, body, callback) => {
        callback(`POST-${url}-${body}`);
      },
      put: (url, body, callback) => {
        callback(`PUT-${url}-${body}`);
      },
      delete: (url, callback) => {
        callback(`DELETE-${url}`);
      },
    },
    storage: {
      getItem: () => Promise.resolve("storage"),
      setItem: () => Promise.resolve(),
    },
    alert: {
      ok: (_, onResponse) => {
        onResponse();
      },
      okCancel: (_, onResponse) => {
        onResponse(true);
      },
    },
    clipboard: {
      copy: (_, onComplete) => {
        onComplete();
      },
    },
  };

  const platform = {
    getInputs: (globalToLocalCoords) => {
      const local = globalToLocalCoords(inputs);
      return { ...inputs, x: local.x, y: local.y };
    },
    mutDevice: mutableTestDevice,
    render: {
      newFrame: () => null,
      startRenderSprite: () => null,
      endRenderSprite: () => null,
      renderTexture: () => null,
    },
  };

  return platform;
}

function getNativeSpriteSettings() {
  return {
    nativeSpriteMap: {},
    nativeSpriteUtils: {
      didResize: false,
      scale: 1,
      gameXToPlatformX: (x) => x,
      gameYToPlatformY: (y) => y,
    },
  };
}

runGame();
