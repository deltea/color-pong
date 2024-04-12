<script lang="ts">
  import { Button } from "bits-ui";
  import { cn } from "$lib/utils";

  let className = "";
  export { className as class };
</script>

<Button.Root class={cn(
  "px-4 py-2 text-lg flex gap-2 items-center hover:scale-105 duration-150 active:scale-95 rounded-lg bg-faded",
  className
)}>
  <slot />
</Button.Root>
