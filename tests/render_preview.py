#!/usr/bin/env python3
"""
Draws pictures of the plug-in's window without REAPER: its @gfx code runs in
loose_eel with drawing calls that print what they would draw, and PIL draws
that. Text widths are estimated, so long names are cut a little differently
than in REAPER; everything else is the plug-in's own layout.

    python3 tests/render_preview.py /path/to/loose_eel out_dir
"""

import os
import re
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import run_tests  # noqa: E402

FONT = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
FONT_B = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

STUBS = r"""
function gfx_set(r, g, b, a) ( printf("C\t%f\t%f\t%f\t%f\n", r, g, b, a); );
function gfx_rect(x, y, w, h) ( printf("R\t%f\t%f\t%f\t%f\n", x, y, w, h); );
function gfx_circle(x, y, r, f, a) ( printf("O\t%f\t%f\t%f\t%d\n", x, y, r, f); );
function gfx_roundrect(x, y, w, h, r) ( printf("Q\t%f\t%f\t%f\t%f\t%f\n", x, y, w, h, r); );
function gfx_line(x, y, x2, y2, aa) ( printf("L\t%f\t%f\t%f\t%f\n", x, y, x2, y2); );
function gfx_triangle(a, b, c, d, e, f) ( printf("P\t%f\t%f\t%f\t%f\t%f\t%f\n", a, b, c, d, e, f); );
function gfx_drawstr(s, f, r, b) ( printf("T\t%f\t%f\t%f\t%f\t%d\t%s\n", gfx_x, gfx_y, r, b, f, s); );
function gfx_setfont(i, f, s, fl) ( cur_font_sz = s; printf("F\t%f\t%d\n", s, fl == 'b'); );
function gfx_getfont(s) ( strcpy(s, "Arial"); );
function gfx_getchar() ( 0; );
function gfx_getdropfile(i, s) ( 0; );
function gfx_showmenu(s) ( 0; );
function gfx_setcursor(i, n) ( 0; );
function export_buffer_to_project(b, n, c, s, t, f) ( 0; );
function slider_automate(m) ( 0; );
function midisend(a, b, c, d) ( 0; );
function midirecv_stub() ( 0; );
function file_open(p) ( -1; );
function file_avail(h) ( 0; );
function file_mem(h, buf, n) ( 0; );
function file_close(h) ( 0; );
function file_string(h, s) ( 0; );
function file_var(h, v) ( 0; );
"""

SCENES = r"""
srate = 48000;
function synth(src, n, on, f0, decay, click, seed) local(bl, br, i, t, ph, x)
(
  bl = s_L[src]; br = s_R[src]; ph = 0; i = 0;
  loop(n,
    t = (i - on) / srate;
    i < on ? (x = (rand(2) - 1) * 0.0003) : (
      ph += 2 * $pi * (f0 + 150 * exp(-t / 0.012)) / srate;
      x = 0.8 * exp(-t / decay) * sin(ph + seed) + click * (rand(2) - 1) * exp(-t / 0.002);
    );
    bl[i] = x; br[i] = 0.9 * x; i += 1;
  );
  s_len[src] = n; s_fsr[src] = 44100; s_nch[src] = 2;
);
function frame(name) ( printf("BEGIN\t%s\t%d\t%d\n", name, gfx_w, gfx_h); sec_gfx(); printf("END\n"); );

gfx_ext_retina = 2; gfx_w = 1640; gfx_h = 1408; mouse_x = mouse_y = -1;
attack_ms = 30; xfade_ms = 10; trim_db = 0; match_on = 1; align_on = 1; onset_db = -30;
result_sel = 0; midi_plays = 0; out_db = 0; thru_on = 1; view_mode = 1; ui_zoom = 1; find_on = 1; snap_on = 0;

frame("empty");

synth(0, 90000, 2400, 50, 0.6, 0.05, 0);
synth(1, 30000, 700, 90, 0.08, 0.9, 1);
strcpy(#pathA, "/Samples/808 Long Boom.wav"); base_name(#nameA, #pathA);
strcpy(#pathB, "/Samples/Punchy Kick 04.wav"); base_name(#nameB, #pathB);
loaded_sr = srate; onset_stale = 1; dirty = 1;
frame("loaded");

// Hovering the splice line while the result plays.
play_on = 1; play_src = 2; play_pos = s_on[2] + 0.018 * srate; last_v = 0;
v_on[0] = 1; v_src[0] = 2; v_pos[0] = play_pos;
frame("warmup");
mouse_x = splice_x; mouse_y = rowR_y + 40;
frame("splice");

// Keyboard focus on a slider, and a message offering Undo.
mouse_x = mouse_y = -1; play_on = 0; v_on[0] = 0;
focus_id = 2; strcpy(#status, "Replaced sample B with Punchy Kick 04.wav."); undo_mask = 2;
frame("keyboard");

// A file that couldn't be read.
focus_id = 0; s_err[1] = 1; s_len[1] = 0; dirty = 1; status_warn = 1;
strcpy(#status, "Couldn't read Broken.wav. Drop a WAV, AIFF, FLAC, MP3 or OGG file instead."); strcpy(#nameB, "Broken.wav");
frame("error");
s_err[1] = 0; synth(1, 30000, 700, 90, 0.08, 0.9, 1); strcpy(#nameB, "Punchy Kick 04.wav"); strcpy(#status, ""); undo_mask = 0; status_warn = 0; dirty = 1;

view_mode = 0; result_sel = 1; dirty = 1;
frame("whole");

gfx_ext_retina = 1; gfx_w = 820; gfx_h = 704; view_mode = 1; result_sel = 0; dirty = 1;
frame("small");

// Find attack off, Snap to zero crossings on, the splice set by hand.
gfx_ext_retina = 2; gfx_w = 1640; gfx_h = 1408; find_on = 0; snap_on = 1; attack_ms = 31.3; xfade_ms = 2; dirty = 1;
frame("snap");
find_on = 1; snap_on = 0; attack_ms = 30; xfade_ms = 10; dirty = 1;

// 200% interface size in a window big enough for it.
ui_zoom = 2; gfx_w = 1640; gfx_h = 1408; dirty = 1;
frame("zoom200");
"""


