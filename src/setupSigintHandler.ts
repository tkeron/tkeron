export const setupSigintHandler = (stopCallback: () => Promise<void>) => {
  process.on("SIGINT", async () => {
    await stopCallback();
    process.exit(0);
  });
};
