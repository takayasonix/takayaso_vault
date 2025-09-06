const { Plugin } = require('obsidian');

module.exports = class KeepListMarkerPlugin extends Plugin {
  onload() {
    // ① 箇条書きを残して「行頭まで削除」
    this.addCommand({
      id: 'delete-to-line-start-keep-bullet',
      name: 'Delete to line start (keep bullet)',
      editorCallback: (editor) => {
        const c = editor.getCursor();
        const line = editor.getLine(c.line);

        // マーカー（- * 1. など）+ タスク [ ] / [x] に対応
        const m = line.match(/^(\s*(?:[-*]|\d+\.)(?:\s+\[[ xX]\])?\s+)/);
        const markerLen = m ? m[0].length : 0;

        const fromCh = markerLen > 0 ? markerLen : 0;
        editor.replaceRange("", { line: c.line, ch: fromCh }, { line: c.line, ch: c.ch });
      }
    });

    // ② Ctrl+A 動作を「マーカー直後 ↔ 列0」でトグル
    this.addCommand({
      id: 'smart-line-home-keep-bullet',
      name: 'Smart line home (toggle at list marker)',
      editorCallback: (editor) => {
        const c = editor.getCursor();
        const line = editor.getLine(c.line);

        // 箇条書き/タスク/番号つき対応
        const m = line.match(/^(\s*(?:[-*]|\d+\.)(?:\s+\[[ xX]\])?\s+)/);
        const markerLen = m ? m[0].length : 0;

        // 先頭の空白だけの行は最初の非空白位置を計算
        const firstNonSpace = (() => {
          const idx = line.search(/\S/);
          return idx === -1 ? 0 : idx;
        })();

        // 「論理的な行頭」= マーカー直後 > それが無ければ最初の非空白
        const logicalStart = markerLen > 0 ? markerLen : firstNonSpace;

        // 現在位置に応じてトグル：右側にいれば logicalStart、すでに logicalStart なら 0 へ、それ以外なら logicalStart
        let targetCh;
        if (c.ch > logicalStart) targetCh = logicalStart;
        else if (c.ch === logicalStart) targetCh = 0;
        else targetCh = logicalStart;

        editor.setCursor({ line: c.line, ch: targetCh });
      }
    });

  }
};
