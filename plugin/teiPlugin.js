(function() {
  const { createElement } = React;
  const { connect } = Mirador;

  const TeiPanel = ({ canvasIndex }) => {
    const [teiHtml, setTeiHtml] = React.useState("読み込み中...");

    React.useEffect(() => {
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
    canvasIndex: state.windows[windowId].canvasIndex
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
      sideBarPanel: ['info', 'annotations', 'teiPanel'],
    },
    workspaceControlPanel: {
      enabled: true,
    },
    panels: {
      teiPanel: {
        icon: '<svg viewBox="0 0 100 100"><text x="10" y="60" font-size="80">文</text></svg>',
        panel: ConnectedTeiPanel,
        title: '翻刻',
      }
    }
  });
})();
