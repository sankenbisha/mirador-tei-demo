(function waitForMirador() {
  if (!window.Mirador || !window.Mirador.viewerInstance) {
    setTimeout(waitForMirador, 100);
    return;
  }

  const { createElement, useState, useEffect } = React;

  const TeiPanel = ({ windowId }) => {
    const [teiHtml, setTeiHtml] = useState("読み込み中...");
    const [canvasIndex, setCanvasIndex] = useState(0);

    useEffect(() => {
      const store = window.Mirador.viewerInstance.store;
      const unsubscribe = store.subscribe(() => {
        const state = store.getState();
        const windows = Object.values(state.windows || {});
        if (windows.length > 0) {
          const idx = windows[0]?.canvasIndex ?? 0;
          setCanvasIndex(idx);
        }
      });
      return () => unsubscribe();
    }, []);

    useEffect(() => {
      fetch("./tei-pages.json")
        .then(res => res.json())
        .then(data => {
          const html = data.pages[canvasIndex] || "翻刻なし";
          setTeiHtml(html);
        });
    }, [canvasIndex]);

    return createElement("div", {
      style: { padding: "1rem", overflowY: "auto", height: "100%" },
      dangerouslySetInnerHTML: { __html: teiHtml }
    });
  };

  // プラグインとして登録
  const plugin = [
    {
      target: 'WindowSidebarButtons',
      mode: 'add',
      component: (props) => {
        return createElement('div', {
          style: { width: '100%', textAlign: 'center', padding: '8px' },
          onClick: () => props.showPanel('teiPanel'),
        }, '📄');
      },
      mapDispatchToProps: { showPanel: Mirador.actions.showPanel },
      mapStateToProps: (state, { windowId }) => ({ windowId }),
    },
    {
      target: 'WindowSidebarPanels',
      mode: 'add',
      component: (props) => {
        return createElement(TeiPanel, { windowId: props.windowId });
      },
      mapStateToProps: (state, { windowId }) => ({ windowId }),
      options: {
        panel: 'teiPanel',
        icon: '<svg viewBox="0 0 100 100"><text x="10" y="60" font-size="80">文</text></svg>',
        label: '翻刻',
      }
    }
  ];

  window.Mirador.viewer({
    id: "viewer",
    windows: [{
      manifestId: "./sample-manifest.json",
      canvasIndex: 0,
    }],
    workspaceControlPanel: {
      enabled: true,
    },
    sideBarPanel: 'teiPanel',
    plugins: plugin,
  });
})();
