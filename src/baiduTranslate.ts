const https = require('https');
const crypto = require('crypto');
const querystring = require('querystring');

import { workspace } from 'vscode';
import { ITranslate, ITranslateOptions } from 'comment-translate-manager';

const PREFIXCONFIG = 'baiduTranslate';

function md5Str(text: string) {
    return crypto.createHash('md5')
    .update(text)
    .digest('hex');
}

function sendRequest<T>(url: string): Promise<T> {
    return new Promise((resolve, reject) => {
      https.get(url, res => {
        if (res.statusCode === 200) {
          let list = [];
          res.on('data', chunk => {
            list.push(chunk);
          });
          res.on('end', () => {
            resolve(JSON.parse(Buffer.concat(list).toString()));
          });
        }
      });
    });
  }

export function getConfig<T>(key: string): T | undefined {
    let configuration = workspace.getConfiguration(PREFIXCONFIG);
    return configuration.get<T>(key);
}

interface BaiduTranslateOption {
    appId?: string;
    appKey?: string;
}
interface Response {
    form: string;
    to: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    trans_result: {
        src: string;
        dst: string
    }[]
}

export class BaiduTranslate implements ITranslate {
    get maxLen(): number {
        return 2000;
    }

    private _defaultOption: BaiduTranslateOption;
    constructor() {
        this._defaultOption = this.createOption();
        workspace.onDidChangeConfiguration(async eventNames => {
            if (eventNames.affectsConfiguration(PREFIXCONFIG)) {
                this._defaultOption = this.createOption();
            }
        });
    }

    createOption() {
        const defaultOption:BaiduTranslateOption = {
            appId: getConfig<string>('appId'),
            appKey: getConfig<string>('appKey')
        };
        return defaultOption;
    }

    async translate(content: string, { to = 'auto', from = 'auto' }: ITranslateOptions) {

        const { appId, appKey } = this._defaultOption;
        if(!appId || !appKey) {
            throw new Error('Please check the configuration of appId and appKey!');
        }
        const data = {
            q: content,
            from,
            to: 'zh',
            appid: appId,
            salt: Date.now() + '',
            sign: ''
        };
        data.sign = md5Str(`${appId}${content}${data.salt}${appKey}`);
        const url = 'https://api.fanyi.baidu.com/api/trans/vip/translate';
        let res = await sendRequest<Response>(`${url}?${querystring.stringify(data)}`);
        return res.trans_result[0].dst;
    }


    link(content: string, { to = 'auto', from = 'auto' }: ITranslateOptions) {
        let str = `https://fanyi.baidu.com/#${from}/${to}/${encodeURIComponent(content)}`;
        return `[baidu](${str})`;
    }

    isSupported(src: string) {
        return true;
    }
}