def adapt(code, maxlen):
    code = run_tests.adapt(code, maxlen)
    code = re.sub(r"gfx_measurestr\(([^,]+), tw, th\);", r"tw = strlen(\1) * cur_font_sz * 0.48; th = cur_font_sz;", code)
    return code


def program():
    src = run_tests.sections(open(run_tests.JSFX, encoding="utf-8").read())
    parts = [STUBS, adapt(src["init"], 200000)]
    for sec in ("slider", "block", "sample", "serialize", "gfx"):
        parts.append("function sec_%s() (\n%s\n);" % (sec, adapt(src[sec], 200000)))
    parts.append(SCENES)
    return "\n".join(parts)


def draw(cmds, w, h, path):
    img = Image.new("RGB", (w, h), (0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    col = (0, 0, 0, 255)
    font = ImageFont.truetype(FONT, 14)
    for c in cmds:
        k, a = c[0], c[1:]
        if k == "C":
            r, g, b, al = (float(v) for v in a)
            col = (int(r * 255 + .5), int(g * 255 + .5), int(b * 255 + .5), int(al * 255 + .5))
        elif k == "F":
            font = ImageFont.truetype(FONT_B if a[1] == "1" else FONT, max(6, int(float(a[0]))))
        elif k == "R":
            x, y, rw, rh = (float(v) for v in a)
            if rw >= 1 and rh >= 1:
                d.rectangle([x, y, x + rw - 1, y + rh - 1], fill=col)
        elif k == "O":
            x, y, r = (float(v) for v in a[:3])
            if a[3] == "1":
                d.ellipse([x - r, y - r, x + r, y + r], fill=col)
            else:
                d.ellipse([x - r, y - r, x + r, y + r], outline=col)
        elif k == "Q":
            x, y, rw, rh, r = (float(v) for v in a)
            d.rounded_rectangle([x, y, x + rw, y + rh], radius=r, outline=col)
        elif k == "L":
            x, y, x2, y2 = (float(v) for v in a)
            d.line([x, y, x2, y2], fill=col, width=1)
        elif k == "P":
            p = [float(v) for v in a]
            d.polygon([(p[0], p[1]), (p[2], p[3]), (p[4], p[5])], fill=col)
        elif k == "T":
            x, y, right, bottom = (float(v) for v in a[:4])
            flags, text = int(a[4]), "\t".join(a[5:])
            l, t, r, b = d.textbbox((0, 0), text, font=font)
            tw, th = r - l, font.size
            if flags & 1:
                x = x + (right - x - tw) / 2
            elif flags & 2:
                x = right - tw
            if flags & 4:
                y = y + (bottom - y - th) / 2
            elif flags & 8:
                y = bottom - th
            d.text((x, y), text, font=font, fill=col)
    img.save(path)


def main():
    eel, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", suffix=".eel", delete=False, encoding="utf-8") as f:
        f.write(program())
        path = f.name
    r = subprocess.run([eel, "--no-args", path], capture_output=True, text=True)
    os.unlink(path)
    if r.stderr:
        print(r.stderr, file=sys.stderr)
    scene, cmds = None, []
    for line in r.stdout.splitlines():
        parts = line.split("\t")
        if parts[0] == "BEGIN":
            scene, w, h, cmds = parts[1], int(parts[2]), int(parts[3]), []
        elif parts[0] == "END":
            if scene != "warmup":
                draw(cmds, w, h, os.path.join(out, scene + ".png"))
                print(os.path.join(out, scene + ".png"))
        elif scene:
            cmds.append(parts)


if __name__ == "__main__":
    main()
