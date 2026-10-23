#!/usr/bin/env python3
"""
Runs TransientShuffler.jsfx's own code in loose_eel, WDL's standalone EEL2
interpreter (the language JSFX is written in), against made-up drums.

REAPER isn't needed: its calls are stubbed, each section of the plug-in
becomes a function, and tests.eel drives them.

    python3 tests/run_tests.py /path/to/loose_eel

Build loose_eel from https://github.com/justinfrankel/WDL (WDL/eel2):
    make NO_GFX=1 MAXLOOP=1048576 loose_eel
MAXLOOP matches JSFX's limit of about a million passes per loop.
"""

import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
JSFX = os.path.join(HERE, "..", "TransientShuffler.jsfx")

STUBS = r"""
function gfx_set(r, g, b, a) ( stub_draws += 1; );
function gfx_rect(x, y, w, h) ( stub_draws += 1; (x != x || y != y || w != w || h != h) ? stub_nan += 1; );
function gfx_circle(x, y, r, f, a) ( stub_draws += 1; );
function gfx_roundrect(x, y, w, h, r) ( stub_draws += 1; );
function gfx_line(x, y, x2, y2, aa) ( stub_draws += 1; );
function gfx_triangle(a, b, c, d, e, f) ( stub_draws += 1; );
function gfx_drawstr(s, f, r, b) ( stub_texts += 1; );
function gfx_measurestr(s, w, h) ( 0; );
function gfx_setfont(i, f, s, fl) ( 0; );
function gfx_getfont(s) ( strcpy(s, stub_font_got); );
function gfx_getchar() ( stub_key; );
function gfx_getdropfile(i, s) ( i == 0 && stub_drop ? (strcpy(s, "/samples/Kick 808 long.wav"); 1) : 0; );
function gfx_showmenu(s) ( stub_menu_shown += 1; 0; );
function gfx_setcursor(i, n) ( stub_cursor = i; );
function export_buffer_to_project(b, n, c, s, t, f) ( stub_export_n = n; stub_export_buf = b; 1; );
function slider_automate(m) ( stub_automated |= m; );
function midisend(a, b, c, d) ( 0; );
function midirecv_stub() ( 0; );
function file_open(p) ( stub_fh; );
function file_avail(h) ( stub_avail; );
function file_mem(h, buf, n) ( memcpy(buf, stub_src + stub_rd, n); stub_rd += n; n; );
function file_close(h) ( 0; );
function file_string(h, s) ( 0; );
function file_var(h, v) ( 0; );
"""


def sections(text):
    out, name = {}, "header"
    for line in text.splitlines():
        m = re.match(r"^@(\w+)", line)
        if m:
            name = m.group(1)
            out[name] = []
            continue
        out.setdefault(name, []).append(line)
    return {k: "\n".join(v) for k, v in out.items()}


def adapt(code, maxlen):
    # REAPER calls that hand values back through their arguments, or whose
    # argument counts differ from the stubs, are swapped for test doubles.
    code = code.replace("file_riff(h, nch, fsr);", "nch = stub_nch; fsr = stub_sr;")
    code = code.replace("midirecv(ofs, m1, m2, m3)", "midirecv_stub()")
    code = code.replace("gfx_getdropfile(-1)", "gfx_getdropfile(-1, #drop)")
    code = code.replace("time_precise()", "time_precise(stub_tp)")
    if maxlen:
        code = code.replace("MAXLEN = 800000;", "MAXLEN = %d;" % maxlen)
    return code


def build(maxlen):
    src = sections(open(JSFX, encoding="utf-8").read())
    parts = [STUBS, adapt(src["init"], maxlen)]
    for sec in ("slider", "block", "sample", "serialize", "gfx"):
        parts.append("function sec_%s() (\n%s\n);" % (sec, adapt(src[sec], maxlen)))
    parts.append(open(os.path.join(HERE, "tests.eel"), encoding="utf-8").read())
    return "\n".join(parts)


def main():
    eel = sys.argv[1] if len(sys.argv) > 1 else "loose_eel"
    failed = False
    for maxlen in (0, 200000):
        prog = build(maxlen)
        with tempfile.NamedTemporaryFile("w", suffix=".eel", delete=False, encoding="utf-8") as f:
            f.write("full_size = %d;\n" % (maxlen == 0))
            f.write(prog)
            path = f.name
        r = subprocess.run([eel, "--no-args", path], capture_output=True, text=True)
        os.unlink(path)
        print(r.stdout, end="")
        if r.stderr:
            print(r.stderr, end="", file=sys.stderr)
        if r.returncode != 0 or "FAIL" in r.stdout or "error" in r.stderr.lower() or "ALL PASSED" not in r.stdout:
            failed = True
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
