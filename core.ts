import Benchmark from "benchmark";
import * as New from "@new/replay-core.benchmark";
import * as Prev from "@prev/replay-core.benchmark";

let finalMemory = 0;
let startMemory = 0;

function onFrameStart(frame: number) {
  // Collect a memory usage halfway through. Run it a few times to settle the value
  if (frame > 500 && frame < 510) {
    startMemory = process.memoryUsage().heapUsed;
  }
}
function onFrameEnd(frame: number) {
  if (frame > 500 && frame < 510) {
    const memoryUsed = process.memoryUsage().heapUsed - startMemory;

    if (memoryUsed < 0) {
      // Was GC collected, ignore
      return;
    }

    finalMemory = memoryUsed;
  }
}

type SuiteArg = {
  onFrameStart: (frame: number) => void;
  onFrameEnd: (frame: number) => void;
}

const suites: (() => Promise<void>)[] = [];

addSuite("Simple texture", New.runSimple, Prev.runSimple);
addSuite("Nested Sprite", New.runNested, Prev.runNested);
addSuite("Pure Sprite", New.runPure, Prev.runPure);
addSuite("Moving Sprite", New.runMovingSprite, Prev.runMovingSprite);
addSuite("Context Sprite", New.runContextSprite, Prev.runContextSprite);
addSuite("Sprite with input", New.runInputSprite, Prev.runInputSprite);
addSuite("Sprites removed and created", New.runRemovedSprites, Prev.runRemovedSprites);
addSuite("1000 textures", New.run1000Textures, Prev.run1000Textures);
addSuite("1000 Sprites", New.run1000Sprites, Prev.run1000Sprites);
addSuite("1000 Pure Sprites", New.run1000Pure, Prev.run1000Pure);
addSuite("200 Nested Sprites", New.run200Nested, Prev.run200Nested);

async function runSuites() {
  for (let i = 0; i < suites.length; i++) {
    await suites[i]();
  }
}
runSuites();

function addSuite(
  name: string,
  newFn: (arg: SuiteArg) => void,
  prevFn: (arg: SuiteArg) => void
) {
  suites.push(
    () =>
      new Promise((res) => {
        new Benchmark.Suite()
          .add("new", () => {
            newFn({ onFrameStart, onFrameEnd });
          })
          .add("previous", () => {
            prevFn({ onFrameStart, onFrameEnd });
          })
          .on("start", () => {
            console.log(name);
          })
          .on("cycle", function (event: Benchmark.Event) {
            const target = event.target as Benchmark.Event["target"] & {
              error?: Error;
            };
            if (target.error) {
              throw target.error;
            }
            const memoryUsed = finalMemory.toFixed(0);
            console.log(String(target), `${memoryUsed} B / frame`);

            (target as any).memory = memoryUsed;
          })
          .on("complete", function (this: Benchmark.Suite) {
            res();

            const fastest = this.filter("fastest").map("name");
            const lowestMemory = this.sort((a, b) => a.memory - b.memory);
            if (fastest.length > 1) {
              console.log("Same speed");
            } else {
              console.log("Fastest is " + fastest);
            }
            if (lowestMemory[0].memory === lowestMemory[1].memory) {
              console.log("Same memory\n");
            } else {
              console.log("Lowest memory is " + lowestMemory[0].name + "\n");
            }
          })
          .run({ async: true });
      })
  );
}
