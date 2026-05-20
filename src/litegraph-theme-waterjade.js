// Waterjade visual theme for litegraph.js
//
// Usage:
//   LiteGraph.applyWaterjadeTheme(graphcanvas)
//
// The global LiteGraph.* constants are tweaked so newly created nodes pick up
// the palette; per-canvas fields are set on the passed-in LGraphCanvas
// instance. Call again after replacing the canvas.

(function (global) {
    var LiteGraph = global.LiteGraph;
    if (!LiteGraph) return;

    var palette = {
        bg: "#000000",
        node: "#18181B",            // generic node body & title bg (Zinc-900)
        nodeTitle: "#18181B",
        titleSeparator: "#27272A",  // 1px line between title and body (Zinc-800)
        widgetBg: "#0F0F10",
        widgetOutline: "#27272A",
        boxIdle: "#27272A",
        textPrimary: "#FFFFFF",
        textSecondary: "#A1A1AA",   // Zinc-400
        link: "#FFFFFF",
        portIdle: "#F08C00",
        portActive: "#FFAA33",
        portConnecting: "#FFAA33",
    };

    LiteGraph.WATERJADE_PALETTE = palette;

    LiteGraph.applyWaterjadeTheme = function (graphcanvas) {
        // ---- Global geometry tokens ----
        // header height 54 = 40px icon + 7px padding top/bottom
        LiteGraph.NODE_TITLE_HEIGHT = 54;
        // baseline so the title text sits vertically centered against the icon
        LiteGraph.NODE_TITLE_TEXT_Y = 30;
        LiteGraph.NODE_SLOT_HEIGHT = 26;
        LiteGraph.NODE_WIDGET_HEIGHT = 28;

        // ---- Global color tokens ----
        LiteGraph.NODE_TITLE_COLOR = palette.textPrimary;
        LiteGraph.NODE_SELECTED_TITLE_COLOR = palette.textPrimary;
        LiteGraph.NODE_TEXT_COLOR = palette.textPrimary;
        LiteGraph.NODE_TEXT_SIZE = 13;
        LiteGraph.NODE_SUBTEXT_SIZE = 12;
        LiteGraph.NODE_DEFAULT_COLOR = palette.nodeTitle;
        LiteGraph.NODE_DEFAULT_BGCOLOR = palette.node;
        LiteGraph.NODE_DEFAULT_BOXCOLOR = palette.boxIdle;
        LiteGraph.NODE_BOX_OUTLINE_COLOR = "#22D3EE";
        LiteGraph.NODE_DEFAULT_SHAPE = "round";
        LiteGraph.DEFAULT_SHADOW_COLOR = "rgba(0,0,0,0)";

        LiteGraph.WIDGET_BGCOLOR = palette.widgetBg;
        LiteGraph.WIDGET_OUTLINE_COLOR = palette.widgetOutline;
        LiteGraph.WIDGET_TEXT_COLOR = palette.textPrimary;
        LiteGraph.WIDGET_SECONDARY_TEXT_COLOR = palette.textSecondary;

        LiteGraph.LINK_COLOR = palette.link;
        LiteGraph.EVENT_LINK_COLOR = palette.link;
        LiteGraph.CONNECTING_LINK_COLOR = palette.portConnecting;

        if (global.LGraphCanvas) {
            global.LGraphCanvas.link_type_colors = {
                "-1": palette.link,
                number: palette.link,
                node: palette.link,
            };
            global.LGraphCanvas.DEFAULT_BACKGROUND_IMAGE = "";
        }

        // ---- Per-canvas instance overrides ----
        if (!graphcanvas) return;

        graphcanvas.background_image = "";
        graphcanvas.clear_background = true;
        graphcanvas.clear_background_color = palette.bg;
        graphcanvas.render_canvas_border = false;
        graphcanvas.render_shadows = false;
        graphcanvas.render_connections_border = false;
        graphcanvas.render_connections_shadows = false;
        graphcanvas.render_curved_connections = true;
        graphcanvas.render_link_centers = false;
        graphcanvas.allow_collapse = false;
        graphcanvas.links_render_mode = LiteGraph.SPLINE_LINK;
        graphcanvas.round_radius = 8;
        graphcanvas.connections_width = 1.5;

        // 1px line between title bar and body
        graphcanvas.title_separator_color = palette.titleSeparator;
        graphcanvas.title_separator_height = 1;

        graphcanvas.node_title_color = palette.textPrimary;
        graphcanvas.default_link_color = palette.link;

        graphcanvas.title_text_font =
            "500 13px 'Inter', 'Segoe UI', system-ui, sans-serif";
        graphcanvas.inner_text_font =
            "400 12px 'Inter', 'Segoe UI', system-ui, sans-serif";

        graphcanvas.default_connection_color = {
            input_off: palette.portIdle,
            input_on: palette.portActive,
            output_off: palette.portIdle,
            output_on: palette.portActive,
        };
        graphcanvas.default_connection_color_byType = {};
        graphcanvas.default_connection_color_byTypeOff = {};

        if (graphcanvas.canvas) {
            graphcanvas.canvas.style.backgroundColor = palette.bg;
            var parent = graphcanvas.canvas.parentElement;
            if (parent) parent.style.backgroundColor = palette.bg;
        }

        // Suppress the built-in litegraph settings panel that opens on
        // double-click — it covers half the canvas with an HTML overlay
        // styled in litegraph's default theme.
        graphcanvas.onShowNodePanel = function () {};

        graphcanvas._waterjade_theme = true;

        if (graphcanvas.setDirty) graphcanvas.setDirty(true, true);
    };
})(typeof window !== "undefined" ? window : globalThis);
