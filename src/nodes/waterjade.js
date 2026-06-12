// Waterjade nodes for litegraph.js
//
// Per-node visual properties (all optional, work on every Waterjade node):
//   - icon          string (emoji/unicode) OR Path2D — drawn in a 40x40
//                   colored square at the top-left of the title bar.
//   - icon_bgcolor  background color of the icon square (none by default).
//   - icon_color    fill color of the icon glyph (default white).
//   - outlined      bool — draws a 1px border around the whole node.
//   - outline_color border color when outlined (default Zinc-500).
//   - locked        bool — draws a 30x30 lock badge at the top-right of the
//                   title bar and disables slot/title editing.
//   - lock_tooltip  string shown when hovering the lock (default
//                   "no edit possible").
//   - onEditClick   function(node, graphcanvas) — when set, shows a pencil
//                   badge at the top-right instead of the lock. Clicking it
//                   calls this function. Mutually exclusive with locked.
//
// Node types registered:
//   - waterjade/node        generic, fully configurable; supports icon +
//                           optional edit badge via onEditClick
//   - waterjade/hru_input   special: one fixed output, locked, outlined
//   - waterjade/hru_output  special: one fixed input,  locked, outlined

(function (global) {
    var LiteGraph = global.LiteGraph;
    if (!LiteGraph) return;

    var WaterjadeNodeTypes = {
        NODE: "waterjade/node",
        HRU_INPUT: "waterjade/hru_input",
        HRU_OUTPUT: "waterjade/hru_output",
    };
    LiteGraph.WaterjadeNodeTypes = WaterjadeNodeTypes;

    var DEFAULT_TYPE = "wj";
    var ORANGE = "#F08C00";
    var WHITE = "#FFFFFF";
    var ZINC_300 = "#D4D4D8";
    var ZINC_500 = "#71717A";
    var ZINC_800 = "#27272A";
    var ZINC_700 = "#3F3F46";
    var BLACK_BODY = "#09090B";

    // ---- SVG icon paths (viewBox 0 0 20 20) ----
    var INPUT_PATH_D =
        "M17.7625 9.8C17.7625 14.1985 14.1985 17.7625 9.8 17.7625C9.29086 17.7625 8.88125 18.1721 8.88125 18.6813C8.88125 19.1904 9.29086 19.6 9.8 19.6C15.213 19.6 19.6 15.213 19.6 9.8C19.6 4.38703 15.213 0 9.8 0C9.29086 0 8.88125 0.409609 8.88125 0.91875C8.88125 1.42789 9.29086 1.8375 9.8 1.8375C14.1985 1.8375 17.7625 5.40148 17.7625 9.8ZM9.22578 14.432L13.207 10.4508C13.5669 10.0909 13.5669 9.50906 13.207 9.15305L9.22578 5.16797C8.86594 4.80813 8.28406 4.80813 7.92805 5.16797C7.57203 5.52781 7.5682 6.10969 7.92805 6.4657L10.3398 8.87742H0.91875C0.409609 8.87742 0 9.28703 0 9.79617C0 10.3053 0.409609 10.7149 0.91875 10.7149H10.3398L7.92805 13.1266C7.5682 13.4865 7.5682 14.0684 7.92805 14.4244C8.28789 14.7804 8.86977 14.7842 9.22578 14.4244V14.432Z";
    var OUTPUT_PATH_D =
        "M1.8375 9.8C1.8375 5.40148 5.40148 1.8375 9.8 1.8375C10.3091 1.8375 10.7188 1.42789 10.7188 0.91875C10.7188 0.409609 10.3091 0 9.8 0C4.38703 0 0 4.38703 0 9.8C0 15.213 4.38703 19.6 9.8 19.6C10.3091 19.6 10.7188 19.1904 10.7188 18.6813C10.7188 18.1721 10.3091 17.7625 9.8 17.7625C5.40148 17.7625 1.8375 14.1985 1.8375 9.8ZM15.0177 5.145C14.6464 4.80047 14.0645 4.81961 13.72 5.19477C13.3755 5.56992 13.3946 6.14797 13.7698 6.4925L16.3423 8.88125H7.04375C6.53461 8.88125 6.125 9.29086 6.125 9.8C6.125 10.3091 6.53461 10.7188 7.04375 10.7188H16.3423L13.7698 13.1075C13.3984 13.452 13.3755 14.0339 13.72 14.4052C14.0645 14.7766 14.6464 14.7995 15.0177 14.455L19.3052 10.4738C19.4928 10.3015 19.6 10.0565 19.6 9.8C19.6 9.54352 19.4928 9.30234 19.3052 9.12625L15.0177 5.145Z";
    // Lock icon (viewBox 0 0 11 13, evenodd)
    var LOCK_PATH_D =
        "M5.425 0C3.58805 0 2.1 1.48805 2.1 3.325V4.9H1.925C0.861852 4.9 0 5.76185 0 6.825V10.325C0 11.3881 0.861852 12.25 1.925 12.25H8.925C9.98815 12.25 10.85 11.3881 10.85 10.325V6.825C10.85 5.76185 9.98815 4.9 8.925 4.9H8.75V3.325C8.75 1.48805 7.26195 0 5.425 0ZM7.7 4.9V3.325C7.7 2.06795 6.68205 1.05 5.425 1.05C4.16795 1.05 3.15 2.06795 3.15 3.325V4.9H7.7ZM2.625 5.95H1.925C1.44175 5.95 1.05 6.34175 1.05 6.825V10.325C1.05 10.8082 1.44175 11.2 1.925 11.2H8.925C9.40825 11.2 9.8 10.8082 9.8 10.325V6.825C9.8 6.34175 9.40825 5.95 8.925 5.95H8.225H2.625Z";
    // Pencil icon (viewBox 0 0 13 13, evenodd)
    var PENCIL_PATH_D =
        "M9.93414 1.07885C9.58302 1.0707 9.27233 1.1852 9.07848 1.3794C9.06084 1.39708 9.04217 1.41334 9.02264 1.42815L1.28129 9.18377L1.12596 11.1164L3.08726 10.9396L10.8865 3.12602C11.079 2.93318 11.1857 2.63388 11.1724 2.29549C11.1591 1.95647 11.0263 1.6345 10.8147 1.42254C10.6096 1.21699 10.2853 1.087 9.93414 1.07885ZM8.38534 0.551889C8.82396 0.153231 9.40976 -0.0120661 9.95907 0.000682071C10.5373 0.0141003 11.1424 0.225617 11.5759 0.659955C12.0031 1.08788 12.2255 1.67899 12.2481 2.25306C12.2706 2.82777 12.0939 3.44156 11.6477 3.8886L3.71045 11.8404C3.62129 11.9298 3.50367 11.9849 3.37809 11.9962L0.586439 12.2478C0.428398 12.2621 0.272136 12.2057 0.159407 12.0938C0.0466787 11.982 -0.0110276 11.826 0.00170795 11.6675L0.224178 8.89947C0.234437 8.77183 0.289704 8.65201 0.380087 8.56146L8.3173 0.609622C8.33859 0.588291 8.36137 0.569027 8.38534 0.551889Z";

    // Path2D caches — built lazily so loading the file in a non-DOM context
    // (eg. tests) doesn't crash.
    var _inputPath = null;
    var _outputPath = null;
    var _lockPath = null;
    var _pencilPath = null;
    function inputPath() {
        if (_inputPath == null && typeof Path2D !== "undefined")
            _inputPath = new Path2D(INPUT_PATH_D);
        return _inputPath;
    }
    function outputPath() {
        if (_outputPath == null && typeof Path2D !== "undefined")
            _outputPath = new Path2D(OUTPUT_PATH_D);
        return _outputPath;
    }
    function lockPath() {
        if (_lockPath == null && typeof Path2D !== "undefined")
            _lockPath = new Path2D(LOCK_PATH_D);
        return _lockPath;
    }
    function pencilPath() {
        if (_pencilPath == null && typeof Path2D !== "undefined")
            _pencilPath = new Path2D(PENCIL_PATH_D);
        return _pencilPath;
    }

    // ---- drawing helpers ----

    function drawSvgPath(ctx, path, x, y, size, viewBoxW, color, viewBoxH, fillRule) {
        var vH = viewBoxH || viewBoxW;
        var scale = Math.min(size / viewBoxW, size / vH);
        var offX = (size - viewBoxW * scale) / 2;
        var offY = (size - vH * scale) / 2;
        ctx.save();
        ctx.translate(x + offX, y + offY);
        ctx.scale(scale, scale);
        ctx.fillStyle = color;
        ctx.fill(path, fillRule || "nonzero");
        ctx.restore();
    }

    // Renders the title-bar left icon. Replaces the default boxcolor circle.
    function drawTitleBox(node, ctx) {
        if (!node.icon) return;
        var th = LiteGraph.NODE_TITLE_HEIGHT;
        var pad = 7;
        var s = th - pad * 2; // 40
        var x = pad;
        var y = -th + pad;

        ctx.fillStyle = node.icon_bgcolor || ZINC_800;
        ctx.beginPath();
        ctx.roundRect(x, y, s, s, [8]);
        ctx.fill();

        var color = node.icon_color || WHITE;
        if (typeof Path2D !== "undefined" && node.icon instanceof Path2D) {
            var iconSize = node.icon_size || 28;
            var iconPad = (s - iconSize) / 2;
            drawSvgPath(
                ctx,
                node.icon,
                x + iconPad,
                y + iconPad,
                iconSize,
                node.icon_viewbox || 20,
                color
            );
        } else {
            ctx.fillStyle = color;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "600 22px 'Segoe UI Symbol', system-ui, sans-serif";
            ctx.fillText(String(node.icon), x + s / 2, y + s / 2 + 1);
            ctx.textBaseline = "alphabetic";
            ctx.textAlign = "left";
        }
    }

    function lockRect(node) {
        var th = LiteGraph.NODE_TITLE_HEIGHT;
        var size = 30;
        var pad = (th - size) / 2; // 12
        var x = node.size[0] - size - pad;
        var y = -th + pad;
        return { x: x, y: y, w: size, h: size };
    }

    function drawLockBadge(node, ctx) {
        var r = lockRect(node);
        ctx.fillStyle = "#3F3F46";
        ctx.strokeStyle = "#52525B";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, [6]);
        ctx.fill();
        ctx.stroke();

        var path = lockPath();
        if (path) {
            var glyphSize = 18;
            var glyphPad = (r.w - glyphSize) / 2;
            drawSvgPath(ctx, path, r.x + glyphPad, r.y + glyphPad, glyphSize, 11, ZINC_300, 13, "evenodd");
        }
    }

    function isMouseInsideLock(node, gc) {
        if (!gc || !gc.graph_mouse) return false;
        var r = lockRect(node);
        var mx = gc.graph_mouse[0] - node.pos[0];
        var my = gc.graph_mouse[1] - node.pos[1];
        return mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
    }

    function editRect(node) {
        var th = LiteGraph.NODE_TITLE_HEIGHT;
        var size = 30;
        var pad = (th - size) / 2;
        var x = node.size[0] - size - pad;
        var y = -th + pad;
        return { x: x, y: y, w: size, h: size };
    }

    function drawEditBadge(node, ctx, hovered) {
        var r = editRect(node);
        ctx.fillStyle = hovered ? "#52525B" : "#3F3F46";
        ctx.strokeStyle = "#52525B";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, [6]);
        ctx.fill();
        ctx.stroke();

        var path = pencilPath();
        if (path) {
            var glyphSize = 16;
            var glyphPad = (r.w - glyphSize) / 2;
            drawSvgPath(ctx, path, r.x + glyphPad, r.y + glyphPad, glyphSize, 13, ZINC_300, 13, "evenodd");
        }
    }

    function isMouseInsideEdit(node, gc) {
        if (!gc || !gc.graph_mouse) return false;
        var r = editRect(node);
        var mx = gc.graph_mouse[0] - node.pos[0];
        var my = gc.graph_mouse[1] - node.pos[1];
        return mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
    }

    function drawTooltip(ctx, anchorX, anchorY, text) {
        var prevFont = ctx.font;
        ctx.font = "500 11px 'Inter', 'Segoe UI', system-ui, sans-serif";
        var padX = 8;
        var padY = 5;
        var textWidth = ctx.measureText(text).width;
        var w = textWidth + padX * 2;
        var h = 22;
        var x = anchorX - w / 2;
        var y = anchorY - h - 8;

        ctx.fillStyle = "#3F3F46";
        ctx.strokeStyle = "#52525B";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x + 0.5, y + 0.5, w - 1, h - 1, [4]);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = WHITE;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x + w / 2, y + h / 2);
        ctx.textBaseline = "alphabetic";
        ctx.textAlign = "left";
        ctx.font = prevFont;
    }

    function drawForeground(node, ctx, gc) {
        var size = node.size;
        var th = LiteGraph.NODE_TITLE_HEIGHT;

        if (node.outlined) {
            ctx.strokeStyle = node.outline_color || ZINC_500;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(
                0.5,
                -th + 0.5,
                size[0] - 1,
                size[1] + th - 1,
                [8]
            );
            ctx.stroke();
        }

        if (node.locked) {
            drawLockBadge(node, ctx);
            if (isMouseInsideLock(node, gc)) {
                var r = lockRect(node);
                drawTooltip(
                    ctx,
                    r.x + r.w / 2,
                    r.y,
                    node.lock_tooltip || "no edit possible"
                );
                if (gc) gc.dirty_canvas = true;
            }
        } else if (node.onEditClick) {
            var hovered = isMouseInsideEdit(node, gc);
            drawEditBadge(node, ctx, hovered);
            if (hovered) gc && (gc.dirty_canvas = true);
        }
    }

    function applyVisualMixin(prototype) {
        prototype.computeSize = function (out) {
            var maxSlots = Math.max(
                this.inputs ? this.inputs.length : 0,
                this.outputs ? this.outputs.length : 0,
                1
            );
            var sh = LiteGraph.NODE_SLOT_HEIGHT;
            var h = (maxSlots - 1) * sh + 48;
            if (this.widgets && this.widgets.length) {
                for (var i = 0; i < this.widgets.length; i++) {
                    var w = this.widgets[i];
                    h += (w.computeSize ? w.computeSize(450)[1] : LiteGraph.NODE_WIDGET_HEIGHT) + 4;
                }
                h += 8;
            }
            var size = out || new Float32Array(2);
            size[0] = 450;
            size[1] = h;
            return size;
        };
        prototype.getConnectionPos = function (is_input, slot_number, out) {
            out = out || new Float32Array(2);
            if (this.flags && this.flags.collapsed) {
                return LiteGraph.LGraphNode.prototype.getConnectionPos.call(
                    this, is_input, slot_number, out
                );
            }
            var sh = LiteGraph.NODE_SLOT_HEIGHT;
            var offset = sh * 0.5;
            out[0] = is_input
                ? this.pos[0] + offset
                : this.pos[0] + this.size[0] + 1 - offset;
            out[1] = this.pos[1] + 24 + slot_number * sh;
            return out;
        };
        prototype.onDrawTitleBox = function (ctx) {
            drawTitleBox(this, ctx);
        };
        prototype.onDrawTitleText = function (ctx, titleH, size, scale, font, selected) {
            var title = String(this.getTitle ? this.getTitle() : (this.title || ""));
            if (!title) return;
            ctx.font = font;
            ctx.fillStyle = selected
                ? LiteGraph.NODE_SELECTED_TITLE_COLOR
                : (this.constructor.title_text_color || LiteGraph.NODE_TITLE_COLOR);
            ctx.textAlign = "left";
            var x = this.icon ? titleH : 12;
            ctx.fillText(title, x, LiteGraph.NODE_TITLE_TEXT_Y - titleH);
        };
        var prevForeground = prototype.onDrawForeground;
        prototype.onDrawForeground = function (ctx, gc, canvas) {
            if (prevForeground) prevForeground.call(this, ctx, gc, canvas);
            drawForeground(this, ctx, gc);
        };
        var prevMouseDown = prototype.onMouseDown;
        prototype.onMouseDown = function (e, pos, gc) {
            if (this.onEditClick) {
                var r = editRect(this);
                if (pos[0] >= r.x && pos[0] <= r.x + r.w &&
                    pos[1] >= r.y && pos[1] <= r.y + r.h) {
                    this.onEditClick(this, gc);
                    return true;
                }
            }
            return prevMouseDown ? prevMouseDown.call(this, e, pos, gc) : false;
        };
    }

    function lockSlots(node) {
        if (node.inputs) {
            for (var i = 0; i < node.inputs.length; i++) {
                node.inputs[i].nameLocked = true;
                node.inputs[i].removable = false;
            }
        }
        if (node.outputs) {
            for (var j = 0; j < node.outputs.length; j++) {
                node.outputs[j].nameLocked = true;
                node.outputs[j].removable = false;
            }
        }
    }

    // ---- generic configurable node ----
    function WaterjadeNode() {
        this.addInput("IN", DEFAULT_TYPE, { removable: true });
        this.addOutput("OUT", DEFAULT_TYPE, { removable: true });
        this.size[0] = 450;
    }
    WaterjadeNode.title = "Node";
    WaterjadeNode.desc =
        "Configurable node — right-click to add/remove/rename slots";
    WaterjadeNode.prototype.onGetInputs = function () {
        return [["IN", DEFAULT_TYPE]];
    };
    WaterjadeNode.prototype.onGetOutputs = function () {
        return [["OUT", DEFAULT_TYPE]];
    };
    WaterjadeNode.prototype.onExecute = function () {
        if (!this.outputs) return;
        for (var i = 0; i < this.outputs.length; i++) {
            this.setOutputData(i, this.getInputData(i));
        }
    };
    applyVisualMixin(WaterjadeNode.prototype);
    LiteGraph.registerNodeType(WaterjadeNodeTypes.NODE, WaterjadeNode);

    // ---- HRU Input ----
    function HRUInput() {
        this.addOutput("OUTPUT", DEFAULT_TYPE);
        this.size[0] = 450;
        this.title = "HRU Input";
        this.icon = inputPath();
        this.icon_bgcolor = ORANGE;
        this.locked = true;
        this.outlined = true;
        this.color = BLACK_BODY; // title bar matches body
        this.bgcolor = BLACK_BODY; // body
        this.outline_color = ZINC_500;
        lockSlots(this);
    }
    HRUInput.title = "HRU Input";
    HRUInput.desc = "HRU pipeline input — single output, non-editable";
    HRUInput.prototype.getMenuOptions = function () {
        return [
            { content: "Remove", callback: global.LGraphCanvas.onMenuNodeRemove },
        ];
    };
    applyVisualMixin(HRUInput.prototype);
    LiteGraph.registerNodeType(WaterjadeNodeTypes.HRU_INPUT, HRUInput);

    // ---- HRU Output ----
    function HRUOutput() {
        this.addInput("INPUT", DEFAULT_TYPE);
        this.size[0] = 450;
        this.title = "HRU Output";
        this.icon = outputPath();
        this.icon_bgcolor = ORANGE;
        this.locked = true;
        this.outlined = true;
        this.color = BLACK_BODY;
        this.bgcolor = BLACK_BODY;
        this.outline_color = ZINC_500;
        lockSlots(this);
    }
    HRUOutput.title = "HRU Output";
    HRUOutput.desc = "HRU pipeline output — single input, non-editable";
    HRUOutput.prototype.getMenuOptions = function () {
        return [
            { content: "Remove", callback: global.LGraphCanvas.onMenuNodeRemove },
        ];
    };
    applyVisualMixin(HRUOutput.prototype);
    LiteGraph.registerNodeType(WaterjadeNodeTypes.HRU_OUTPUT, HRUOutput);
})(this);
