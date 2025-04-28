(function waitForMirador() {
  if (!window.Mirador) {
    setTimeout(waitForMirador, 100);
    return;
  }

  const { createElement, useState, useEffect } = React;
  const connect = Mirador.connect;

  const TeiPanel = ({ canvasIndex }) => {
    const [teiHtml, setTeiHtml] = useState("読み込み中...");

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

  const mapStateToProps = (state, { windowId }) => ({
    canvasIndex: state.windows[windowId]?.canvasIndex || 0
  });

  const ConnectedTeiPanel = connect(mapStateToProps)(TeiPanel);

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
        return createElement(ConnectedTeiPanel, { windowId: props.windowId });
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
