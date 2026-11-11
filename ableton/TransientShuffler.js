/* Transient Shuffler - built by ableton/kit/build.py from ableton/device.json. Do not edit; edit the sources and rebuild. */
var DEVICE = {"audio": true, "drops": true, "fromWindow": ["ui_trig", "ui_trig_src", "ui_stop"], "main": "TransientShuffler.jsfx", "title": "Transient Shuffler"};
DEVICE.files = {"TransientShuffler.jsfx": "desc:Transient Shuffler\n//author: Kallum Shah\n//version: 1.0\n//about:\n//  Give one sample the attack of another. Drop two samples on the window:\n//  the result keeps A's body (its sustain and tail) and takes B's attack, or\n//  the other way round. Play it from the window or with MIDI notes, and print\n//  it to the project as a new item.\n//tags: sampler transient drum hybrid instrument\n\n/*\n  How the swap works\n\n  1. Each sample's hit is found: the first moment it gets within the onset\n     threshold of its own peak. The two hits are lined up there.\n  2. Up to the attack length after the hit (plus 5 ms before it, so the\n     rise isn't clipped) the result is the attack sample.\n  3. From the attack length the two are crossfaded. With \"Align phase\" on,\n     the body is first slid up to 2.5 ms (and flipped if that matches\n     better) so the splice adds rather than cancels; the crossfade's shape\n     follows how alike the two are there, so the level holds either way.\n  4. After the crossfade it is the body sample, untouched.\n\n  With \"Find attack\" on, the attack length is where the attack sample's own\n  attack ends, measured from the sound (find_attack_end, decision 0012).\n  With \"Snap to zero crossings\" on, the splice moves up to 5 ms to where\n  both sounds cross zero together (0013).\n\n  \"Match level\" scales the borrowed attack so its peak equals the body\n  sample's own attack peak: the result is as loud as the sample it replaces.\n\n  Colours are the house scheme (Good Idea's docs/COLOUR.md, as in\n  Miderator's Theme.h): a dark cool-grey ground, light grey controls with\n  dark ink, one yellow for what is switched on, sounding or being dragged,\n  red only for what went wrong.\n*/\n\nslider1:attack_ms=30<2,250,0.1>-Attack length (ms)\nslider2:xfade_ms=10<0.5,100,0.1>-Crossfade (ms)\nslider3:trim_db=0<-24,24,0.1>-Attack trim (dB)\nslider4:match_on=1<0,1,1{Off,On}>-Match level\nslider5:align_on=1<0,1,1{Off,On}>-Align phase\nslider6:onset_db=-30<-60,-6,1>-Hit threshold (dB below peak)\nslider7:result_sel=0<0,1,1{A with B's attack,B with A's attack}>-Result\nslider8:midi_plays=0<0,2,1{The result,Sample A,Sample B}>-MIDI notes play\nslider9:out_db=0<-24,12,0.1>-Output (dB)\nslider10:thru_on=1<0,1,1{Off,On}>-Pass input audio through\nslider11:find_on=1<0,1,1{Off,On}>-Find attack\nslider12:snap_on=0<0,1,1{Off,On}>-Snap to zero crossings\n\nin_pin:left input\nin_pin:right input\nout_pin:left output\nout_pin:right output\n\n@init\next_noinit = 1;\ngfx_ext_retina = 1;\n\n// ---- Memory: four sounds, each planar stereo -------------------------------\nMAXLEN = 800000;              // frames per sound: 16.6 s at 48 kHz\nCHUNK = 65536;\nPEAKW = 4096;                 // widest waveform drawn, in pixels\nNV = 8;                       // voices\n\nA_L = 0;            A_R = MAXLEN;\nB_L = 2 * MAXLEN;   B_R = 3 * MAXLEN;\nH1_L = 4 * MAXLEN;  H1_R = 5 * MAXLEN;   // A's body, B's attack\nH2_L = 6 * MAXLEN;  H2_R = 7 * MAXLEN;   // B's body, A's attack\nSCRATCH = 8 * MAXLEN;                     // 2 * MAXLEN: loading, printing\nCHUNKBUF = 10 * MAXLEN;\nPEAKS = CHUNKBUF + CHUNK;                 // 3 rows of min/max per pixel\nTABLES = PEAKS + 3 * 2 * PEAKW;\n\nv_src = TABLES; v_pos = v_src + NV; v_gain = v_pos + NV; v_on = v_gain + NV;\n// Per sound: 0 = A, 1 = B, 2 = A with B's attack, 3 = B with A's attack\ns_L = v_on + NV; s_R = s_L + 4; s_len = s_R + 4; s_on = s_len + 4;\ns_pk = s_on + 4; s_fsr = s_pk + 4; s_nch = s_fsr + 4; s_err = s_nch + 4;\ns_lag = s_err + 4; s_pol = s_lag + 4; s_gain = s_pol + 4;\ns_tend = s_gain + 4;                      // A and B: where the attack ends (0 if not found)\ns_att = s_tend + 4; s_xf = s_att + 4; s_s0 = s_xf + 4;   // results: their splice\nFOCUS = s_s0 + 4;                         // the window's controls, in Tab order\nATK = FOCUS + 64;                         // find_attack_end's working space, 3 x 300\n\ns_L[0] = A_L;  s_R[0] = A_R;\ns_L[1] = B_L;  s_R[1] = B_R;\ns_L[2] = H1_L; s_R[2] = H1_R;\ns_L[3] = H2_L; s_R[3] = H2_R;\n\n// ---- The house colours ------------------------------------------------------\nACCENT = 0xFFF200;   ACC_HOVER = 0xFFF42E; ACC_HELD = 0xD1C600;\nCONTROL = 0xA9AFBA;  C_HOVER = 0xC0C6CF;   C_HELD = 0x8F96A2;\nGROUND = 0x23272E;   SUNKEN = 0x1A1D23;    FRAME_ACT = 0x2A2F37;\nRULE = 0x3A404A;     INK = 0x14171C;       TEXT = 0xDDE1E7;\nDIM = 0x8A919C;      FAINT = 0x6D7581;     ROLL = 0x111419;\nROW = 0x1C2026;      UNUSED = 0x646B77;    WARN = 0xD2483F;\nPLAYHEAD = ACCENT;\n// Text colours that meet Apple's contrast targets on every ground here:\n// LABEL2 (secondary text) 7.3:1, WARN_TEXT (errors) 7.5:1. The house red\n// itself is only 3.4:1 on the ground, so it marks things but isn't text.\nLABEL2 = 0xB0B6C0;   WARN_TEXT = 0xFF9E96;\n\nSPLICE_ID = 100;\n\n// ---- Small helpers ------------------------------------------------------------\nfunction db2g(db) ( 10 ^ (db / 20); );\nfunction clamp(v, lo, hi) ( max(lo, min(hi, v)); );\n\n// The attack length, the crossfade, and where the crossfade starts, in\n// samples after the hit. The crossfade starts where the attack ends, so\n// all of the attack is kept whole (decision 0012).\nfunction calc_splice()\n(\n  att_s = max(1, floor(attack_ms * 0.001 * srate));\n  xf_s = max(1, floor(xfade_ms * 0.001 * srate));\n  s0_s = att_s;\n);\n\n// ---- Loading ------------------------------------------------------------------\nfunction herm(buf, idx, fr, n) local(xm1, x0, x1, x2, c1, c2, c3)\n(\n  xm1 = idx > 0 ? buf[idx - 1] : 0;\n  x0 = idx < n ? buf[idx] : 0;\n  x1 = idx + 1 < n ? buf[idx + 1] : 0;\n  x2 = idx + 2 < n ? buf[idx + 2] : 0;\n  c1 = 0.5 * (x1 - xm1);\n  c2 = xm1 - 2.5 * x0 + 2 * x1 - 0.5 * x2;\n  c3 = 0.5 * (x2 - xm1) + 1.5 * (x0 - x1);\n  ((c3 * fr + c2) * fr + c1) * fr + x0;\n);\n\n// Zero-phase 4th-order low-pass (a Butterworth biquad, forwards then back),\n// so a sample going down in rate doesn't fold its top octave back in.\nfunction lowpass(buf, n, fc, fs) local(w0, cw, al, b0, b1, b2, a1, a2, a0, x1, x2, y1, y2, i, x, y)\n(\n  w0 = 2 * $pi * fc / fs; cw = cos(w0); al = sin(w0) / (2 * 0.70710678);\n  a0 = 1 + al;\n  b0 = (1 - cw) * 0.5 / a0; b1 = (1 - cw) / a0; b2 = b0;\n  a1 = -2 * cw / a0; a2 = (1 - al) / a0;\n  x1 = x2 = y1 = y2 = 0; i = 0;\n  loop(n,\n    x = buf[i];\n    y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;\n    x2 = x1; x1 = x; y2 = y1; y1 = y;\n    buf[i] = y;\n    i += 1;\n  );\n  x1 = x2 = y1 = y2 = 0; i = n - 1;\n  loop(n,\n    x = buf[i];\n    y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;\n    x2 = x1; x1 = x; y2 = y1; y1 = y;\n    buf[i] = y;\n    i -= 1;\n  );\n);\n\n// Reads any file REAPER can, into planar stereo at the project's rate. Mono\n// is copied to both sides; more than two channels fold down, odd channels\n// left and even right. Returns the length in frames, 0 if it couldn't.\nfunction load_into(path, dL, dR, slot)\n  local(h, nch, fsr, avail, frames, pos, n, k, c, sl, sr2, ptr, ratio, outlen, i, x, idx, rawL, rawR, cf)\n(\n  outlen = 0;\n  h = file_open(path);\n  h >= 0 ? (\n    nch = 0; fsr = 0;\n    file_riff(h, nch, fsr);\n    (nch >= 1 && fsr > 0) ? (\n      avail = file_avail(h);\n      frames = min(floor(avail / nch), MAXLEN);\n      rawL = SCRATCH; rawR = SCRATCH + MAXLEN;\n      cf = floor(CHUNK / nch);\n      pos = 0;\n      while (pos < frames) (\n        n = min(cf, frames - pos);\n        file_mem(h, CHUNKBUF, n * nch);\n        ptr = CHUNKBUF; k = 0;\n        nch == 1 ? (\n          loop(n, rawL[pos + k] = rawR[pos + k] = ptr[k]; k += 1; );\n        ) : nch == 2 ? (\n          loop(n, rawL[pos + k] = ptr[0]; rawR[pos + k] = ptr[1]; ptr += 2; k += 1; );\n        ) : (\n          loop(n,\n            sl = sr2 = 0; c = 0;\n            loop(nch, (c & 1) ? (sr2 += ptr[c]) : (sl += ptr[c]); c += 1; );\n            rawL[pos + k] = sl / ceil(nch / 2);\n            rawR[pos + k] = sr2 / floor(nch / 2);\n            ptr += nch; k += 1;\n          );\n        );\n        pos += n;\n      );\n\n      ratio = fsr / srate;\n      abs(ratio - 1) < 0.000001 ? (\n        memcpy(dL, rawL, frames); memcpy(dR, rawR, frames);\n        outlen = frames;\n      ) : (\n        ratio > 1.0001 ? (\n          lowpass(rawL, frames, 0.45 * srate, fsr);\n          lowpass(rawR, frames, 0.45 * srate, fsr);\n        );\n        outlen = frames > 0 ? min(floor((frames - 1) / ratio) + 1, MAXLEN) : 0;\n        i = 0;\n        loop(outlen,\n          x = i * ratio; idx = floor(x);\n          dL[i] = herm(rawL, idx, x - idx, frames);\n          dR[i] = herm(rawR, idx, x - idx, frames);\n          i += 1;\n        );\n      );\n      s_fsr[slot] = fsr;\n      s_nch[slot] = nch;\n    );\n    file_close(h);\n  );\n  outlen;\n);\n\n// The file's name without its folder.\nfunction base_name(dst, path) local(i, c)\n(\n  i = strlen(path) - 1;\n  while (i >= 0 && ((c = str_getchar(path, i)) != 47) && (c != 92)) ( i -= 1; );\n  strcpy_substr(dst, path, i + 1);\n);\n\nfunction load_slot(slot) local(n)\n(\n  slot == 0 ? (\n    n = strlen(#pathA) ? load_into(#pathA, A_L, A_R, 0) : 0;\n    base_name(#nameA, #pathA);\n    s_err[0] = strlen(#pathA) && n == 0;\n  ) : (\n    n = strlen(#pathB) ? load_into(#pathB, B_L, B_R, 1) : 0;\n    base_name(#nameB, #pathB);\n    s_err[1] = strlen(#pathB) && n == 0;\n  );\n  s_len[slot] = n;\n  s_err[slot] ? (\n    sprintf(#status, \"Couldn't read %s. Drop a WAV, AIFF, FLAC, MP3 or OGG file instead.\", slot == 0 ? #nameA : #nameB);\n    status_warn = 1;\n  );\n  loaded_sr = srate;\n  onset_stale = 1;\n  dirty = 1;\n);\n\n// Swaps a slot's file for another (or for none), remembering the old one so\n// the change can be undone. Call begin_change() first.\nfunction begin_change() ( undo_mask = 0; strcpy(#status, \"\"); status_warn = 0; );\nfunction replace_slot(slot, path) local(had)\n(\n  slot == 0 ? (\n    had = s_len[0] > 0 || s_err[0]; strcpy(#u_pathA, #pathA); strcpy(#pathA, path);\n  ) : (\n    had = s_len[1] > 0 || s_err[1]; strcpy(#u_pathB, #pathB); strcpy(#pathB, path);\n  );\n  had ? (undo_mask |= slot == 0 ? 1 : 2);\n  load_slot(slot);\n  (had && !s_err[slot]) ? (\n    strlen(path) ?\n      sprintf(#status, \"Replaced sample %s with %s.\", slot == 0 ? \"A\" : \"B\", slot == 0 ? #nameA : #nameB) :\n      sprintf(#status, \"Cleared sample %s.\", slot == 0 ? \"A\" : \"B\");\n  );\n);\n\nfunction clear_slot(slot) ( begin_change(); replace_slot(slot, \"\"); );\n\nfunction undo_change() local(m)\n(\n  m = undo_mask; begin_change();\n  (m & 1) ? (strcpy(#pathA, #u_pathA); load_slot(0););\n  (m & 2) ? (strcpy(#pathB, #u_pathB); load_slot(1););\n);\n\n// ---- Analysis ---------------------------------------------------------------------\n// Where the hit starts: the first sample within onset_db of the peak.\nfunction find_onset(src) local(bl, br, n, pk, i, a, thr)\n(\n  bl = s_L[src]; br = s_R[src]; n = s_len[src];\n  pk = 0; i = 0;\n  loop(n, a = max(abs(bl[i]), abs(br[i])); a > pk ? (pk = a); i += 1; );\n  s_pk[src] = pk;\n  thr = pk * db2g(onset_db);\n  i = 0;\n  while (i < n && max(abs(bl[i]), abs(br[i])) < thr) ( i += 1; );\n  s_on[src] = i < n ? i : 0;\n);\n\nfunction region_peak(bl, br, n, i0, i1) local(pk, i, a)\n(\n  pk = 0; i = max(i0, 0); i1 = min(i1, n);\n  while (i < i1) ( a = max(abs(bl[i]), abs(br[i])); a > pk ? (pk = a); i += 1; );\n  pk;\n);\n\n// Where a sample's attack ends, in samples after its hit, or 0 if no end is\n// found within 250 ms (decision 0012). The earlier of two measures, taken\n// a millisecond at a time over the first 300 ms:\n//  - level: a fast follower of the level (2 ms) falls back below a slow one\n//    (20 ms), after the hit had pushed it above. The level is held over\n//    +-6 ms first, so a low note's waveform isn't mistaken for a decay.\n//  - brightness: what is above 2.5 kHz falls 20 dB below its own peak. A\n//    click or pick is bright; a low body hardly reaches up there, so this\n//    finds the click's end even when the body is louder.\nfunction find_attack_end(src)\n  local(bl, br, n, on, blk, nb, lv, hv, hh, i, j, k, a, x, y, x1, x2, y1, y2,\n        w0, cw, al, a0, b0, b1, b2, a1, a2, hold, af, as, f, sl, armed, end1, end2, pk, pki, thr)\n(\n  bl = s_L[src]; br = s_R[src]; n = s_len[src]; on = s_on[src];\n  blk = max(1, floor(0.001 * srate));\n  nb = max(0, min(floor((n - on) / blk), 300));\n  lv = ATK; hv = ATK + 300; hh = ATK + 600;\n\n  // High-pass at 2.5 kHz (a Butterworth biquad), started 5 ms before the hit.\n  w0 = 2 * $pi * 2500 / srate; cw = cos(w0); al = sin(w0) / (2 * 0.70710678);\n  a0 = 1 + al;\n  b0 = (1 + cw) * 0.5 / a0; b1 = -(1 + cw) / a0; b2 = b0;\n  a1 = -2 * cw / a0; a2 = (1 - al) / a0;\n  x1 = x2 = y1 = y2 = 0;\n  i = max(0, on - 5 * blk);\n  loop(on - i,\n    x = (bl[i] + br[i]) * 0.5;\n    y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;\n    x2 = x1; x1 = x; y2 = y1; y1 = y;\n    i += 1;\n  );\n  // The peak of each millisecond: level, and brightness.\n  k = 0;\n  loop(nb,\n    lv[k] = hv[k] = 0;\n    loop(blk,\n      x = (bl[i] + br[i]) * 0.5;\n      y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;\n      x2 = x1; x1 = x; y2 = y1; y1 = y;\n      lv[k] = max(lv[k], max(abs(bl[i]), abs(br[i])));\n      hv[k] = max(hv[k], abs(y));\n      i += 1;\n    );\n    k += 1;\n  );\n\n  // Level\n  hold = 6; af = 1 - exp(-1 / 2); as = 1 - exp(-1 / 20);\n  f = sl = 0; armed = 0; end1 = 0; k = 0;\n  while (k < nb && !end1) (\n    a = 0; j = max(0, k - hold);\n    loop(min(nb, k + hold + 1) - j, a = max(a, lv[j]); j += 1;);\n    f += af * (a - f); sl += as * (a - sl);\n    !armed ? ((f > sl * 1.1) ? (armed = 1)) : ((f < sl) ? (end1 = max(1, k - hold)));\n    k += 1;\n  );\n\n  // Brightness, if there is any to speak of (within 40 dB of the peak).\n  pk = 0; pki = 0; k = 0;\n  loop(nb,\n    hh[k] = max(hv[max(0, k - 1)], max(hv[k], hv[min(nb - 1, k + 1)]));\n    hh[k] > pk ? (pk = hh[k]; pki = k;);\n    k += 1;\n  );\n  end2 = 0;\n  pk > s_pk[src] * 0.01 ? (\n    thr = pk * 0.1;\n    k = pki;\n    while (k < nb && !end2) ( hh[k] < thr ? (end2 = max(1, k)); k += 1; );\n  );\n\n  k = (end1 && end2) ? min(end1, end2) : max(end1, end2);\n  s_tend[src] = k > 0 ? clamp(k * blk, floor(0.002 * srate), floor(0.25 * srate)) : 0;\n);\n\n// The attack of sound a, the body of sound b, into sound d.\nfunction make_hybrid(d, a, b)\n  local(dL, dR, aL, aR, aN, aOn, bL, bR, bN, bOn, pre, g, pol, lag, maxlag, best, l, t, c, ea, eb,\n        va, vb, r, len, i, p, wa, wb, nm, ai, bi, pka, pkb, cw, i1, bi1, cnt, pk, y,\n        att, xf, s0, W, ra, rb, bt, cost)\n(\n  dL = s_L[d]; dR = s_R[d];\n  aL = s_L[a]; aR = s_R[a]; aN = s_len[a]; aOn = s_on[a];\n  bL = s_L[b]; bR = s_R[b]; bN = s_len[b]; bOn = s_on[b];\n\n  pre = min(aOn, floor(0.005 * srate));\n\n  // The splice: where the attack sample's attack ends, if Find attack found\n  // it, else the Attack length setting.\n  att = (find_on && s_tend[a] > 0) ? s_tend[a] : att_s;\n  xf = max(1, floor(xfade_ms * 0.001 * srate));\n  s0 = att;\n\n  g = db2g(trim_db);\n  match_on ? (\n    pka = region_peak(aL, aR, aN, aOn - pre, aOn + att);\n    pkb = region_peak(bL, bR, bN, bOn - pre, bOn + att);\n    (pka > 0.000001 && pkb > 0.000001) ? (g *= pkb / pka);\n  );\n\n  // Find how alike the two are across the splice, and with \"Align phase\"\n  // the lag (and polarity) at which they are most alike.\n  maxlag = align_on ? floor(0.0025 * srate) : 0;\n  cw = min(xf, max(16, floor(0.01 * srate)));\n  best = -1; lag = 0; r = 0;\n  l = -maxlag;\n  loop(2 * maxlag + 1,\n    c = ea = eb = 0; t = s0;\n    loop(cw,\n      ai = aOn + t; bi = bOn + t + l;\n      va = ai < aN ? aL[ai] + aR[ai] : 0;\n      vb = (bi >= 0 && bi < bN) ? bL[bi] + bR[bi] : 0;\n      c += va * vb; ea += va * va; eb += vb * vb;\n      t += 1;\n    );\n    nm = ea * eb > 0 ? c / sqrt(ea * eb) : 0;\n    abs(nm) > best ? (best = abs(nm); lag = l; r = nm;);\n    l += 1;\n  );\n  pol = 1;\n  align_on ? (r < 0 ? (pol = -1); r = abs(r);) : (r = max(r, 0));\n\n  // Snap to zero crossings: within 5 ms, the point where both sounds are\n  // nearest zero together (each measured against its own level there), the\n  // nearer the better. The crossfade starts there.\n  snap_on ? (\n    W = floor(0.005 * srate);\n    ra = rb = 0; t = max(1, att - W);\n    loop(att + W + 1 - t,\n      ai = aOn + t; bi = bOn + t + lag;\n      va = ai < aN ? aL[ai] + aR[ai] : 0;\n      vb = (bi >= 0 && bi < bN) ? bL[bi] + bR[bi] : 0;\n      ra += va * va; rb += vb * vb;\n      t += 1;\n    );\n    ra = sqrt(ra / (2 * W + 1)) + 0.000000001; rb = sqrt(rb / (2 * W + 1)) + 0.000000001;\n    best = 1000000000; bt = att; t = max(1, att - W);\n    loop(att + W + 1 - t,\n      ai = aOn + t; bi = bOn + t + lag;\n      va = ai < aN ? aL[ai] + aR[ai] : 0;\n      vb = (bi >= 0 && bi < bN) ? bL[bi] + bR[bi] : 0;\n      cost = abs(va) / ra + abs(vb) / rb + 0.5 * abs(t - att) / W;\n      cost < best ? (best = cost; bt = t;);\n      t += 1;\n    );\n    att = bt;\n    s0 = att;\n  );\n\n  len = min(pre + max(bN - bOn - lag, s0 + xf), MAXLEN);\n  pk = 0;\n\n  // The attack, before the crossfade.\n  i = 0;\n  loop(min(pre + s0, len),\n    ai = aOn + i - pre;\n    ai < aN ? (dL[i] = g * pol * aL[ai]; dR[i] = g * pol * aR[ai];) : (dL[i] = dR[i] = 0;);\n    pk = max(pk, max(abs(dL[i]), abs(dR[i])));\n    i += 1;\n  );\n\n  // The crossfade: power held for however alike the two are (r).\n  loop(min(xf, len - i),\n    t = i - pre;\n    ai = aOn + t; bi = bOn + t + lag;\n    p = (t - s0 + 0.5) / xf;\n    wa = cos(p * $pi * 0.5); wb = sin(p * $pi * 0.5);\n    nm = 1 / sqrt(wa * wa + wb * wb + 2 * r * wa * wb);\n    wa *= g * pol * nm * (ai < aN);\n    wb *= nm * (bi >= 0 && bi < bN);\n    ai = min(ai, aN - 1); bi = clamp(bi, 0, bN - 1);\n    dL[i] = wa * aL[ai] + wb * bL[bi];\n    dR[i] = wa * aR[ai] + wb * bR[bi];\n    pk = max(pk, max(abs(dL[i]), abs(dR[i])));\n    i += 1;\n  );\n\n  // The body, as it was.\n  i1 = i;\n  bi1 = bOn + (i1 - pre) + lag;\n  bi1 < 0 ? (\n    cnt = min(-bi1, len - i1);\n    memset(dL + i1, 0, cnt); memset(dR + i1, 0, cnt);\n    i1 += cnt; bi1 += cnt;\n  );\n  cnt = max(0, min(len - i1, bN - bi1));\n  memcpy(dL + i1, bL + bi1, cnt); memcpy(dR + i1, bR + bi1, cnt);\n  i1 + cnt < len ? (memset(dL + i1 + cnt, 0, len - i1 - cnt); memset(dR + i1 + cnt, 0, len - i1 - cnt););\n\n  s_on[d] = pre;\n  s_pk[d] = max(pk, region_peak(bL, bR, bN, bOn + s0 + xf + lag, bN));\n  s_lag[d] = lag; s_pol[d] = pol; s_gain[d] = g;\n  s_att[d] = att; s_xf[d] = xf; s_s0[d] = s0;\n  s_len[d] = len;\n);\n\nfunction recompute()\n(\n  calc_splice();\n  (onset_stale || onset_db != used_onset_db) ? (\n    s_len[0] > 0 ? (find_onset(0); find_attack_end(0);) : (s_on[0] = s_pk[0] = s_tend[0] = 0);\n    s_len[1] > 0 ? (find_onset(1); find_attack_end(1);) : (s_on[1] = s_pk[1] = s_tend[1] = 0);\n    used_onset_db = onset_db;\n    onset_stale = 0;\n  );\n  (s_len[0] > 0 && s_len[1] > 0) ? (\n    make_hybrid(2, 1, 0);\n    make_hybrid(3, 0, 1);\n  ) : (\n    s_len[2] = s_len[3] = 0;\n  );\n  dirty = 0;\n  view_ver += 1;\n);\n\n// Loading and recomputing, wherever they are due. Runs from @gfx while the\n// window is open, and from @block when it isn't.\nfunction housekeeping()\n(\n  (loaded_sr != srate && (strlen(#pathA) || strlen(#pathB))) ? (need_load = 1);\n  need_load ? (need_load = 0; load_slot(0); load_slot(1););\n  dirty ? recompute();\n);\n\n// ---- Playing ------------------------------------------------------------------------\nfunction start_voice(src, gain, delay) local(v)\n(\n  s_len[src] > 0 ? (\n    v = next_v; next_v = (next_v + 1) % NV;\n    v_src[v] = src; v_pos[v] = -delay; v_gain[v] = gain; v_on[v] = 1;\n    last_v = v;\n  );\n);\n\nfunction audition(src)\n(\n  s_len[src] > 0 ? (ui_trig_src = src; ui_trig += 1;);\n);\n\nfunction print_result() local(src, n, i, bl, br)\n(\n  src = 2 + result_sel; n = min(s_len[src], MAXLEN);\n  n > 0 ? (\n    bl = s_L[src]; br = s_R[src]; i = 0;\n    loop(n, SCRATCH[2 * i] = bl[i]; SCRATCH[2 * i + 1] = br[i]; i += 1;);\n    export_buffer_to_project(SCRATCH, n, 2, srate, -1, 0);\n    begin_change();\n    strcpy(#status, result_sel == 0 ? \"Printed A with B's attack as a new item.\" : \"Printed B with A's attack as a new item.\");\n  );\n);\n\n// ---- Drawing --------------------------------------------------------------------------\nfunction cola(c, a) ( gfx_set(((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255, a); );\nfunction col(c) ( cola(c, 1); );\n// c laid over bg at opacity a, as one solid colour: shapes drawn in pieces\n// (a rounded rectangle is five) would otherwise darken where they overlap.\nfunction mix(c, bg, a)\n(\n  floor(((c >> 16) & 255) * a + ((bg >> 16) & 255) * (1 - a) + 0.5) * 65536 +\n  floor(((c >> 8) & 255) * a + ((bg >> 8) & 255) * (1 - a) + 0.5) * 256 +\n  floor((c & 255) * a + (bg & 255) * (1 - a) + 0.5);\n);\n\nfunction fill_round(x, y, w, h, r)\n(\n  r = min(r, min(w, h) * 0.5);\n  r >= 1 ? (\n    gfx_rect(x + r, y, w - 2 * r, h);\n    gfx_rect(x, y + r, r, h - 2 * r);\n    gfx_rect(x + w - r, y + r, r, h - 2 * r);\n    gfx_circle(x + r, y + r, r, 1, 1);\n    gfx_circle(x + w - r - 1, y + r, r, 1, 1);\n    gfx_circle(x + r, y + h - r - 1, r, 1, 1);\n    gfx_circle(x + w - r - 1, y + h - r - 1, r, 1, 1);\n  ) : gfx_rect(x, y, w, h);\n);\n\nfunction frame(x, y, w, h)\n(\n  gfx_rect(x, y, w, 1); gfx_rect(x, y + h - 1, w, 1);\n  gfx_rect(x, y, 1, h); gfx_rect(x + w - 1, y, 1, h);\n);\n\nfunction dashed_frame(x, y, w, h) local(i, d)\n(\n  d = 6 * S;\n  i = 0; while (i < w) ( gfx_rect(x + i, y, min(d, w - i), 1); gfx_rect(x + i, y + h - 1, min(d, w - i), 1); i += 2 * d; );\n  i = 0; while (i < h) ( gfx_rect(x, y + i, 1, min(d, h - i)); gfx_rect(x + w - 1, y + i, 1, min(d, h - i)); i += 2 * d; );\n);\n\nfunction text(str, x, y, w, h, flags) ( gfx_x = x; gfx_y = y; gfx_drawstr(str, flags, x + w, y + h); );\n\n// The system's own typeface where there is one: Segoe UI on Windows, San\n// Francisco on macOS, else Arial. gfx_getfont names the face the system\n// actually gave back, so a missing font is caught rather than guessed.\nfunction pick_font()\n(\n  gfx_setfont(1, \"Segoe UI\", 14, 0); gfx_getfont(#got);\n  matchi(\"Segoe UI*\", #got) ? strcpy(#ui_font, \"Segoe UI\") : (\n    gfx_setfont(1, \".AppleSystemUIFont\", 14, 0); gfx_getfont(#got);\n    (matchi(\"*System*\", #got) || matchi(\"*SF*\", #got)) ? strcpy(#ui_font, \".AppleSystemUIFont\") : strcpy(#ui_font, \"Arial\");\n  );\n  font_ready = 1;\n);\n// Sizes from Apple's macOS defaults: 13 pt text, nothing under 10 pt.\nfunction font_body() ( gfx_setfont(1, #ui_font, 14 * S, 0); );\nfunction font_small() ( gfx_setfont(2, #ui_font, 13 * S, 0); );\nfunction font_label() ( gfx_setfont(3, #ui_font, 14 * S, 'b'); );\n\n// Draws a string cut short with an ellipsis if it would be wider than w.\nfunction text_fit(str, x, y, w, h) local(tw, th, n, c)\n(\n  gfx_measurestr(str, tw, th);\n  tw <= w ? text(str, x, y, w, h, 4) : (\n    n = strlen(str);\n    while (n > 1 && tw > w) (\n      n -= 1;\n      // Never cut a UTF-8 character in half.\n      while (n > 1 && (c = str_getchar(str, n)) >= -128 && c < -64) ( n -= 1; );\n      strcpy_substr(#fit, str, 0, n); strcat(#fit, \"\u00e2\u0080\u00a6\");\n      gfx_measurestr(#fit, tw, th);\n    );\n    text(#fit, x, y, w, h, 4);\n  );\n);\n\nfunction hit(x, y, w, h) ( mouse_x >= x && mouse_x < x + w && mouse_y >= y && mouse_y < y + h; );\n\nfunction set_hint(str) ( hint_on = 1; strcpy(#hint, str); );\n\n// ---- Keyboard focus ----------------------------------------------------------------------\n// Every control that can be used registers itself as it is drawn, so Tab\n// moves through them in reading order: top to bottom, left to right.\nfunction focusable(id) ( FOCUS[fl_n] = id; fl_n = min(fl_n + 1, 63); );\nfunction focus_ring(x, y, w, h)\n(\n  col(TEXT);\n  gfx_roundrect(x - 3 * S, y - 3 * S, w + 5 * S, h + 5 * S, 6 * S);\n  gfx_roundrect(x - 2 * S, y - 2 * S, w + 3 * S, h + 3 * S, 5 * S);\n);\n// Return or Space presses the focused control.\nfunction key_activates(id) ( (focus_id == id && (key == 13 || key == 32)) ? (key = 0; 1) : 0; );\n\n// ---- Controls --------------------------------------------------------------------------\n// Where the i-th control goes in the grid (laid out in @gfx).\nfunction cell_x(i) ( pad + (i % cols) * (cw + cg); );\nfunction cell_y(i) ( ctrl_y + floor(i / cols) * crow_h; );\n\n// 1: play (a triangle), 2: stop (a square), drawn in the current colour.\nfunction draw_icon(icon, x, cy) local(r)\n(\n  r = 5 * S;\n  icon == 1 ? gfx_triangle(x, cy - r, x, cy + r, x + 1.8 * r, cy) :\n  icon == 2 ? gfx_rect(x, cy - r + S, 2 * r - 2 * S, 2 * r - 2 * S);\n);\n\n// A button: light grey with ink, yellow when it is on. Returns 1 when\n// clicked, or pressed from the keyboard.\nfunction ui_button(id, x, y, w, h, label, on, enabled, icon) local(hov, hov2, press, clicked, c, tw, th, iw, x0)\n(\n  enabled ? focusable(id);\n  hov = enabled && hit(x, y, w, h);\n  (m_click && hov) ? (ui_active = id);\n  hov2 = hov && (ui_active == 0 || ui_active == id);\n  press = hov && ui_active == id && m_down;\n  clicked = enabled && ((ui_active == id && m_up && hit(x, y, w, h)) || key_activates(id));\n  c = on ? (press ? ACC_HELD : (hov2 ? ACC_HOVER : ACCENT)) : (press ? C_HELD : (hov2 ? C_HOVER : CONTROL));\n  c = enabled ? c : mix(c, GROUND, 0.35);\n  col(c); fill_round(x, y, w, h, 4 * S);\n  col(enabled ? INK : mix(INK, c, 0.5)); gfx_roundrect(x, y, w - 1, h - 1, 4 * S);\n  font_body();\n  icon ? (\n    gfx_measurestr(label, tw, th); iw = 9 * S;\n    x0 = x + floor((w - iw - 7 * S - tw) / 2);\n    draw_icon(icon, x0, floor(y + h / 2));\n    text(label, x0 + iw + 7 * S, y, x + w - x0 - iw - 7 * S, h, 4);\n  ) : text(label, x, y, w, h, 1 | 4);\n  focus_id == id ? focus_ring(x, y, w, h);\n  clicked;\n);\n\n// A checkbox and its label. Returns the new state.\nfunction ui_toggle(id, x, y, w, label, on, help) local(hov, bs, bx, by, res)\n(\n  focusable(id);\n  bs = 16 * S; bx = x; by = y + floor((28 * S - bs) / 2);\n  hov = hit(x, y, w, 28 * S);\n  (hov || focus_id == id) ? set_hint(help);\n  (m_click && hov) ? (ui_active = id);\n  res = on;\n  ((ui_active == id && m_up && hov) || key_activates(id)) ? (res = !on);\n  col(on ? ACCENT : ((hov && (ui_active == 0 || ui_active == id)) ? C_HOVER : CONTROL));\n  fill_round(bx, by, bs, bs, 3 * S);\n  col(INK); gfx_roundrect(bx, by, bs - 1, bs - 1, 3 * S);\n  on ? (\n    gfx_line(bx + 4 * S, by + 8 * S, bx + 7 * S, by + 11 * S, 1);\n    gfx_line(bx + 7 * S, by + 11 * S, bx + 12 * S, by + 5 * S, 1);\n    gfx_line(bx + 4 * S, by + 9 * S, bx + 7 * S, by + 12 * S, 1);\n    gfx_line(bx + 7 * S, by + 12 * S, bx + 12 * S, by + 6 * S, 1);\n  );\n  font_body(); col(TEXT); text(label, bx + bs + 8 * S, y, w - bs - 8 * S, 28 * S, 4);\n  focus_id == id ? focus_ring(bx, by, bs, bs);\n  res;\n);\n\n// A slider with its name and value above it. Click or drag on the track to\n// set it, scroll or use the arrow keys to nudge (Shift for finer), double-\n// click to put it back. Returns the value.\nfunction ui_slider(id, x, y, w, label, fmt, val, lo, hi, def, islog, help)\n  local(tx, ty, tw, u, u0, kx, hov, nv, now, k)\n(\n  focusable(id);\n  font_small(); col(LABEL2); text(label, x, y, w, 16 * S, 4);\n  sprintf(#sl_txt, fmt, val);\n  col(TEXT); text(#sl_txt, x, y, w, 16 * S, 2 | 4);\n\n  ty = y + 30 * S; tx = x + 8 * S; tw = max(1, w - 16 * S);\n  hov = hit(x, y + 16 * S, w, 28 * S);\n  (hov || ui_active == id || focus_id == id) ? set_hint(help);\n  (m_click && hov) ? (\n    now = time_precise();\n    (now - ui_lastclick < 0.35 && ui_lastid == id) ? (ui_reset = id);\n    ui_lastclick = now; ui_lastid = id; ui_active = id;\n  );\n  nv = val;\n  (ui_active == id && m_down) ? (\n    ui_reset == id ? (nv = def) : (\n      u = clamp((mouse_x - tx) / tw, 0, 1);\n      nv = islog ? lo * (hi / lo) ^ u : lo + u * (hi - lo);\n    );\n  );\n  k = (hov && mouse_wheel != 0 && ui_active == 0) ? (mouse_wheel > 0 ? 2 : -2) : 0;\n  k != 0 ? (mouse_wheel = 0);\n  focus_id == id ? (\n    (key == 'rght' || key == 'up') ? (k = 1; key = 0;);\n    (key == 'left' || key == 'down') ? (k = -1; key = 0;);\n  );\n  k != 0 ? (\n    u = islog ? log(val / lo) / log(hi / lo) : (val - lo) / (hi - lo);\n    u = clamp(u + k * ((mouse_cap & 8) ? 0.001 : 0.01), 0, 1);\n    nv = islog ? lo * (hi / lo) ^ u : lo + u * (hi - lo);\n    // Always move at least one step of what is shown.\n    floor(nv * 10 + 0.5) / 10 == val ? (nv = clamp(val + sign(k) * 0.1, lo, hi));\n  );\n  nv = floor(nv * 10 + 0.5) / 10;\n\n  u = clamp(islog ? log(nv / lo) / log(hi / lo) : (nv - lo) / (hi - lo), 0, 1);\n  u0 = (lo < 0 && hi > 0) ? -lo / (hi - lo) : 0;\n  col(SUNKEN); fill_round(tx, ty - 2 * S, tw, 4 * S, 2 * S);\n  col(ui_active == id ? CONTROL : FAINT); fill_round(tx + min(u, u0) * tw, ty - 2 * S, abs(u - u0) * tw, 4 * S, 2 * S);\n  kx = tx + u * tw;\n  col(ui_active == id ? C_HELD : ((hov && ui_active == 0) ? C_HOVER : CONTROL));\n  gfx_circle(kx, ty, 7 * S, 1, 1);\n  col(INK); gfx_circle(kx, ty, 7 * S, 0, 1);\n  focus_id == id ? focus_ring(x - 2 * S, y - 2 * S, w + 4 * S, 46 * S);\n  nv;\n);\n\n// ---- Waveforms ----------------------------------------------------------------------------\n// Every row shares one time axis, in samples from the hit, so the hits and\n// the splice line up down the window.\nfunction build_peaks(v, src, w) local(base, n, on, bl, br, i, a, b, j, step, mn, mx, tpp, x)\n(\n  base = PEAKS + v * 2 * PEAKW;\n  n = s_len[src]; on = s_on[src]; bl = s_L[src]; br = s_R[src];\n  tpp = (view_t1 - view_t0) / w;\n  i = 0;\n  loop(min(w, PEAKW),\n    a = floor(on + view_t0 + i * tpp); b = floor(on + view_t0 + (i + 1) * tpp);\n    b = max(b, a + 1);\n    a = max(a, 0); b = min(b, n);\n    mn = mx = 0;\n    a < b ? (\n      step = max(1, floor((b - a) / 64));\n      j = a;\n      while (j < b) (\n        x = bl[j]; mx = max(mx, x); mn = min(mn, x);\n        x = br[j]; mx = max(mx, x); mn = min(mn, x);\n        j += step;\n      );\n    );\n    base[2 * i] = mn; base[2 * i + 1] = mx;\n    i += 1;\n  );\n);\n\n// role: 0 = sample A, 1 = sample B, 2 = the result. The parts of A and B\n// that make it into the result are drawn light, the rest dark, and the\n// labels say so in words too.\nfunction draw_wave(v, src, x, y, w, h, role) local(base, i, n, mid, amp, t, c, ya, yb, px, prov, used, tpp, xa, xb, ok)\n(\n  tpp = (view_t1 - view_t0) / w;\n  ok = s_len[src] > 0;\n  col(ROLL); gfx_rect(x, y, w, h);\n  ok ? (\n    xb = clamp(x + (att_s - view_t0) / tpp, x, x + w);\n    xb > x ? (col(ROW); gfx_rect(x, y, xb - x, h););\n    xa = clamp(x + (s0_s - view_t0) / tpp, x, x + w);\n    xb = clamp(x + (s0_s + xf_s - view_t0) / tpp, x, x + w);\n    xb > xa ? (col(FRAME_ACT); gfx_rect(xa, y, xb - xa, h););\n\n    mid = floor(y + h / 2);\n    col(RULE); gfx_rect(x, mid, w, 1);\n    amp = (h / 2 - 4 * S) * disp_scale;\n    base = PEAKS + v * 2 * PEAKW;\n    prov = result_sel == 0 ? 1 : 0;\n    n = min(w, PEAKW);\n    i = 0;\n    loop(n,\n      t = view_t0 + (i + 0.5) * tpp;\n      role == 2 ? (c = t < att_s ? TEXT : CONTROL) : (\n        used = (role == prov) ? (t < s0_s + xf_s) : (t >= s0_s);\n        c = used ? CONTROL : UNUSED;\n      );\n      col(c);\n      ya = max(y, mid - base[2 * i + 1] * amp);\n      yb = min(y + h, mid - base[2 * i] * amp);\n      gfx_rect(x + i, ya, 1, max(1, yb - ya));\n      i += 1;\n    );\n\n    // The hit (a mark at the top) and, with Find attack on, where this\n    // sample's attack ends (a mark at the bottom).\n    px = x + (0 - view_t0) / tpp;\n    (px >= x && px <= x + w) ? (col(DIM); gfx_triangle(px - 4 * S, y, px + 4 * S, y, px, y + 5 * S););\n    (role < 2 && find_on && s_tend[role] > 0) ? (\n      px = x + (s_tend[role] - view_t0) / tpp;\n      (px >= x && px <= x + w) ? (col(LABEL2); gfx_triangle(px - 5 * S, y + h - 1, px + 5 * S, y + h - 1, px, y + h - 7 * S););\n    );\n\n    // Names over the two parts\n    font_small();\n    px = x + (att_s - view_t0) / tpp;\n    role == 2 ? (\n      (px - x > 64 * S) ? (col(TEXT); text(result_sel == 0 ? \"B attack\" : \"A attack\", x + 6 * S, y + 4 * S, px - x - 8 * S, 16 * S, 4););\n      (x + w - px > 64 * S) ? (col(TEXT); text(result_sel == 0 ? \"A body\" : \"B body\", px + 6 * S, y + 4 * S, x + w - px - 8 * S, 16 * S, 4););\n    ) : (\n      (px - x > 48 * S) ? (col(role == prov ? TEXT : DIM); text(role == prov ? \"attack\" : \"attack (unused)\", x + 6 * S, y + 4 * S, px - x - 8 * S, 16 * S, 4););\n      (x + w - px > 48 * S) ? (col(role == prov ? DIM : TEXT); text(role == prov ? \"body (unused)\" : \"body\", px + 6 * S, y + 4 * S, x + w - px - 8 * S, 16 * S, 4););\n    );\n\n    // The splice: white, wider while it can be dragged.\n    (px >= x && px < x + w) ? (\n      col(TEXT);\n      gfx_rect(px - (splice_hot ? S : 0), y, splice_hot ? 3 * S : max(1, S), h);\n      role == 2 ? (\n        col(splice_hot ? TEXT : CONTROL); fill_round(px - 5 * S, y + h / 2 - 12 * S, 10 * S + 1, 24 * S, 3 * S);\n        col(INK); gfx_roundrect(px - 5 * S, y + h / 2 - 12 * S, 10 * S, 24 * S, 3 * S);\n      );\n    );\n\n    // What is sounding\n    (play_on && play_src == src) ? (\n      px = x + (play_pos - s_on[src] - view_t0) / tpp;\n      (px >= x && px < x + w) ? (col(PLAYHEAD); gfx_rect(px, y, max(1, S), h););\n    );\n    col(RULE); frame(x, y, w, h);\n  ) : (\n    col(FAINT); dashed_frame(x, y, w, h);\n    font_body();\n    (role < 2 && s_err[role]) ? (\n      col(WARN_TEXT);\n      sprintf(#werr, \"Couldn't read %s.\", role == 0 ? #nameA : #nameB);\n      text(#werr, x, y, w, h / 2, 1 | 8);\n      col(LABEL2); text(\"Drop a WAV, AIFF, FLAC, MP3 or OGG file here.\", x, y + h / 2 + 4 * S, w, 20 * S, 1);\n    ) : (\n      col(LABEL2);\n      text(role == 2 ? \"The result appears here once both samples are in.\" :\n           role == 0 ? \"Drop sample A here, or two files at once.\" : \"Drop sample B here.\",\n           x, y, w, h, 1 | 4);\n    );\n  );\n);\n\nfunction draw_ruler(x, y, w) local(span, st, k, n, t, px, tpp)\n(\n  span = (view_t1 - view_t0) / srate * 1000;\n  st = 0.1; k = 0;\n  while (k < 40 && st / span * w < 70 * S) ( st *= (k % 3 == 1) ? 2.5 : 2; k += 1; );\n  tpp = (view_t1 - view_t0) / w;\n  n = ceil(view_t0 / srate * 1000 / st);\n  font_small();\n  while ((t = n * st) <= view_t1 / srate * 1000) (\n    px = x + (t * 0.001 * srate - view_t0) / tpp;\n    col(FAINT); gfx_rect(px, y, max(1, S), 4 * S);\n    col(LABEL2);\n    abs(t) >= 1000 ? sprintf(#rl, \"%g s\", floor(t / 10 + 0.5) / 100) : sprintf(#rl, \"%g ms\", floor(t * 10 + 0.5) / 10);\n    text(#rl, px + 3 * S, y, 90 * S, 16 * S, 4);\n    n += 1;\n  );\n);\n\nfunction draw_source_panel(slot, x, y, w, h) local(cs, playing)\n(\n  cs = 28 * S;\n  col(CONTROL); fill_round(x, y, cs, cs, 4 * S);\n  col(INK); gfx_roundrect(x, y, cs - 1, cs - 1, 4 * S);\n  font_label(); text(slot == 0 ? \"A\" : \"B\", x, y, cs, cs, 1 | 4);\n\n  (s_len[slot] > 0 || s_err[slot]) ? (\n    col(TEXT); text_fit(slot == 0 ? #nameA : #nameB, x + cs + 8 * S, y, w - cs - 8 * S, cs);\n    // The whole name, however long, when the pointer is over it.\n    hit(x, y, w, cs) ? set_hint(slot == 0 ? #nameA : #nameB);\n  ) : (\n    col(LABEL2); text(slot == 0 ? \"Sample A\" : \"Sample B\", x + cs + 8 * S, y, w - cs - 8 * S, cs, 4);\n  );\n\n  font_small();\n  s_err[slot] ? (\n    col(WARN_TEXT); text(\"Couldn't read this file.\", x, y + cs + 6 * S, w, 18 * S, 4);\n  ) : s_len[slot] > 0 ? (\n    sprintf(#meta, \"%.2f s \u00c2\u00b7 %g kHz%s\", s_len[slot] / srate, s_fsr[slot] / 1000, s_nch[slot] == 1 ? \" \u00c2\u00b7 mono\" : \"\");\n    col(LABEL2); text_fit(#meta, x, y + cs + 6 * S, w, 18 * S);\n  ) : (\n    col(LABEL2); text(\"No sample yet\", x, y + cs + 6 * S, w, 18 * S, 4);\n  );\n\n  playing = play_on && play_src == slot;\n  ui_button(10 + slot, x, y + 60 * S, w, 28 * S, playing ? \"Stop\" : (slot == 0 ? \"Play A\" : \"Play B\"),\n            playing, s_len[slot] > 0, playing ? 2 : 1) ? (playing ? (ui_stop += 1) : audition(slot));\n);\n\nui_active = 0;\nview_mode = 1;\nui_zoom = 1;\n\n@slider\ndirty = 1;\n\n@block\n// While the window is closed (or after a project loads) nothing else will\n// load or recompute, so do it here.\n(time_precise() - gfx_seen > 0.5) ? housekeeping();\n\nui_trig != ui_trig_seen ? (ui_trig_seen = ui_trig; start_voice(ui_trig_src, 1, 0););\nui_stop != ui_stop_seen ? (ui_stop_seen = ui_stop; memset(v_on, 0, NV););\n\nwhile (midirecv(ofs, m1, m2, m3)) (\n  ((m1 & 0xF0) == 0x90 && m3 > 0) ? (\n    start_voice(midi_plays == 0 ? 2 + result_sel : midi_plays - 1, m3 / 127, ofs);\n  );\n  midisend(ofs, m1, m2, m3);\n);\n\noutg = db2g(out_db);\n\n@sample\nout_l = thru_on ? spl0 : 0;\nout_r = thru_on ? spl1 : 0;\nvi = 0;\nloop(NV,\n  v_on[vi] ? (\n    vp = v_pos[vi];\n    vp >= 0 ? (\n      vs = v_src[vi];\n      vp < s_len[vs] ? (\n        vbl = s_L[vs]; vbr = s_R[vs];\n        out_l += vbl[vp] * v_gain[vi] * outg;\n        out_r += vbr[vp] * v_gain[vi] * outg;\n      ) : (v_on[vi] = 0);\n    );\n    v_pos[vi] = vp + 1;\n  );\n  vi += 1;\n);\nspl0 = out_l;\nspl1 = out_r;\nplay_on = v_on[last_v];\nplay_src = v_src[last_v];\nplay_pos = v_pos[last_v];\n\n@serialize\nfile_string(0, #pathA);\nfile_string(0, #pathB);\nfile_var(0, view_mode);\nfile_var(0, ui_zoom);\nfile_avail(0) >= 0 ? (need_load = 1);\n\n@gfx 820 704\ngfx_seen = time_precise();\n!font_ready ? pick_font();\nui_zoom < 1 ? (ui_zoom = 1);\nS = max(1, gfx_ext_retina) * ui_zoom;\nhousekeeping();\n\nkey = gfx_getchar();\nm_down = mouse_cap & 1;\nm_click = m_down && !m_last;\nm_up = !m_down && m_last;\nm_last = m_down;\nm_click ? (focus_id = 0);    // pointing takes over from the keyboard\nhint_on = 0;\ncursor = 32512;\nfl_n = 0;\n\n// ---- Layout --------------------------------------------------------------------------------\n// Top to bottom: a bar for messages and Options, the controls, then the\n// waveforms. Nothing that matters sits at the bottom edge, which Apple notes\n// often ends up off the screen.\npad = 16 * S;\ngap = 12 * S;\nbar_h = 28 * S;\ncg = 24 * S;\ncols = clamp(floor((gfx_w - 2 * pad + cg) / (170 * S + cg)), 2, 4);\ncw = floor((gfx_w - 2 * pad - (cols - 1) * cg) / cols);\ncrow_h = 64 * S;\nctrl_y = pad + bar_h + 18 * S;\nctrl_h = ceil(10 / cols) * crow_h - 12 * S;\nsep_y = ctrl_y + ctrl_h + 10 * S;\nlabw = 172 * S;\nwx = pad + labw + 16 * S;\nww = max(16, floor(gfx_w - wx - pad));\narea_y = sep_y + 16 * S;\narea_h = max(2 * 88 * S + 132 * S + 2 * gap, gfx_h - area_y - pad - 22 * S);\nrowR_h = max(132 * S, floor((area_h - 2 * gap) * 1.3 / 3.3));\nrh = max(88 * S, floor((area_h - 2 * gap - rowR_h) / 2));\nrowA_y = area_y;              rowA_h = rh;\nrowB_y = rowA_y + rh + gap;   rowB_h = rh;\nrowR_y = rowB_y + rh + gap;\nruler_y = rowR_y + rowR_h + 4 * S;\n\ncol(GROUND); gfx_rect(0, 0, gfx_w, gfx_h);\n\n// ---- Dropped files --------------------------------------------------------------------------\n// One file goes to the row it was dropped on (or the first empty one); two go\n// to A and B. Whatever they replace can be put back with Undo.\ngfx_getdropfile(0, #drop) ? (\n  begin_change();\n  gfx_getdropfile(1, #drop2) ? (\n    replace_slot(0, #drop); replace_slot(1, #drop2);\n    (undo_mask == 3 && !status_warn) ? strcpy(#status, \"Replaced both samples.\");\n  ) : (\n    target = hit(0, rowB_y, gfx_w, rowB_h) ? 1 :\n             hit(0, rowA_y, gfx_w, rowA_h) ? 0 :\n             s_len[0] == 0 ? 0 : s_len[1] == 0 ? 1 : 0;\n    replace_slot(target, #drop);\n  );\n  gfx_getdropfile(-1);\n  housekeeping();\n);\n\n// ---- What the rows show ----------------------------------------------------------------------\n// The splice drawn is the chosen result's own (found and snapped as it was\n// made), or the Attack length setting while there is no result.\ncalc_splice();\ns_len[2 + result_sel] > 0 ? (\n  att_s = s_att[2 + result_sel]; xf_s = s_xf[2 + result_sel]; s0_s = s_s0[2 + result_sel];\n);\nui_active != SPLICE_ID ? (\n  view_mode == 0 ? (\n    any = 0; view_t0 = -0.005 * srate; view_t1 = 0.25 * srate;\n    i = 0;\n    loop(3,\n      si = i < 2 ? i : 2 + result_sel;\n      s_len[si] > 0 ? (\n        any ? (\n          view_t0 = min(view_t0, -s_on[si]); view_t1 = max(view_t1, s_len[si] - s_on[si]);\n        ) : (\n          view_t0 = -s_on[si]; view_t1 = s_len[si] - s_on[si]; any = 1;\n        );\n      );\n      i += 1;\n    );\n    view_t0 -= 0.002 * srate;\n  ) : view_mode == 1 ? (\n    view_t0 = -0.006 * srate;\n    view_t1 = max(0.04 * srate, 2.5 * att_s + xf_s);\n  ) : (\n    view_t0 = cv0; view_t1 = cv1;\n  );\n);\n\n// Scroll over the waveforms to zoom around the pointer.\n(mouse_wheel != 0 && hit(wx, rowA_y, ww, rowR_y + rowR_h - rowA_y)) ? (\n  tm = view_t0 + (mouse_x - wx) / ww * (view_t1 - view_t0);\n  zf = 0.85 ^ (mouse_wheel / 120);\n  cv0 = tm - (tm - view_t0) * zf; cv1 = tm + (view_t1 - tm) * zf;\n  (cv1 - cv0 < 0.004 * srate) ? (cv0 = tm - 0.002 * srate; cv1 = tm + 0.002 * srate;);\n  (cv1 - cv0 > 60 * srate) ? (cv0 = tm - 30 * srate; cv1 = tm + 30 * srate;);\n  view_t0 = cv0; view_t1 = cv1; view_mode = 2;\n  mouse_wheel = 0;\n);\n\n(pk_ver != view_ver || pk_t0 != view_t0 || pk_t1 != view_t1 || pk_w != ww || pk_sel != result_sel) ? (\n  build_peaks(0, 0, ww);\n  build_peaks(1, 1, ww);\n  build_peaks(2, 2 + result_sel, ww);\n  pk_ver = view_ver; pk_t0 = view_t0; pk_t1 = view_t1; pk_w = ww; pk_sel = result_sel;\n);\ndisp_scale = 1 / max(0.001, max(s_pk[0], max(s_pk[1], s_pk[2 + result_sel])));\n\nany_loaded = s_len[0] > 0 || s_len[1] > 0;\nsplice_x = wx + (att_s - view_t0) / (view_t1 - view_t0) * ww;\nsplice_hot = ui_active == SPLICE_ID ||\n             (ui_active == 0 && any_loaded && hit(splice_x - 10 * S, rowA_y, 20 * S, rowR_y + rowR_h - rowA_y));\nready = s_len[2 + result_sel] > 0;\nplaying_r = play_on && play_src == 2 + result_sel;\n\n// ---- The bar: messages stay until dismissed, with Undo when it applies --------------------------------\nopt_x = gfx_w - pad - 96 * S;\nstatus_on = strlen(#status) > 0;\ndis_x = opt_x - 12 * S - 84 * S;\nundo_x = dis_x - 12 * S - 72 * S;\nmsg_right = (status_on ? (undo_mask ? undo_x : dis_x) : opt_x) - 12 * S;\n(status_on && undo_mask) ? (ui_button(31, undo_x, pad, 72 * S, bar_h, \"Undo\", 0, 1, 0) ? undo_change(););\nstatus_on ? (ui_button(32, dis_x, pad, 84 * S, bar_h, \"Dismiss\", 0, 1, 0) ? (strcpy(#status, \"\"); undo_mask = 0;););\n\nui_button(30, opt_x, pad, 96 * S, bar_h, \"Options\", 0, 1, 0) ? (\n  gfx_x = opt_x; gfx_y = pad + bar_h;\n  sprintf(#menu, \"%sPass input audio through||%sMIDI notes play the result|%sMIDI notes play sample A|%sMIDI notes play sample B||%sInterface size 100%%|%sInterface size 125%%|%sInterface size 150%%|%sInterface size 200%%||%sClear sample A|%sClear sample B\",\n          thru_on ? \"!\" : \"\", midi_plays == 0 ? \"!\" : \"\", midi_plays == 1 ? \"!\" : \"\", midi_plays == 2 ? \"!\" : \"\",\n          ui_zoom == 1 ? \"!\" : \"\", ui_zoom == 1.25 ? \"!\" : \"\", ui_zoom == 1.5 ? \"!\" : \"\", ui_zoom == 2 ? \"!\" : \"\",\n          s_len[0] > 0 || s_err[0] ? \"\" : \"#\", s_len[1] > 0 || s_err[1] ? \"\" : \"#\");\n  menu_sel = gfx_showmenu(#menu);\n  menu_sel == 1 ? (thru_on = !thru_on; slider_automate(512);) :\n  (menu_sel >= 2 && menu_sel <= 4) ? (midi_plays = menu_sel - 2; slider_automate(128);) :\n  (menu_sel >= 5 && menu_sel <= 8) ? (ui_zoom = menu_sel == 5 ? 1 : menu_sel == 6 ? 1.25 : menu_sel == 7 ? 1.5 : 2;) :\n  menu_sel == 9 ? clear_slot(0) :\n  menu_sel == 10 ? clear_slot(1);\n);\n\n// ---- Controls ----------------------------------------------------------------------------------------\n// Attack length shows the splice the result really has: what Find attack\n// found, or the setting and, if snapping moved it, where it went. Moving it\n// is a choice made by hand, so it turns Find attack off.\natt_found = find_on && s_len[2 + result_sel] > 0 && s_tend[result_sel == 0 ? 1 : 0] > 0;\natt_shown = att_found ? floor(att_s / srate * 10000 + 0.5) / 10 : attack_ms;\natt_found ? strcpy(#att_fmt, \"%.1f ms, found\") :\n  (s_len[2 + result_sel] > 0 && abs(att_s / srate * 1000 - attack_ms) >= 0.05) ?\n    sprintf(#att_fmt, \"%%.1f \u00e2\u0086\u0092 %.1f ms\", att_s / srate * 1000) : strcpy(#att_fmt, \"%.1f ms\");\nnv = ui_slider(1, cell_x(0), cell_y(0), cw, \"Attack length\", #att_fmt, att_shown, 2, 250, 30, 1,\n               \"Attack length: how much of the start is taken from the attack sample. Moving it turns Find attack off.\");\nnv != att_shown ? (\n  attack_ms = clamp(nv, 2, 250); slider_automate(1); dirty = 1;\n  find_on ? (find_on = 0; slider_automate(1024););\n);\n\nnv = ui_slider(2, cell_x(1), cell_y(1), cw, \"Crossfade\", \"%.1f ms\", xfade_ms, 0.5, 100, 10, 1,\n               \"Crossfade: how long the attack takes to blend into the body.\");\nnv != xfade_ms ? (xfade_ms = nv; slider_automate(2); dirty = 1;);\n\nnv = ui_slider(3, cell_x(2), cell_y(2), cw, \"Attack trim\", \"%+.1f dB\", trim_db, -24, 24, 0, 0,\n               \"Attack trim: turns the borrowed attack up or down.\");\nnv != trim_db ? (trim_db = nv; slider_automate(4); dirty = 1;);\n\nnv = ui_slider(4, cell_x(3), cell_y(3), cw, \"Output\", \"%+.1f dB\", out_db, -24, 12, 0, 0,\n               \"Output: the level of what plays here. Printing isn't affected.\");\nnv != out_db ? (out_db = nv; slider_automate(256););\n\nnv = ui_slider(5, cell_x(4), cell_y(4), cw, \"Hit threshold\", \"%.0f dB\", onset_db, -60, -6, -30, 0,\n               \"Hit threshold: how near its peak a sample must get before its hit counts as started.\");\nnv = floor(nv + 0.5);\nnv != onset_db ? (onset_db = nv; slider_automate(32); dirty = 1;);\n\nnv = ui_toggle(14, cell_x(5), cell_y(5) + 16 * S, cw, \"Find attack\", find_on,\n               \"Find attack: measures where the attack sample's attack ends, and splices there. The marks under A and B show where each one's attack ends.\");\nnv != find_on ? (find_on = nv; slider_automate(1024); dirty = 1;);\n\nnv = ui_toggle(15, cell_x(6), cell_y(6) + 16 * S, cw, \"Snap to zero crossings\", snap_on,\n               \"Snap to zero crossings: moves the splice up to 5 ms, to where both sounds cross zero together, so the join doesn't click.\");\nnv != snap_on ? (snap_on = nv; slider_automate(2048); dirty = 1;);\n\nnv = ui_toggle(6, cell_x(7), cell_y(7) + 16 * S, cw, \"Match level\", match_on,\n               \"Match level: sets the borrowed attack to the peak of the attack it replaces.\");\nnv != match_on ? (match_on = nv; slider_automate(8); dirty = 1;);\n\nnv = ui_toggle(7, cell_x(8), cell_y(8) + 16 * S, cw, \"Align phase\", align_on,\n               \"Align phase: shifts the body up to 2.5 ms, or flips it, so the two don't cancel at the splice.\");\nnv != align_on ? (align_on = nv; slider_automate(16); dirty = 1;);\n\nvx = cell_x(9); vy = cell_y(9);\nfont_small(); col(LABEL2); text(\"View\", vx, vy, cw, 16 * S, 4);\nvbw = floor((cw - 12 * S) / 2);\nui_button(8, vx, vy + 16 * S, vbw, 28 * S, \"Attack\", view_mode == 1, 1, 0) ? (view_mode = 1);\nui_button(9, vx + vbw + 12 * S, vy + 16 * S, cw - vbw - 12 * S, 28 * S, \"Whole\", view_mode == 0, 1, 0) ? (view_mode = 0);\n(hit(vx, vy + 16 * S, cw, 28 * S) || focus_id == 8 || focus_id == 9) ? set_hint(\"View: zoom in on the splice, or see all of each sound. Scroll over the waveforms to zoom.\");\n\ncol(RULE); gfx_rect(pad, sep_y, gfx_w - 2 * pad, max(1, S));\n\n// ---- Rows ----------------------------------------------------------------------------------------\ndraw_source_panel(0, pad, rowA_y, labw, rowA_h);\ndraw_source_panel(1, pad, rowB_y, labw, rowB_h);\n\nfont_label(); col(TEXT); text(\"Result\", pad, rowR_y, labw, 22 * S, 4);\nui_button(20, pad, rowR_y + 28 * S, labw, 28 * S, \"A with B's attack\", result_sel == 0, 1, 0) ? (result_sel = 0; slider_automate(64););\nui_button(21, pad, rowR_y + 64 * S, labw, 28 * S, \"B with A's attack\", result_sel == 1, 1, 0) ? (result_sel = 1; slider_automate(64););\nbw = floor((labw - 12 * S) / 2);\nui_button(22, pad, rowR_y + 104 * S, bw, 28 * S, playing_r ? \"Stop\" : \"Play\", playing_r, ready, playing_r ? 2 : 1) ?\n  (playing_r ? (ui_stop += 1) : audition(2 + result_sel));\nui_button(23, pad + bw + 12 * S, rowR_y + 104 * S, labw - bw - 12 * S, 28 * S, \"Print\", 0, ready, 0) ? print_result();\n(hit(pad + bw + 12 * S, rowR_y + 104 * S, labw - bw - 12 * S, 28 * S) || focus_id == 23) ?\n  set_hint(\"Print: adds the result to the project as a new item.\");\n\ndraw_wave(0, 0, wx, rowA_y, ww, rowA_h, 0);\ndraw_wave(1, 1, wx, rowB_y, ww, rowB_h, 1);\ndraw_wave(2, 2 + result_sel, wx, rowR_y, ww, rowR_h, 2);\nany_loaded ? draw_ruler(wx, ruler_y, ww);\n\n// Clicking a waveform plays it; the splice line drags (Attack length does\n// the same from the keyboard).\nsplice_hot ? (\n  cursor = 32644;\n  set_hint(\"Drag the line to choose how much of the attack is borrowed.\");\n) : (any_loaded && ui_active == 0 && hit(wx, rowA_y, ww, rowR_y + rowR_h - rowA_y)) ? (\n  set_hint(\"Click a waveform to hear it. Scroll to zoom.\");\n);\n(m_click && ui_active == 0) ? (\n  splice_hot ? (ui_active = SPLICE_ID) :\n  hit(wx, rowA_y, ww, rowA_h) ? (ui_active = 40; audition(0)) :\n  hit(wx, rowB_y, ww, rowB_h) ? (ui_active = 41; audition(1)) :\n  hit(wx, rowR_y, ww, rowR_h) ? (ui_active = 42; audition(2 + result_sel));\n);\n(ui_active == SPLICE_ID && m_down) ? (\n  nv = clamp((view_t0 + (mouse_x - wx) / ww * (view_t1 - view_t0)) / srate * 1000, 2, 250);\n  nv = floor(nv * 10 + 0.5) / 10;\n  nv != attack_ms ? (attack_ms = nv; slider_automate(1); dirty = 1;);\n  find_on ? (find_on = 0; slider_automate(1024); dirty = 1;);\n);\n\n// ---- Keys --------------------------------------------------------------------------------------------\n// Tab and Shift+Tab move between controls; Return or Space presses one;\n// arrows move a slider. With nothing focused, Space plays or stops the result.\nkey == 9 ? (\n  fl_n > 0 ? (\n    cur = -1; i = 0;\n    loop(fl_n, FOCUS[i] == focus_id ? (cur = i); i += 1;);\n    (mouse_cap & 8) ? (cur = cur <= 0 ? fl_n - 1 : cur - 1) : (cur = cur < 0 ? 0 : (cur + 1) % fl_n);\n    focus_id = FOCUS[cur];\n  );\n) :\nkey == 27 ? (focus_id = 0; ui_stop += 1;) :\nkey == 32 ? (playing_r ? (ui_stop += 1) : audition(2 + result_sel)) :\nkey == 49 ? (result_sel = 0; slider_automate(64);) :\nkey == 50 ? (result_sel = 1; slider_automate(64);) :\n(key == 97 || key == 65) ? audition(0) :\n(key == 98 || key == 66) ? audition(1);\n\n// ---- The bar's text: a message, else what's under the pointer, else what to do next ---------------------------\nfont_body();\nstatus_on ? (\n  col(status_warn ? WARN_TEXT : TEXT); text_fit(#status, pad, pad, msg_right - pad, bar_h);\n) : hint_on ? (\n  col(LABEL2); text_fit(#hint, pad, pad, msg_right - pad, bar_h);\n) : (\n  col(LABEL2);\n  text_fit(s_len[0] == 0 && s_len[1] == 0 ? \"Drop two samples on the window. The result takes A's body and B's attack.\" :\n           s_len[0] == 0 || s_len[1] == 0 ? \"Now drop the other sample.\" :\n           \"Click a waveform to hear it. Drag the white line to set the attack length.\",\n           pad, pad, msg_right - pad, bar_h);\n);\n\ngfx_setcursor(cursor, \"arrow\");\nm_up ? (ui_active = 0; ui_reset = 0;);\nmouse_wheel = 0;\n"};

