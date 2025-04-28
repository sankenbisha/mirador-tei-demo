(function waitForMirador() {
  if (!window.Mirador || !window.Mirador.viewerInstance) {
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

  window.Mirador.viewer({
    id: "viewer",
    windows: [{
      manifestId: "./sample-manifest.json",
      canvasIndex: 0,
    }],
    window: {
      defaultSideBarPanel: 'teiPanel',
      sideBarPanels: ['info', 'annotations', 'teiPanel'],
    },
    panels: {
      teiPanel: {
        icon: '<svg viewBox="0 0 100 100"><text x="10" y="60" font-size="80">文</text></svg>',
        panel: ConnectedTeiPanel,
        title: '翻刻',
      }
    },
    workspaceControlPanel: {
      enabled: true,
    }
  });
})();
