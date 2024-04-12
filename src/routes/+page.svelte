<script lang="ts">
  import "../global.css";
  import "@fontsource/montserrat-alternates";
  import "@fontsource-variable/raleway";
  import "iconify-icon";
  import { onMount } from "svelte";

  import { type Ball, darkenColor, lerp, radianToVector } from "$lib/utils";
  import { type Palette, palettes } from "$lib/palettes";

  let canvas: HTMLCanvasElement;
  let colorCircles: HTMLDivElement[] = [];
  let scoreText: HTMLElement[] = [];

  const SQUARE_SIZE = 10;
  const BALL_SPEED_RANGE = 50;
  const BALL_SPEED = 8;

  onMount(() => {
    const numSquaresX = canvas.width / SQUARE_SIZE;
    const numSquaresY = canvas.height / SQUARE_SIZE;

    const squares: [string[]] = [[]];

    let ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
    let palette: Palette = palettes[Math.floor(Math.random() * palettes.length)];
    let targetSpeedScale = 1;
    let speedScale = 0;

    // Set color displays
    colorCircles[0].style.backgroundColor = palette.color1;
    colorCircles[1].style.backgroundColor = palette.color2;
    colorCircles[2].style.backgroundColor = palette.color3;
    colorCircles[3].style.backgroundColor = palette.color4;

    const balls: Ball[] = [
      {
        x: canvas.width / 4,
        y: canvas.height / 4,
        dx: 0,
        dy: 0,
        color: palette.color1,
        ballColor: darkenColor(palette.color1, -10),
      },
      {
        x: canvas.width / 4,
        y: (canvas.height / 4) * 3,
        dx: 0,
        dy: 0,
        color: palette.color2,
        ballColor: darkenColor(palette.color2, -10),
      },
      {
        x: (canvas.width / 4) * 3,
        y: canvas.height / 4,
        dx: 0,
        dy: 0,
        color: palette.color3,
        ballColor: darkenColor(palette.color3, -10),
      },
      {
        x: (canvas.width / 4) * 3,
        y: (canvas.height / 4) * 3,
        dx: 0,
        dy: 0,
        color: palette.color4,
        ballColor: darkenColor(palette.color4, -10),
      },
    ];

    // Click the canvas to pause
    canvas.onclick = () => {
      targetSpeedScale = targetSpeedScale ? 0 : 1;
    }

    // Populate squares
    for (let i = 0; i < numSquaresX; i++) {
      squares[i] = [];
      for (let j = 0; j < numSquaresX; j++) {
        if (i < numSquaresX / 2) {
          if (j < numSquaresY / 2) squares[i][j] = palette.color1;
          else squares[i][j] = palette.color2;
        } else {
          if (j < numSquaresY / 2) squares[i][j] = palette.color3;
          else squares[i][j] = palette.color4;
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
      let scores = [0, 0, 0, 0];

      for (let i = 0; i < numSquaresX; i++) {
        for (let j = 0; j < numSquaresX; j++) {
          ctx.fillStyle = squares[i][j];
          ctx.fillRect(
            i * SQUARE_SIZE,
            j * SQUARE_SIZE,
            SQUARE_SIZE,
            SQUARE_SIZE
          );

          if (squares[i][j] === palette.color1) scores[0]++;
          if (squares[i][j] === palette.color2) scores[1]++;
          if (squares[i][j] === palette.color3) scores[2]++;
          if (squares[i][j] === palette.color4) scores[3]++;
        }
      }

      scoreText.forEach((text, i) => text.innerText = scores[i].toString());
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

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawSquares();

      balls.forEach(ball => {
        drawBall(ball);
        checkSquareCollision(ball);
        checkBoundaryCollision(ball);

        ball.x += ball.dx * speedScale;
        ball.y += ball.dy * speedScale;

        addRandomness(ball);
      });

      speedScale = lerp(speedScale, targetSpeedScale, 0.15);

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
  class="bg-background h-screen textwhite text-white flex flex-col justify-evenly items-center font-sans relative"
>
  <h1 class="text-5xl">Color <b class="font-black">Pong</b></h1>

  <div class="size-[25rem]">
    <canvas
      bind:this={canvas}
      id="canvas"
      class="rounded-md shadow-2xl cursor-pointer w-full h-full"
      width="500"
      height="500"
    ></canvas>
  </div>

  <div class="flex items-center justify-center text-sm">
    <div class="flex items-center justify-center gap-2 w-[7rem]">
      <div class="size-4 rounded-full" bind:this={colorCircles[0]}></div>
      <h2 class="font-bold" bind:this={scoreText[0]}>140</h2>
    </div>
    <div class="flex items-center justify-center gap-2 w-[7rem]">
      <div class="size-4 rounded-full" bind:this={colorCircles[1]}></div>
      <h2 class="font-bold" bind:this={scoreText[1]}>140</h2>
    </div>
    <div class="flex items-center justify-center gap-2 w-[7rem]">
      <div class="size-4 rounded-full" bind:this={colorCircles[2]}></div>
      <h2 class="font-bold" bind:this={scoreText[2]}>140</h2>
    </div>
    <div class="flex items-center justify-center gap-2 w-[7rem]">
      <div class="size-4 rounded-full" bind:this={colorCircles[3]}></div>
      <h2 class="font-bold" bind:this={scoreText[3]}>140</h2>
    </div>
  </div>
</main>
