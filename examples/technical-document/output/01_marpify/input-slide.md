---
marp: true
---

<div style="text-align: center;">
# WebAssembly（Wasm）入門
</div>

---

## WebAssemblyとは

WebAssembly（略称：Wasm）は、モダンウェブブラウザで実行可能な新しいタイプのコードです。低レベルのアセンブリ風言語であり、コンパクトなバイナリフォーマットでコンパイルされ、ネイティブに近いパフォーマンスで実行されます。C、C++、Rustなどの言語からコンパイルすることができます。

---

## Wasmの主な特徴

1. **効率性**: バイナリフォーマットにより、ファイルサイズが小さく、解析も高速
2. **高速実行**: 最適化された仮想マシンで実行され、ネイティブコードに近いパフォーマンス
3. **安全性**: メモリ保護、サンドボックス化された実行環境を提供
4. **オープン標準**: W3Cにより標準化された仮想命令セットアーキテクチャ
5. **言語非依存**: 多くのプログラミング言語からコンパイル可能

---

## Wasmのユースケース

* 計算負荷の高いウェブアプリケーション（画像/動画編集、3Dレンダリング）
* ゲーム開発（特に既存のC/C++コードベースの移植）
* シミュレーションや科学計算
* 既存のデスクトップアプリケーションのウェブ移植
* IoTデバイスやエッジコンピューティング環境での実行

---

## Wasmの基本的なワークフロー

```
[C/C++/Rust等のソースコード] → [Wasmコンパイラ] → [.wasmバイナリ] → [ブラウザでの実行]
```

---

## Emscriptenによるコンパイル例

C言語からWebAssemblyへのコンパイル例：

```c
// hello.c
#include <stdio.h>

int main() {
  printf("Hello, WebAssembly!\n");
  return 0;
}
```

コンパイルコマンド：

```bash
emcc hello.c -o hello.html
```

---

## JavaScriptからのWasm呼び出し

```javascript
// WebAssemblyモジュールを読み込む
WebAssembly.instantiateStreaming(fetch('module.wasm'))
  .then(obj => {
    // エクスポートされた関数を呼び出す
    const result = obj.instance.exports.add(1, 2);
    console.log(result); // 3
  });
```

---

## WASI（WebAssembly System Interface）

WebAssemblyはブラウザだけでなく、WASI仕様によりサーバーサイドやエッジでも利用可能になりつつあります。WASIは、ファイルシステムアクセスやネットワーク機能などのシステムインターフェースを標準化します。

---

## まとめ

WebAssemblyは、ウェブプラットフォームに高性能で安全なコード実行環境をもたらし、様々な言語で書かれたコードをブラウザで実行可能にします。今後、ブラウザ内だけでなく、サーバーサイドや組み込みデバイスなど多様な環境でますます重要な役割を果たすことが期待されています。