/* ---- kit/palette.js ---- */
/* The devices' colours in Live: after Ableton Live 8's default theme.
 *
 * The scheme is Starting Blocks' own experiment of 18 September 2026
 * (commit 2765b0a3, "theme the window after Live 8"): a neutral grey chrome
 * meant to sit quietly under brightly coloured clips, controls raised off it,
 * and one warm amber spent where Live spends its accent, on what is switched
 * on. It was built from the theme's described character, not Live's own
 * files, so it is a likeness, not a match.
 *
 * Two changes from that experiment, both for the family's rules (every word
 * 7:1 on what it sits on, ink on every button, marks and edges 3:1):
 *   - the chrome is #3E3E3E, a step darker than its #4A4A4A, because on
 *     #4A4A4A a secondary word cannot reach 7:1 and still look secondary;
 *   - buttons are a light grey with dark ink, as the house scheme's are,
 *     because light words on its #5E5E5E buttons reach only 5:1.
 * The greys are neutral (R = G = B), as Live's are: the house rule that
 * every grey leans blue is the yellow scheme's, and Live's look is not that.
 *
 * Palette.tone(r, g, b) is how the REAPER windows (the JSFX and Lua scripts,
 * drawn through gfx.js) take the scheme without a line of theirs changing:
 *   - the house scheme's own colours map one for one (HOUSE below), each
 *     chosen so the pairs the scripts rely on stay 7:1 for words and 3:1
 *     for edges;
 *   - the house yellow, and the shades the scripts make of it, become the
 *     amber, shaded the same way;
 *   - any other grey loses its tint at the same brightness, so a script
 *     with a palette of its own keeps every contrast it had;
 *   - every other colour (a material, an engine, a part) is left alone.
 */
