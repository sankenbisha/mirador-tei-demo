(function waitForMirador() {
  if (!window.Mirador || !window.Mirador.viewerInstance) {
    setTimeout(waitForMirador, 100);
    return;
  }

  // Mirador起動後に実行
  const store = window.Mirador.viewerInstance.store;

  // 翻刻パネルを作成
  const teiPanel = document.createElement("div");
  teiPanel.id = "teiPanel";
  teiPanel.style.padding = "1rem";
  teiPanel.style.overflowY = "auto";
  teiPanel.style.height = "100%";
  teiPanel.innerHTML = "翻刻を読み込み中...";
  
  const sidePanel = document.createElement("div");
  sidePanel.appendChild(teiPanel);
  document.getElementById("viewer").appendChild(sidePanel);

  // 翻刻テキスト更新関数
  function updateTeiText(canvasIndex) {
    fetch("./tei-pages.json")
      .then(res => res.json())
      .then(data => {
        const html = data.pages[canvasIndex] || "翻刻なし";
        teiPanel.innerHTML = html;
      });
  }

  // Miradorの状態変化を監視
  store.subscribe(() => {
    const state = store.getState();
    const windows = Object.values(state.windows || {});
    const canvasIndex = windows[0]?.canvasIndex ?? 0;
    updateTeiText(canvasIndex);
  });

  // 初回ロード
  updateTeiText(0);
})();
