export async function showBanner() {
  const packageJson = await import("../package.json");
  console.log(`\x1b[34m
   _______  _  __  _____  ____    ___   _   _
  |__   __|| |/ / |  ___||    \\  /   \\ | \\ | |
     | |   |   /  |  __| |  ^ / |  ^  ||  \\| |
     | |   | |\\ \\ | |___ | |\\ \\ |  v  || |\\  |
     |_|   |_| \\_\\|_____||_| \\_\\ \\___/ |_| \\_|
\x1b[0m
     \x1b[1mtkeron\x1b[0m  ${packageJson.version}
     \x1b[1mbun\x1b[0m     ${Bun.version}
 

     type '\x1b[1mtkeron help\x1b[0m' to see commands`);
}