var Palette = (function () {
  'use strict';
  var C = {
    ground: 0x3E3E3E,     // the chrome: Live 8's #4A4A4A, a step darker (see above)
    raised: 0x484848,     // a control that is off
    sunken: 0x2E2E2E,     // lists, fields, a roll or a page: Live 8's roll ground
    deep: 0x262626,       // a roll's own ground under a sunken frame
    popup: 0x333333,      // menus
    rule: 0x555555,       // separators: they group, they do not act
    edge: 0x8C8C8C,       // the edge of anything that acts: 3.2:1 on the chrome
    control: 0xB4B4B4,    // buttons, with ink on them
    controlHover: 0xC4C4C4,
    controlHeld: 0xAAAAAA,
    accent: 0xD7A93C,     // Live 8's warm amber: what is on
    accentHeld: 0xCDA139,  // held: ink on it still 7.2:1
    ink: 0x1A1A1A,        // words on a button, grey or amber; also a window's darkest ground
                          // (AutoCC paints its window in the ink), so words are 7:1 on it too
    text: 0xF0F0F0,       // 9.4:1 on the chrome
    label: 0xD8D8D8,      // 7.5:1
    dim: 0xD4D4D4,        // secondary words, 7.2:1
    mark: 0xA8A8A8,       // a mark that is not a word, or a control that is off
    note: 0xA8D8E8,       // Live 8's cool note colour, for a roll
    ring: 0xFAFAFA,       // the keyboard's place
    warn: 0xF0605A,       // a warning's mark, never its words: 3.3:1 on the chrome
    warnText: 0xFFC8C2    // a warning's words, 7.3:1
  };
  // The house scheme (HousePalette, every family repo's docs/COLOUR.md) to this one.
  var HOUSE = {
    0x111419: C.deep, 0x14171C: C.ink, 0x1A1D23: C.sunken, 0x1B1F25: C.popup, 0x1E2228: 0x343434,
    0x22262D: 0x363636, 0x23272E: C.ground, 0x2A2F37: C.raised, 0x3A404A: C.rule, 0x585F6B: 0x707070,
    0x646B77: 0x7A7A7A, 0x6D7581: C.edge, 0x8A919C: C.mark, 0x8F96A2: C.controlHeld, 0xA9AFBA: C.control,
    0xB0B6C0: C.dim, 0xB6BCC6: C.dim, 0xBFC5CE: C.label, 0xC0C6CF: C.controlHover, 0xDDE1E7: C.text,
    0xF2F4F7: C.ring, 0xFFF200: C.accent, 0xD1C600: C.accentHeld, 0xFF9E96: C.warnText, 0xFFA6A0: C.warnText, 0xD2483F: C.warn
  };
  function rgb(hex, a) {
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255, a === undefined ? 1 : a];
  }
  function lin(c) { return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function unlin(l) { return l <= 0.0031308 ? l * 12.92 : 1.055 * Math.pow(l, 1 / 2.4) - 0.055; }
  function luminance(r, g, b) { return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); }
  function contrast(a, b) {
    var la = luminance(a[0], a[1], a[2]), lb = luminance(b[0], b[1], b[2]);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  var AMBER = rgb(C.accent);
  // r, g, b from 0 to 1; returns [r, g, b].
  function tone(r, g, b) {
    r = clamp(r); g = clamp(g); b = clamp(b);
    var R = Math.round(r * 255), G = Math.round(g * 255), B = Math.round(b * 255);
    var hex = (R << 16) | (G << 8) | B;
    if (HOUSE[hex] !== undefined) { var t = rgb(HOUSE[hex]); return [t[0], t[1], t[2]]; }
    // The house yellow and its shades: lighter ones mix in white (blue rises
    // from 0), darker ones scale down (red and green fall together).
    if (R >= 120 && G >= 110 && Math.abs(R - G) <= 40 && B <= Math.min(R, G) - 90) {
      var w = B / 255, k = Math.max(R, G) / 255;
      return [0, 1, 2].map(function (i) { return clamp(AMBER[i] * k + (1 - AMBER[i] * k) * w); });
    }
    // A grey with a tint, from any palette: neutral at the same brightness.
    var hi = Math.max(R, G, B), lo = Math.min(R, G, B);
    if (hi - lo <= 28) { var n = unlin(luminance(r, g, b)); return [n, n, n]; }
    return [r, g, b];
  }
  return { C: C, HOUSE: HOUSE, rgb: rgb, tone: tone, luminance: luminance, contrast: contrast };
})();


