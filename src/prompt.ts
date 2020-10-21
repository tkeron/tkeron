import readline from "readline";

export const prompt = async (question: string): Promise<string> => {
    return new Promise((ok, _e) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(question, (res) => {
            ok(res);
            rl.close();
        });
    });
};

export default prompt;