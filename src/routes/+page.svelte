<script lang="ts">
  import "../global.css";
  import "@fontsource/montserrat-alternates";
  import "@fontsource-variable/raleway";
  import "iconify-icon";
  import { onMount } from "svelte";
  import { fade, slide } from "svelte/transition";

  import { type Ball, darkenColor, radianToVector, cn } from "$lib/utils";
  import { type Palette, palettes } from "$lib/palettes";

  let canvas: HTMLCanvasElement;
  let scores = [0, 0, 0, 0];
  let paletteIndex = 0;
  let palette: Palette = palettes[paletteIndex];
  let themesOpen = false;
  let zenMode = false;

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

  function setZenMode(enabled: boolean) {
    zenMode = enabled;
    if (zenMode) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
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
    canvas.onclick = () => themesOpen = !themesOpen;

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

    document.addEventListener("fullscreenchange", fullscreenHandler, false);
    document.addEventListener("mozfullscreenchange", fullscreenHandler, false);
    document.addEventListener("MSFullscreenChange", fullscreenHandler, false);
    document.addEventListener("webkitfullscreenchange", fullscreenHandler, false);

    function fullscreenHandler() {
      setZenMode(document.fullscreenElement !== null);
    }
  });
</script>

<svelte:head>
  <title>Color Pong</title>
</svelte:head>

<main
  id="app"
  class="bg-background h-screen textwhite text-white flex w-full items-center font-sans relative"
>
  {#if zenMode}
    <button
      on:click={() => setZenMode(false)}
      class="absolute left-10 top-10 text-2xl"
    >
      <iconify-icon icon="mingcute:close-fill"></iconify-icon>
    </button>
  {/if}

  <div class="flex flex-col items-center justify-evenly h-full flex-grow">
    {#if !zenMode}
      <div class="flex flex-col items-center gap-1">
        <h1 class="text-5xl font-light">
          Color <b class="font-extrabold">Pong</b>
        </h1>

        <div class="flex justify-center items-center">
          <a
            href="https://github.com/thcheetah777/color-pong"
            target="_blank"
            class="flex justify-center rounded-l-full h-full items-center border-y-2 border-l-2 border-white hover:bg-white hover:text-background duration-150 py-1.5 px-1.5 pl-2.5"
          >
            <iconify-icon icon="mingcute:github-fill" class="text-xl"></iconify-icon>
          </a>

          <button
            on:click={() => (themesOpen = !themesOpen)}
            class="flex justify-center h-full items-center border-y-2 border-white hover:bg-white hover:text-background duration-150 py-1.5 px-2"
          >
            <iconify-icon icon="mingcute:palette-fill" class="text-lg"></iconify-icon>
          </button>

          <button
            on:click={() => setZenMode(true)}
            class="flex justify-center rounded-r-full h-full items-center border-y-2 border-r-2 border-white hover:bg-white hover:text-background duration-150 py-1.5 px-1.5 pr-2.5"
          >
            <iconify-icon icon="mingcute:fullscreen-2-fill" class="text-lg"></iconify-icon>
          </button>
        </div>
      </div>
    {/if}

    <div class={cn(
      "relative duration-150",
      zenMode ? "size-[80dvh]" : "size-[25rem]"
    )}>
      <canvas
        bind:this={canvas}
        id="canvas"
        class="rounded-md hover:scale-[103%] shadow-2xl cursor-pointer w-full h-full duration-300"
        width="500"
        height="500"
      ></canvas>

      {#if themesOpen}
        <div
          class="absolute left-0 top-0 w-full h-full rounded-md bg-black/80 grid grid-cols-3 overflow-auto no-scrollbar"
          transition:fade={{ duration: 150 }}
        >
          {#each palettes as p, i}
            <button
              on:click={() => {
                setPalette(i);
                themesOpen = false;
              }}
              class="flex flex-col items-center justify-center gap-2 h-[7.5rem] duration-75 hover:scale-110 active:scale-100"
            >
              <div class="size-8 grid grid-rows-2 grid-cols-2 relative">
                <div class="rounded-tl-full" style:background={p.colors[0]}></div>
                <div class="rounded-tr-full" style:background={p.colors[2]}></div>
                <div class="rounded-bl-full" style:background={p.colors[1]}></div>
                <div class="rounded-br-full" style:background={p.colors[3]}></div>

                {#if p === palette}
                  <iconify-icon icon="mingcute:check-fill" class="text-lg absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></iconify-icon>
                {/if}
              </div>

              <h3>{p.value}</h3>
            </button>
          {/each}
        </div>
      {/if}
    </div>

  {#if !zenMode}
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

    <footer class="absolute flex bottom-2 left-4 text-sm gap-1">
      made with
      <a href="https://svelte.dev" target="_blank" class="flex items-start">
        <iconify-icon icon="ri:svelte-line" class="text-base"></iconify-icon>
      </a>
      x
      <iconify-icon icon="mingcute:heart-line" class="text-lg"></iconify-icon>
      x
      <a href="https://lospec.com/palette-list" target="_blank" class="flex items-start">
        <iconify-icon icon="simple-icons:lospec" class="text-md mt-0.5"></iconify-icon>
      </a>
    </footer>
  {/if}
</main>
