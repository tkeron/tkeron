import { exec as e } from "child_process";


export const exec = async (cmd: string): Promise<string> => {
    return new Promise((ok, _er) => {
        const cp = e(cmd, { encoding: "buffer" }, (_err, stdout, stderr) => {
            if (_err) {
                _er(stdout.toString("utf-8") + "\n" + stderr.toString("utf-8"));
                return;
            }
            const lerr = stderr.toString("utf-8");
            const lout = stdout.toString("utf-8");
            ok(`${lout}\n${lerr}`);
        });
    });
};

export default exec;
