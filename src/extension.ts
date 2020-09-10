import open from 'open'
import copy from 'copy'
import * as vscode from 'vscode'
import { getSourcegraphUrl } from './config'
import { repoInfo } from './git'

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const { version } = require('../package.json')

/**
 * Displays an error message to the user.
 */
async function showError(err: Error): Promise<void> {
    await vscode.window.showErrorMessage(err.message)
}

const handleCommandErrors = <P extends unknown[], R>(command: (...args: P) => Promise<R>) => async (
    ...args: P
): Promise<R | void> => {
    try {
        return await command(...args)
    } catch (error) {
        await showError(error)
    }
}

/**
 * The command implementation for opening a cursor selection on Sourcegraph.
 */
async function openCommand(): Promise<void> {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
        throw new Error('No active editor')
    }
    const [remoteURL, branch, fileRel] = await repoInfo(editor.document.uri.fsPath)
    if (remoteURL === '') {
        return
    }

    // Open in browser.
    await open(
        `${getSourcegraphUrl()}/-/editor` +
            `?remote_url=${encodeURIComponent(remoteURL)}` +
            `&branch=${encodeURIComponent(branch)}` +
            `&file=${encodeURIComponent(fileRel)}` +
            `&editor=${encodeURIComponent('VSCode')}` +
            `&version=${encodeURIComponent(version)}` +
            `&start_row=${encodeURIComponent(String(editor.selection.start.line))}` +
            `&start_col=${encodeURIComponent(String(editor.selection.start.character))}` +
            `&end_row=${encodeURIComponent(String(editor.selection.end.line))}` +
            `&end_col=${encodeURIComponent(String(editor.selection.end.character))}`
    )
}

/**
 * The command implementation for searching a cursor selection on Sourcegraph.
 */
async function searchCommand(): Promise<void> {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
        throw new Error('No active editor')
    }
    const [remoteURL, branch, fileRel] = await repoInfo(editor.document.uri.fsPath)

    const query = editor.document.getText(editor.selection)
    if (query === '') {
        return // nothing to query
    }

    // Search in browser.
    await open(
        `${getSourcegraphUrl()}/-/editor` +
            `?remote_url=${encodeURIComponent(remoteURL)}` +
            `&branch=${encodeURIComponent(branch)}` +
            `&file=${encodeURIComponent(fileRel)}` +
            `&editor=${encodeURIComponent('VSCode')}` +
            `&version=${encodeURIComponent(version)}` +
            `&search=${encodeURIComponent(query)}`
    )
}

/**
 * The command implementation for copying a Sourcegraph page to the clipboard.
 */
async function copyCommand(): Promise<void> {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
        throw new Error('No active editor')
    }
    const [remoteURL, branch, fileRel] = await repoInfo(editor.document.uri.fsPath)
    if (remoteURL === '') {
        return
    }

    // Copy to clipboard.
    await copy (
        `${getSourcegraphUrl()}/-/editor` +
            `?remote_url=${encodeURIComponent(remoteURL)}` +
            `&branch=${encodeURIComponent(branch)}` +
            `&file=${encodeURIComponent(fileRel)}` +
            `&editor=${encodeURIComponent('VSCode')}` +
            `&version=${encodeURIComponent(version)}` +
            `&start_row=${encodeURIComponent(String(editor.selection.start.line))}` +
            `&start_col=${encodeURIComponent(String(editor.selection.start.character))}` +
            `&end_row=${encodeURIComponent(String(editor.selection.end.line))}` +
            `&end_col=${encodeURIComponent(String(editor.selection.end.character))}`
    )
}

/**
 * Open link from sourcegraph.com corresponding to a local file.
 */
async function editCommand(): Promise<void> {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
        throw new Error('No active editor')
    }
    //Get URL from user
    const input = await vscode.window.showInputBox("Sourcegraph URL: ")
    vscode.window.showInformationMessage(input)

    // Get file path
    var index = input.lastIndexOf("/") + 1
    var filename = input.substr(index)

    





}

/**
 * Called when the extension is activated.
 */
export function activate(context: vscode.ExtensionContext): void {
    // Register our extension commands (see package.json).
    context.subscriptions.push(vscode.commands.registerCommand('extension.open', handleCommandErrors(openCommand)))
    context.subscriptions.push(vscode.commands.registerCommand('extension.search', handleCommandErrors(searchCommand)))
    context.subscriptions.push(vscode.commands.registerCommand('extension.copy', handleCommandErrors(copyCommand)))
}

export function deactivate(): void {
    // no-op
}
