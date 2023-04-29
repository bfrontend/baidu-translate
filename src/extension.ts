import { ITranslateRegistry, TranslateManager } from 'comment-translate-manager';
import * as vscode from 'vscode';
import { BaiduTranslate } from './baiduTranslate';

export function activate(context: vscode.ExtensionContext) {
    //Expose the plug-in
    const translateManager = new TranslateManager(context.workspaceState);
    return {
        extendTranslate: function (registry: ITranslateRegistry) {
            registry('baidu', BaiduTranslate);
            if (translateManager.hasSource('baidu')) {
                translateManager.setSource('baidu');
            }
        }
    };
}

// this method is called when your extension is deactivated
export function deactivate() {}
