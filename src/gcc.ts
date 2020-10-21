import axios, { AxiosRequestConfig } from "axios";
import { formdata } from "./formData";
import { save, get } from "./cache";
import { log } from "./log";


export const gcc = async (jscode: string, advanced = false) => {
    const level = advanced ? "ADVANCED_OPTIMIZATIONS" : "SIMPLE_OPTIMIZATIONS";
    const cache = get("gcc" + level, jscode);
    if (cache) return cache;
    const data = formdata({
        'compilation_level': level,
        'output_format': 'json',
        'output_info': 'compiled_code',
        'js_code': jscode
    });
    const config = {
        method: 'post',
        url: 'https://closure-compiler.appspot.com/compile',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    } as AxiosRequestConfig;
    return axios(config)
        .then(function (response) {
            if (typeof response.data["compiledCode"] === "undefined") return false;
            save("gcc" + level, jscode, response.data.compiledCode);
            return response.data.compiledCode;
        })
        .catch(function (error) {
            log("Error in gcc: ", error);
            return false;
        });
};

export default gcc;