/* ---- kit/runtime/jsfx.js ---- */
/* Middaw's JSFX runtime: the family's REAPER plug-ins, run unchanged.
 *
 * A JSFX file is a header (sliders, pins, imports) and sections of EEL2 code:
 * @init, @slider, @block, @sample, @serialize and @gfx. This file reads the
 * header, compiles the EEL2 in each section to JavaScript, and runs it the way
 * REAPER does: @init once, @slider when a slider moves, then for every block
 * @block once and @sample once per sample frame. MIDI arrives through
 * midirecv() and leaves through midisend() with its sample offset.
 *
 * @gfx is not run by default: Middaw draws each device's controls itself from
 * the sliders, so a device looks like the rest of the app. With
 * `{ gfx: true }` it is compiled too, and `runGfx(host, ...)` runs it: every
 * gfx_* call goes to the host, which draws (the Ableton devices' [v8ui]).
 *
 * Everything in EEL2 is a double. Variables live in one Float64Array, so the
 * generated code reads `v[12]`; memory (`buf[i]`) is EEL2's 8M words, given
 * out in 64k-word blocks only when written to, as EEL2 itself does.
 */
(function (NS) {
  'use strict';

  var EPS = 0.00001;
  var MAXLOOP = 1048576;
  var BLOCK = 65536, NBLOCKS = 128;

  // ------------------------------------------------------------ header ----
  function parseSliderLine(line) {
    var m = /^slider(\d+):(?:([A-Za-z_][\w.]*)=)?\s*([^<]*?)\s*<([^>]*)>(.*)$/.exec(line);
    if (!m) return null;
    var inner = m[4], enumNames = null;
    var em = /\{([^}]*)\}/.exec(inner);
    if (em) { enumNames = em[1].split(','); inner = inner.replace(em[0], ''); }
    var shape = null, sm = /:(log|sqr)(?:=([^,>]*))?/.exec(inner);
    if (sm) { shape = { kind: sm[1], value: sm[2] === undefined ? null : Number(sm[2]) }; inner = inner.replace(sm[0], ''); }
    var parts = inner.split(',').map(function (s) { return s.trim(); });
    var desc = m[5].trim();
    var hidden = desc[0] === '-';
    if (hidden) desc = desc.slice(1);
    return {
      index: Number(m[1]), variable: (m[2] || ('slider' + m[1])).toLowerCase(),
      def: Number(m[3]) || 0, min: Number(parts[0]) || 0, max: parts[1] === undefined ? 1 : Number(parts[1]),
      step: parts[2] === undefined || parts[2] === '' ? 0 : Number(parts[2]),
      names: enumNames, shape: shape, name: desc, hidden: hidden
    };
  }

  // A JSFX file and its imports -> header and sections.
  function parseFile(text, readImport) {
    var out = { desc: '', sliders: [], inPins: [], outPins: [], options: '', sections: {}, gfxSize: null };
    var order = ['init', 'slider', 'block', 'sample', 'serialize', 'gfx'];
    order.forEach(function (s) { out.sections[s] = []; });
    function take(src, isImport) {
      var lines = src.replace(/\r\n?/g, '\n').split('\n');
      var section = null, buf = [], startLine = 0;
      function flush() {
        if (section && out.sections[section]) out.sections[section].push({ code: buf.join('\n'), line: startLine });
        buf = [];
      }
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var sm = /^@(\w+)(.*)$/.exec(line);
        if (sm) {
          flush();
          section = sm[1].toLowerCase();
          startLine = i + 2;
          if (section === 'gfx') {
            var sz = sm[2].trim().split(/\s+/).map(Number);
            if (sz.length >= 2 && !out.gfxSize) out.gfxSize = [sz[0], sz[1]];
          }
          continue;
        }
        if (section) { buf.push(line); continue; }
        var t = line.trim();
        if (/^desc:/.test(t)) { if (!isImport || !out.desc) out.desc = t.slice(5).trim(); }
        else if (/^slider\d+:/.test(t)) { var s = parseSliderLine(t); if (s) out.sliders.push(s); }
        else if (/^in_pin:/.test(t)) out.inPins.push(t.slice(7).trim());
        else if (/^out_pin:/.test(t)) out.outPins.push(t.slice(8).trim());
        else if (/^options:/.test(t)) out.options += ' ' + t.slice(8).trim();
        else if (/^import\s+/.test(t)) {
          var name = t.replace(/^import\s+/, '').trim();
          var inc = readImport ? readImport(name) : null;
          if (inc === null || inc === undefined) throw new Error('JSFX import not found: ' + name);
          take(inc, true);
        }
      }
      flush();
    }
    take(text, false);
    out.sliders.sort(function (a, b) { return a.index - b.index; });
    out.inPins = out.inPins.filter(function (p) { return p !== 'none'; });
    out.outPins = out.outPins.filter(function (p) { return p !== 'none'; });
    return out;
  }

  // ------------------------------------------------------------- lexer ----
  var OPS = ['===', '!==', '<<=', '>>=', '==', '!=', '<=', '>=', '<<', '>>', '&&', '||',
    '+=', '-=', '*=', '/=', '%=', '^=', '|=', '&=', '~=',
    '+', '-', '*', '/', '%', '^', '<', '>', '!', '&', '|', '~', '?', ':',
    '(', ')', '[', ']', ',', ';', '='];
  var CONSTS = { pi: Math.PI, phi: (1 + Math.sqrt(5)) / 2, e: Math.E };

  function EelError(msg, line) { this.message = (line ? 'line ' + line + ': ' : '') + msg; this.line = line; }
  EelError.prototype = Object.create(Error.prototype);
  EelError.prototype.name = 'EelError';

  // REAPER's strings are bytes: one character per UTF-8 byte, as the C runtime
  // keeps them.
  function bytes(s) {
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var c = s.codePointAt(i);
      if (c > 0xffff) i++;
      if (c < 0x80) out += String.fromCharCode(c);
      else if (c < 0x800) out += String.fromCharCode(0xc0 | c >> 6, 0x80 | c & 63);
      else if (c < 0x10000) out += String.fromCharCode(0xe0 | c >> 12, 0x80 | c >> 6 & 63, 0x80 | c & 63);
      else out += String.fromCharCode(0xf0 | c >> 18, 0x80 | c >> 12 & 63, 0x80 | c >> 6 & 63, 0x80 | c & 63);
    }
    return out;
  }

  function lex(src, firstLine) {
    var toks = [], i = 0, n = src.length, line = firstLine || 1;
    while (i < n) {
      var c = src[i];
      if (c === '\n') { line++; i++; continue; }
      if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }
      if (c === '/' && src[i + 1] === '/') { var j = src.indexOf('\n', i); i = j < 0 ? n : j; continue; }
      if (c === '/' && src[i + 1] === '*') {
        var k = src.indexOf('*/', i + 2); if (k < 0) k = n;
        for (var q = i; q < k; q++) if (src[q] === '\n') line++;
        i = k + 2; continue;
      }
      if (c === '"') {
        var buf = '', p = i + 1;
        while (p < n && src[p] !== '"') {
          if (src[p] === '\\' && p + 1 < n) {
            var e = src[p + 1];
            buf += e === 'n' ? '\n' : e === 't' ? '\t' : e === 'r' ? '\r' : e; p += 2;
          } else { if (src[p] === '\n') line++; buf += src[p++]; }
        }
        toks.push({ k: 'str', v: bytes(buf), line: line }); i = p + 1; continue;
      }
      if (c === "'") {
        var close = src.indexOf("'", i + 1);
        var val = 0;
        var lit = bytes(src.slice(i + 1, close));
        for (var x = 0; x < lit.length; x++) val = val * 256 + lit.charCodeAt(x);
        toks.push({ k: 'num', v: val, line: line }); i = close + 1; continue;
      }
      if (c === '#') {
        var nm = /^#[A-Za-z_][A-Za-z0-9_.]*/.exec(src.slice(i, i + 200));
        if (nm) { toks.push({ k: 'nstr', v: nm[0].toLowerCase(), line: line }); i += nm[0].length; }
        else { toks.push({ k: 'tmpstr', line: line }); i++; }
        continue;
      }
      if (c === '$') {
        var rest = src.slice(i, i + 64), m;
        if ((m = /^\$x([0-9A-Fa-f]+)/.exec(rest))) { toks.push({ k: 'num', v: parseInt(m[1], 16), line: line }); i += m[0].length; continue; }
        if ((m = /^\$'(.)'/.exec(rest))) { toks.push({ k: 'num', v: m[1].charCodeAt(0), line: line }); i += m[0].length; continue; }
        if ((m = /^\$~(\d+)/.exec(rest))) { toks.push({ k: 'num', v: Math.pow(2, Number(m[1])) - 1, line: line }); i += m[0].length; continue; }
        if ((m = /^\$(pi|phi|e)\b/i.exec(rest))) { toks.push({ k: 'num', v: CONSTS[m[1].toLowerCase()], line: line }); i += m[0].length; continue; }
        throw new EelError('bad $ constant', line);
      }
      var hx = /^0[xX][0-9A-Fa-f]+/.exec(src.slice(i, i + 40));
      if (hx) { toks.push({ k: 'num', v: parseInt(hx[0], 16), line: line }); i += hx[0].length; continue; }
      var num = /^(\d+\.\d*|\.\d+|\d+)/.exec(src.slice(i, i + 64));
      if (num) { toks.push({ k: 'num', v: Number(num[0]), line: line }); i += num[0].length; continue; }
      var id = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(src.slice(i, i + 200));
      if (id) {
        var w = id[0].toLowerCase();
        toks.push({ k: (w === 'function' || w === 'local' || w === 'instance' || w === 'globals' || w === 'global' || w === 'static') ? 'kw' : 'id', v: w, line: line });
        i += id[0].length; continue;
      }
      var op = null;
      for (var o = 0; o < OPS.length; o++) if (src.substr(i, OPS[o].length) === OPS[o]) { op = OPS[o]; break; }
      if (!op) throw new EelError("unexpected '" + c + "'", line);
      toks.push({ k: 'op', v: op, line: line }); i += op.length;
    }
    toks.push({ k: 'eof', line: line });
    return toks;
  }

  // ------------------------------------------------------------ parser ----
  var ASSIGN = { '=': 1, '+=': 1, '-=': 1, '*=': 1, '/=': 1, '%=': 1, '^=': 1, '|=': 1, '&=': 1, '~=': 1, '<<=': 1, '>>=': 1 };
  var CMP = { '==': 1, '===': 1, '!=': 1, '!==': 1, '<': 1, '>': 1, '<=': 1, '>=': 1 };

  function parse(toks, funcs) {
    var p = 0;
    function peek() { return toks[p]; }
    function at(k, v) { var t = toks[p]; return t.k === k && (v === undefined || t.v === v); }
    function eat(k, v) { if (at(k, v)) return toks[p++]; return null; }
    function expect(k, v) {
      var t = eat(k, v);
      if (!t) { var q = toks[p]; throw new EelError('expected ' + (v || k) + ', got ' + (q.v !== undefined ? q.v : q.k), q.line); }
      return t;
    }

    function program() {
      var items = [];
      for (;;) {
        while (eat('op', ';')) {}
        if (at('eof')) break;
        if (at('kw', 'function')) { func(); continue; }
        items.push(assign());
        if (!at('op', ';') && !at('eof') && !at('kw', 'function')) {
          var t = peek();
          throw new EelError("missing ';' before " + (t.v !== undefined ? t.v : t.k), t.line);
        }
      }
      return { k: 'seq', items: items };
    }
    function func() {
      var line = expect('kw', 'function').line;
      var name = expect('id').v;
      expect('op', '(');
      var params = [];
      while (!at('op', ')')) { params.push(expect('id').v.replace(/\*$/, '')); eat('op', ','); }
      expect('op', ')');
      var locals = [], instance = [], globals = null;
      while (at('kw')) {
        var kw = toks[p++].v;
        expect('op', '(');
        var list = [];
        while (!at('op', ')')) {
          if (at('op', '*')) { p++; list.push('*'); }
          else list.push(expect('id').v.replace(/\*$/, ''));
          eat('op', ',');
        }
        expect('op', ')');
        if (kw === 'local' || kw === 'static') locals = locals.concat(list);
        else if (kw === 'instance') instance = instance.concat(list);
        else globals = (globals || []).concat(list);
      }
      expect('op', '(');
      var body = block();
      expect('op', ')');
      while (eat('op', ';')) {}
      funcs[name] = { name: name, params: params, locals: locals, instance: instance, globals: globals, body: body, line: line };
    }
    function block() {
      var items = [];
      for (;;) {
        while (eat('op', ';')) {}
        if (at('op', ')') || at('eof')) break;
        if (at('kw', 'function')) { func(); continue; }
        items.push(assign());
        if (!at('op', ';')) break;
      }
      while (eat('op', ';')) {}
      return items.length === 1 ? items[0] : { k: 'seq', items: items };
    }
    function arg() {
      var items = [assign()];
      while (at('op', ';')) {
        p++;
        if (at('op', ')') || at('op', ',')) break;
        items.push(assign());
      }
      return items.length === 1 ? items[0] : { k: 'seq', items: items };
    }
    function assign() {
      var lhs = ternary();
      var t = peek();
      if (t.k === 'op' && ASSIGN[t.v]) {
        p++;
        return { k: 'assign', op: t.v, lhs: lhs, rhs: assign(), line: t.line };
      }
      return lhs;
    }
    function ternary() {
      var c = logic();
      if (eat('op', '?')) {
        var a = at('op', ':') ? { k: 'num', v: 0 } : assign();
        var b = null;
        if (eat('op', ':')) b = assign();
        return { k: 'if', c: c, a: a, b: b };
      }
      return c;
    }
    function logic() {
      var n = cmp();
      while (at('op', '&&') || at('op', '||')) n = { k: 'logic', op: toks[p++].v, a: n, b: cmp() };
      return n;
    }
    function cmp() {
      var n = bit();
      while (peek().k === 'op' && CMP[peek().v]) n = { k: 'bin', op: toks[p++].v, a: n, b: bit() };
      return n;
    }
    function bit() {
      var n = add();
      while (at('op', '|') || at('op', '&') || at('op', '~')) n = { k: 'bin', op: toks[p++].v, a: n, b: add() };
      return n;
    }
    function add() {
      var n = mul();
      while (at('op', '+') || at('op', '-')) n = { k: 'bin', op: toks[p++].v, a: n, b: mul() };
      return n;
    }
    function mul() {
      var n = shift();
      while (at('op', '*') || at('op', '/')) n = { k: 'bin', op: toks[p++].v, a: n, b: shift() };
      return n;
    }
    function shift() {
      var n = mod();
      while (at('op', '<<') || at('op', '>>')) n = { k: 'bin', op: toks[p++].v, a: n, b: mod() };
      return n;
    }
    function mod() {
      var n = pow();
      while (at('op', '%')) { p++; n = { k: 'bin', op: '%', a: n, b: pow() }; }
      return n;
    }
    function pow() {
      var n = unary();
      if (at('op', '^')) { p++; return { k: 'bin', op: '^', a: n, b: pow() }; }
      return n;
    }
    function unary() {
      var t = peek();
      if (t.k === 'op' && (t.v === '!' || t.v === '-' || t.v === '+')) { p++; return { k: 'un', op: t.v, a: unary() }; }
      return postfix();
    }
    function postfix() {
      var n = primary();
      while (at('op', '[')) {
        p++;
        var idx = at('op', ']') ? { k: 'num', v: 0 } : assign();
        expect('op', ']');
        n = { k: 'index', base: n, idx: idx };
      }
      return n;
    }
    function primary() {
      var t = toks[p++];
      switch (t.k) {
        case 'num': return { k: 'num', v: t.v };
        case 'str': return { k: 'strlit', v: t.v };
        case 'nstr': return { k: 'nstr', v: t.v };
        case 'tmpstr': return { k: 'tmpstr', id: p };
        case 'op':
          if (t.v === '(') { var b = block(); expect('op', ')'); return b; }
          break;
        case 'id':
          if (at('op', '(')) {
            p++;
            var args = [];
            while (!at('op', ')')) { args.push(arg()); if (!eat('op', ',')) break; }
            expect('op', ')');
            if ((t.v === 'while' || t.v === 'loop') && at('op', '(')) {
              p++; var body = block(); expect('op', ')');
              args.push(body);
            }
            return { k: 'call', name: t.v, args: args, line: t.line };
          }
          return { k: 'var', name: t.v, line: t.line };
      }
      throw new EelError('unexpected ' + (t.v !== undefined ? t.v : t.k), t.line);
    }
    return program();
  }

  // ---------------------------------------------------------- compiler ----
  // Builtins that are plain maths: name -> JS expression template.
  var MATH = {
    sin: 'Math.sin', cos: 'Math.cos', tan: 'Math.tan', asin: 'Math.asin', acos: 'Math.acos',
    atan: 'Math.atan', atan2: 'Math.atan2', sqrt: 'H.sqrt', exp: 'Math.exp', log: 'Math.log',
    log10: 'Math.log10', abs: 'Math.abs', floor: 'Math.floor', ceil: 'Math.ceil',
    min: 'Math.min', max: 'Math.max', pow: 'Math.pow', sign: 'H.sign', invsqrt: 'H.invsqrt',
    sqr: 'H.sqr', rand: 'H.rand', exp2: 'H.exp2'
  };

  function Compiler(slotsOf) {
    this.slots = slotsOf;          // name -> index into v
    this.funcs = {};
    this.compiledFuncs = {};
    this.funcCode = [];
    this.strConsts = [];
    this.temps = 0;
    this.gfx = false;              // compile gfx_* calls for a host to draw
  }
  Compiler.prototype.slot = function (name) {
    var s = this.slots[name];
    if (s === undefined) { s = this.slots.__count++; this.slots[name] = s; }
    return s;
  };

  Compiler.prototype.compileSection = function (code, firstLine) {
    var ast = parse(lex(code, firstLine), this.funcs);
    var saveTemps = this.temps;
    this.temps = 0;
    var body = this.stmts(ast, null, true, 'r');
    var temps = this.tempDecl();
    this.temps = saveTemps;
    return 'var r = 0;' + temps + body + 'return r;';
  };
  Compiler.prototype.tempDecl = function () {
    if (!this.temps) return '';
    var names = [];
    for (var i = 1; i <= this.temps; i++) names.push('t' + i);
    return 'var ' + names.join(', ') + ';';
  };
  Compiler.prototype.temp = function () { this.temps++; return 't' + this.temps; };

  // Names inside a function: parameters, statics, instance variables, or
  // globals. A function called as ns.f() keeps its instance() variables, and
  // anything it names as this.x, in ns: ns.x (REAPER's pseudo-objects).
  Compiler.prototype.ref = function (name, ctx) {
    if (ctx) {
      var pi = ctx.fn.params.indexOf(name);
      if (pi >= 0) return 'p' + pi;
      if (ctx.fn.locals.indexOf(name) >= 0) return 'v[' + this.slot(ctx.fn.name + '::' + name) + ']';
      if (ctx.fn.instance.indexOf(name) >= 0) return 'v[' + this.slot(ctx.ns ? ctx.ns + '.' + name : name) + ']';
    }
    if (name.indexOf('this.') === 0) return 'v[' + this.slot(resolveThis(name, ctx)) + ']';
    return 'v[' + this.slot(name) + ']';
  };
  // this.x, this.child.x: the namespace the function was called in.
  function resolveThis(name, ctx) {
    var ns = ctx && ctx.ns ? ctx.ns : '';
    if (name === 'this') return ns;
    return ns ? ns + '.' + name.slice(5) : name.slice(5);
  }

  function hasControl(n) {
    if (!n || typeof n !== 'object') return false;
    if (n.k === 'call' && (n.name === 'loop' || n.name === 'while')) return true;
    for (var key in n) {
      var c = n[key];
      if (Array.isArray(c)) { for (var i = 0; i < c.length; i++) if (hasControl(c[i])) return true; }
      else if (c && typeof c === 'object' && c.k && hasControl(c)) return true;
    }
    return false;
  }

  // Statements computing `n`; the value lands in `target` when wanted.
  Compiler.prototype.stmts = function (n, ctx, want, target) {
    if (n.k === 'seq') {
      var out = '';
      if (!n.items.length) return want ? target + ' = 0;' : '';
      for (var i = 0; i < n.items.length; i++) {
        var last = i === n.items.length - 1;
        out += this.stmts(n.items[i], ctx, want && last, target);
      }
      return out;
    }
    if (n.k === 'call' && n.name === 'loop') {
      var cnt = this.temp(), ii = this.temp();
      var s = cnt + ' = Math.min(' + MAXLOOP + ', Math.trunc(' + this.expr(n.args[0], ctx) + ')); ';
      if (want) s += target + ' = 0; ';
      s += 'for (' + ii + ' = 0; ' + ii + ' < ' + cnt + '; ' + ii + '++) {' + (n.args[1] ? this.stmts(n.args[1], ctx, want, target) : '') + '}';
      return s;
    }
    if (n.k === 'call' && n.name === 'while') {
      var guard = this.temp(), r = this.temp();
      if (n.args.length >= 2) {
        return guard + ' = 0; ' + (want ? target + ' = 0; ' : '') + 'while (Math.abs(' + this.expr(n.args[0], ctx) + ') >= ' + EPS + ' && ' + guard + '++ < ' + MAXLOOP + ') {' +
          this.stmts(n.args[1], ctx, want, target) + '}';
      }
      return guard + ' = 0; do {' + this.stmts(n.args[0], ctx, true, r) + (want ? target + ' = ' + r + ';' : '') +
        '} while (Math.abs(' + r + ') >= ' + EPS + ' && ++' + guard + ' < ' + MAXLOOP + ');';
    }
    if (n.k === 'if' && hasControl(n)) {
      var o = 'if (Math.abs(' + this.expr(n.c, ctx) + ') >= ' + EPS + ') {' + this.stmts(n.a, ctx, want, target) + '}';
      if (n.b) o += ' else {' + this.stmts(n.b, ctx, want, target) + '}';
      else if (want) o += ' else { ' + target + ' = 0; }';
      return o;
    }
    var e = this.expr(n, ctx);
    return (want ? target + ' = ' + e : e) + ';';
  };

  function T(e) { return '(Math.abs(' + e + ') >= ' + EPS + ')'; }

  Compiler.prototype.expr = function (n, ctx) {
    var self = this;
    // A loop inside an expression: the statements holding it run in a
    // closure. Only a loop, a sequence or a conditional is one; anything else
    // compiles its parts, each of which takes its own closure if it needs one.
    if (hasControl(n) && (n.k === 'seq' || n.k === 'if' || (n.k === 'call' && (n.name === 'loop' || n.name === 'while')))) {
      return '(() => { var rr = 0; ' + this.stmts(n, ctx, true, 'rr') + ' return rr; })()';
    }
    switch (n.k) {
      case 'raw': return n.code;
      case 'num': return n.v < 0 ? '(' + String(n.v) + ')' : String(n.v);
      case 'strlit': return String(this.strConst(n.v));
      case 'nstr': return 'S.named(' + JSON.stringify(n.v) + ')';
      case 'tmpstr': return 'S.tempStr(' + n.id + ')';
      case 'var': return this.varRead(n.name, ctx);
      case 'seq': {
        if (!n.items.length) return '0';
        return '(' + n.items.map(function (x) { return self.expr(x, ctx); }).join(', ') + ')';
      }
      case 'if':
        return '(' + T(this.expr(n.c, ctx)) + ' ? ' + this.expr(n.a, ctx) + ' : ' + (n.b ? this.expr(n.b, ctx) : '0') + ')';
      case 'logic': {
        var a = T(this.expr(n.a, ctx)), b = T(this.expr(n.b, ctx));
        return '((' + a + (n.op === '&&' ? ' && ' : ' || ') + b + ') ? 1 : 0)';
      }
      case 'un':
        if (n.op === '!') return '(' + T(this.expr(n.a, ctx)) + ' ? 0 : 1)';
        if (n.op === '-') return '(-' + this.expr(n.a, ctx) + ')';
        return this.expr(n.a, ctx);
      case 'bin': return this.binary(n.op, this.expr(n.a, ctx), this.expr(n.b, ctx));
      case 'index': return this.memRead(n, ctx);
      case 'assign': return this.assignment(n, ctx);
      case 'call': return this.call(n, ctx);
    }
    throw new EelError('cannot compile ' + n.k);
  };

  Compiler.prototype.binary = function (op, a, b) {
    switch (op) {
      case '+': return '(' + a + ' + ' + b + ')';
      case '-': return '(' + a + ' - ' + b + ')';
      case '*': return '(' + a + ' * ' + b + ')';
      case '/': return '(' + a + ' / ' + b + ')';
      case '%': return 'H.mod(' + a + ', ' + b + ')';
      case '^': return 'Math.pow(' + a + ', ' + b + ')';
      case '<<': return 'H.shl(' + a + ', ' + b + ')';
      case '>>': return 'H.shr(' + a + ', ' + b + ')';
      case '|': return 'H.bor(' + a + ', ' + b + ')';
      case '&': return 'H.band(' + a + ', ' + b + ')';
      case '~': return 'H.bxor(' + a + ', ' + b + ')';
      case '==': return '(Math.abs(' + a + ' - ' + b + ') < ' + EPS + ' ? 1 : 0)';
      case '!=': return '(Math.abs(' + a + ' - ' + b + ') < ' + EPS + ' ? 0 : 1)';
      case '===': return '(' + a + ' === ' + b + ' ? 1 : 0)';
      case '!==': return '(' + a + ' !== ' + b + ' ? 1 : 0)';
      case '<': case '>': case '<=': case '>=': return '(' + a + ' ' + op + ' ' + b + ' ? 1 : 0)';
    }
    throw new EelError('bad operator ' + op);
  };

  Compiler.prototype.strConst = function (s) {
    var i = this.strConsts.indexOf(s);
    if (i < 0) { i = this.strConsts.length; this.strConsts.push(s); }
    return 10000 + i;
  };

  Compiler.prototype.varRead = function (name, ctx) {
    if (name === 'gmem') return 'S.gmemBase';
    return this.ref(name, ctx);
  };

  Compiler.prototype.address = function (n, ctx) {
    if (n.base.k === 'var' && n.base.name === 'gmem') return { gmem: true, addr: this.expr(n.idx, ctx) };
    var base = this.expr(n.base, ctx);
    var idx = n.idx.k === 'num' && n.idx.v === 0 ? null : this.expr(n.idx, ctx);
    return { gmem: false, addr: idx === null ? base : '(' + base + ' + ' + idx + ')' };
  };
  Compiler.prototype.memRead = function (n, ctx) {
    var a = this.address(n, ctx);
    if (a.gmem) return 'S.grd(' + a.addr + ')';
    // Inline: a typed array read out of range is undefined, which || makes 0.
    return '(M[(' + a.addr + ' + ' + EPS + ') | 0] || 0)';
  };

  var COMPOUND = { '+=': '+', '-=': '-', '*=': '*', '/=': '/', '%=': '%', '^=': '^', '|=': '|', '&=': '&', '~=': '~', '<<=': '<<', '>>=': '>>' };

  Compiler.prototype.assignment = function (n, ctx) {
    var self = this;
    var lhs = n.lhs, rhs = this.expr(n.rhs, ctx);
    function value(cur) { return n.op === '=' ? rhs : self.binary(COMPOUND[n.op], cur, rhs); }
    if (lhs.k === 'var') {
      var r = this.ref(lhs.name, ctx);
      return '(' + r + ' = ' + value(r) + ')';
    }
    if (lhs.k === 'index') {
      var a = this.address(lhs, ctx), t = this.temp();
      var rdf = a.gmem ? 'S.grd' : 'rd', wrf = a.gmem ? 'S.gwr' : 'wr';
      return '(' + t + ' = ' + a.addr + ', ' + wrf + '(' + t + ', ' + value(rdf + '(' + t + ')') + '))';
    }
    if (lhs.k === 'if') {
      var tv = this.temp();
      var asg = function (side) { return side ? self.assignment({ k: 'assign', op: '=', lhs: side, rhs: { k: 'raw', code: tv } }, ctx) : '0'; };
      if (n.op !== '=') throw new EelError('compound assignment to a conditional is not supported');
      return '(' + tv + ' = ' + rhs + ', ' + T(this.expr(lhs.c, ctx)) + ' ? ' + asg(lhs.a) + ' : ' + asg(lhs.b) + ')';
    }
    if (lhs.k === 'nstr' || lhs.k === 'strlit') {
      return 'S.strcpy(' + this.expr(lhs, ctx) + ', ' + rhs + ')';
    }
    if (lhs.k === 'call' && lhs.name === 'slider') {
      var si = this.temp();
      return '(' + si + ' = ' + this.expr(lhs.args[0], ctx) + ', S.setSliderByIndex(' + si + ', ' + value('S.sliderByIndex(' + si + ')') + '))';
    }
    if (lhs.k === 'seq' && lhs.items.length) {
      var head = lhs.items.slice(0, -1).map(function (x) { return self.expr(x, ctx); });
      return '(' + head.concat([this.assignment({ k: 'assign', op: n.op, lhs: lhs.items[lhs.items.length - 1], rhs: n.rhs }, ctx)]).join(', ') + ')';
    }
    throw new EelError('cannot assign to ' + lhs.k);
  };

  // A variable passed by reference (midirecv, file_var): its JS lvalue.
  Compiler.prototype.lvalue = function (n, ctx) {
    if (n.k === 'var') return this.ref(n.name, ctx);
    return null;
  };

  Compiler.prototype.call = function (n, ctx) {
    var self = this, name = n.name, args = n.args;
    function A(i) { return args[i] === undefined ? '0' : self.expr(args[i], ctx); }
    function all() { return args.map(function (x) { return self.expr(x, ctx); }).join(', '); }
    if (MATH[name]) return MATH[name] + '(' + all() + ')';
    switch (name) {
      case 'midirecv': {
        var lv = args.map(function (x) { return self.lvalue(x, ctx); });
        var sets = [];
        for (var i = 0; i < lv.length; i++) {
          if (!lv[i]) continue;
          var src = lv.length >= 4 ? 'S.mr[' + i + ']' : (i === 2 ? '(S.mr[2] + S.mr[3] * 256)' : 'S.mr[' + i + ']');
          sets.push(lv[i] + ' = ' + src);
        }
        return '(S.midirecv() ? (' + (sets.length ? sets.join(', ') + ', ' : '') + 'S.mr[1]) : 0)';
      }
      case 'midisend':
        if (args.length >= 4) return 'S.midisend(' + A(0) + ', ' + A(1) + ', ' + A(2) + ', ' + A(3) + ')';
        return 'S.midisend3(' + A(0) + ', ' + A(1) + ', ' + A(2) + ')';
      case 'midisend_buf': return 'S.midisendBuf(' + A(0) + ', ' + A(1) + ', ' + A(2) + ')';
      case 'midisyx': return 'S.midisendBuf(' + A(0) + ', ' + A(1) + ', ' + A(2) + ')';
      case 'file_var': {
        var fv = this.lvalue(args[1], ctx);
        if (!fv) return 'S.fileVar(' + A(0) + ', ' + A(1) + ')';
        return '(' + fv + ' = S.fileVar(' + A(0) + ', ' + fv + '))';
      }
      case 'file_riff': {
        // channels and sample rate come back through the arguments
        var nc = this.lvalue(args[1], ctx), fr = this.lvalue(args[2], ctx);
        var t0 = this.temp();
        return '(' + t0 + ' = S.fileRiff(' + A(0) + ')' + (nc ? ', ' + nc + ' = S.riff[0]' : '') + (fr ? ', ' + fr + ' = S.riff[1]' : '') + ', ' + t0 + ')';
      }
      case 'slider': return 'S.sliderByIndex(' + A(0) + ')';
      case 'loop': case 'while':
        return '(() => { var rr = 0; ' + this.stmts(n, ctx, true, 'rr') + ' return rr; })()';
      case 'match': case 'matchi': {
        var refs = args.slice(2).map(function (x) { return self.lvalue(x, ctx); });
        var call = 'S.match(' + (name === 'matchi' ? 'true' : 'false') + ', ' + A(0) + ', ' + A(1) + ')';
        if (!refs.length) return call;
        var tm = this.temp();
        var assigns = refs.map(function (r, k) { return r ? r + ' = S.matchOut[' + k + ']' : ''; }).filter(Boolean);
        return '(' + tm + ' = ' + call + ', ' + tm + ' ? (' + (assigns.length ? assigns.join(', ') + ', ' : '') + '1) : 0)';
      }
    }
    if (this.funcs[name]) return this.userCall(this.funcs[name], args, ctx, '');
    if (name.indexOf('.') > 0) {
      var base = name.slice(name.lastIndexOf('.') + 1), prefix = name.slice(0, name.lastIndexOf('.'));
      if (this.funcs[base]) return this.userCall(this.funcs[base], args, ctx, prefix === 'this' || prefix.indexOf('this.') === 0 ? resolveThis(prefix, ctx) : prefix);
    }
    if (/^gfx_|^mouse_/.test(name)) {
      if (!this.gfx) return '(' + (args.length ? all() + ', ' : '') + '0)';
      // Width and height come back through the arguments, as file_riff's do.
      if (name === 'gfx_measurestr' || name === 'gfx_measurechar' || name === 'gfx_getimgdim') {
        var mw = this.lvalue(args[1] || { k: 'num', v: 0 }, ctx), mh = this.lvalue(args[2] || { k: 'num', v: 0 }, ctx);
        var tg = this.temp();
        return '(' + tg + ' = S.call(' + JSON.stringify(name) + ', ' + A(0) + ')' + (mw ? ', ' + mw + ' = S.gm[0]' : '') +
               (mh ? ', ' + mh + ' = S.gm[1]' : '') + ', ' + tg + ')';
      }
    }
    return 'S.call(' + JSON.stringify(name) + (args.length ? ', ' + all() : '') + ')';
  };

  // One compiled copy per function and namespace, as EEL2 does: a.f() and
  // b.f() are two functions, each with its own instance variables.
  Compiler.prototype.userCall = function (fn, args, ctx, ns) {
    var self = this;
    ns = ns || '';
    if (args.length !== fn.params.length && !(args.length === 1 && fn.params.length === 0)) {
      // EEL2 refuses the wrong number of arguments at compile time.
      throw new EelError(fn.name + '() takes ' + fn.params.length + ' arguments, given ' + args.length);
    }
    var jsName = 'F_' + fn.name.replace(/\./g, '_') + (ns ? '$' + ns.replace(/\./g, '$') : '');
    var key = fn.name + '@' + ns;
    if (!this.compiledFuncs[key]) {
      this.compiledFuncs[key] = true;
      var saved = this.temps;
      this.temps = 0;
      var body = this.stmts(fn.body, { fn: fn, ns: ns }, true, 'r');
      var temps = this.tempDecl();
      this.temps = saved;
      var params = fn.params.map(function (_, i) { return 'p' + i; });
      this.funcCode.push('function ' + jsName + '(' + params.join(', ') + ') { var r = 0;' + temps + body + ' return r; }');
    }
    return jsName + '(' + args.slice(0, fn.params.length).map(function (x) { return self.expr(x, ctx); }).join(', ') + ')';
  };

  // ----------------------------------------------------------- helpers ----
  function i64(x) { return Math.trunc(x); }
  function bigOp(a, b, f) { return Number(BigInt.asIntN(64, f(BigInt(i64(a)), BigInt(i64(b))))); }
  var H = {
    sqrt: function (x) { return Math.sqrt(Math.abs(x)); },
    sign: function (x) { return x > 0 ? 1 : (x < 0 ? -1 : 0); },
    invsqrt: function (x) { return 1 / Math.sqrt(x); },
    sqr: function (x) { return x * x; },
    exp2: function (x) { return Math.pow(2, x); },
    rand: function (x) { return Math.random() * (x === undefined ? 1 : x); },
    mod: function (a, b) {
      var ib = Math.trunc(Math.abs(b));
      return ib ? Math.trunc(Math.abs(a)) % ib : 0;
    },
    shl: function (a, b) { return bigOp(a, b, function (x, y) { return x << (y & 63n); }); },
    shr: function (a, b) { return bigOp(a, b, function (x, y) { return x >> (y & 63n); }); },
    bor: function (a, b) {
      if (Math.abs(a) < 2147483648 && Math.abs(b) < 2147483648) return (i64(a) | i64(b));
      return bigOp(a, b, function (x, y) { return x | y; });
    },
    band: function (a, b) {
      if (Math.abs(a) < 2147483648 && Math.abs(b) < 2147483648) return (i64(a) & i64(b));
      return bigOp(a, b, function (x, y) { return x & y; });
    },
    bxor: function (a, b) {
      if (Math.abs(a) < 2147483648 && Math.abs(b) < 2147483648) return (i64(a) ^ i64(b));
      return bigOp(a, b, function (x, y) { return x ^ y; });
    }
  };

  // C's %f: the double's exact decimal value, rounded half to even.
  var F64 = new Float64Array(1), U32 = new Uint32Array(F64.buffer);
  function toFixedC(x, f) {
    if (!isFinite(x)) return String(x);
    var neg = x < 0; F64[0] = Math.abs(x);
    var hi = U32[1], lo = U32[0], exp = (hi >>> 20) & 0x7ff;
    var mant = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo);
    if (exp === 0) exp = 1; else mant |= 1n << 52n;
    var e = exp - 1075, D, sc;
    if (e >= 0) { D = mant << BigInt(e); sc = 0; } else { D = mant * (5n ** BigInt(-e)); sc = -e; }
    var q;
    if (f >= sc) q = D * (10n ** BigInt(f - sc));
    else {
      var div = 10n ** BigInt(sc - f); q = D / div; var r2 = (D % div) * 2n;
      if (r2 > div || (r2 === div && (q & 1n) === 1n)) q += 1n;
    }
    var s = q.toString();
    if (f > 0) { while (s.length <= f) s = '0' + s; s = s.slice(0, s.length - f) + '.' + s.slice(s.length - f); }
    return (neg && /[1-9]/.test(s) ? '-' : (neg ? '-' : '')) + s;
  }

  // EEL2's sprintf, on doubles.
  function eelFormat(fmt, values) {
    var vi = 0;
    return fmt.replace(/%([-+ 0#]*)(\d*)(?:\.(\d+))?([dixXfgecs%])/g, function (all, flags, width, prec, conv) {
      if (conv === '%') return '%';
      var v = values[vi++], s;
      if (v === undefined) v = 0;
      switch (conv) {
        case 'd': case 'i': s = String(Math.trunc(v.num !== undefined ? v.num : v)); break;
        case 'x': s = (Math.trunc(v) >>> 0).toString(16); break;
        case 'X': s = (Math.trunc(v) >>> 0).toString(16).toUpperCase(); break;
        case 'f': s = toFixedC(Number(v), prec === undefined ? 6 : Number(prec)); break;
        case 'e': s = Number(v).toExponential(prec === undefined ? 6 : Number(prec)); break;
        case 'g': s = String(Number(Number(v).toPrecision(prec === undefined ? 6 : Math.max(1, Number(prec))))); break;
        case 'c': s = String.fromCharCode(Math.trunc(v)); break;
        case 's': s = v.str !== undefined ? v.str : String(v); break;
      }
      if (flags.indexOf('+') >= 0 && conv !== 's' && Number(v) >= 0) s = '+' + s;
      var w = Number(width || 0);
      while (s.length < w) s = flags.indexOf('-') >= 0 ? s + ' ' : (flags.indexOf('0') >= 0 && conv !== 's' ? '0' + s : ' ' + s);
      return s;
    });
  }

  // ---------------------------------------------------------- instance ----
  function JSFX(text, opts) {
    opts = opts || {};
    this.file = parseFile(text, opts.readImport);
    this.srate = opts.sampleRate || 48000;
    this.slots = { __count: 0 };
    var self = this;
    var C = new Compiler(this.slots);
    C.gfx = !!opts.gfx;
    // Predeclare what the host reads and writes.
    ['srate', 'samplesblock', 'tempo', 'play_state', 'play_position', 'beat_position', 'ts_num', 'ts_denom',
     'num_ch', 'trigger', 'pdc_delay', 'pdc_bot_ch', 'pdc_top_ch', 'pdc_midi', 'ext_noinit', 'ext_nodenorm',
     'ext_midi_bus', 'midi_bus', 'gfx_ext_retina'].forEach(function (n) { C.slot(n); });
    for (var c = 0; c < 64; c++) C.slot('spl' + c);
    for (var s = 1; s <= 64; s++) C.slot('slider' + s);
    this.file.sliders.forEach(function (sl) { C.slot(sl.variable); });
    if (C.gfx) ['gfx_r', 'gfx_g', 'gfx_b', 'gfx_a', 'gfx_a2', 'gfx_x', 'gfx_y', 'gfx_w', 'gfx_h', 'gfx_texth', 'gfx_mode', 'gfx_clear',
                'gfx_dest', 'gfx_ext_flags', 'mouse_x', 'mouse_y', 'mouse_cap', 'mouse_wheel', 'mouse_hwheel'].forEach(function (n) { C.slot(n); });

    var sections = {};
    ['init', 'slider', 'block', 'sample', 'serialize'].concat(C.gfx ? ['gfx'] : []).forEach(function (name) {
      var parts = self.file.sections[name];
      if (!parts.length) return;
      sections[name] = parts.map(function (part) { return C.compileSection(part.code, part.line); });
    });
    // @gfx is parsed for its functions only, so @init code that calls a
    // helper defined there still compiles.
    if (!C.gfx) this.file.sections.gfx.forEach(function (part) {
      try { parse(lex(part.code, part.line), C.funcs); } catch (e) { /* the window is not run */ }
    });

    // Room for names a later eval() adds: the generated code holds on to v.
    this.v = new Float64Array(this.slots.__count + 4096);
    this.strConsts = C.strConsts;
    var src = [];
    src.push('"use strict";');
    // Memory is one Float64Array that doubles when written past its end, up
    // to EEL2's 8M words; rd and wr sit beside it so V8 can inline them.
    src.push('var v = S.v, M = new Float64Array(' + BLOCK + ');');
    src.push('function rd(a) { var i = (a + ' + EPS + ') | 0; return (i >= 0 && i < M.length) ? M[i] : 0; }');
    src.push('function wr(a, x) { var i = (a + ' + EPS + ') | 0; if (i >= 0 && i < M.length) { M[i] = x; return x; } return grow(i, x); }');
    src.push('function grow(i, x) { if (i < 0 || i >= ' + (BLOCK * NBLOCKS) + ') return x; var n = M.length; while (n <= i) n *= 2;' +
             ' var N = new Float64Array(Math.min(n, ' + (BLOCK * NBLOCKS) + ')); N.set(M); M = N; M[i] = x; return x; }');
    src.push('S.rd = rd; S.wr = wr; S.clearMem = function () { M = new Float64Array(' + BLOCK + '); };');
    // Code compiled later (eval) runs in this scope, beside M, v and the helpers.
    src.push('S.evalIn = function (code) { return eval(code); };');
    src.push(C.funcCode.join('\n'));
    Object.keys(sections).forEach(function (name) {
      src.push('S.sec_' + name + ' = [' + sections[name].map(function (b) { return 'function () {' + b + '}'; }).join(',\n') + '];');
    });
    this.code = src.join('\n');
    this.reset();
    new Function('S', 'H', this.code)(this, H);
  }

  JSFX.prototype.reset = function () {
    this.v.fill(0);
    this.mem = new Array(NBLOCKS);
    this.gmem = NS.sharedGmem || (NS.sharedGmem = {});
    this.gmemName = (/gmem=(\S+)/.exec(this.file.options) || [])[1] || '';
    this.strings = {};
    this.namedIds = {};
    this.nextNamed = 90000;
    this.midiIn = []; this.midiInPos = 0; this.midiOut = [];
    this.mr = [0, 0, 0, 0];
    this.matchOut = [];
    this.serial = null;
    this.blockCount = 0;
    this.sliderDirty = true;
    this.sampleFrame = 0;
    var self = this;
    if (this.clearMem) this.clearMem();
    this.file.sliders.forEach(function (sl) { self.v[self.slots[sl.variable]] = sl.def; });
  };

  JSFX.prototype.slot = function (name) { return this.slots[name.toLowerCase()]; };
  JSFX.prototype.getVar = function (name) { var s = this.slot(name); return s === undefined ? 0 : this.v[s]; };
  JSFX.prototype.setVar = function (name, val) { var s = this.slot(name); if (s !== undefined) this.v[s] = val; };

  JSFX.prototype.sliderVar = function (n) {
    for (var i = 0; i < this.file.sliders.length; i++) if (this.file.sliders[i].index === n) return this.file.sliders[i].variable;
    return 'slider' + n;
  };
  JSFX.prototype.sliderByIndex = function (n) { return this.v[this.slots[this.sliderVar(Math.trunc(n))]] || 0; };
  JSFX.prototype.setSliderByIndex = function (n, val) { this.v[this.slots[this.sliderVar(Math.trunc(n))]] = val; return val; };
  JSFX.prototype.getSlider = function (n) { return this.sliderByIndex(n); };
  JSFX.prototype.setSlider = function (n, val) {
    this.setSliderByIndex(n, val);
    this.sliderDirty = true;
  };

  JSFX.prototype.runSection = function (name) {
    var list = this['sec_' + name];
    if (!list) return 0;
    var r = 0;
    for (var i = 0; i < list.length; i++) r = list[i]();
    return r;
  };

  JSFX.prototype.setTime = function (t) {
    var v = this.v, s = this.slots;
    if (t.tempo !== undefined) v[s.tempo] = t.tempo;
    if (t.playState !== undefined) v[s.play_state] = t.playState;
    if (t.beat !== undefined) v[s.beat_position] = t.beat;
    if (t.seconds !== undefined) v[s.play_position] = t.seconds;
    if (t.num !== undefined) v[s.ts_num] = t.num;
    if (t.den !== undefined) v[s.ts_denom] = t.den;
  };

  JSFX.prototype.init = function (sampleRate) {
    if (sampleRate) this.srate = sampleRate;
    var keep = this.file.sliders.map(function (sl) { return this.v[this.slots[sl.variable]]; }, this);
    this.reset();
    this.file.sliders.forEach(function (sl, i) { this.v[this.slots[sl.variable]] = keep[i]; }, this);
    var v = this.v, s = this.slots;
    v[s.srate] = this.srate;
    v[s.num_ch] = Math.max(this.file.inPins.length, this.file.outPins.length);
    v[s.tempo] = v[s.tempo] || 120; v[s.ts_num] = v[s.ts_num] || 4; v[s.ts_denom] = v[s.ts_denom] || 4;
    this.runSection('init');
    this.runSection('slider');
    this.sliderDirty = false;
    this.initialised = true;
  };

  /* One block: `inputs`/`outputs` are arrays of Float32Array per channel (or
   * null for a MIDI-only device), `midi` is [{offset, data:[b1,b2,b3]}]
   * sorted by offset. Returns the MIDI sent, with offsets. */
  JSFX.prototype.process = function (n, inputs, outputs, midi) {
    if (!this.initialised) this.init();
    var v = this.v, s = this.slots;
    if (this.sliderDirty) { this.sliderDirty = false; this.runSection('slider'); }
    v[s.samplesblock] = n;
    this.midiIn = midi || [];
    this.midiInPos = 0;
    this.midiOut = [];
    this.runSection('block');
    var sec = this.sec_sample;
    if (sec && sec.length) {
      var nIn = inputs ? inputs.length : 0, nOut = outputs ? outputs.length : 0;
      var nch = Math.max(nIn, nOut, 2);
      var spl = [];
      for (var c = 0; c < nch; c++) spl.push(s['spl' + c]);
      for (var i = 0; i < n; i++) {
        this.sampleFrame = i;
        for (var ci = 0; ci < nch; ci++) v[spl[ci]] = ci < nIn && inputs[ci] ? inputs[ci][i] : 0;
        for (var k = 0; k < sec.length; k++) sec[k]();
        for (var co = 0; co < nOut; co++) if (outputs[co]) outputs[co][i] = v[spl[co]];
      }
    } else if (outputs && inputs) {
      for (var ch = 0; ch < outputs.length; ch++) if (outputs[ch] && inputs[ch]) outputs[ch].set(inputs[ch]);
    }
    // MIDI a plug-in did not read passes through, as in REAPER.
    for (var r = this.midiInPos; r < this.midiIn.length; r++) this.midiOut.push(this.midiIn[r]);
    this.blockCount++;
    var out = this.midiOut;
    out.sort(function (a, b) { return a.offset - b.offset; });
    return out;
  };

  // ------------------------------------------------------- the host API --
  JSFX.prototype.midirecv = function () {
    if (this.midiInPos >= this.midiIn.length) return 0;
    var ev = this.midiIn[this.midiInPos++];
    this.mr[0] = ev.offset; this.mr[1] = ev.data[0]; this.mr[2] = ev.data[1] || 0; this.mr[3] = ev.data[2] || 0;
    return 1;
  };
  JSFX.prototype.midisend = function (offset, b1, b2, b3) {
    this.midiOut.push({ offset: Math.max(0, Math.trunc(offset)), data: [Math.trunc(b1) & 255, Math.trunc(b2) & 127, Math.trunc(b3) & 127] });
    return b1;
  };
  JSFX.prototype.midisend3 = function (offset, b1, b23) {
    b23 = Math.trunc(b23);
    return this.midisend(offset, b1, b23 & 255, (b23 >> 8) & 255);
  };
  JSFX.prototype.midisendBuf = function (offset, buf, len) {
    var data = [];
    for (var i = 0; i < len; i++) data.push(Math.trunc(this.rd(buf + i)) & 255);
    this.midiOut.push({ offset: Math.max(0, Math.trunc(offset)), data: data });
    return len;
  };

  JSFX.prototype.grd = function (a) { var g = this.gmem[this.gmemName]; if (!g) return 0; var i = (a + EPS) | 0; return g[i] || 0; };
  JSFX.prototype.gwr = function (a, val) {
    var g = this.gmem[this.gmemName] || (this.gmem[this.gmemName] = {});
    g[(a + EPS) | 0] = val; return val;
  };

  // Strings: literals are 10000+, named strings 90000+, slots 0-1023 free.
  JSFX.prototype.str = function (id) {
    id = Math.trunc(id);
    if (id >= 10000 && id < 90000) return this.strConsts[id - 10000] || '';
    return this.strings[id] || '';
  };
  JSFX.prototype.setStr = function (id, s) { this.strings[Math.trunc(id)] = s; return id; };
  JSFX.prototype.named = function (name) {
    var id = this.namedIds[name];
    if (id === undefined) { id = this.namedIds[name] = this.nextNamed++; this.strings[id] = ''; }
    return id;
  };
  JSFX.prototype.tempStr = function (site) { var id = 200000 + site; if (this.strings[id] === undefined) this.strings[id] = ''; return id; };
  JSFX.prototype.strcpy = function (d, s) { return this.setStr(d, this.str(s)); };
  JSFX.prototype.match = function (ci, pat, sid) {
    var p = this.str(pat), s = this.str(sid);
    var re = '^' + p.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$';
    return new RegExp(re, ci ? 'i' : '').test(s) ? 1 : 0;
  };

  JSFX.prototype.riff = [0, 0];
  JSFX.prototype.fileRiff = function (h) {
    var f = this.files && this.files[Math.trunc(h)];
    this.riff = f ? [f.channels, f.rate] : [0, 0];
    return f ? 1 : 0;
  };
  // One frame of @gfx, drawn by `host`: an object with a method per gfx_*
  // function (each called with the JSFX first), as the Ableton devices give.
  // `w`, `h` and `mouse` ({x, y, cap, wheel, hwheel}) are what REAPER sets.
  JSFX.prototype.runGfx = function (host, w, h, mouse) {
    if (!this.sec_gfx) return 0;
    if (!this.initialised) this.init();
    var v = this.v, s = this.slots;
    this.gfxHost = host;
    v[s.gfx_w] = w; v[s.gfx_h] = h;
    if (mouse) {
      v[s.mouse_x] = mouse.x; v[s.mouse_y] = mouse.y; v[s.mouse_cap] = mouse.cap;
      if (mouse.wheel) v[s.mouse_wheel] += mouse.wheel;
      if (mouse.hwheel) v[s.mouse_hwheel] += mouse.hwheel;
    }
    return this.runSection('gfx');
  };
  JSFX.prototype.gm = [0, 0];

  JSFX.prototype.call = function (name) {
    var a = Array.prototype.slice.call(arguments, 1);
    if (this.gfxHost && this.gfxHost[name]) return +this.gfxHost[name].apply(this.gfxHost, [this].concat(a)) || 0;
    var f = BUILTINS[name];
    if (!f) {
      if (!this.warned) this.warned = {};
      if (!this.warned[name] && typeof console !== 'undefined') { this.warned[name] = true; console.warn('JSFX: no ' + name + '()'); }
      return 0;
    }
    return f.apply(this, a);
  };

  // @serialize: values written in order, read back in order.
  JSFX.prototype.fileVar = function (h, cur) {
    h = Math.trunc(h);
    if (h === 0 && this.serial) {
      if (this.serial.mode === 'write') { this.serial.data.push(cur); return cur; }
      var d = this.serial.data[this.serial.pos++];
      return d === undefined ? cur : (typeof d === 'number' ? d : cur);
    }
    var f = this.files && this.files[h];
    if (f && f.pos < f.values.length) return f.values[f.pos++];
    return cur;
  };
  JSFX.prototype.serialize = function () {
    this.serial = { mode: 'write', data: [], pos: 0 };
    this.runSection('serialize');
    var data = this.serial.data;
    this.serial = null;
    return { sliders: this.file.sliders.map(function (sl) { return this.v[this.slots[sl.variable]]; }, this), data: data };
  };
  JSFX.prototype.deserialize = function (state) {
    if (!state) return;
    if (!this.initialised) this.init();
    if (state.sliders) this.file.sliders.forEach(function (sl, i) {
      if (state.sliders[i] !== undefined) this.v[this.slots[sl.variable]] = state.sliders[i];
    }, this);
    this.serial = { mode: 'read', data: state.data || [], pos: 0 };
    this.runSection('serialize');
    this.serial = null;
    this.sliderDirty = true;
  };

  // Run a line of EEL2 against this instance: how a device's own buttons
  // (Panic, Transfer to Pads...) are pressed from Middaw's controls.
  JSFX.prototype.eval = function (code) {
    var C = new Compiler(this.slots);
    C.gfx = !!opts.gfx;
    C.strConsts = this.strConsts;
    // reuse the instance's functions by recompiling them into this snippet
    var funcs = {};
    var self = this;
    ['init', 'slider', 'block', 'sample', 'serialize', 'gfx'].forEach(function (name) {
      self.file.sections[name].forEach(function (part) { try { parse(lex(part.code, part.line), funcs); } catch (e) {} });
    });
    C.funcs = funcs;
    var body = C.compileSection(code, 1);
    var fn = this.evalIn('(function () {' + C.funcCode.join('\n') + ' return function () {' + body + '}; })()');
    if (this.slots.__count > this.v.length) throw new EelError('too many new variables in eval');
    return fn();
  };

  var BUILTINS = {
    memset: function (d, val, n) { for (var i = 0; i < n; i++) this.wr(d + i, val); return d; },
    memcpy: function (d, s, n) {
      var tmp = [];
      for (var i = 0; i < n; i++) tmp.push(this.rd(s + i));
      for (var j = 0; j < n; j++) this.wr(d + j, tmp[j]);
      return d;
    },
    freembuf: function (n) { return n; },
    mem_set_values: function () { return 0; },
    time: function () { return Math.floor(Date.now() / 1000); },
    time_precise: function () { return (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000; },
    sliderchange: function () { if (this.onSliderChange) this.onSliderChange(); return 0; },
    slider_automate: function () { if (this.onSliderChange) this.onSliderChange(); return 0; },
    slider_show: function () { return 0; },
    strlen: function (s) { return this.str(s).length; },
    strcpy: function (d, s) { return this.setStr(d, this.str(s)); },
    strcat: function (d, s) { return this.setStr(d, this.str(d) + this.str(s)); },
    strcmp: function (a, b) { var x = this.str(a), y = this.str(b); return x < y ? -1 : x > y ? 1 : 0; },
    stricmp: function (a, b) { var x = this.str(a).toLowerCase(), y = this.str(b).toLowerCase(); return x < y ? -1 : x > y ? 1 : 0; },
    strncpy: function (d, s, n) { return this.setStr(d, this.str(s).slice(0, n)); },
    strcpy_substr: function (d, s, off, len) {
      var str = this.str(s);
      if (off < 0) off = Math.max(0, str.length + off);
      return this.setStr(d, len === undefined ? str.slice(off) : str.substr(off, Math.max(0, len)));
    },
    str_getchar: function (s, i) { var str = this.str(s); if (i < 0) i += str.length; return i >= 0 && i < str.length ? str.charCodeAt(i) : 0; },
    str_setchar: function (s, i, c) {
      var str = this.str(s); if (i < 0) i += str.length;
      if (i >= 0 && i <= str.length) this.setStr(s, str.slice(0, i) + String.fromCharCode(c) + str.slice(i + 1));
      return c;
    },
    sprintf: function (d, fmt) {
      var self = this, vals = Array.prototype.slice.call(arguments, 2);
      var f = this.str(fmt);
      // %s takes a string handle
      var vi = 0;
      var mapped = [];
      f.replace(/%[-+ 0#]*\d*(?:\.\d+)?([dixXfgecs%])/g, function (all, conv) {
        if (conv === '%') return all;
        var x = vals[vi++];
        mapped.push(conv === 's' ? { str: self.str(x) } : x);
        return all;
      });
      return this.setStr(d, eelFormat(f, mapped));
    },
    file_open: function (s) {
      var name = this.str(s);
      var vals = this.openFile ? this.openFile(name) : null;
      if (!vals) return -1;
      if (!this.files) { this.files = {}; this.nextFile = 1; }
      var h = this.nextFile++;
      this.files[h] = { values: vals.samples || vals, pos: 0, channels: vals.channels || 1, rate: vals.rate || this.srate };
      return h;
    },
    file_close: function (h) { if (this.files) delete this.files[h]; return 0; },
    file_rewind: function (h) { if (this.files && this.files[h]) this.files[h].pos = 0; return 0; },
    file_avail: function (h) {
      h = Math.trunc(h);
      if (h === 0 && this.serial) return this.serial.mode === 'write' ? -1 : this.serial.data.length - this.serial.pos;
      var f = this.files && this.files[h];
      return f ? f.values.length - f.pos : 0;
    },
    file_riff: function () { return 0; },
    file_text: function () { return 0; },
    file_mem: function (h, addr, n) {
      h = Math.trunc(h);
      if (h === 0 && this.serial) {
        if (this.serial.mode === 'write') { for (var i = 0; i < n; i++) this.serial.data.push(this.rd(addr + i)); }
        else { for (var j = 0; j < n; j++) { var d = this.serial.data[this.serial.pos++]; this.wr(addr + j, typeof d === 'number' ? d : 0); } }
        return n;
      }
      var f = this.files && this.files[h];
      if (!f) return 0;
      var k = 0;
      for (; k < n && f.pos < f.values.length; k++) this.wr(addr + k, f.values[f.pos++]);
      return k;
    },
    file_string: function (h, s) {
      h = Math.trunc(h);
      if (h === 0 && this.serial) {
        if (this.serial.mode === 'write') this.serial.data.push({ s: this.str(s) });
        else { var d = this.serial.data[this.serial.pos++]; if (d && d.s !== undefined) this.setStr(s, d.s); }
      }
      return 1;
    },
    export_buffer_to_project: function () { return this.exportBuffer ? this.exportBuffer.apply(this, arguments) : 0; },
    get_host_placement: function () { return 0; },
    get_host_numchan: function () { return 2; },
    set_host_numchan: function () { return 0; },
    get_pin_mapping: function () { return 0; },
    set_pdc: function () { return 0; },
    printf: function () { return 0; },
    gfx_getchar: function () { return 0; }
  };

  NS.JSFX = JSFX;
  NS.parseFile = parseFile;
  NS.parseSliderLine = parseSliderLine;
  NS.lexEel = lex;
  NS.parseEel = parse;
  NS.EelError = EelError;
})(typeof module === 'object' && module.exports
  ? (module.exports = (globalThis.MiddawJSFX = globalThis.MiddawJSFX || {}))
  : (globalThis.MiddawJSFX = globalThis.MiddawJSFX || {}));


