<script lang="ts">
  import "../global.css";
  import "@fontsource/montserrat-alternates";
  import "@fontsource-variable/raleway";
  import "iconify-icon";
  import { onMount } from "svelte";
  import { fade, slide } from "svelte/transition";
  import { ScrollArea } from "bits-ui";

  import { type Ball, darkenColor, radianToVector, cn } from "$lib/utils";
  import { type Palette, palettes } from "$lib/palettes";

  let canvas: HTMLCanvasElement;
  let scores = [0, 0, 0, 0];
  let paletteIndex = 0;
  let palette: Palette = palettes[paletteIndex];
  let panelOpen = false;

  let balls: Ball[];
  let squares: string[][] = [[]];

  const SQUARE_SIZE = 10;
  const BALL_SPEED_RANGE = 50;
  const BALL_SPEED = 8;

  function checkBoundaryCollision(ball: Ball) {
    if (
      ball.x + ball.dx > canvas.width - SQUARE_SIZE / 2 ||
      ball.x + ball.dx < SQUARE_SIZE / 2
    ) {
      ball.dx = -ball.dx;
    }

    if (
      ball.y + ball.dy > canvas.height - SQUARE_SIZE / 2 ||
      ball.y + ball.dy < SQUARE_SIZE / 2
    ) {
      ball.dy = -ball.dy;
    }
  }

  function addRandomness(ball: Ball) {
    ball.dx += Math.random() * 0.01 - 0.005;
    ball.dy += Math.random() * 0.01 - 0.005;

    const MAX_SPEED = BALL_SPEED + BALL_SPEED_RANGE;
    const MIN_SPEED = BALL_SPEED - BALL_SPEED_RANGE;

    // Limit the speed of the ball
    ball.dx = Math.min(Math.max(ball.dx, -MAX_SPEED), MAX_SPEED);
    ball.dy = Math.min(Math.max(ball.dy, -MAX_SPEED), MAX_SPEED);

    // Make sure the ball always maintains a minimum speed
    if (Math.abs(ball.dx) < MIN_SPEED)
      ball.dx = ball.dx > 0 ? MIN_SPEED : -MIN_SPEED;
    if (Math.abs(ball.dy) < MIN_SPEED)
      ball.dy = ball.dy > 0 ? MIN_SPEED : -MIN_SPEED;
  }

  function setPalette(index: number) {
    let prevIndex = paletteIndex;
    paletteIndex = index;
    palette = palettes[index];

    balls.forEach((ball, i) => {
      ball.color = palette.colors[i];
      ball.ballColor = darkenColor(ball.color, -10);
    });

    for (let i = 0; i < squares.length; i++) {
      for (let j = 0; j < squares[i].length; j++) {
        const square = squares[i][j];
        squares[i][j] = palette.colors[palettes[prevIndex].colors.indexOf(square)];
      }
    }
  }

  onMount(() => {
    const numSquaresX = canvas.width / SQUARE_SIZE;
    const numSquaresY = canvas.height / SQUARE_SIZE;

    let ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;

    balls = [
      {
        x: canvas.width / 4,
        y: canvas.height / 4,
        dx: 0,
        dy: 0,
        color: "",
        ballColor: "",
      },
      {
        x: canvas.width / 4,
        y: (canvas.height / 4) * 3,
        dx: 0,
        dy: 0,
        color: "",
        ballColor: "",
      },
      {
        x: (canvas.width / 4) * 3,
        y: canvas.height / 4,
        dx: 0,
        dy: 0,
        color: "",
        ballColor: "",
      },
      {
        x: (canvas.width / 4) * 3,
        y: (canvas.height / 4) * 3,
        dx: 0,
        dy: 0,
        color: "",
        ballColor: "",
      },
    ];

    setPalette(Math.floor(Math.random() * palettes.length));
    canvas.onclick = () => panelOpen = !panelOpen;

    // Populate squares
    for (let i = 0; i < numSquaresX; i++) {
      squares[i] = [];
      for (let j = 0; j < numSquaresX; j++) {
        if (i < numSquaresX / 2) {
          if (j < numSquaresY / 2) squares[i][j] = palette.colors[0];
          else squares[i][j] = palette.colors[1];
        } else {
          if (j < numSquaresY / 2) squares[i][j] = palette.colors[2];
          else squares[i][j] = palette.colors[3];
        }
      }
    }

    // Set a random ball velocity
    balls.forEach(ball => {
      const direction = radianToVector(Math.random() * Math.PI * 2);
      ball.dx = direction.x * BALL_SPEED;
      ball.dy = direction.y * BALL_SPEED;
    });

    function drawBall(ball: Ball) {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, SQUARE_SIZE / 2, 0, Math.PI * 2, false);
      ctx.fillStyle = ball.ballColor;
      ctx.fill();
      ctx.closePath();
    }

    function drawSquares() {
      scores = [0, 0, 0, 0];

      for (let i = 0; i < numSquaresX; i++) {
        for (let j = 0; j < numSquaresX; j++) {
          ctx.fillStyle = squares[i][j];
          ctx.fillRect(
            i * SQUARE_SIZE,
            j * SQUARE_SIZE,
            SQUARE_SIZE,
            SQUARE_SIZE
          );

          if (squares[i][j] === palette.colors[0]) scores[0]++;
          if (squares[i][j] === palette.colors[1]) scores[1]++;
          if (squares[i][j] === palette.colors[2]) scores[2]++;
          if (squares[i][j] === palette.colors[3]) scores[3]++;
        }
      }
    }

    function checkSquareCollision(ball: Ball) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const checkX = ball.x + Math.cos(angle) * (SQUARE_SIZE / 2);
        const checkY = ball.y + Math.sin(angle) * (SQUARE_SIZE / 2);

        const i = Math.floor(checkX / SQUARE_SIZE);
        const j = Math.floor(checkY / SQUARE_SIZE);

        if (i >= 0 && i < numSquaresX && j >= 0  && j < numSquaresY) {
          if (squares[i][j] !== ball.color) {
            squares[i][j] = ball.color;

            if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
              ball.dx = -ball.dx;
            } else {
              ball.dy = -ball.dy;
            }
          }
        }
      }
    }


    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawSquares();

      balls.forEach(ball => {
        drawBall(ball);
        checkSquareCollision(ball);
        checkBoundaryCollision(ball);

        ball.x += ball.dx;
        ball.y += ball.dy;

        addRandomness(ball);
      });

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  });
</script>

