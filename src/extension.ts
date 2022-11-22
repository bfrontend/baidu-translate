import { ITranslateRegistry } from 'comment-translate-manager';
import * as vscode from 'vscode';
import { BaiduTranslate } from './baiduTranslate';

export function activate(context: vscode.ExtensionContext) {
    //Expose the plug-in
    return {
        extendTranslate: function (registry: ITranslateRegistry) {
            registry('baidu', BaiduTranslate);
        }
    };
}

// this method is called when your extension is deactivated
export function deactivate() {}