/* ---- kit/gfx.js ---- */
/* REAPER's gfx_* drawing, on Max's mgraphics: the host a JSFX's @gfx runs on
 * (MiddawJSFX's runGfx). Each method takes the JSFX first, reads gfx_r, gfx_x
 * and the rest from its variables, and draws as REAPER would: text from its
 * top-left, gfx_x moved on past it, angles from twelve o'clock clockwise.
 *
 * gfx_showmenu cannot wait for a choice inside a frame, so it asks for one:
 * `menu` is set, the frame returns 0, and the device draws the menu. When an
 * item is chosen the device puts the variables back as they were at the start
 * of that frame and runs it again, and this time gfx_showmenu returns the item.
 */
var Gfx = (function () {
  'use strict';
  function Host(g) {
    this.g = g;
    this.fonts = { 0: { name: 'Arial', size: 13, flags: 0 } };
    this.font = 0;
    this.menu = null;        // { text, x, y } asked for this frame
    this.choice = 0;         // the item to give gfx_showmenu on the replayed frame
    this.slots = null;
  }
  Host.prototype.begin = function (g, fx) {
    this.g = g;
    if (!this.slots || this.fx !== fx) {
      this.fx = fx;
      var s = fx.slots;
      this.slots = { r: s.gfx_r, g: s.gfx_g, b: s.gfx_b, a: s.gfx_a, x: s.gfx_x, y: s.gfx_y, texth: s.gfx_texth,
                     mx: s.mouse_x, my: s.mouse_y, clear: s.gfx_clear };
    }
    this.menu = null;
    this.applyFont();
  };
  Host.prototype.v = function (k) { return this.fx.v[this.slots[k]]; };
  Host.prototype.set = function (k, x) { this.fx.v[this.slots[k]] = x; };
  // Every colour the script sets goes through Palette.tone: the house scheme
  // becomes Live's, other greys lose their tint, other colours stay.
  function toned(r, g, b) { return typeof Palette !== 'undefined' ? Palette.tone(r, g, b) : [clamp(r), clamp(g), clamp(b)]; }
  Host.prototype.colour = function () {
    var c = toned(this.v('r') || 0, this.v('g') || 0, this.v('b') || 0);
    this.g.set_source_rgba(c[0], c[1], c[2], clamp(this.v('a')));
  };
  // EEL2 strings are bytes; REAPER draws them as UTF-8.
  function utf8(s) { try { return decodeURIComponent(escape(s)); } catch (e) { return s; } }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : (x || 0); }
  function num(x, d) { return x === undefined || x !== x ? d : x; }

  // ------------------------------------------------------------ colour ---
  Host.prototype.gfx_set = function (fx, r, g, b, a) {
    r = num(r, 0);
    this.set('r', r); this.set('g', num(g, r)); this.set('b', num(b, r)); this.set('a', num(a, 1));
    return 0;
  };

  // ------------------------------------------------------------ shapes ---
  Host.prototype.gfx_rect = function (fx, x, y, w, h, filled) {
    if (!(w > 0 && h > 0)) return 0;
    this.colour();
    if (num(filled, 1)) { this.g.rectangle(x, y, w, h); this.g.fill(); }
    else { this.g.set_line_width(1); this.g.rectangle(x + 0.5, y + 0.5, w - 1, h - 1); this.g.stroke(); }
    return 0;
  };
  Host.prototype.gfx_line = function (fx, x1, y1, x2, y2) {
    this.colour();
    this.g.set_line_width(1);
    this.g.move_to(x1 + 0.5, y1 + 0.5); this.g.line_to(x2 + 0.5, y2 + 0.5); this.g.stroke();
    return 0;
  };
  Host.prototype.gfx_lineto = function (fx, x, y) {
    this.gfx_line(fx, this.v('x'), this.v('y'), x, y);
    this.set('x', x); this.set('y', y);
    return 0;
  };
  Host.prototype.gfx_circle = function (fx, x, y, r, fill) {
    this.colour();
    this.g.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
    if (num(fill, 0)) this.g.fill(); else { this.g.set_line_width(1); this.g.stroke(); }
    return 0;
  };
  Host.prototype.gfx_arc = function (fx, x, y, r, a1, a2) {
    this.colour();
    this.g.set_line_width(1);
    this.g.arc(x, y, Math.max(0, r), a1 - Math.PI / 2, a2 - Math.PI / 2);
    this.g.stroke();
    return 0;
  };
  Host.prototype.gfx_roundrect = function (fx, x, y, w, h, radius) {
    this.colour();
    this.g.set_line_width(1);
    this.g.rectangle_rounded(x + 0.5, y + 0.5, w, h, radius * 2, radius * 2);
    this.g.stroke();
    return 0;
  };
  Host.prototype.gfx_triangle = function (fx) {
    var p = Array.prototype.slice.call(arguments, 1);
    if (p.length < 6) return 0;
    this.colour();
    this.g.move_to(p[0], p[1]);
    for (var i = 2; i + 1 < p.length; i += 2) this.g.line_to(p[i], p[i + 1]);
    this.g.close_path();
    this.g.fill();
    return 0;
  };
  Host.prototype.gfx_gradrect = function (fx, x, y, w, h, r, g, b, a) {
    var c = toned(r || 0, g || 0, b || 0);
    this.g.set_source_rgba(c[0], c[1], c[2], clamp(num(a, 1)));
    this.g.rectangle(x, y, w, h); this.g.fill();
    return 0;
  };

  // -------------------------------------------------------------- text ---
  // gfx_setfont(idx, name, size, flags): flags is a character code, 'b' bold, 'i' italic.
  Host.prototype.gfx_setfont = function (fx, idx, name, size, flags) {
    idx = Math.trunc(num(idx, 0));
    if (name !== undefined && idx > 0) {
      this.fonts[idx] = { name: fx.str(name) || 'Arial', size: num(size, 13), flags: Math.trunc(num(flags, 0)) };
    }
    this.font = this.fonts[idx] ? idx : 0;
    this.applyFont();
    return 1;
  };
  Host.prototype.gfx_getfont = function () { return this.font; };
  Host.prototype.applyFont = function () {
    var f = this.fonts[this.font] || this.fonts[0], fl = f.flags;
    // REAPER's names for the system face are not names Max can ask for
    var face = /^\./.test(f.name) || /^segoe/i.test(f.name) ? 'Arial' : f.name;
    var bold = fl === 98 || ((fl >> 8) & 255) === 98 || ((fl >> 16) & 255) === 98;
    var italic = fl === 105 || ((fl >> 8) & 255) === 105 || ((fl >> 16) & 255) === 105;
    this.g.select_font_face(face, italic ? 'italic' : 'normal', bold ? 'bold' : 'normal');
    this.g.set_font_size(f.size);
    this.size = f.size;
    if (this.slots) this.set('texth', Math.round(f.size));
  };
  Host.prototype.measure = function (s) {
    var m = this.g.text_measure(s);
    return [m[0], Math.max(m[1], this.size)];
  };
  Host.prototype.gfx_measurestr = function (fx, s) { this.fx.gm = this.measure(utf8(fx.str(s))); return this.fx.gm[0]; };
  Host.prototype.gfx_measurechar = function (fx, c) { this.fx.gm = this.measure(String.fromCharCode(c)); return this.fx.gm[0]; };
  Host.prototype.text = function (s, flags, right, bottom) {
    var x = this.v('x'), y = this.v('y'), m = this.measure(s);
    flags = Math.trunc(num(flags, 0));
    if (right !== undefined && !(flags & 256)) {
      if (flags & 1) x = x + (right - x - m[0]) / 2; else if (flags & 2) x = right - m[0];
      if (flags & 4) y = y + (bottom - y - m[1]) / 2; else if (flags & 8) y = bottom - m[1];
    }
    this.colour();
    this.g.move_to(x, y + this.size * 0.8);
    this.g.show_text(s);
    this.set('x', x + m[0]);
    return 0;
  };
  Host.prototype.gfx_drawstr = function (fx, s, flags, right, bottom) { return this.text(utf8(fx.str(s)), flags, right, bottom); };
  Host.prototype.gfx_drawchar = function (fx, c) { return this.text(String.fromCharCode(c)); };
  Host.prototype.gfx_drawnumber = function (fx, n, digits) { return this.text(Number(n).toFixed(Math.max(0, Math.trunc(num(digits, 0))))); };
  Host.prototype.gfx_printf = function (fx, fmt) {
    var args = Array.prototype.slice.call(arguments, 2);
    var s = fx.str(fmt).replace(/%(-?\d*)(?:\.(\d+))?([dfsxXc%])/g, function (m, w, p, k) {
      if (k === '%') return '%';
      var a = args.shift();
      if (k === 's') return fx.str(a);
      if (k === 'c') return String.fromCharCode(a);
      if (k === 'x' || k === 'X') { var h = Math.trunc(a).toString(16); return k === 'X' ? h.toUpperCase() : h; }
      return k === 'd' ? String(Math.trunc(a)) : Number(a).toFixed(p === undefined ? 6 : +p);
    });
    return this.text(utf8(s));
  };

  // ------------------------------------------------------------- input ---
  // gfx_getchar(65536) asks about the window: 1 it has focus, 2 it is shown,
  // 4 the mouse is in it. With no argument it is the next key typed, which the
  // window's [key] hands in (Host.key); with a key it asks whether it is held.
  Host.prototype.gfx_getchar = function (fx, c) {
    if (c === 65536) return 1 | 2 | (this.mouseIn ? 4 : 0);
    if (c) return 0;
    return this.keys && this.keys.length ? this.keys.shift() : 0;
  };
  // Max's key codes as REAPER's gfx_getchar gives them: the arrows and the
  // editing keys are four-letter codes there.
  var KEYS = { 28: 0x6C656674, 29: 0x72676874, 30: 0x7570, 31: 0x646F776E, 127: 0x64656C, 8: 8, 9: 9, 13: 13, 27: 27,
               '-9': 0x6C656674, '-10': 0x72676874, '-11': 0x7570, '-12': 0x646F776E };
  Host.prototype.key = function (code) {
    (this.keys = this.keys || []).push(KEYS[code] !== undefined ? KEYS[code] : code);
    if (this.keys.length > 32) this.keys.shift();
  };
  Host.prototype.gfx_showmenu = function (fx, s) {
    if (this.choice) { var k = this.choice; this.choice = 0; return k; }
    this.menu = { text: utf8(fx.str(s)), x: this.v('x'), y: this.v('y') };
    return 0;
  };
  Host.prototype.gfx_setcursor = function () { return 0; };
  Host.prototype.gfx_getdropfile = function () { return 0; };
  Host.prototype.gfx_update = function () { return 0; };

  // A menu as gfx_showmenu writes it: items split by |, '#' greyed, '!'
  // ticked, '>' opens a submenu, '<' closes one. Numbered as REAPER numbers
  // them: every item that is not a submenu's title, in order, from 1.
  function parseMenu(text) {
    var out = [], depth = 0, n = 0;
    String(text).split('|').forEach(function (raw) {
      var t = raw, grey = false, tick = false, opens = false, closes = false;
      for (;;) {
        var c = t.charAt(0);
        if (c === '#') { grey = true; t = t.slice(1); } else if (c === '!') { tick = true; t = t.slice(1); }
        else if (c === '>') { opens = true; t = t.slice(1); } else if (c === '<') { closes = true; t = t.slice(1); } else break;
      }
      if (opens) { out.push({ label: t, title: true, depth: depth }); depth++; return; }
      if (t === '' && !closes) { out.push({ rule: true, depth: depth }); return; }
      n++;
      out.push({ label: t, index: n, grey: grey, tick: tick, depth: depth });
      if (closes) depth = Math.max(0, depth - 1);
    });
    return out;
  }

  // gfx_clear's colour (r + g * 256 + b * 65536) as Live draws it.
  function clearColour(c) { return toned((c & 255) / 255, ((c >> 8) & 255) / 255, ((c >> 16) & 255) / 255); }

  // The menu gfx_showmenu asked for, drawn the same in every device.
  var ITEM_H = 20;
  function drawMenu(g, r, items, hover) {
    var P = Palette.C, rgb = Palette.rgb, c;
    c = rgb(P.popup); g.set_source_rgba(c[0], c[1], c[2], 1); g.rectangle(r[0], r[1], r[2], r[3]); g.fill();
    c = rgb(P.edge); g.set_source_rgba(c[0], c[1], c[2], 1); g.set_line_width(1); g.rectangle(r[0] + 0.5, r[1] + 0.5, r[2] - 1, r[3] - 1); g.stroke();
    items.forEach(function (it, i) {
      var y = r[1] + 4 + i * ITEM_H;
      if (it.rule) { c = rgb(P.rule); g.set_source_rgba(c[0], c[1], c[2], 1); g.rectangle(r[0] + 6, y + ITEM_H / 2, r[2] - 12, 1); g.fill(); return; }
      var on = i === hover && it.index && !it.grey;
      if (on) { c = rgb(P.accent); g.set_source_rgba(c[0], c[1], c[2], 1); g.rectangle(r[0] + 2, y, r[2] - 4, ITEM_H); g.fill(); }
      c = rgb(on ? P.ink : it.grey || it.title ? P.dim : P.text);
      g.set_source_rgba(c[0], c[1], c[2], 1);
      g.move_to(r[0] + 22 + it.depth * 12, y + 14);
      g.show_text(it.label);
      if (it.tick) { g.move_to(r[0] + 7 + it.depth * 12, y + 14); g.show_text('✓'); }
    });
  }

  return { Host: Host, parseMenu: parseMenu, clearColour: clearColour, drawMenu: drawMenu, ITEM_H: ITEM_H };
})();