<svelte:head>
  <title>Color Pong</title>
</svelte:head>

<main
  id="app"
  class="bg-background h-screen textwhite text-white flex w-full items-center font-sans relative"
>
  <div class="flex flex-col items-center justify-evenly h-full flex-grow">
    <h1 class="text-5xl">Color <b class="font-black">Pong</b></h1>
    <div class="size-[25rem]">
      <canvas
        bind:this={canvas}
        id="canvas"
        class="rounded-md hover:scale-[103%] shadow-2xl cursor-pointer w-full h-full duration-300"
        width="500"
        height="500"
      ></canvas>
    </div>
    <div class="flex items-center justify-center text-sm">
      <div class="flex items-center justify-center gap-2 w-[7rem]">
        <div class="size-4 rounded-full" style:background={palette.colors[0]}></div>
        <h2 class="font-bold">{scores[0]}</h2>
      </div>
      <div class="flex items-center justify-center gap-2 w-[7rem]">
        <div class="size-4 rounded-full" style:background={palette.colors[1]}></div>
        <h2 class="font-bold">{scores[1]}</h2>
      </div>
      <div class="flex items-center justify-center gap-2 w-[7rem]">
        <div class="size-4 rounded-full" style:background={palette.colors[2]}></div>
        <h2 class="font-bold">{scores[2]}</h2>
      </div>
      <div class="flex items-center justify-center gap-2 w-[7rem]">
        <div class="size-4 rounded-full" style:background={palette.colors[3]}></div>
        <h2 class="font-bold">{scores[3]}</h2>
      </div>
    </div>
  </div>

  {#if panelOpen}
    <div
      transition:slide={{ duration: 300, axis: "x" }}
      class="p-10 h-full"
    >
      <div class="rounded-2xl bg-faded h-full w-[36vw] shadow-lg py-6 px-4">
        <div class="flex justify-between items-center text-2xl font-raleway pb-4 border-b-[1.5px] border-b-white">
          <h2 class="font-semibold ml-4">Themes</h2>
          <button
            on:click={() => (panelOpen = false)}
            class="flex items-center mr-4"
          >
            <iconify-icon icon="material-symbols:close-rounded" class="text-3xl"></iconify-icon>
          </button>
        </div>

        <div class="w-full h-[90%] overflow-auto no-scrollbar pt-4">
          {#each palettes as p, i}
            <button
              on:click={() => (setPalette(i))}
              class="w-full p-4 flex items-center gap-4 hover:bg-background duration-150 rounded-lg active:scale-[98%]"
            >
              <div class="size-8 grid grid-rows-2 grid-cols-2">
                <div class="rounded-tl-full" style:background={p.colors[0]}></div>
                <div class="rounded-tr-full" style:background={p.colors[1]}></div>
                <div class="rounded-bl-full" style:background={p.colors[2]}></div>
                <div class="rounded-br-full" style:background={p.colors[3]}></div>
              </div>

              <h3>{p.value}</h3>
              {#if p === palette}
                <iconify-icon
                  icon="mingcute:check-fill"
                  class="text-xl ml-auto"
                  transition:fade={{ duration: 50, }}
                ></iconify-icon>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</main>
