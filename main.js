import { Bodies, Body, Engine, Events, Render, Runner, World } from "matter-js";
import { FRUITS, } from "./fruits";
import "./dark.css";



const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    background: "#F7F4C8",
    wireframes: false,
    width: 620,
    height: 850,
  }
});

const world = engine.world;

// 테두리 만들기
const leftwall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143"}
});

const rightwall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143"}
});

const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: { fillStyle: "#E6B143"}
});

const topLine = Bodies.rectangle(310, 150, 620, 2, {
  name: "topLine",
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#E6B143"}
});

World.add(world, [leftwall, rightwall, ground, topLine])
Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false; 
let interval = null;
let num_suika = 0;

// 과일 추가
function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    isSleeping: true,
    render: {
      sprite : { texture: `${fruit.name}.png`}
    },
    restitution: 0.2,
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body)
}

// 키보드 작동
window.onkeydown = (e) => {
  if (disableAction){
    return;
  }

  switch (e.code) {
    case "KeyA":
      if(interval) return;
      // 벽을 넘어가지 않게 조정 + 움직임 부드럽게 
      interval = setInterval (()=> {
        if(currentBody.position.x - currentFruit.radius > 30)
        Body.setPosition(currentBody, {
          x: currentBody.position.x - 1,
          y: currentBody.position.y,
      });
      }, 5);
      break;
    case "KeyD":
      if(interval) return;
        interval = setInterval (()=> {
        if(currentBody.position.x + currentFruit.radius < 590)
          Body.setPosition(currentBody, {
            x: currentBody.position.x + 1,
            y: currentBody.position.y,
        });
      }, 5);
      break;
    case "KeyS":
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(()=> {
        addFruit();
        disableAction = false;
      }, 1000);
      break;
  }
}

window.onkeyup = (event) => {
  switch (event.code) {
    case "KeyA":
    case "KeyD":
      clearInterval(interval);
      interval = null;
  }
}

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision)=> {
    if (collision.bodyA.index === collision.bodyB.index){
      const index = collision.bodyA.index;

      if (index === FRUITS.length - 1) {
        return;
      }

      World.remove(world, [collision.bodyA, collision.bodyB]);

      const newFruit = FRUITS[index + 1];

      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render: {
            sprite : { texture: `${newFruit.name}.png`}
        },
          index: index + 1,
        },
      );
      World.add(world, newBody)

      num_suika ++;
      if(newFruit === newFruit[9]) {
        alert("You win score: ", num_suika);
      }
      
    }

    if (
      !disableAction &&
      (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")) {
      alert("Game over");
    }
  });
});

addFruit();