/* ---- kit/live.js ---- */
/* The Live set, as the family's devices need it: the song's tempo, meter and
 * scale, the notes of the clip being edited, somewhere to put new notes, and
 * a way to hear notes before they are used.
 *
 * Everything goes through the Live Object Model (LiveAPI). Times are beats,
 * which in Live are quarter notes - the unit every family engine already
 * speaks - so nothing is converted but the field names.
 */
var Live = (function () {
  'use strict';
  function api(path) { return new LiveAPI(null, path); }
  function one(a, prop) { var v = a.get(prop); return Array.isArray(v) ? v[0] : v; }
  function exists(a) { return a && Number(a.id) !== 0; }
  function json(v) {
    if (typeof v === 'string') return JSON.parse(v);
    if (Array.isArray(v) && typeof v[0] === 'string' && v.length === 1) return JSON.parse(v[0]);
    return v;
  }

  // Live 12's scale names, as ScaleView numbers its scales (1-16). A scale
  // ScaleView has no name for is left out: the device keeps its own key.
  var SCALE = {
    'Major': 1, 'Minor': 2, 'Harmonic Minor': 3, 'Dorian': 5, 'Phrygian': 6, 'Lydian': 7,
    'Mixolydian': 8, 'Major Pentatonic': 10, 'Minor Pentatonic': 11, 'Minor Blues': 13,
    'Whole Tone': 14, 'Whole-half Dim.': 15, 'Half-whole Dim.': 16
  };
  // ScaleView's eighteen roots, and the spelling a key on each pitch class
  // takes: flats for the major side, sharps where a minor key has them.
  var ROOTS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B', 'Cb'];
  var MAJOR_SIDE = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  var MINOR_SIDE = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];
  var MINORISH = { 2: 1, 3: 1, 5: 1, 6: 1, 11: 1, 13: 1 };
  var SCALE_NAMES = ['Major', 'Minor (Natural)', 'Harmonic Minor', 'Ionian', 'Dorian', 'Phrygian', 'Lydian',
                     'Mixolydian', 'Aeolian', 'Major Pentatonic', 'Minor Pentatonic', 'Major Blues', 'Minor Blues',
                     'Whole Tone', 'Diminished Whole-Half', 'Diminished Half-Whole'];

  // Live's scale (a root pitch class and a name) as the family's key, or
  // null for a scale ScaleView does not have.
  function keyOf(pc, name) {
    var sc = SCALE[String(name)];
    if (!sc) return null;
    return { root: ROOTS.indexOf((MINORISH[sc] ? MINOR_SIDE : MAJOR_SIDE)[((+pc % 12) + 12) % 12]) + 1, scale: sc };
  }

  function song() {
    var s = api('live_set');
    var out = { tempo: +one(s, 'tempo') || 120, num: +one(s, 'signature_numerator') || 4,
                den: +one(s, 'signature_denominator') || 4, playing: !!+one(s, 'is_playing'),
                position: +one(s, 'current_song_time') || 0, key: null };
    var mode = s.get('scale_mode');
    if (mode !== undefined && mode !== null) {
      var name = String(one(s, 'scale_name')), pc = +one(s, 'root_note');
      out.liveScale = { on: !!+(Array.isArray(mode) ? mode[0] : mode), name: name, root: pc };
      out.key = keyOf(pc, name);
    }
    return out;
  }

  function detailClip() {
    var c = api('live_set view detail_clip');
    if (!exists(c) || !+one(c, 'is_midi_clip')) return null;
    return c;
  }

  // The clip being edited: its selected notes if any are selected, else every
  // note in its loop. Starts are from the start of what was taken.
  function clipNotes() {
    var c = detailClip();
    if (!c) return null;
    var from = +one(c, 'loop_start') || 0, to = +one(c, 'loop_end') || 0;
    var raw = null, selected = false;
    try { raw = json(c.call('get_selected_notes_extended')); selected = raw && raw.notes && raw.notes.length > 0; } catch (e) { raw = null; }
    if (!selected) raw = json(c.call('get_notes_extended', 0, 128, from, Math.max(0, to - from)));
    var notes = ((raw && raw.notes) || []).filter(function (n) { return !n.mute; }).map(function (n) {
      return { start: n.start_time, len: n.duration, pitch: n.pitch, vel: Math.round(n.velocity) };
    });
    var first = selected && notes.length ? Math.min.apply(null, notes.map(function (n) { return n.start; })) : from;
    var beats = to - from;
    if (selected) {
      var bar = 4, end = 0;
      notes.forEach(function (n) { end = Math.max(end, n.start + n.len); });
      first = Math.floor(first / bar) * bar;
      beats = Math.ceil((end - first) / bar) * bar;
    }
    notes.forEach(function (n) { n.start -= first; });
    notes.sort(function (a, b) { return a.start - b.start || a.pitch - b.pitch; });
    return { notes: notes, beats: beats, name: String(one(c, 'name') || ''), selected: selected, drums: drumTrack() };
  }

  // A track whose instrument is a Drum Rack plays drums: its note numbers name
  // drums, not pitches, and the engines treat them that way.
  function drumTrack() {
    try {
      var track = api('this_device canonical_parent'), n = track.getcount('devices');
      for (var i = 0; i < n; i++) if (+one(api(track.unquotedpath + ' devices ' + i), 'can_have_drum_pads')) return true;
    } catch (e) { /* not known: not drums */ }
    return false;
  }

  function liveNotes(notes) {
    return { notes: notes.map(function (n) {
      return { pitch: Math.max(0, Math.min(127, Math.round(n.pitch))), start_time: Math.max(0, n.start),
               duration: Math.max(1 / 128, n.len), velocity: Math.max(1, Math.min(127, Math.round(n.vel || 100))), mute: 0 };
    }) };
  }

  function undoable(fn) {
    var s = api('live_set');
    try { s.call('begin_undo_step'); } catch (e) { /* Live before 11.1 */ }
    try { return fn(); } finally { try { s.call('end_undo_step'); } catch (e2) { /* as above */ } }
  }

  function show(clip) {
    try { api('live_set view').set('detail_clip', 'id', Number(clip.id)); } catch (e) { /* the clip is made either way */ }
  }

  function selectedScene() {
    var scene = api('live_set view selected_scene'), n = api('live_set').getcount('scenes');
    for (var i = 0; i < n; i++) if (Number(api('live_set scenes ' + i).id) === Number(scene.id)) return i;
    return 0;
  }
  function thisTrack() {
    var track = api('this_device canonical_parent');
    if (!exists(track) || !+one(track, 'has_midi_input')) return null;
    return track;
  }
  // Where this device's track is in the set, for putting new tracks beside it.
  function trackIndex(track) {
    var n = api('live_set').getcount('tracks');
    for (var i = 0; i < n; i++) if (Number(api('live_set tracks ' + i).id) === Number(track.id)) return i;
    return n - 1;
  }
  function clipInSlot(slot, notes, beats, name) {
    slot.call('create_clip', Math.max(1, beats));
    var clip = api(slot.unquotedpath + ' clip');
    if (name) clip.set('name', name);
    clip.call('add_new_notes', liveNotes(notes));
    return clip;
  }
  function freeSlot(track, from) {
    var n = track.getcount('clip_slots');
    for (var k = 0; k < n; k++) {
      var at = (from + k) % n, slot = api(track.unquotedpath + ' clip_slots ' + at);
      if (!+one(slot, 'has_clip')) return { slot: slot, at: at };
    }
    return null;
  }
  function arrangementClipOn(track, notes, beats, name, at) {
    var before = track.getcount('arrangement_clips');
    try { track.call('create_midi_clip', at, Math.max(1, beats)); } catch (e) { /* checked below */ }
    var count = track.getcount('arrangement_clips');
    if (!(count > before)) return false;
    for (var i = 0; i < count; i++) {
      var clip = api(track.unquotedpath + ' arrangement_clips ' + i);
      if (Math.abs((+one(clip, 'start_time') || 0) - at) < 1e-6) {
        if (name) clip.set('name', name);
        clip.call('add_new_notes', liveNotes(notes));
        return true;
      }
    }
    return false;
  }

  // New notes, as a new clip in the first free slot on this device's track,
  // from the selected scene down. `more` are further parts ({name, notes}),
  // each on a new MIDI track after this one, in the same scene. Returns what
  // happened, for the status line.
  function newClip(notes, beats, name, more) {
    var track = thisTrack();
    if (!track) return { ok: false, message: 'This device needs to be on a MIDI track.' };
    var free = freeSlot(track, selectedScene());
    if (!free) return { ok: false, message: 'Every clip slot on this track is full. Add a scene, then try again.' };
    return undoable(function () {
      var clip = clipInSlot(free.slot, notes, beats, name);
      var made = newTracks(track, more, function (t) {
        clipInSlot(api(t.unquotedpath + ' clip_slots ' + free.at), this.notes, beats, this.name);
      });
      show(clip);
      return { ok: true, message: 'Added a clip in scene ' + (free.at + 1) + (made ? ', and ' + made + ' on new tracks beside it.' : '.') };
    });
  }

  // New notes on a new MIDI track beside this one, in the selected scene:
  // a suggestion goes with the music it was made for, not over it.
  function newTrackClip(notes, beats, name, more) {
    var track = thisTrack();
    if (!track) return { ok: false, message: 'This device needs to be on a MIDI track.' };
    var scene = selectedScene();
    return undoable(function () {
      var parts = [{ name: name, notes: notes }].concat(more || []);
      newTracks(track, parts, function (t) { show(clipInSlot(api(t.unquotedpath + ' clip_slots ' + scene), this.notes, beats, this.name)); });
      return { ok: true, message: parts.length === 1 ? 'Added a track beside this one, with the clip in scene ' + (scene + 1) + '.'
                                                     : 'Added ' + parts.length + ' tracks beside this one, with the clips in scene ' + (scene + 1) + '.' };
    });
  }

  // Each further part on a new MIDI track, in order, after this one.
  function newTracks(track, more, put) {
    if (!more || !more.length) return '';
    var at = trackIndex(track), song = api('live_set');
    more.forEach(function (part, k) {
      song.call('create_midi_track', at + 1 + k);
      var t = api('live_set tracks ' + (at + 1 + k));
      t.set('name', part.name);
      put.call(part, t);
    });
    return more.length === 1 ? 'one more part' : more.length + ' more parts';
  }

  // New notes in place of the notes of the clip being edited, from its loop start.
  function replaceInClip(notes, beats) {
    var c = detailClip();
    if (!c) return { ok: false, message: 'No MIDI clip is open. Open one in Detail View, then try again.' };
    var from = +one(c, 'loop_start') || 0;
    return undoable(function () {
      var span = Math.max(beats, (+one(c, 'loop_end') || 0) - from);
      c.call('remove_notes_extended', 0, 128, from, span);
      c.call('add_new_notes', liveNotes(notes.map(function (n) {
        return { start: n.start + from, len: n.len, pitch: n.pitch, vel: n.vel };
      })));
      if ((+one(c, 'loop_end') || 0) < from + beats) c.set('loop_end', from + beats);
      return { ok: true, message: 'Replaced the notes in “' + (String(one(c, 'name') || '') || 'the clip') + '”.' };
    });
  }

  // New notes in the Arrangement at the insert marker, on this device's track
  // (Track.create_midi_clip, Live 12.2 and later); further parts as above.
  function arrangementClip(notes, beats, name, more) {
    var track = thisTrack();
    if (!track) return { ok: false, message: 'This device needs to be on a MIDI track.' };
    var at = +one(api('live_set'), 'current_song_time') || 0;
    return undoable(function () {
      if (!arrangementClipOn(track, notes, beats, name, at)) {
        return { ok: false, message: 'This version of Live can\u2019t add Arrangement clips from a device. Choose New Clip instead.' };
      }
      var made = newTracks(track, more, function (t) { arrangementClipOn(t, this.notes, beats, this.name, at); });
      return { ok: true, message: 'Added a clip to the Arrangement at beat ' + (Math.round(at * 100) / 100 + 1) +
               (made ? ', and ' + made + ' on new tracks beside it.' : '.') };
    });
  }

  // ------------------------------------------------------------ player ---
  // Notes heard through this device's MIDI out: the instrument after it on
  // the track plays them. A Task ticks every few milliseconds and sends what
  // is due; nothing waits on the transport.
  function Player(send) {
    this.send = send; this.events = []; this.pos = 0; this.t0 = 0; this.task = null; this.sounding = {};
    this.onEnd = null;
  }
  Player.prototype.play = function (notes, tempo, onEnd) {
    this.stop();
    var ms = 60000 / (tempo || 120), ev = [];
    notes.forEach(function (n) {
      ev.push({ t: n.start * ms, on: true, pitch: n.pitch, vel: n.vel || 100 });
      ev.push({ t: (n.start + n.len) * ms - 1, on: false, pitch: n.pitch });
    });
    ev.sort(function (a, b) { return a.t - b.t || (a.on === b.on ? 0 : a.on ? 1 : -1); });
    this.events = ev; this.pos = 0; this.t0 = Date.now(); this.onEnd = onEnd || null;
    var self = this;
    this.task = new Task(function () { self.tick(); }, this);
    this.task.interval = 4;
    this.task.repeat();
    this.tick();
  };
  Player.prototype.tick = function () {
    var now = Date.now() - this.t0;
    while (this.pos < this.events.length && this.events[this.pos].t <= now) {
      var e = this.events[this.pos++];
      if (e.on) { this.sounding[e.pitch] = (this.sounding[e.pitch] || 0) + 1; this.send([0x90, e.pitch, Math.max(1, Math.min(127, Math.round(e.vel)))]); }
      else if (this.sounding[e.pitch]) { this.sounding[e.pitch]--; this.send([0x80, e.pitch, 0]); }
    }
    if (this.pos >= this.events.length) {
      var end = this.onEnd;
      this.stop();
      if (end) end();
    }
  };
  Player.prototype.playing = function () { return !!this.task; };
  Player.prototype.stop = function () {
    if (this.task) { this.task.cancel(); this.task.freepeer && this.task.freepeer(); this.task = null; }
    var self = this;
    Object.keys(this.sounding).forEach(function (p) {
      for (var i = 0; i < self.sounding[p]; i++) self.send([0x80, +p, 0]);
    });
    this.sounding = {};
    this.onEnd = null;
  };

  return { song: song, clipNotes: clipNotes, newClip: newClip, newTrackClip: newTrackClip, replaceInClip: replaceInClip,
           arrangementClip: arrangementClip, drumTrack: drumTrack, Player: Player, ROOTS: ROOTS, SCALE_NAMES: SCALE_NAMES,
           keyOf: keyOf };
})();


