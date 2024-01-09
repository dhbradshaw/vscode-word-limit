import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "word-limit" is now active!');

  let wordCounter = new WordCounter();
  let controller = new WordCountController(wordCounter);

  // Update the word count when the active editor is changed
  vscode.window.onDidChangeActiveTextEditor(() => {
    wordCounter.updateWordCount();
  });

  vscode.window.onDidChangeTextEditorSelection(() => {
    wordCounter.updateWordCount();
  });

  // Update the word count immediately when the extension is activated
  wordCounter.updateWordCount();

  context.subscriptions.push(controller);
  context.subscriptions.push(wordCounter);
}

export function deactivate() {}

export class WordCounter {
  private _statusBarItem: vscode.StatusBarItem =
    vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

  private _decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: "rgba(255,0,0,0.3)",
  });

  public updateWordCount() {
    // Get the current text editor
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
      this._statusBarItem.hide();
      return;
    }

    let doc = editor.document;

    // Only update status if an Markdown file
    if (doc.languageId === "markdown") {
      let wordLimit = this._getWordLimit(doc);
      let wordCount = this._getWordCount(doc);

      // Get status bar text
      if (wordLimit) {
        this._statusBarItem.text = `${wordCount}/${wordLimit} Words`;
      } else {
        this._statusBarItem.text =
          wordCount !== 1 ? `${wordCount} Words` : "1 Word";
      }

      if (wordLimit && wordCount > wordLimit) {
        this._statusBarItem.color = "red";
        // Set editor background color to red
        vscode.window.activeTextEditor?.setDecorations(this._decorationType, [
          new vscode.Range(0, 0, 1000, 1000),
        ]);
      } else {
        this._statusBarItem.color = undefined;
        // Remove editor background color, if any.
        vscode.window.activeTextEditor?.setDecorations(
          this._decorationType,
          []
        );
      }

      this._statusBarItem.show();
    } else {
      this._statusBarItem.hide();
    }
  }

  public _getWordLimit(doc: vscode.TextDocument): number | undefined {
    // User may optionally include a comment specifying the word limit with the following syntax:
    // <!-- target: 500 -->
    let wordLimit = undefined;
    let docContent = doc.getText();
    let wordLimitComment = docContent.match(/<!--\s*limit:\s*(\d+)\s*-->/);
    if (wordLimitComment) {
      wordLimit = parseInt(wordLimitComment[1]);
    }
    return wordLimit;
  }

  public _getWordCount(doc: vscode.TextDocument): number {
    let docContent = doc.getText();

    // Remove markdown comments
    docContent = docContent.replace(/<!--[\s\S]*?-->/g, "");

    // Parse out unwanted whitespace so the split is accurate
    docContent = docContent.replace(/(< ([^>]+)<)/g, "").replace(/\s+/g, " ");
    docContent = docContent.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
    let wordCount = 0;
    if (docContent !== "") {
      wordCount = docContent.split(" ").length;
    }

    return wordCount;
  }

  dispose() {
    this._statusBarItem.dispose();
  }
}

class WordCountController {
  private _wordCounter: WordCounter;
  private _disposable: vscode.Disposable;

  constructor(wordCounter: WordCounter) {
    this._wordCounter = wordCounter;
    this._wordCounter.updateWordCount();

    // subscribe to selection change and editor activation events
    let subscriptions: vscode.Disposable[] = [];
    vscode.window.onDidChangeTextEditorSelection(
      this._onEvent,
      this,
      subscriptions
    );
    vscode.window.onDidChangeActiveTextEditor(
      this._onEvent,
      this,
      subscriptions
    );

    // update the counter for the current file
    this._wordCounter.updateWordCount();

    // create a combined disposable from both event subscriptions
    this._disposable = vscode.Disposable.from(...subscriptions);
  }

  private _onEvent() {
    this._wordCounter.updateWordCount();
  }

  public dispose() {
    this._disposable.dispose();
  }
}