/* ---- actions.js ---- */
/* Transient Shuffler in Live.
 *
 * In REAPER a sound dropped on the window is read with file_open and spliced
 * by the plug-in itself. Here the sound is dropped on the device strip and
 * decoded by a buffer~ (any format Live reads); the window's copy of the
 * plug-in reads it through file_open as before (fx.openFile), finds the
 * attacks and builds the two results. gen~ plays them: its memory is a
 * buffer~ (Buffer M), and the sounds and their tables are copied there
 * whenever they change. The window's Play buttons reach gen~'s @block through
 * ui_trig, ui_trig_src and ui_stop (fromWindow in device.json). */
var TS = { names: {}, cache: {}, pending: {}, mem: null, sig: '', n: 0, ready: false };
var TS_PATH = { A: '#patha', B: '#pathb' };

function srcname(key, name) { TS.names[key] = String(name); }
function memname(name) { try { TS.mem = new Buffer(String(name)); } catch (e) { TS.mem = null; } TS.sig = ''; }
function baseName(p) { return String(p).replace(/^.*[\/\\:]/, ''); }

// A sound dropped on the strip goes to its buffer~, which says when it is in.
function drop(key, path) {
  path = String(path);
  TS.pending[key] = path;
  outlet(4, key, 'replace', path);
  say('Loading ' + baseName(path) + '…');
}
function loaded(key) {
  var path = TS.pending[key];
  if (!path || !TS.names[key]) return;
  delete TS.pending[key];
  var b = new Buffer(TS.names[key]);
  var ch = Math.max(1, b.channelcount()), n = b.framecount(), ms = b.length();
  if (!(n > 0)) { say('That file has no sound in it. Choose another.'); return; }
  var rate = ms > 0 ? n / (ms / 1000) : 48000;
  var samples = new Float64Array(n * ch);
  for (var c = 0; c < ch; c++) {
    for (var at = 0; at < n; at += 4096) {
      var part = b.peek(c + 1, at, Math.min(4096, n - at));
      for (var i = 0; i < part.length; i++) samples[(at + i) * ch + c] = part[i];
    }
  }
  TS.cache[path] = { samples: samples, channels: ch, rate: Math.round(rate) };
  fx.setStr(fx.named(TS_PATH[key]), path);
  fx.setVar('need_load', 1);
  say('Loaded ' + baseName(path) + ' as ' + key + '.');
}

// What gen~ plays from: each sound's frames, and the tables that say where they are.
function signature() {
  var s = [], sl = fx.getVar('s_l'), focus = fx.getVar('focus');
  for (var a = sl; a < focus; a++) s.push(fx.rd(a));
  for (var k = 0; k < 4; k++) {
    var len = fx.rd(fx.getVar('s_len') + k), L = fx.rd(sl + k);
    for (var j = 0; j < len; j += 997) s.push(fx.rd(L + j));
  }
  return s.join(',');
}
function copyToGen() {
  if (!TS.mem) return;
  var sl = fx.getVar('s_l'), sr = fx.getVar('s_r'), lenAt = fx.getVar('s_len'), focus = fx.getVar('focus');
  function copy(from, n) {
    for (var at = 0; at < n; at += 65536) {
      var part = [], m = Math.min(65536, n - at);
      for (var i = 0; i < m; i++) part.push(fx.rd(from + at + i));
      TS.mem.poke(1, from + at, part);
    }
  }
  for (var k = 0; k < 4; k++) {
    var len = Math.trunc(fx.rd(lenAt + k));
    if (len > 0) { copy(Math.trunc(fx.rd(sl + k)), len); copy(Math.trunc(fx.rd(sr + k)), len); }
  }
  copy(Math.trunc(sl), Math.trunc(focus - sl));
}

var ACTIONS = {
  tick: function (fx) {
    if (!TS.ready) {
      TS.ready = true;
      fx.openFile = function (name) { return TS.cache[name] || null; };
    }
    // a sound named in a saved set is read again
    ['A', 'B'].forEach(function (key) {
      var p = fx.str(fx.named(TS_PATH[key]));
      if (p && !TS.cache[p] && !TS.pending[key] && TS.names[key]) drop(key, p);
    });
    if ((TS.n++ % 25) === 0) fx.runSection('block');   // housekeeping, as @block does while the window is closed
    if ((TS.n % 60) === 0) {
      var sig = signature();
      if (sig !== TS.sig) { TS.sig = sig; copyToGen(); }
    }
  }
};


/* ---- kit/jsfx_device.js ---- */
/* A family JSFX as a Max for Live MIDI effect: the .jsfx itself, unchanged,
 * on Middaw's EEL2 runtime, with its own @gfx window drawn in this [v8ui].
 *
 * The [v8ui] sits in the device's window subpatcher, which the device strip's
 * Show Window button opens. Its code runs whether the window is open or not.
 *
 * A Task ticks every few milliseconds: the MIDI that arrived since the last
 * tick goes in, a block as long as the time that passed is run, and what the
 * plug-in sends comes straight out. Live's tempo, meter, transport and song
 * position are what REAPER would give it.
 *
 * Expects, before it: Gfx, Live, MiddawJSFX, and DEVICE = { main, files,
 * actions? }. A device's own buttons (Load Clip, Insert the Take) are in
 * ACTIONS, defined in the repository's ableton/actions.js, which shares this
 * file's global scope: its own functions must not reuse a name defined here
 * (send, say, load, tick...), or this file's takes its place.
 * Inlet 0: bang (Live is ready), MIDI bytes, restore, and the strip's
 * commands. Outlets: 0 MIDI bytes, 1 the saved state to [pattr], 2 the
 * strip's status line.
 *
 * DEVICE.audio: the sound is gen~'s (ableton/kit/jsfx2gen.js), not this
 * file's. The plug-in here runs @init, @slider and @gfx only, for its window;
 * what its sliders say goes to gen~ (outlet 3, "sliderN value"), with Live's
 * tempo and transport, and MIDI goes to gen~ through the buffer~ the patcher
 * names in "mqname" (three values a message, the count at 0).
 */
inlets = 1;
outlets = DEVICE.audio ? (DEVICE.drops ? 5 : 4) : 3;
mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

var SR = 48000;
var ACTIONS = typeof ACTIONS === 'undefined' ? {} : ACTIONS;

// The bundle keeps files as bytes; the runtime reads a .jsfx as text.
function source(name) {
  var t = DEVICE.files[name];
  if (t === undefined) return null;
  try { return decodeURIComponent(escape(t)); } catch (e) { return t; }
}
var fx = new MiddawJSFX.JSFX(source(DEVICE.main), { gfx: true, sampleRate: SR, readImport: source });
fx.init(SR);

var D = {
  ready: false, pending: null, task: null, last: 0, beat: 0, pos: 0,
  midiIn: [], running: [], status: '', host: new Gfx.Host(mgraphics),
  mouse: { x: -1, y: -1, cap: 0, wheel: 0 }, release: false, frameSaw: true,
  menu: null, menuSnap: null, menuMouse: null, frames: 0, song: { tempo: 120, num: 4, den: 4, playing: false }
};

function say(msg) { D.status = msg || ''; outlet(2, 'set', D.status); }
function send(data) { for (var i = 0; i < data.length; i++) outlet(0, data[i]); }

// ---------------------------------------------------------------- MIDI --
// [midiin] gives a byte at a time; a message is whole once its data are in.
function msg_int(b) {
  b = b & 255;
  if (b >= 0xF8) return;                      // real-time: not passed to the plug-in
  if (b & 0x80) { D.running = [b]; return; }
  if (!D.running.length) return;
  D.running.push(b);
  var st = D.running[0] & 0xF0, need = (st === 0xC0 || st === 0xD0) ? 2 : 3;
  if (D.running[0] >= 0xF0) { D.running = []; return; }  // system messages are not passed on
  if (D.running.length === need) {
    D.midiIn.push(need === 2 ? [D.running[0], D.running[1], 0] : D.running.slice());
    D.running = [D.running[0]];
  }
}

// --------------------------------------------------------------- clock --
function readSong() {
  try {
    var s = Live.song();
    D.song = { tempo: s.tempo, num: s.num, den: s.den, playing: s.playing, position: s.position };
  } catch (e) { /* outside Live */ }
}
// ------------------------------------------------------------ gen~ ----
var GEN = { sent: {}, mq: null, written: 0, CAP: 256, every: 0 };
function mqname(name) {
  try { GEN.mq = new Buffer(String(name)); } catch (e) { GEN.mq = null; }
}
function toGen() {
  fx.file.sliders.forEach(function (sl) {
    var v = fx.sliderByIndex(sl.index);
    if (GEN.sent[sl.index] !== v) { GEN.sent[sl.index] = v; outlet(3, 'slider' + sl.index, v); }
  });
  (DEVICE.fromWindow || []).forEach(function (n) {
    var v = fx.getVar(n);
    if (GEN.sent['w_' + n] !== v) { GEN.sent['w_' + n] = v; outlet(3, 'w_' + n, v); }
  });
  if ((GEN.every++ % 12) === 0) {
    outlet(3, 'tempo', D.song.tempo); outlet(3, 'play_state', D.song.playing ? 1 : 0);
    outlet(3, 'beat_position', D.song.playing ? D.song.position : D.beat);
    outlet(3, 'ts_num', D.song.num); outlet(3, 'ts_denom', D.song.den);
  }
}
function midiToGen(data) {
  if (!GEN.mq) return;
  var at = 1 + 3 * (GEN.written % GEN.CAP);
  GEN.mq.poke(1, at, [data[0], data[1], data[2]]);
  GEN.written++;
  GEN.mq.poke(1, 0, GEN.written);
}

function tick() {
  if (DEVICE.audio) {
    if ((D.frames++ & 63) === 0) readSong();
    if (D.midiIn.length) { D.midiIn.forEach(midiToGen); D.midiIn = []; }
    if ((D.frames % 5) === 0) toGen();
    if (ACTIONS.tick) ACTIONS.tick(fx);
    if ((D.frames & 511) === 0) save();
    return;
  }
  var now = Date.now();
  var ms = Math.min(100, Math.max(0, now - D.last));
  D.last = now;
  if ((D.frames++ & 63) === 0 || D.song.playing) readSong();
  var n = Math.max(1, Math.round(ms * SR / 1000));
  var spb = SR * 60 / D.song.tempo;
  fx.setTime({ tempo: D.song.tempo, num: D.song.num, den: D.song.den, playState: D.song.playing ? 1 : 0,
               beat: D.song.playing ? D.song.position : D.beat, seconds: (D.song.playing ? D.song.position : D.beat) * 60 / D.song.tempo });
  if (!D.song.playing) D.beat += n / spb;
  var midi = D.midiIn.map(function (data) { return { offset: 0, data: data }; });
  D.midiIn = [];
  var out = fx.process(n, null, null, midi);
  for (var i = 0; i < out.length; i++) send(out[i].data);
  if (ACTIONS.tick) ACTIONS.tick(fx);
  if ((D.frames & 511) === 0) save();
}
function start() {
  if (D.task) return;
  D.last = Date.now();
  D.task = new Task(tick, this);
  D.task.interval = 4;
  D.task.repeat();
  var draw = new Task(function () { mgraphics.redraw(); }, this);
  draw.interval = 33;
  draw.repeat();
  D.drawTask = draw;
}

// ------------------------------------------------------------ messages --
function bang() {
  D.ready = true;
  readSong();
  if (D.pending) { load(D.pending); D.pending = null; }
  start();
}
function restore(text) {
  var st = null;
  try { st = JSON.parse(String(text)); } catch (e) { return; }
  if (!D.ready) { D.pending = st; return; }
  load(st);
}
function load(st) {
  if (st && st.v === 1 && st.fx) { fx.deserialize(st.fx); fx.runSection('slider'); lastSaved = JSON.stringify(st); GEN.sent = {}; }
}
// The plug-in's @serialize, kept with the Live set: written when it changes,
// so an untouched device does not mark the set as changed.
var lastSaved = '';
function save() {
  var s = JSON.stringify({ v: 1, fx: fx.serialize() });
  if (s === lastSaved) return;
  lastSaved = s;
  outlet(1, 'set', s);
}
// The strip's buttons: "action <name>".
function action(name) {
  var a = ACTIONS[name];
  if (!a) return;
  try { var msg = a(fx, Live); if (msg) say(msg); } catch (e) { say(String(e.message || e)); }
  save();
  mgraphics.redraw();
}
// Keys typed while the window has focus, from its [key].
function key(code) { D.host.key(code); mgraphics.redraw(); }
function anything() {
  var a = ACTIONS[messagename];
  if (a) action(messagename);
}

// --------------------------------------------------------------- paint --
function size() {
  var r = (typeof box !== 'undefined' && box.rect) ? box.rect : [0, 0].concat(fx.file.gfxSize || [800, 600]);
  return [r[2] - r[0], r[3] - r[1]];
}
function paint() {
  var g = mgraphics, sz = size(), h = D.host;
  var clear = fx.getVar('gfx_clear');
  var c = clear >= 0 ? clear : 0;           // REAPER keeps the last frame for -1; a [v8ui] cannot
  var k = Gfx.clearColour(c);
  g.set_source_rgba(k[0], k[1], k[2], 1);
  g.rectangle(0, 0, sz[0], sz[1]);
  g.fill();
  if (D.menu) { frame(g, sz, D.menuMouse); drawMenu(g, sz); return; }
  var snap = new Float64Array(fx.v);
  var mouse = { x: D.mouse.x, y: D.mouse.y, cap: D.mouse.cap, wheel: D.mouse.wheel };
  D.mouse.wheel = 0;
  frame(g, sz, mouse);
  D.frameSaw = true;
  if (D.release) { D.release = false; D.mouse.cap = 0; }
  if (h.menu) { D.menu = { items: Gfx.parseMenu(h.menu.text), x: mouse.x, y: mouse.y, hover: -1 }; D.menuSnap = snap; D.menuMouse = mouse; }
}
function frame(g, sz, mouse) {
  D.host.begin(g, fx);
  D.host.mouseIn = mouse.x >= 0 && mouse.y >= 0 && mouse.x < sz[0] && mouse.y < sz[1];
  try { fx.runGfx(D.host, sz[0], sz[1], mouse); } catch (e) { say('The window stopped: ' + (e.message || e)); }
}

// The menu gfx_showmenu asked for, over the window.
var ITEM_H = Gfx.ITEM_H;
function menuRect(sz) {
  var m = D.menu, w = 40;
  mgraphics.select_font_face('Arial', 'normal', 'normal');
  mgraphics.set_font_size(12);
  m.items.forEach(function (it) { if (it.label) w = Math.max(w, mgraphics.text_measure(it.label)[0] + 40 + it.depth * 12); });
  var h = m.items.length * ITEM_H + 8;
  var x = Math.min(m.x, sz[0] - w - 2), y = Math.min(m.y, sz[1] - h - 2);
  return [Math.max(0, x), Math.max(0, y), w, h];
}
function drawMenu(g, sz) {
  g.select_font_face('Arial', 'normal', 'normal'); g.set_font_size(12);
  Gfx.drawMenu(g, menuRect(sz), D.menu.items, D.menu.hover);
}
function menuAt(x, y) {
  var r = menuRect(size());
  if (x < r[0] || x >= r[0] + r[2] || y < r[1] + 4 || y >= r[1] + r[3] - 4) return -1;
  return Math.floor((y - r[1] - 4) / ITEM_H);
}
function chooseMenu(i) {
  var m = D.menu, it = i >= 0 ? m.items[i] : null;
  if (it && (!it.index || it.grey)) return;          // a title, a rule or a greyed item: the menu stays
  D.menu = null;
  // The frame that asked runs again from where it started, and gets the answer.
  fx.v.set(D.menuSnap);
  D.host.choice = it ? it.index : 0;
  if (!it) { D.host.choice = 0; D.host.cancelled = true; }
  var g = mgraphics, sz = size();
  if (it) frame(g, sz, D.menuMouse);
  D.host.choice = 0;
  D.mouse.cap = 0;
  save();
  mgraphics.redraw();
}

// --------------------------------------------------------------- mouse --
// REAPER's mouse_cap: 1 left, 2 right, 4 Command, 8 Shift, 16 Option, 32 Control.
function caps(but, cmd, shift, opt, ctrl) {
  return (ctrl ? 2 : 1) | (cmd ? 4 : 0) | (shift ? 8 : 0) | (opt ? 16 : 0);
}
function onclick(x, y, but, cmd, shift, capslock, opt, ctrl) {
  if (D.menu) { chooseMenu(menuAt(x, y)); return; }
  D.mouse.x = x; D.mouse.y = y; D.mouse.cap = caps(but, cmd, shift, opt, ctrl);
  D.frameSaw = false;
  mgraphics.redraw();
}
function ondrag(x, y, but) {
  if (D.menu) return;
  D.mouse.x = x; D.mouse.y = y;
  if (!but) {
    // A click shorter than a frame is still seen down for one frame.
    if (D.frameSaw) D.mouse.cap = 0; else D.release = true;
    save();
  }
  mgraphics.redraw();
}
function onidle(x, y) {
  if (D.menu) { var i = menuAt(x, y); if (i !== D.menu.hover) { D.menu.hover = i; mgraphics.redraw(); } return; }
  D.mouse.x = x; D.mouse.y = y;
}
function onidleout() { if (!D.menu) { D.mouse.x = -1; D.mouse.y = -1; } }
function onwheel(x, y, dx, dy) { D.mouse.wheel += Math.round(dy * 120); mgraphics.redraw(); }

