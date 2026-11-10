{
 "patcher": {
  "fileversion": 1,
  "appversion": {
   "major": 9,
   "minor": 0,
   "revision": 0,
   "architecture": "x64",
   "modernui": 1
  },
  "classnamespace": "box",
  "rect": [
   100.0,
   100.0,
   960.0,
   560.0
  ],
  "openinpresentation": 1,
  "default_fontsize": 10.0,
  "default_fontface": 0,
  "default_fontname": "Arial",
  "gridonopen": 1,
  "gridsize": [
   8.0,
   8.0
  ],
  "gridsnaponopen": 1,
  "objectsnaponopen": 1,
  "statusbarvisible": 2,
  "toolbarvisible": 1,
  "boxes": [
   {
    "box": {
     "id": "obj-1",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      20.0,
      20.0,
      50.0,
      22.0
     ],
     "outlettype": [
      "int"
     ],
     "text": "midiin"
    }
   },
   {
    "box": {
     "id": "obj-2",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 3,
     "patching_rect": [
      120.0,
      20.0,
      90.0,
      22.0
     ],
     "outlettype": [
      "bang",
      "int",
      "int"
     ],
     "text": "live.thisdevice"
    }
   },
   {
    "box": {
     "id": "obj-3",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 5,
     "patching_rect": [
      20.0,
      200.0,
      140.0,
      22.0
     ],
     "outlettype": [
      "",
      "",
      "",
      "",
      ""
     ],
     "text": "p window",
     "patcher": {
      "fileversion": 1,
      "appversion": {
       "major": 9,
       "minor": 0,
       "revision": 0,
       "architecture": "x64",
       "modernui": 1
      },
      "classnamespace": "box",
      "rect": [
       80.0,
       80.0,
       820.0,
       704.0
      ],
      "openinpresentation": 1,
      "toolbarvisible": 0,
      "statusbarvisible": 0,
      "enablehscroll": 0,
      "enablevscroll": 0,
      "title": "Transient Shuffler",
      "boxes": [
       {
        "box": {
         "id": "obj-1",
         "maxclass": "inlet",
         "numinlets": 0,
         "numoutlets": 1,
         "patching_rect": [
          20.0,
          20.0,
          30.0,
          30.0
         ],
         "outlettype": [
          ""
         ],
         "text": "inlet",
         "comment": "window"
        }
       },
       {
        "box": {
         "id": "obj-2",
         "maxclass": "inlet",
         "numinlets": 0,
         "numoutlets": 1,
         "patching_rect": [
          120.0,
          20.0,
          30.0,
          30.0
         ],
         "outlettype": [
          ""
         ],
         "text": "inlet",
         "comment": "MIDI, bang, restore, actions"
        }
       },
       {
        "box": {
         "id": "obj-3",
         "maxclass": "v8ui",
         "numinlets": 1,
         "numoutlets": 5,
         "patching_rect": [
          120.0,
          80.0,
          820.0,
          704.0
         ],
         "outlettype": [
          "",
          "",
          "",
          "",
          ""
         ],
         "filename": "TransientShuffler.js",
         "parameter_enable": 0,
         "border": 0,
         "presentation": 1,
         "presentation_rect": [
          0.0,
          0.0,
          820.0,
          704.0
         ]
        }
       },
       {
        "box": {
         "id": "obj-4",
         "maxclass": "outlet",
         "numinlets": 1,
         "numoutlets": 0,
         "patching_rect": [
          120.0,
          824.0,
          30.0,
          30.0
         ],
         "text": "outlet"
        }
       },
       {
        "box": {
         "id": "obj-5",
         "maxclass": "outlet",
         "numinlets": 1,
         "numoutlets": 0,
         "patching_rect": [
          240.0,
          824.0,
          30.0,
          30.0
         ],
         "text": "outlet"
        }
       },
       {
        "box": {
         "id": "obj-6",
         "maxclass": "outlet",
         "numinlets": 1,
         "numoutlets": 0,
         "patching_rect": [
          360.0,
          824.0,
          30.0,
          30.0
         ],
         "text": "outlet"
        }
       },
       {
        "box": {
         "id": "obj-7",
         "maxclass": "outlet",
         "numinlets": 1,
         "numoutlets": 0,
         "patching_rect": [
          480.0,
          824.0,
          30.0,
          30.0
         ],
         "text": "outlet"
        }
       },
       {
        "box": {
         "id": "obj-8",
         "maxclass": "outlet",
         "numinlets": 1,
         "numoutlets": 0,
         "patching_rect": [
          600.0,
          824.0,
          30.0,
          30.0
         ],
         "text": "outlet"
        }
       },
       {
        "box": {
         "id": "obj-9",
         "maxclass": "newobj",
         "numinlets": 0,
         "numoutlets": 4,
         "patching_rect": [
          320.0,
          20.0,
          40.0,
          22.0
         ],
         "outlettype": [
          "int",
          "int",
          "int",
          "int"
         ],
         "text": "key"
        }
       },
       {
        "box": {
         "id": "obj-10",
         "maxclass": "newobj",
         "numinlets": 1,
         "numoutlets": 1,
         "patching_rect": [
          320.0,
          50.0,
          75.0,
          22.0
         ],
         "outlettype": [
          ""
         ],
         "text": "prepend key"
        }
       }
      ],
      "lines": [
       {
        "patchline": {
         "source": [
          "obj-9",
          0
         ],
         "destination": [
          "obj-10",
          0
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "obj-10",
          0
         ],
         "destination": [
          "obj-3",
          0
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "obj-2",
          0
         ],
         "destination": [
          "obj-3",
          0
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "obj-3",
          0
         ],
         "destination": [
          "obj-4",
          0
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "obj-3",
          1
         ],
         "destination": [
          "obj-5",
          0
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "obj-3",
          2
         ],
         "destination": [
          "obj-6",
          0
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "obj-3",
          3
         ],
         "destination": [
          "obj-7",
          0
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "obj-3",
          4
         ],
         "destination": [
          "obj-8",
          0
         ]
        }
       }
      ]
     }
    }
   },
   {
    "box": {
     "id": "obj-4",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      20.0,
      420.0,
      55.0,
      22.0
     ],
     "text": "midiout"
    }
   },
   {
    "box": {
     "id": "obj-5",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 3,
     "patching_rect": [
      200.0,
      420.0,
      80.0,
      22.0
     ],
     "outlettype": [
      "",
      "",
      ""
     ],
     "text": "pattr state",
     "parameter_enable": 1,
     "varname": "state",
     "saved_attribute_attributes": {
      "valueof": {
       "parameter_longname": "state",
       "parameter_shortname": "state",
       "parameter_type": 3,
       "parameter_invisible": 1,
       "parameter_initial_enable": 0
      }
     }
    }
   },
   {
    "box": {
     "id": "obj-6",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      200.0,
      460.0,
      95.0,
      22.0
     ],
     "outlettype": [
      ""
     ],
     "text": "prepend restore"
    }
   },
   {
    "box": {
     "id": "obj-7",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      420.0,
      420.0,
      244.0,
      40.0
     ],
     "text": "Show Window opens Transient Shuffler's own window.",
     "presentation": 1,
     "presentation_rect": [
      8.0,
      8.0,
      244.0,
      40.0
     ],
     "linecount": 2,
     "textcolor": [
      0.867,
      0.882,
      0.906,
      1.0
     ],
     "fontsize": 11.0
    }
   },
   {
    "box": {
     "id": "obj-8",
     "maxclass": "live.text",
     "numinlets": 1,
     "numoutlets": 2,
     "patching_rect": [
      420.0,
      20.0,
      120.0,
      20.0
     ],
     "outlettype": [
      "",
      ""
     ],
     "text": "Show Window",
     "texton": "Show Window",
     "mode": 0,
     "parameter_enable": 0,
     "presentation": 1,
     "presentation_rect": [
      8.0,
      56.0,
      118.0,
      22.0
     ]
    }
   },
   {
    "box": {
     "id": "obj-9",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 3,
     "patching_rect": [
      420.0,
      60.0,
      80.0,
      22.0
     ],
     "outlettype": [
      "",
      "",
      ""
     ],
     "text": "route bang 1"
    }
   },
   {
    "box": {
     "id": "obj-10",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      420.0,
      100.0,
      30.0,
      22.0
     ],
     "outlettype": [
      "bang"
     ],
     "text": "t b"
    }
   },
   {
    "box": {
     "id": "obj-11",
     "maxclass": "message",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      420.0,
      140.0,
      40.0,
      22.0
     ],
     "outlettype": [
      ""
     ],
     "text": "open"
    }
   },
   {
    "box": {
     "id": "obj-12",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      420.0,
      180.0,
      60.0,
      22.0
     ],
     "outlettype": [
      ""
     ],
     "text": "pcontrol"
    }
   },
   {
    "box": {
     "id": "obj-13",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 2,
     "patching_rect": [
      20.0,
      300.0,
      160.0,
      22.0
     ],
     "outlettype": [
      "signal",
      "signal"
     ],
     "text": "gen~",
     "patcher": {
      "fileversion": 1,
      "appversion": {
       "major": 9,
       "minor": 0,
       "revision": 0,
       "architecture": "x64",
       "modernui": 1
      },
      "classnamespace": "dsp.gen",
      "rect": [
       100.0,
       100.0,
       700.0,
       600.0
      ],
      "boxes": [
       {
        "box": {
         "id": "obj-1",
         "maxclass": "newobj",
         "numinlets": 0,
         "numoutlets": 1,
         "patching_rect": [
          20.0,
          20.0,
          40.0,
          22.0
         ],
         "outlettype": [
          ""
         ],
         "text": "in 1"
        }
       },
       {
        "box": {
         "id": "obj-2",
         "maxclass": "newobj",
         "numinlets": 0,
         "numoutlets": 1,
         "patching_rect": [
          140.0,
          20.0,
          40.0,
          22.0
         ],
         "outlettype": [
          ""
         ],
         "text": "in 2"
        }
       },
       {
        "box": {
         "id": "obj-3",
         "maxclass": "codebox",
         "numinlets": 2,
         "numoutlets": 2,
         "patching_rect": [
          20.0,
          80.0,
          600.0,
          400.0
         ],
         "outlettype": [
          "",
          ""
         ],
         "code": "// Transient Shuffler - translated by ableton/kit/jsfx2gen.js. Do not edit; rebuild.\nData V(331);\nBuffer M;\nParam w_ui_trig(0);\nParam w_ui_trig_src(0);\nParam w_ui_stop(0);\nBuffer mq;\nParam slider1(30, min=2, max=250);\nParam slider2(10, min=0.5, max=100);\nParam slider3(0, min=(-24), max=24);\nParam slider4(1, min=0, max=1);\nParam slider5(1, min=0, max=1);\nParam slider6((-30), min=(-60), max=(-6));\nParam slider7(0, min=0, max=1);\nParam slider8(0, min=0, max=2);\nParam slider9(0, min=(-24), max=12);\nParam slider10(1, min=0, max=1);\nParam slider11(1, min=0, max=1);\nParam slider12(0, min=0, max=1);\nParam tempo(120, min=1, max=999);\nParam play_state(0, min=0, max=8);\nParam beat_position(0);\nParam ts_num(4, min=1, max=64);\nParam ts_denom(4, min=1, max=64);\n\neel_mod(a, b) { ib = trunc(abs(b)); return ib >= 1 ? trunc(abs(a)) - ib * floor(trunc(abs(a)) / ib) : 0; }\neel_bor(a, b) { return bitor(trunc(a), trunc(b)); }\neel_band(a, b) { return bitand(trunc(a), trunc(b)); }\neel_bxor(a, b) { return bitxor(trunc(a), trunc(b)); }\neel_shl(a, b) { return trunc(a) * pow(2, trunc(b)); }\neel_shr(a, b) { return floor(trunc(a) / pow(2, trunc(b))); }\n\nf_lowpass(V, M, mq, p0, p1, p2, p3) {\n  t1 = 0; t2 = 0; t3 = 0; t4 = 0; t5 = 0; t6 = 0; t7 = 0; t8 = 0; t9 = 0; t10 = 0; t11 = 0; t12 = 0; t13 = 0; t14 = 0; t15 = 0; t16 = 0; t17 = 0; t18 = 0; t19 = 0; t20 = 0; t21 = 0; t22 = 0; t23 = 0; t24 = 0; t25 = 0; t26 = 0; t27 = 0; t28 = 0; t29 = 0; t30 = 0; t31 = 0; t32 = 0;\n  r = 0;\n  t1 = (((2 * 3.141592653589793) * p2) / p3);\n  poke(V, t1, 176);\n  t2 = cos(peek(V, 176));\n  poke(V, t2, 177);\n  t3 = (sin(peek(V, 176)) / (2 * 0.70710678));\n  poke(V, t3, 178);\n  t4 = (1 + peek(V, 178));\n  poke(V, t4, 179);\n  t5 = (((1 - peek(V, 177)) * 0.5) / peek(V, 179));\n  poke(V, t5, 180);\n  t6 = ((1 - peek(V, 177)) / peek(V, 179));\n  poke(V, t6, 181);\n  t7 = peek(V, 180);\n  poke(V, t7, 182);\n  t8 = (((-2) * peek(V, 177)) / peek(V, 179));\n  poke(V, t8, 183);\n  t9 = ((1 - peek(V, 178)) / peek(V, 179));\n  poke(V, t9, 184);\n  poke(V, 0, 185);\n  poke(V, 0, 186);\n  poke(V, 0, 187);\n  poke(V, 0, 188);\n  poke(V, 0, 189);\n  t10 = min(1048576, trunc(p1));\n  for (t11 = 0; t11 < t10; t11 += 1) {\n    t12 = peek(M, trunc(p0 + peek(V, 189) + 0.00001));\n    poke(V, t12, 190);\n    t13 = (((((peek(V, 180) * peek(V, 190)) + (peek(V, 181) * peek(V, 188))) + (peek(V, 182) * peek(V, 187))) - (peek(V, 183) * peek(V, 186))) - (peek(V, 184) * peek(V, 185)));\n    poke(V, t13, 191);\n    t14 = peek(V, 188);\n    poke(V, t14, 187);\n    t15 = peek(V, 190);\n    poke(V, t15, 188);\n    t16 = peek(V, 186);\n    poke(V, t16, 185);\n    t17 = peek(V, 191);\n    poke(V, t17, 186);\n    t18 = trunc(p0 + peek(V, 189) + 0.00001);\n    t19 = peek(V, 191);\n    poke(M, t19, t18);\n    t20 = (peek(V, 189) + 1);\n    poke(V, t20, 189);\n  }\n  poke(V, 0, 185);\n  poke(V, 0, 186);\n  poke(V, 0, 187);\n  poke(V, 0, 188);\n  t21 = (p1 - 1);\n  poke(V, t21, 189);\n  t22 = min(1048576, trunc(p1));\n  r = 0;\n  for (t23 = 0; t23 < t22; t23 += 1) {\n    t24 = peek(M, trunc(p0 + peek(V, 189) + 0.00001));\n    poke(V, t24, 190);\n    t25 = (((((peek(V, 180) * peek(V, 190)) + (peek(V, 181) * peek(V, 188))) + (peek(V, 182) * peek(V, 187))) - (peek(V, 183) * peek(V, 186))) - (peek(V, 184) * peek(V, 185)));\n    poke(V, t25, 191);\n    t26 = peek(V, 188);\n    poke(V, t26, 187);\n    t27 = peek(V, 190);\n    poke(V, t27, 188);\n    t28 = peek(V, 186);\n    poke(V, t28, 185);\n    t29 = peek(V, 191);\n    poke(V, t29, 186);\n    t30 = trunc(p0 + peek(V, 189) + 0.00001);\n    t31 = peek(V, 191);\n    poke(M, t31, t30);\n    t32 = (peek(V, 189) - 1);\n    poke(V, t32, 189);\n    r = t32;\n  }\n  return r;\n}\n\nf_herm(V, M, mq, p0, p1, p2, p3) {\n  t1 = 0; t2 = 0; t3 = 0; t4 = 0; t5 = 0; t6 = 0; t7 = 0;\n  r = 0;\n  t1 = ((abs((p1 > 0 ? 1 : 0)) >= 0.00001) ? peek(M, trunc(p0 + (p1 - 1) + 0.00001)) : 0);\n  poke(V, t1, 195);\n  t2 = ((abs((p1 < p3 ? 1 : 0)) >= 0.00001) ? peek(M, trunc(p0 + p1 + 0.00001)) : 0);\n  poke(V, t2, 196);\n  t3 = ((abs(((p1 + 1) < p3 ? 1 : 0)) >= 0.00001) ? peek(M, trunc(p0 + (p1 + 1) + 0.00001)) : 0);\n  poke(V, t3, 197);\n  t4 = ((abs(((p1 + 2) < p3 ? 1 : 0)) >= 0.00001) ? peek(M, trunc(p0 + (p1 + 2) + 0.00001)) : 0);\n  poke(V, t4, 198);\n  t5 = (0.5 * (peek(V, 197) - peek(V, 195)));\n  poke(V, t5, 199);\n  t6 = (((peek(V, 195) - (2.5 * peek(V, 196))) + (2 * peek(V, 197))) - (0.5 * peek(V, 198)));\n  poke(V, t6, 200);\n  t7 = ((0.5 * (peek(V, 198) - peek(V, 195))) + (1.5 * (peek(V, 196) - peek(V, 197))));\n  poke(V, t7, 201);\n  r = ((((((peek(V, 201) * p2) + peek(V, 200)) * p2) + peek(V, 199)) * p2) + peek(V, 196));\n  return r;\n}\n\nf_load_into(V, M, mq, p0, p1, p2, p3) {\n  t1 = 0; t2 = 0; t3 = 0; t4 = 0; t5 = 0; t6 = 0; t7 = 0; t8 = 0; t9 = 0; t10 = 0; t11 = 0; t12 = 0; t13 = 0; t14 = 0; t15 = 0; t16 = 0; t17 = 0; t18 = 0; t19 = 0; t20 = 0; t21 = 0; t22 = 0; t23 = 0; t24 = 0; t25 = 0; t26 = 0; t27 = 0; t28 = 0; t29 = 0; t30 = 0; t31 = 0; t32 = 0; t33 = 0; t34 = 0; t35 = 0; t36 = 0; t37 = 0; t38 = 0; t39 = 0; t40 = 0; t41 = 0; t42 = 0; t43 = 0; t44 = 0; t45 = 0; t46 = 0; t47 = 0; t48 = 0; t49 = 0; t50 = 0; t51 = 0; t52 = 0; t53 = 0; t54 = 0; t55 = 0; t56 = 0; t57 = 0; t58 = 0; t59 = 0; t60 = 0; t61 = 0; t62 = 0; t63 = 0; t64 = 0; t65 = 0;\n  r = 0;\n  poke(V, 0, 159);\n  poke(V, 0, 160);\n  if ((abs((peek(V, 160) >= 0 ? 1 : 0)) >= 0.00001)) {\n    poke(V, 0, 161);\n    poke(V, 0, 162);\n    if ((abs((((abs((peek(V, 161) >= 1 ? 1 : 0)) >= 0.00001) && (abs((peek(V, 162) > 0 ? 1 : 0)) >= 0.00001)) ? 1 : 0)) >= 0.00001)) {\n      poke(V, 0, 163);\n      t1 = min(floor((peek(V, 163) / peek(V, 161))), peek(V, 86));\n      poke(V, t1, 164);\n      t2 = peek(V, 98);\n      poke(V, t2, 165);\n      t3 = (peek(V, 98) + peek(V, 86));\n      poke(V, t3, 166);\n      t4 = floor((peek(V, 87) / peek(V, 161)));\n      poke(V, t4, 167);\n      poke(V, 0, 168);\n      t5 = 0;\n      while (t5 < 1048576) {\n        if (!(abs((peek(V, 168) < peek(V, 164) ? 1 : 0)) >= 0.00001)) {\n          break;\n        }\n        t6 = min(peek(V, 167), (peek(V, 164) - peek(V, 168)));\n        poke(V, t6, 169);\n        t7 = peek(V, 99);\n        poke(V, t7, 170);\n        poke(V, 0, 171);\n        if ((abs((abs(peek(V, 161) - 1) < 0.00001 ? 1 : 0)) >= 0.00001)) {\n          t8 = min(1048576, trunc(peek(V, 169)));\n          for (t9 = 0; t9 < t8; t9 += 1) {\n            t10 = trunc(peek(V, 165) + (peek(V, 168) + peek(V, 171)) + 0.00001);\n            t11 = trunc(peek(V, 166) + (peek(V, 168) + peek(V, 171)) + 0.00001);\n            t12 = peek(M, trunc(peek(V, 170) + peek(V, 171) + 0.00001));\n            poke(M, t12, t11);\n            poke(M, t12, t10);\n            t13 = (peek(V, 171) + 1);\n            poke(V, t13, 171);\n          }\n        }\n        else {\n          if ((abs((abs(peek(V, 161) - 2) < 0.00001 ? 1 : 0)) >= 0.00001)) {\n            t14 = min(1048576, trunc(peek(V, 169)));\n            for (t15 = 0; t15 < t14; t15 += 1) {\n              t16 = trunc(peek(V, 165) + (peek(V, 168) + peek(V, 171)) + 0.00001);\n              t17 = peek(M, trunc(peek(V, 170) + 0.00001));\n              poke(M, t17, t16);\n              t18 = trunc(peek(V, 166) + (peek(V, 168) + peek(V, 171)) + 0.00001);\n              t19 = peek(M, trunc(peek(V, 170) + 1 + 0.00001));\n              poke(M, t19, t18);\n              t20 = (peek(V, 170) + 2);\n              poke(V, t20, 170);\n              t21 = (peek(V, 171) + 1);\n              poke(V, t21, 171);\n            }\n          }\n          else {\n            t22 = min(1048576, trunc(peek(V, 169)));\n            for (t23 = 0; t23 < t22; t23 += 1) {\n              poke(V, 0, 172);\n              poke(V, 0, 173);\n              poke(V, 0, 174);\n              t24 = min(1048576, trunc(peek(V, 161)));\n              for (t25 = 0; t25 < t24; t25 += 1) {\n                if ((abs(eel_band(peek(V, 174), 1)) >= 0.00001)) {\n                  t26 = peek(M, trunc(peek(V, 170) + peek(V, 174) + 0.00001));\n                  t27 = (peek(V, 172) + t26);\n                  poke(V, t27, 172);\n                }\n                else {\n                  t28 = peek(M, trunc(peek(V, 170) + peek(V, 174) + 0.00001));\n                  t29 = (peek(V, 173) + t28);\n                  poke(V, t29, 173);\n                }\n                t30 = (peek(V, 174) + 1);\n                poke(V, t30, 174);\n              }\n              t31 = trunc(peek(V, 165) + (peek(V, 168) + peek(V, 171)) + 0.00001);\n              t32 = (peek(V, 173) / ceil((peek(V, 161) / 2)));\n              poke(M, t32, t31);\n              t33 = trunc(peek(V, 166) + (peek(V, 168) + peek(V, 171)) + 0.00001);\n              t34 = (peek(V, 172) / floor((peek(V, 161) / 2)));\n              poke(M, t34, t33);\n              t35 = peek(V, 161);\n              t36 = (peek(V, 170) + t35);\n              poke(V, t36, 170);\n              t37 = (peek(V, 171) + 1);\n              poke(V, t37, 171);\n            }\n          }\n        }\n        t38 = peek(V, 169);\n        t39 = (peek(V, 168) + t38);\n        poke(V, t39, 168);\n        t5 += 1;\n      }\n      t40 = (peek(V, 162) / peek(V, 78));\n      poke(V, t40, 175);\n      if ((abs((abs((peek(V, 175) - 1)) < 0.000001 ? 1 : 0)) >= 0.00001)) {\n        t41 = p1;\n        t42 = peek(V, 165);\n        t43 = min(trunc(peek(V, 164)), 8388608);\n        if (t41 <= t42) {\n          for (t44 = 0; t44 < t43; t44 += 1) {\n            poke(M, peek(M, trunc(t42 + t44 + 0.00001)), trunc(t41 + t44 + 0.00001));\n          }\n        }\n        else {\n          for (t44 = t43 - 1; t44 >= 0; t44 -= 1) {\n            poke(M, peek(M, trunc(t42 + t44 + 0.00001)), trunc(t41 + t44 + 0.00001));\n          }\n        }\n        t45 = p2;\n        t46 = peek(V, 166);\n        t47 = min(trunc(peek(V, 164)), 8388608);\n        if (t45 <= t46) {\n          for (t48 = 0; t48 < t47; t48 += 1) {\n            poke(M, peek(M, trunc(t46 + t48 + 0.00001)), trunc(t45 + t48 + 0.00001));\n          }\n        }\n        else {\n          for (t48 = t47 - 1; t48 >= 0; t48 -= 1) {\n            poke(M, peek(M, trunc(t46 + t48 + 0.00001)), trunc(t45 + t48 + 0.00001));\n          }\n        }\n        t49 = peek(V, 164);\n        poke(V, t49, 159);\n      }\n      else {\n        if ((abs((peek(V, 175) > 1.0001 ? 1 : 0)) >= 0.00001)) {\n          t50 = f_lowpass(V, M, mq, peek(V, 165), peek(V, 164), (0.45 * peek(V, 78)), peek(V, 162));\n          t51 = f_lowpass(V, M, mq, peek(V, 166), peek(V, 164), (0.45 * peek(V, 78)), peek(V, 162));\n        }\n        t52 = ((abs((peek(V, 164) > 0 ? 1 : 0)) >= 0.00001) ? min((floor(((peek(V, 164) - 1) / peek(V, 175))) + 1), peek(V, 86)) : 0);\n        poke(V, t52, 159);\n        poke(V, 0, 192);\n        t53 = min(1048576, trunc(peek(V, 159)));\n        for (t54 = 0; t54 < t53; t54 += 1) {\n          t55 = (peek(V, 192) * peek(V, 175));\n          poke(V, t55, 193);\n          t56 = floor(peek(V, 193));\n          poke(V, t56, 194);\n          t57 = trunc(p1 + peek(V, 192) + 0.00001);\n          t58 = f_herm(V, M, mq, peek(V, 165), peek(V, 194), (peek(V, 193) - peek(V, 194)), peek(V, 164));\n          poke(M, t58, t57);\n          t59 = trunc(p2 + peek(V, 192) + 0.00001);\n          t60 = f_herm(V, M, mq, peek(V, 166), peek(V, 194), (peek(V, 193) - peek(V, 194)), peek(V, 164));\n          poke(M, t60, t59);\n          t61 = (peek(V, 192) + 1);\n          poke(V, t61, 192);\n        }\n      }\n      t62 = trunc(peek(V, 111) + p3 + 0.00001);\n      t63 = peek(V, 162);\n      poke(M, t63, t62);\n      t64 = trunc(peek(V, 112) + p3 + 0.00001);\n      t65 = peek(V, 161);\n      poke(M, t65, t64);\n    }\n  }\n  r = peek(V, 159);\n  return r;\n}\n\nf_base_name(V, M, mq, p0, p1) {\n  t1 = 0; t2 = 0; t3 = 0; t4 = 0;\n  r = 0;\n  t1 = (0 - 1);\n  poke(V, t1, 203);\n  t2 = 0;\n  while (t2 < 1048576) {\n    t3 = (abs((peek(V, 203) >= 0 ? 1 : 0)) >= 0.00001) ? 1 : 0;\n    if (t3 != 0) {\n      poke(V, 0, 204);\n      t3 = (abs((abs(0 - 47) < 0.00001 ? 0 : 1)) >= 0.00001) ? 1 : 0;\n    }\n    if (!(abs((((abs(t3) >= 0.00001) && (abs((abs(peek(V, 204) - 92) < 0.00001 ? 0 : 1)) >= 0.00001)) ? 1 : 0)) >= 0.00001)) {\n      break;\n    }\n    t4 = (peek(V, 203) - 1);\n    poke(V, t4, 203);\n    t2 += 1;\n  }\n  r = 0;\n  return r;\n}\n\nf_load_slot(V, M, mq, p0) {\n  t1 = 0; t2 = 0; t3 = 0; t4 = 0; t5 = 0; t6 = 0; t7 = 0; t8 = 0; t9 = 0; t10 = 0; t11 = 0; t12 = 0; t13 = 0;\n  r = 0;\n  if ((abs((abs(p0 - 0) < 0.00001 ? 1 : 0)) >= 0.00001)) {\n    if ((abs(0) >= 0.00001)) {\n      t2 = f_load_into(V, M, mq, 0, peek(V, 90), peek(V, 91), 0);\n      t1 = t2;\n    }\n    else {\n      t1 = 0;\n    }\n    poke(V, t1, 202);\n    t3 = f_base_name(V, M, mq, 0, 0);\n    t4 = trunc(peek(V, 113) + 0.00001);\n    t5 = (((abs(0) >= 0.00001) && (abs((abs(peek(V, 202) - 0) < 0.00001 ? 1 : 0)) >= 0.00001)) ? 1 : 0);\n    poke(M, t5, t4);\n  }\n  else {\n    if ((abs(0) >= 0.00001)) {\n      t7 = f_load_into(V, M, mq, 0, peek(V, 92), peek(V, 93), 1);\n      t6 = t7;\n    }\n    else {\n      t6 = 0;\n    }\n    poke(V, t6, 202);\n    t8 = f_base_name(V, M, mq, 0, 0);\n    t9 = trunc(peek(V, 113) + 1 + 0.00001);\n    t10 = (((abs(0) >= 0.00001) && (abs((abs(peek(V, 202) - 0) < 0.00001 ? 1 : 0)) >= 0.00001)) ? 1 : 0);\n    poke(M, t10, t9);\n  }\n  t11 = trunc(peek(V, 108) + p0 + 0.00001);\n  t12 = peek(V, 202);\n  poke(M, t12, t11);\n  if ((abs(peek(M, trunc(peek(V, 113) + p0 + 0.00001))) >= 0.00001)) {\n    poke(V, 1, 205);\n  }\n  t13 = peek(V, 78);\n  poke(V, t13, 157);\n  poke(V, 1, 206);\n  poke(V, 1, 148);\n  r = 1;\n  return r;\n}\n\nf_calc_splice(V, M, mq) {\n  t1 = 0; t2 = 0; t3 = 0;\n  r = 0;\n  t1 = max(1, floor(((peek(V, 0) * 0.001) * peek(V, 78))));\n  poke(V, t1, 207);\n  t2 = max(1, floor(((peek(V, 1) * 0.001) * peek(V, 78))));\n  poke(V, t2, 208);\n  t3 = peek(V, 207);\n  poke(V, t3, 209);\n  r = t3;\n  return r;\n}\n\nf_db2g(V, M, mq, p0) {\n  r = 0;\n  r = pow(10, (p0 / 20));\n  return r;\n}\n\nf_find_onset(V, M, mq, p0) {\n  t1 = 0; t2 = 0; t3 = 0; t4 = 0; t5 = 0; t6 = 0; t7 = 0; t8 = 0; t9 = 0; t10 = 0; t11 = 0; t12 = 0; t13 = 0; t14 = 0; t15 = 0; t16 = 0; t17 = 0;\n  r = 0;\n  t1 = peek(M, trunc(peek(V, 106) + p0 + 0.00001));\n  poke(V, t1, 211);\n  t2 = peek(M, trunc(peek(V, 107) + p0 + 0.00001));\n  poke(V, t2, 212);\n  t3 = peek(M, trunc(peek(V, 108) + p0 + 0.00001));\n  poke(V, t3, 213);\n  poke(V, 0, 214);\n  poke(V, 0, 215);\n  t4 = min(1048576, trunc(peek(V, 213)));\n  for (t5 = 0; t5 < t4; t5 += 1) {\n    t6 = max(abs(peek(M, trunc(peek(V, 211) + peek(V, 215) + 0.00001))), abs(peek(M, trunc(peek(V, 212) + peek(V, 215) + 0.00001))));\n    poke(V, t6, 216);\n    if ((abs((peek(V, 216) > peek(V, 214) ? 1 : 0)) >= 0.00001)) {\n      t7 = peek(V, 216);\n      poke(V, t7, 214);\n    }\n    t8 = (peek(V, 215) + 1);\n    poke(V, t8, 215);\n  }\n  t9 = trunc(peek(V, 110) + p0 + 0.00001);\n  t10 = peek(V, 214);\n  poke(M, t10, t9);\n  t11 = peek(V, 214);\n  t12 = f_db2g(V, M, mq, peek(V, 5));\n  t13 = (t11 * t12);\n  poke(V, t13, 217);\n  poke(V, 0, 215);\n  t14 = 0;\n  while (t14 < 1048576) {\n    if (!(abs((((abs((peek(V, 215) < peek(V, 213) ? 1 : 0)) >= 0.00001) && (abs((max(abs(peek(M, trunc(peek(V, 211) + peek(V, 215) + 0.00001))), abs(peek(M, trunc(peek(V, 212) + peek(V, 215) + 0.00001)))) < peek(V, 217) ? 1 : 0)) >= 0.00001)) ? 1 : 0)) >= 0.00001)) {\n      break;\n    }\n    t15 = (peek(V, 215) + 1);\n    poke(V, t15, 215);\n    t14 += 1;\n  }\n  t16 = trunc(peek(V, 109) + p0 + 0.00001);\n  t17 = ((abs((peek(V, 215) < peek(V, 213) ? 1 : 0)) >= 0.00001) ? peek(V, 215) : 0);\n  poke(M, t17, t16);\n  r = t17;\n  return r;\n}\n\nf_clamp(V, M, mq, p0, p1, p2) {\n  r = 0;\n  r = max(p1, min(p2, p0));\n  return r;\n}\n\nf_find_attack_end(V, M, mq, p0) {\n  t1 = 0; t2 = 0; t3 = 0; t4 = 0; t5 = 0; t6 = 0; t7 = 0; t8 = 0; t9 = 0; t10 = 0; t11 = 0; t12 = 0; t13 = 0; t14 = 0; t15 = 0; t16 = 0; t17 = 0; t18 = 0; t19 = 0; t20 = 0; t21 = 0; t22 = 0; t23 = 0; t24 = 0; t25 = 0; t26 = 0; t27 = 0; t28 = 0; t29 = 0; t30 = 0; t31 = 0; t32 = 0; t33 = 0; t34 = 0; t35 = 0; t36 = 0; t37 = 0; t38 = 0; t39 = 0; t40 = 0; t41 = 0; t42 = 0; t43 = 0; t44 = 0; t45 = 0; t46 = 0; t47 = 0; t48 = 0; t49 = 0; t50 = 0; t51 = 0; t52 = 0; t53 = 0; t54 = 0; t55 = 0; t56 = 0; t57 = 0; t58 = 0; t59 = 0; t60 = 0; t61 = 0; t62 = 0; t63 = 0; t64 = 0; t65 = 0; t66 = 0; t67 = 0; t68 = 0; t69 = 0; t70 = 0; t71 = 0; t72 = 0; t73 = 0; t74 = 0; t75 = 0; t76 = 0;\n  r = 0;\n  t1 = peek(M, trunc(peek(V, 106) + p0 + 0.00001));\n  poke(V, t1, 218);\n  t2 = peek(M, trunc(peek(V, 107) + p0 + 0.00001));\n  poke(V, t2, 219);\n  t3 = peek(M, trunc(peek(V, 108) + p0 + 0.00001));\n  poke(V, t3, 220);\n  t4 = peek(M, trunc(peek(V, 109) + p0 + 0.00001));\n  poke(V, t4, 221);\n  t5 = max(1, floor((0.001 * peek(V, 78))));\n  poke(V, t5, 222);\n  t6 = max(0, min(floor(((peek(V, 220) - peek(V, 221)) / peek(V, 222))), 300));\n  poke(V, t6, 223);\n  t7 = peek(V, 122);\n  poke(V, t7, 224);\n  t8 = (peek(V, 122) + 300);\n  poke(V, t8, 225);\n  t9 = (peek(V, 122) + 600);\n  poke(V, t9, 226);\n  t10 = (((2 * 3.141592653589793) * 2500) / peek(V, 78));\n  poke(V, t10, 227);\n  t11 = cos(peek(V, 227));\n  poke(V, t11, 228);\n  t12 = (sin(peek(V, 227)) / (2 * 0.70710678));\n  poke(V, t12, 229);\n  t13 = (1 + peek(V, 229));\n  poke(V, t13, 230);\n  t14 = (((1 + peek(V, 228)) * 0.5) / peek(V, 230));\n  poke(V, t14, 231);\n  t15 = ((-(1 + peek(V, 228))) / peek(V, 230));\n  poke(V, t15, 232);\n  t16 = peek(V, 231);\n  poke(V, t16, 233);\n  t17 = (((-2) * peek(V, 228)) / peek(V, 230));\n  poke(V, t17, 234);\n  t18 = ((1 - peek(V, 229)) / peek(V, 230));\n  poke(V, t18, 235);\n  poke(V, 0, 236);\n  poke(V, 0, 237);\n  poke(V, 0, 238);\n  poke(V, 0, 239);\n  t19 = max(0, (peek(V, 221) - (5 * peek(V, 222))));\n  poke(V, t19, 240);\n  t20 = min(1048576, trunc((peek(V, 221) - peek(V, 240))));\n  for (t21 = 0; t21 < t20; t21 += 1) {\n    t22 = ((peek(M, trunc(peek(V, 218) + peek(V, 240) + 0.00001)) + peek(M, trunc(peek(V, 219) + peek(V, 240) + 0.00001))) * 0.5);\n    poke(V, t22, 241);\n    t23 = (((((peek(V, 231) * peek(V, 241)) + (peek(V, 232) * peek(V, 239))) + (peek(V, 233) * peek(V, 238))) - (peek(V, 234) * peek(V, 237))) - (peek(V, 235) * peek(V, 236)));\n    poke(V, t23, 242);\n    t24 = peek(V, 239);\n    poke(V, t24, 238);\n    t25 = peek(V, 241);\n    poke(V, t25, 239);\n    t26 = peek(V, 237);\n    poke(V, t26, 236);\n    t27 = peek(V, 242);\n    poke(V, t27, 237);\n    t28 = (peek(V, 240) + 1);\n    poke(V, t28, 240);\n  }\n  poke(V, 0, 243);\n  t29 = min(1048576, trunc(peek(V, 223)));\n  for (t30 = 0; t30 < t29; t30 += 1) {\n    t31 = trunc(peek(V, 224) + peek(V, 243) + 0.00001);\n    t32 = trunc(peek(V, 225) + peek(V, 243) + 0.00001);\n    poke(M, 0, t32);\n    poke(M, 0, t31);\n    t33 = min(1048576, trunc(peek(V, 222)));\n    for (t34 = 0; t34 < t33; t34 += 1) {\n      t35 = ((peek(M, trunc(peek(V, 218) + peek(V, 240) + 0.00001)) + peek(M, trunc(peek(V, 219) + peek(V, 240) + 0.00001))) * 0.5);\n      poke(V, t35, 241);\n      t36 = (((((peek(V, 231) * peek(V, 241)) + (peek(V, 232) * peek(V, 239))) + (peek(V, 233) * peek(V, 238))) - (peek(V, 234) * peek(V, 237))) - (peek(V, 235) * peek(V, 236)));\n      poke(V, t36, 242);\n      t37 = peek(V, 239);\n      poke(V, t37, 238);\n      t38 = peek(V, 241);\n      poke(V, t38, 239);\n      t39 = peek(V, 237);\n      poke(V, t39, 236);\n      t40 = peek(V, 242);\n      poke(V, t40, 237);\n      t41 = trunc(peek(V, 224) + peek(V, 243) + 0.00001);\n      t42 = max(peek(M, trunc(peek(V, 224) + peek(V, 243) + 0.00001)), max(abs(peek(M, trunc(peek(V, 218) + peek(V, 240) + 0.00001))), abs(peek(M, trunc(peek(V, 219) + peek(V, 240) + 0.00001)))));\n      poke(M, t42, t41);\n      t43 = trunc(peek(V, 225) + peek(V, 243) + 0.00001);\n      t44 = max(peek(M, trunc(peek(V, 225) + peek(V, 243) + 0.00001)), abs(peek(V, 242)));\n      poke(M, t44, t43);\n      t45 = (peek(V, 240) + 1);\n      poke(V, t45, 240);\n    }\n    t46 = (peek(V, 243) + 1);\n    poke(V, t46, 243);\n  }\n  poke(V, 6, 244);\n  t47 = (1 - exp(((-1) / 2)));\n  poke(V, t47, 245);\n  t48 = (1 - exp(((-1) / 20)));\n  poke(V, t48, 246);\n  poke(V, 0, 247);\n  poke(V, 0, 248);\n  poke(V, 0, 249);\n  poke(V, 0, 250);\n  poke(V, 0, 243);\n  t49 = 0;\n  while (t49 < 1048576) {\n    if (!(abs((((abs((peek(V, 243) < peek(V, 223) ? 1 : 0)) >= 0.00001) && (abs(((abs(peek(V, 250)) >= 0.00001) ? 0 : 1)) >= 0.00001)) ? 1 : 0)) >= 0.00001)) {\n      break;\n    }\n    poke(V, 0, 251);\n    t50 = max(0, (peek(V, 243) - peek(V, 244)));\n    poke(V, t50, 252);\n    t51 = min(1048576, trunc((min(peek(V, 223), ((peek(V, 243) + peek(V, 244)) + 1)) - peek(V, 252))));\n    for (t52 = 0; t52 < t51; t52 += 1) {\n      t53 = max(peek(V, 251), peek(M, trunc(peek(V, 224) + peek(V, 252) + 0.00001)));\n      poke(V, t53, 251);\n      t54 = (peek(V, 252) + 1);\n      poke(V, t54, 252);\n    }\n    t55 = (peek(V, 245) * (peek(V, 251) - peek(V, 248)));\n    t56 = (peek(V, 248) + t55);\n    poke(V, t56, 248);\n    t57 = (peek(V, 246) * (peek(V, 251) - peek(V, 247)));\n    t58 = (peek(V, 247) + t57);\n    poke(V, t58, 247);\n    if ((abs(((abs(peek(V, 249)) >= 0.00001) ? 0 : 1)) >= 0.00001)) {\n      if ((abs((peek(V, 248) > (peek(V, 247) * 1.1) ? 1 : 0)) >= 0.00001)) {\n        poke(V, 1, 249);\n      }\n    }\n    else {\n      if ((abs((peek(V, 248) < peek(V, 247) ? 1 : 0)) >= 0.00001)) {\n        t59 = max(1, (peek(V, 243) - peek(V, 244)));\n        poke(V, t59, 250);\n      }\n    }\n    t60 = (peek(V, 243) + 1);\n    poke(V, t60, 243);\n    t49 += 1;\n  }\n  poke(V, 0, 253);\n  poke(V, 0, 254);\n  poke(V, 0, 243);\n  t61 = min(1048576, trunc(peek(V, 223)));\n  for (t62 = 0; t62 < t61; t62 += 1) {\n    t63 = trunc(peek(V, 226) + peek(V, 243) + 0.00001);\n    t64 = max(peek(M, trunc(peek(V, 225) + max(0, (peek(V, 243) - 1)) + 0.00001)), max(peek(M, trunc(peek(V, 225) + peek(V, 243) + 0.00001)), peek(M, trunc(peek(V, 225) + min((peek(V, 223) - 1), (peek(V, 243) + 1)) + 0.00001))));\n    poke(M, t64, t63);\n    if ((abs((peek(M, trunc(peek(V, 226) + peek(V, 243) + 0.00001)) > peek(V, 253) ? 1 : 0)) >= 0.00001)) {\n      t65 = peek(M, trunc(peek(V, 226) + peek(V, 243) + 0.00001));\n      poke(V, t65, 253);\n      t66 = peek(V, 243);\n      poke(V, t66, 254);\n    }\n    t67 = (peek(V, 243) + 1);\n    poke(V, t67, 243);\n  }\n  poke(V, 0, 255);\n  if ((abs((peek(V, 253) > (peek(M, trunc(peek(V, 110) + p0 + 0.00001)) * 0.01) ? 1 : 0)) >= 0.00001)) {\n    t68 = (peek(V, 253) * 0.1);\n    poke(V, t68, 256);\n    t69 = peek(V, 254);\n    poke(V, t69, 243);\n    t70 = 0;\n    while (t70 < 1048576) {\n      if (!(abs((((abs((peek(V, 243) < peek(V, 223) ? 1 : 0)) >= 0.00001) && (abs(((abs(peek(V, 255)) >= 0.00001) ? 0 : 1)) >= 0.00001)) ? 1 : 0)) >= 0.00001)) {\n        break;\n      }\n      if ((abs((peek(M, trunc(peek(V, 226) + peek(V, 243) + 0.00001)) < peek(V, 256) ? 1 : 0)) >= 0.00001)) {\n        t71 = max(1, peek(V, 243));\n        poke(V, t71, 255);\n      }\n      t72 = (peek(V, 243) + 1);\n      poke(V, t72, 243);\n      t70 += 1;\n    }\n  }\n  t73 = ((abs((((abs(peek(V, 250)) >= 0.00001) && (abs(peek(V, 255)) >= 0.00001)) ? 1 : 0)) >= 0.00001) ? min(peek(V, 250), peek(V, 255)) : max(peek(V, 250), peek(V, 255)));\n  poke(V, t73, 243);\n  t74 = trunc(peek(V, 117) + p0 + 0.00001);\n  if ((abs((peek(V, 243) > 0 ? 1 : 0)) >= 0.00001)) {\n    t76 = f_clamp(V, M, mq, (peek(V, 243) * peek(V, 222)), floor((0.002 * peek(V, 78))), floor((0.25 * peek(V, 78))));\n    t75 = t76;\n  }\n  else {\n    t75 = 0;\n  }\n  poke(M, t75, t74);\n  r = t75;\n  return r;\n}\n\nf_region_peak(V, M, mq, p0, p1, p2, p3, p4) {\n  t1 = 0; t2 = 0; t3 = 0; t4 = 0; t5 = 0; t6 = 0;\n  r = 0;\n  poke(V, 0, 272);\n  t1 = max(p3, 0);\n  poke(V, t1, 273);\n  t2 = min(p4, p2);\n  p4 = t2;\n  t3 = 0;\n  while (t3 < 1048576) {\n    if (!(abs((peek(V, 273) < p4 ? 1 : 0)) >= 0.00001)) {\n      break;\n    }\n    t4 = max(abs(peek(M, trunc(p0 + peek(V, 273) + 0.00001))), abs(peek(M, trunc(p1 + peek(V, 273) + 0.00001))));\n    poke(V, t4, 274);\n    if ((abs((peek(V, 274) > peek(V, 272) ? 1 : 0)) >= 0.00001)) {\n      t5 = peek(V, 274);\n      poke(V, t5, 272);\n    }\n    t6 = (peek(V, 273) + 1);\n    poke(V, t6, 273);\n    t3 += 1;\n  }\n  r = peek(V, 272);\n  return r;\n}\n\nf_make_hybrid(V, M, mq, p0, p1, p2) {\n  t1 = 0; t2 = 0; t3 = 0; t4 = 0; t5 = 0; t6 = 0; t7 = 0; t8 = 0; t9 = 0; t10 = 0; t11 = 0; t12 = 0; t13 = 0; t14 = 0; t15 = 0; t16 = 0; t17 = 0; t18 = 0; t19 = 0; t20 = 0; t21 = 0; t22 = 0; t23 = 0; t24 = 0; t25 = 0; t26 = 0; t27 = 0; t28 = 0; t29 = 0; t30 = 0; t31 = 0; t32 = 0; t33 = 0; t34 = 0; t35 = 0; t36 = 0; t37 = 0; t38 = 0; t39 = 0; t40 = 0; t41 = 0; t42 = 0; t43 = 0; t44 = 0; t45 = 0; t46 = 0; t47 = 0; t48 = 0; t49 = 0; t50 = 0; t51 = 0; t52 = 0; t53 = 0; t54 = 0; t55 = 0; t56 = 0; t57 = 0; t58 = 0; t59 = 0; t60 = 0; t61 = 0; t62 = 0; t63 = 0; t64 = 0; t65 = 0; t66 = 0; t67 = 0; t68 = 0; t69 = 0; t70 = 0; t71 = 0; t72 = 0; t73 = 0; t74 = 0; t75 = 0; t76 = 0; t77 = 0; t78 = 0; t79 = 0; t80 = 0; t81 = 0; t82 = 0; t83 = 0; t84 = 0; t85 = 0; t86 = 0; t87 = 0; t88 = 0; t89 = 0; t90 = 0; t91 = 0; t92 = 0; t93 = 0; t94 = 0; t95 = 0; t96 = 0; t97 = 0; t98 = 0; t99 = 0; t100 = 0; t101 = 0; t102 = 0; t103 = 0; t104 = 0; t105 = 0; t106 = 0; t107 = 0; t108 = 0; t109 = 0; t110 = 0; t111 = 0; t112 = 0; t113 = 0; t114 = 0; t115 = 0; t116 = 0; t117 = 0; t118 = 0; t119 = 0; t120 = 0; t121 = 0; t122 = 0; t123 = 0; t124 = 0; t125 = 0; t126 = 0; t127 = 0; t128 = 0; t129 = 0; t130 = 0; t131 = 0; t132 = 0; t133 = 0; t134 = 0; t135 = 0; t136 = 0; t137 = 0; t138 = 0; t139 = 0; t140 = 0; t141 = 0; t142 = 0; t143 = 0; t144 = 0; t145 = 0; t146 = 0; t147 = 0; t148 = 0; t149 = 0; t150 = 0; t151 = 0; t152 = 0; t153 = 0; t154 = 0; t155 = 0;\n  r = 0;\n  t1 = peek(M, trunc(peek(V, 106) + p0 + 0.00001));\n  poke(V, t1, 257);\n  t2 = peek(M, trunc(peek(V, 107) + p0 + 0.00001));\n  poke(V, t2, 258);\n  t3 = peek(M, trunc(peek(V, 106) + p1 + 0.00001));\n  poke(V, t3, 259);\n  t4 = peek(M, trunc(peek(V, 107) + p1 + 0.00001));\n  poke(V, t4, 260);\n  t5 = peek(M, trunc(peek(V, 108) + p1 + 0.00001));\n  poke(V, t5, 261);\n  t6 = peek(M, trunc(peek(V, 109) + p1 + 0.00001));\n  poke(V, t6, 262);\n  t7 = peek(M, trunc(peek(V, 106) + p2 + 0.00001));\n  poke(V, t7, 263);\n  t8 = peek(M, trunc(peek(V, 107) + p2 + 0.00001));\n  poke(V, t8, 264);\n  t9 = peek(M, trunc(peek(V, 108) + p2 + 0.00001));\n  poke(V, t9, 265);\n  t10 = peek(M, trunc(peek(V, 109) + p2 + 0.00001));\n  poke(V, t10, 266);\n  t11 = min(peek(V, 262), floor((0.005 * peek(V, 78))));\n  poke(V, t11, 267);\n  t12 = ((abs((((abs(peek(V, 10)) >= 0.00001) && (abs((peek(M, trunc(peek(V, 117) + p1 + 0.00001)) > 0 ? 1 : 0)) >= 0.00001)) ? 1 : 0)) >= 0.00001) ? peek(M, trunc(peek(V, 117) + p1 + 0.00001)) : peek(V, 207));\n  poke(V, t12, 268);\n  t13 = max(1, floor(((peek(V, 1) * 0.001) * peek(V, 78))));\n  poke(V, t13, 269);\n  t14 = peek(V, 268);\n  poke(V, t14, 270);\n  t15 = f_db2g(V, M, mq, peek(V, 2));\n  poke(V, t15, 271);\n  if ((abs(peek(V, 3)) >= 0.00001)) {\n    t16 = f_region_peak(V, M, mq, peek(V, 259), peek(V, 260), peek(V, 261), (peek(V, 262) - peek(V, 267)), (peek(V, 262) + peek(V, 268)));\n    poke(V, t16, 275);\n    t17 = f_region_peak(V, M, mq, peek(V, 263), peek(V, 264), peek(V, 265), (peek(V, 266) - peek(V, 267)), (peek(V, 266) + peek(V, 268)));\n    poke(V, t17, 276);\n    if ((abs((((abs((peek(V, 275) > 0.000001 ? 1 : 0)) >= 0.00001) && (abs((peek(V, 276) > 0.000001 ? 1 : 0)) >= 0.00001)) ? 1 : 0)) >= 0.00001)) {\n      t18 = (peek(V, 276) / peek(V, 275));\n      t19 = (peek(V, 271) * t18);\n      poke(V, t19, 271);\n    }\n  }\n  t20 = ((abs(peek(V, 4)) >= 0.00001) ? floor((0.0025 * peek(V, 78))) : 0);\n  poke(V, t20, 277);\n  t21 = min(peek(V, 269), max(16, floor((0.01 * peek(V, 78)))));\n  poke(V, t21, 278);\n  poke(V, (-1), 279);\n  poke(V, 0, 280);\n  poke(V, 0, 281);\n  t22 = (-peek(V, 277));\n  poke(V, t22, 282);\n  t23 = min(1048576, trunc(((2 * peek(V, 277)) + 1)));\n  for (t24 = 0; t24 < t23; t24 += 1) {\n    poke(V, 0, 283);\n    poke(V, 0, 284);\n    poke(V, 0, 285);\n    t25 = peek(V, 270);\n    poke(V, t25, 286);\n    t26 = min(1048576, trunc(peek(V, 278)));\n    for (t27 = 0; t27 < t26; t27 += 1) {\n      t28 = (peek(V, 262) + peek(V, 286));\n      poke(V, t28, 287);\n      t29 = ((peek(V, 266) + peek(V, 286)) + peek(V, 282));\n      poke(V, t29, 288);\n      t30 = ((abs((peek(V, 287) < peek(V, 261) ? 1 : 0)) >= 0.00001) ? (peek(M, trunc(peek(V, 259) + peek(V, 287) + 0.00001)) + peek(M, trunc(peek(V, 260) + peek(V, 287) + 0.00001))) : 0);\n      poke(V, t30, 289);\n      t31 = ((abs((((abs((peek(V, 288) >= 0 ? 1 : 0)) >= 0.00001) && (abs((peek(V, 288) < peek(V, 265) ? 1 : 0)) >= 0.00001)) ? 1 : 0)) >= 0.00001) ? (peek(M, trunc(peek(V, 263) + peek(V, 288) + 0.00001)) + peek(M, trunc(peek(V, 264) + peek(V, 288) + 0.00001))) : 0);\n      poke(V, t31, 290);\n      t32 = (peek(V, 289) * peek(V, 290));\n      t33 = (peek(V, 285) + t32);\n      poke(V, t33, 285);\n      t34 = (peek(V, 289) * peek(V, 289));\n      t35 = (peek(V, 284) + t34);\n      poke(V, t35, 284);\n      t36 = (peek(V, 290) * peek(V, 290));\n      t37 = (peek(V, 283) + t36);\n      poke(V, t37, 283);\n      t38 = (peek(V, 286) + 1);\n      poke(V, t38, 286);\n    }\n    t39 = ((abs(((peek(V, 284) * peek(V, 283)) > 0 ? 1 : 0)) >= 0.00001) ? (peek(V, 285) / sqrt(abs((peek(V, 284) * peek(V, 283))))) : 0);\n    poke(V, t39, 291);\n    if ((abs((abs(peek(V, 291)) > peek(V, 279) ? 1 : 0)) >= 0.00001)) {\n      t40 = abs(peek(V, 291));\n      poke(V, t40, 279);\n      t41 = peek(V, 282);\n      poke(V, t41, 280);\n      t42 = peek(V, 291);\n      poke(V, t42, 281);\n    }\n    t43 = (peek(V, 282) + 1);\n    poke(V, t43, 282);\n  }\n  poke(V, 1, 292);\n  if ((abs(peek(V, 4)) >= 0.00001)) {\n    if ((abs((peek(V, 281) < 0 ? 1 : 0)) >= 0.00001)) {\n      poke(V, (-1), 292);\n    }\n    t44 = abs(peek(V, 281));\n    poke(V, t44, 281);\n  }\n  else {\n    t45 = max(peek(V, 281), 0);\n    poke(V, t45, 281);\n  }\n  if ((abs(peek(V, 11)) >= 0.00001)) {\n    t46 = floor((0.005 * peek(V, 78)));\n    poke(V, t46, 293);\n    poke(V, 0, 294);\n    poke(V, 0, 295);\n    t47 = max(1, (peek(V, 268) - peek(V, 293)));\n    poke(V, t47, 286);\n    t48 = min(1048576, trunc((((peek(V, 268) + peek(V, 293)) + 1) - peek(V, 286))));\n    for (t49 = 0; t49 < t48; t49 += 1) {\n      t50 = (peek(V, 262) + peek(V, 286));\n      poke(V, t50, 287);\n      t51 = ((peek(V, 266) + peek(V, 286)) + peek(V, 280));\n      poke(V, t51, 288);\n      t52 = ((abs((peek(V, 287) < peek(V, 261) ? 1 : 0)) >= 0.00001) ? (peek(M, trunc(peek(V, 259) + peek(V, 287) + 0.00001)) + peek(M, trunc(peek(V, 260) + peek(V, 287) + 0.00001))) : 0);\n      poke(V, t52, 289);\n      t53 = ((abs((((abs((peek(V, 288) >= 0 ? 1 : 0)) >= 0.00001) && (abs((peek(V, 288) < peek(V, 265) ? 1 : 0)) >= 0.00001)) ? 1 : 0)) >= 0.00001) ? (peek(M, trunc(peek(V, 263) + peek(V, 288) + 0.00001)) + peek(M, trunc(peek(V, 264) + peek(V, 288) + 0.00001))) : 0);\n      poke(V, t53, 290);\n      t54 = (peek(V, 289) * peek(V, 289));\n      t55 = (peek(V, 295) + t54);\n      poke(V, t55, 295);\n      t56 = (peek(V, 290) * peek(V, 290));\n      t57 = (peek(V, 294) + t56);\n      poke(V, t57, 294);\n      t58 = (peek(V, 286) + 1);\n      poke(V, t58, 286);\n    }\n    t59 = (sqrt(abs((peek(V, 295) / ((2 * peek(V, 293)) + 1)))) + 1e-9);\n    poke(V, t59, 295);\n    t60 = (sqrt(abs((peek(V, 294) / ((2 * peek(V, 293)) + 1)))) + 1e-9);\n    poke(V, t60, 294);\n    poke(V, 1000000000, 279);\n    t61 = peek(V, 268);\n    poke(V, t61, 296);\n    t62 = max(1, (peek(V, 268) - peek(V, 293)));\n    poke(V, t62, 286);\n    t63 = min(1048576, trunc((((peek(V, 268) + peek(V, 293)) + 1) - peek(V, 286))));\n    for (t64 = 0; t64 < t63; t64 += 1) {\n      t65 = (peek(V, 262) + peek(V, 286));\n      poke(V, t65, 287);\n      t66 = ((peek(V, 266) + peek(V, 286)) + peek(V, 280));\n      poke(V, t66, 288);\n      t67 = ((abs((peek(V, 287) < peek(V, 261) ? 1 : 0)) >= 0.00001) ? (peek(M, trunc(peek(V, 259) + peek(V, 287) + 0.00001)) + peek(M, trunc(peek(V, 260) + peek(V, 287) + 0.00001))) : 0);\n      poke(V, t67, 289);\n      t68 = ((abs((((abs((peek(V, 288) >= 0 ? 1 : 0)) >= 0.00001) && (abs((peek(V, 288) < peek(V, 265) ? 1 : 0)) >= 0.00001)) ? 1 : 0)) >= 0.00001) ? (peek(M, trunc(peek(V, 263) + peek(V, 288) + 0.00001)) + peek(M, trunc(peek(V, 264) + peek(V, 288) + 0.00001))) : 0);\n      poke(V, t68, 290);\n      t69 = (((abs(peek(V, 289)) / peek(V, 295)) + (abs(peek(V, 290)) / peek(V, 294))) + ((0.5 * abs((peek(V, 286) - peek(V, 268)))) / peek(V, 293)));\n      poke(V, t69, 297);\n      if ((abs((peek(V, 297) < peek(V, 279) ? 1 : 0)) >= 0.00001)) {\n        t70 = peek(V, 297);\n        poke(V, t70, 279);\n        t71 = peek(V, 286);\n        poke(V, t71, 296);\n      }\n      t72 = (peek(V, 286) + 1);\n      poke(V, t72, 286);\n    }\n    t73 = peek(V, 296);\n    poke(V, t73, 268);\n    t74 = peek(V, 268);\n    poke(V, t74, 270);\n  }\n  t75 = min((peek(V, 267) + max(((peek(V, 265) - peek(V, 266)) - peek(V, 280)), (peek(V, 270) + peek(V, 269)))), peek(V, 86));\n  poke(V, t75, 298);\n  poke(V, 0, 299);\n  poke(V, 0, 300);\n  t76 = min(1048576, trunc(min((peek(V, 267) + peek(V, 270)), peek(V, 298))));\n  for (t77 = 0; t77 < t76; t77 += 1) {\n    t78 = ((peek(V, 262) + peek(V, 300)) - peek(V, 267));\n    poke(V, t78, 287);\n    if ((abs((peek(V, 287) < peek(V, 261) ? 1 : 0)) >= 0.00001)) {\n      t79 = trunc(peek(V, 257) + peek(V, 300) + 0.00001);\n      t80 = ((peek(V, 271) * peek(V, 292)) * peek(M, trunc(peek(V, 259) + peek(V, 287) + 0.00001)));\n      poke(M, t80, t79);\n      t81 = trunc(peek(V, 258) + peek(V, 300) + 0.00001);\n      t82 = ((peek(V, 271) * peek(V, 292)) * peek(M, trunc(peek(V, 260) + peek(V, 287) + 0.00001)));\n      poke(M, t82, t81);\n    }\n    else {\n      t83 = trunc(peek(V, 257) + peek(V, 300) + 0.00001);\n      t84 = trunc(peek(V, 258) + peek(V, 300) + 0.00001);\n      poke(M, 0, t84);\n      poke(M, 0, t83);\n    }\n    t85 = max(peek(V, 299), max(abs(peek(M, trunc(peek(V, 257) + peek(V, 300) + 0.00001))), abs(peek(M, trunc(peek(V, 258) + peek(V, 300) + 0.00001)))));\n    poke(V, t85, 299);\n    t86 = (peek(V, 300) + 1);\n    poke(V, t86, 300);\n  }\n  t87 = min(1048576, trunc(min(peek(V, 269), (peek(V, 298) - peek(V, 300)))));\n  for (t88 = 0; t88 < t87; t88 += 1) {\n    t89 = (peek(V, 300) - peek(V, 267));\n    poke(V, t89, 286);\n    t90 = (peek(V, 262) + peek(V, 286));\n    poke(V, t90, 287);\n    t91 = ((peek(V, 266) + peek(V, 286)) + peek(V, 280));\n    poke(V, t91, 288);\n    t92 = (((peek(V, 286) - peek(V, 270)) + 0.5) / peek(V, 269));\n    poke(V, t92, 301);\n    t93 = cos(((peek(V, 301) * 3.141592653589793) * 0.5));\n    poke(V, t93, 302);\n    t94 = sin(((peek(V, 301) * 3.141592653589793) * 0.5));\n    poke(V, t94, 303);\n    t95 = (1 / sqrt(abs((((peek(V, 302) * peek(V, 302)) + (peek(V, 303) * peek(V, 303))) + (((2 * peek(V, 281)) * peek(V, 302)) * peek(V, 303))))));\n    poke(V, t95, 291);\n    t96 = (((peek(V, 271) * peek(V, 292)) * peek(V, 291)) * (peek(V, 287) < peek(V, 261) ? 1 : 0));\n    t97 = (peek(V, 302) * t96);\n    poke(V, t97, 302);\n    t98 = (peek(V, 291) * (((abs((peek(V, 288) >= 0 ? 1 : 0)) >= 0.00001) && (abs((peek(V, 288) < peek(V, 265) ? 1 : 0)) >= 0.00001)) ? 1 : 0));\n    t99 = (peek(V, 303) * t98);\n    poke(V, t99, 303);\n    t100 = min(peek(V, 287), (peek(V, 261) - 1));\n    poke(V, t100, 287);\n    t101 = f_clamp(V, M, mq, peek(V, 288), 0, (peek(V, 265) - 1));\n    poke(V, t101, 288);\n    t102 = trunc(peek(V, 257) + peek(V, 300) + 0.00001);\n    t103 = ((peek(V, 302) * peek(M, trunc(peek(V, 259) + peek(V, 287) + 0.00001))) + (peek(V, 303) * peek(M, trunc(peek(V, 263) + peek(V, 288) + 0.00001))));\n    poke(M, t103, t102);\n    t104 = trunc(peek(V, 258) + peek(V, 300) + 0.00001);\n    t105 = ((peek(V, 302) * peek(M, trunc(peek(V, 260) + peek(V, 287) + 0.00001))) + (peek(V, 303) * peek(M, trunc(peek(V, 264) + peek(V, 288) + 0.00001))));\n    poke(M, t105, t104);\n    t106 = max(peek(V, 299), max(abs(peek(M, trunc(peek(V, 257) + peek(V, 300) + 0.00001))), abs(peek(M, trunc(peek(V, 258) + peek(V, 300) + 0.00001)))));\n    poke(V, t106, 299);\n    t107 = (peek(V, 300) + 1);\n    poke(V, t107, 300);\n  }\n  t108 = peek(V, 300);\n  poke(V, t108, 304);\n  t109 = ((peek(V, 266) + (peek(V, 304) - peek(V, 267))) + peek(V, 280));\n  poke(V, t109, 305);\n  if ((abs((peek(V, 305) < 0 ? 1 : 0)) >= 0.00001)) {\n    t110 = min((-peek(V, 305)), (peek(V, 298) - peek(V, 304)));\n    poke(V, t110, 306);\n    t111 = (peek(V, 257) + peek(V, 304));\n    t112 = min(trunc(peek(V, 306)), 8388608);\n    for (t113 = 0; t113 < t112; t113 += 1) {\n      poke(M, 0, trunc(t111 + t113 + 0.00001));\n    }\n    t114 = (peek(V, 258) + peek(V, 304));\n    t115 = min(trunc(peek(V, 306)), 8388608);\n    for (t116 = 0; t116 < t115; t116 += 1) {\n      poke(M, 0, trunc(t114 + t116 + 0.00001));\n    }\n    t117 = peek(V, 306);\n    t118 = (peek(V, 304) + t117);\n    poke(V, t118, 304);\n    t119 = peek(V, 306);\n    t120 = (peek(V, 305) + t119);\n    poke(V, t120, 305);\n  }\n  t121 = max(0, min((peek(V, 298) - peek(V, 304)), (peek(V, 265) - peek(V, 305))));\n  poke(V, t121, 306);\n  t122 = (peek(V, 257) + peek(V, 304));\n  t123 = (peek(V, 263) + peek(V, 305));\n  t124 = min(trunc(peek(V, 306)), 8388608);\n  if (t122 <= t123) {\n    for (t125 = 0; t125 < t124; t125 += 1) {\n      poke(M, peek(M, trunc(t123 + t125 + 0.00001)), trunc(t122 + t125 + 0.00001));\n    }\n  }\n  else {\n    for (t125 = t124 - 1; t125 >= 0; t125 -= 1) {\n      poke(M, peek(M, trunc(t123 + t125 + 0.00001)), trunc(t122 + t125 + 0.00001));\n    }\n  }\n  t126 = (peek(V, 258) + peek(V, 304));\n  t127 = (peek(V, 264) + peek(V, 305));\n  t128 = min(trunc(peek(V, 306)), 8388608);\n  if (t126 <= t127) {\n    for (t129 = 0; t129 < t128; t129 += 1) {\n      poke(M, peek(M, trunc(t127 + t129 + 0.00001)), trunc(t126 + t129 + 0.00001));\n    }\n  }\n  else {\n    for (t129 = t128 - 1; t129 >= 0; t129 -= 1) {\n      poke(M, peek(M, trunc(t127 + t129 + 0.00001)), trunc(t126 + t129 + 0.00001));\n    }\n  }\n  if ((abs(((peek(V, 304) + peek(V, 306)) < peek(V, 298) ? 1 : 0)) >= 0.00001)) {\n    t130 = ((peek(V, 257) + peek(V, 304)) + peek(V, 306));\n    t131 = min(trunc(((peek(V, 298) - peek(V, 304)) - peek(V, 306))), 8388608);\n    for (t132 = 0; t132 < t131; t132 += 1) {\n      poke(M, 0, trunc(t130 + t132 + 0.00001));\n    }\n    t133 = ((peek(V, 258) + peek(V, 304)) + peek(V, 306));\n    t134 = min(trunc(((peek(V, 298) - peek(V, 304)) - peek(V, 306))), 8388608);\n    for (t135 = 0; t135 < t134; t135 += 1) {\n      poke(M, 0, trunc(t133 + t135 + 0.00001));\n    }\n  }\n  t136 = trunc(peek(V, 109) + p0 + 0.00001);\n  t137 = peek(V, 267);\n  poke(M, t137, t136);\n  t138 = trunc(peek(V, 110) + p0 + 0.00001);\n  t139 = peek(V, 299);\n  t140 = f_region_peak(V, M, mq, peek(V, 263), peek(V, 264), peek(V, 265), (((peek(V, 266) + peek(V, 270)) + peek(V, 269)) + peek(V, 280)), peek(V, 265));\n  t141 = max(t139, t140);\n  poke(M, t141, t138);\n  t142 = trunc(peek(V, 114) + p0 + 0.00001);\n  t143 = peek(V, 280);\n  poke(M, t143, t142);\n  t144 = trunc(peek(V, 115) + p0 + 0.00001);\n  t145 = peek(V, 292);\n  poke(M, t145, t144);\n  t146 = trunc(peek(V, 116) + p0 + 0.00001);\n  t147 = peek(V, 271);\n  poke(M, t147, t146);\n  t148 = trunc(peek(V, 118) + p0 + 0.00001);\n  t149 = peek(V, 268);\n  poke(M, t149, t148);\n  t150 = trunc(peek(V, 119) + p0 + 0.00001);\n  t151 = peek(V, 269);\n  poke(M, t151, t150);\n  t152 = trunc(peek(V, 120) + p0 + 0.00001);\n  t153 = peek(V, 270);\n  poke(M, t153, t152);\n  t154 = trunc(peek(V, 108) + p0 + 0.00001);\n  t155 = peek(V, 298);\n  poke(M, t155, t154);\n  r = t155;\n  return r;\n}\n\nf_recompute(V, M, mq) {\n  t1 = 0; t2 = 0; t3 = 0; t4 = 0; t5 = 0; t6 = 0; t7 = 0; t8 = 0; t9 = 0; t10 = 0; t11 = 0; t12 = 0; t13 = 0; t14 = 0; t15 = 0; t16 = 0; t17 = 0;\n  r = 0;\n  t1 = f_calc_splice(V, M, mq);\n  if ((abs((((abs(peek(V, 206)) >= 0.00001) || (abs((abs(peek(V, 5) - peek(V, 210)) < 0.00001 ? 0 : 1)) >= 0.00001)) ? 1 : 0)) >= 0.00001)) {\n    if ((abs((peek(M, trunc(peek(V, 108) + 0.00001)) > 0 ? 1 : 0)) >= 0.00001)) {\n      t2 = f_find_onset(V, M, mq, 0);\n      t3 = f_find_attack_end(V, M, mq, 0);\n    }\n    else {\n      t4 = trunc(peek(V, 109) + 0.00001);\n      t5 = trunc(peek(V, 110) + 0.00001);\n      t6 = trunc(peek(V, 117) + 0.00001);\n      poke(M, 0, t6);\n      poke(M, 0, t5);\n      poke(M, 0, t4);\n    }\n    if ((abs((peek(M, trunc(peek(V, 108) + 1 + 0.00001)) > 0 ? 1 : 0)) >= 0.00001)) {\n      t7 = f_find_onset(V, M, mq, 1);\n      t8 = f_find_attack_end(V, M, mq, 1);\n    }\n    else {\n      t9 = trunc(peek(V, 109) + 1 + 0.00001);\n      t10 = trunc(peek(V, 110) + 1 + 0.00001);\n      t11 = trunc(peek(V, 117) + 1 + 0.00001);\n      poke(M, 0, t11);\n      poke(M, 0, t10);\n      poke(M, 0, t9);\n    }\n    t12 = peek(V, 5);\n    poke(V, t12, 210);\n    poke(V, 0, 206);\n  }\n  if ((abs((((abs((peek(M, trunc(peek(V, 108) + 0.00001)) > 0 ? 1 : 0)) >= 0.00001) && (abs((peek(M, trunc(peek(V, 108) + 1 + 0.00001)) > 0 ? 1 : 0)) >= 0.00001)) ? 1 : 0)) >= 0.00001)) {\n    t13 = f_make_hybrid(V, M, mq, 2, 1, 0);\n    t14 = f_make_hybrid(V, M, mq, 3, 0, 1);\n  }\n  else {\n    t15 = trunc(peek(V, 108) + 2 + 0.00001);\n    t16 = trunc(peek(V, 108) + 3 + 0.00001);\n    poke(M, 0, t16);\n    poke(M, 0, t15);\n  }\n  poke(V, 0, 148);\n  t17 = (peek(V, 307) + 1);\n  poke(V, t17, 307);\n  r = t17;\n  return r;\n}\n\nf_housekeeping(V, M, mq) {\n  t1 = 0; t2 = 0; t3 = 0; t4 = 0; t5 = 0;\n  r = 0;\n  t1 = (abs((abs(peek(V, 157) - peek(V, 78)) < 0.00001 ? 0 : 1)) >= 0.00001) ? 1 : 0;\n  if (t1 != 0) {\n    t2 = (abs(0) >= 0.00001) ? 1 : 0;\n    if (t2 == 0) {\n      t2 = (abs(0) >= 0.00001) ? 1 : 0;\n    }\n    t1 = (abs(t2) >= 0.00001) ? 1 : 0;\n  }\n  if ((abs(t1) >= 0.00001)) {\n    poke(V, 1, 158);\n  }\n  if ((abs(peek(V, 158)) >= 0.00001)) {\n    poke(V, 0, 158);\n    t3 = f_load_slot(V, M, mq, 0);\n    t4 = f_load_slot(V, M, mq, 1);\n  }\n  if ((abs(peek(V, 148)) >= 0.00001)) {\n    t5 = f_recompute(V, M, mq);\n    r = t5;\n  }\n  else {\n    r = 0;\n  }\n  return r;\n}\n\nf_start_voice(V, M, mq, p0, p1, p2) {\n  t1 = 0; t2 = 0; t3 = 0; t4 = 0; t5 = 0; t6 = 0; t7 = 0; t8 = 0; t9 = 0; t10 = 0;\n  r = 0;\n  if ((abs((peek(M, trunc(peek(V, 108) + p0 + 0.00001)) > 0 ? 1 : 0)) >= 0.00001)) {\n    t1 = peek(V, 309);\n    poke(V, t1, 310);\n    t2 = eel_mod((peek(V, 309) + 1), peek(V, 89));\n    poke(V, t2, 309);\n    t3 = trunc(peek(V, 102) + peek(V, 310) + 0.00001);\n    t4 = p0;\n    poke(M, t4, t3);\n    t5 = trunc(peek(V, 103) + peek(V, 310) + 0.00001);\n    t6 = (-p2);\n    poke(M, t6, t5);\n    t7 = trunc(peek(V, 104) + peek(V, 310) + 0.00001);\n    t8 = p1;\n    poke(M, t8, t7);\n    t9 = trunc(peek(V, 105) + peek(V, 310) + 0.00001);\n    poke(M, 1, t9);\n    t10 = peek(V, 310);\n    poke(V, t10, 311);\n    r = t10;\n  }\n  else {\n    r = 0;\n  }\n  return r;\n}\n\n// every sample\n  t1 = 0; t2 = 0; t3 = 0; t4 = 0; t5 = 0; t6 = 0; t7 = 0; t8 = 0; t9 = 0; t10 = 0; t11 = 0; t12 = 0; t13 = 0; t14 = 0; t15 = 0; t16 = 0;\n  t17 = 0; t18 = 0; t19 = 0; t20 = 0; t21 = 0; t22 = 0; t23 = 0; t24 = 0; t25 = 0; t26 = 0; t27 = 0; t28 = 0; t29 = 0; t30 = 0; t31 = 0; t32 = 0;\n  t33 = 0; t34 = 0; t35 = 0; t36 = 0; t37 = 0; t38 = 0; t39 = 0; t40 = 0; t41 = 0; t42 = 0; t43 = 0; t44 = 0; t45 = 0; t46 = 0; t47 = 0; t48 = 0;\n  t49 = 0; t50 = 0; t51 = 0; t52 = 0; t53 = 0; t54 = 0; t55 = 0; t56 = 0; t57 = 0; t58 = 0; t59 = 0; t60 = 0; t61 = 0; t62 = 0; t63 = 0; t64 = 0;\n  t65 = 0; t66 = 0; t67 = 0; t68 = 0; t69 = 0; t70 = 0; t71 = 0; t72 = 0; t73 = 0; t74 = 0; t75 = 0; t76 = 0; t77 = 0; t78 = 0; t79 = 0; t80 = 0;\n  t81 = 0; t82 = 0; t83 = 0; t84 = 0; t85 = 0;\n  moved = 0;\n  // @init and @slider, once\n  if (peek(V, 64) == 0) {\n    poke(V, slider1, 0);\n    poke(V, slider1, 65);\n    poke(V, slider2, 1);\n    poke(V, slider2, 66);\n    poke(V, slider3, 2);\n    poke(V, slider3, 67);\n    poke(V, slider4, 3);\n    poke(V, slider4, 68);\n    poke(V, slider5, 4);\n    poke(V, slider5, 69);\n    poke(V, slider6, 5);\n    poke(V, slider6, 70);\n    poke(V, slider7, 6);\n    poke(V, slider7, 71);\n    poke(V, slider8, 7);\n    poke(V, slider8, 72);\n    poke(V, slider9, 8);\n    poke(V, slider9, 73);\n    poke(V, slider10, 9);\n    poke(V, slider10, 74);\n    poke(V, slider11, 10);\n    poke(V, slider11, 75);\n    poke(V, slider12, 11);\n    poke(V, slider12, 76);\n    poke(V, 22222, 77);\n    poke(V, samplerate, 78);\n    poke(V, 2, 79);\n    poke(V, 32, 80);\n    poke(V, tempo, 81);\n    poke(V, ts_num, 82);\n    poke(V, ts_denom, 83);\n    poke(V, 1, 84);\n    poke(V, 1, 85);\n    poke(V, 800000, 86);\n    poke(V, 65536, 87);\n    poke(V, 4096, 88);\n    poke(V, 8, 89);\n    poke(V, 0, 90);\n    t1 = peek(V, 86);\n    poke(V, t1, 91);\n    t2 = (2 * peek(V, 86));\n    poke(V, t2, 92);\n    t3 = (3 * peek(V, 86));\n    poke(V, t3, 93);\n    t4 = (4 * peek(V, 86));\n    poke(V, t4, 94);\n    t5 = (5 * peek(V, 86));\n    poke(V, t5, 95);\n    t6 = (6 * peek(V, 86));\n    poke(V, t6, 96);\n    t7 = (7 * peek(V, 86));\n    poke(V, t7, 97);\n    t8 = (8 * peek(V, 86));\n    poke(V, t8, 98);\n    t9 = (10 * peek(V, 86));\n    poke(V, t9, 99);\n    t10 = (peek(V, 99) + peek(V, 87));\n    poke(V, t10, 100);\n    t11 = (peek(V, 100) + ((3 * 2) * peek(V, 88)));\n    poke(V, t11, 101);\n    t12 = peek(V, 101);\n    poke(V, t12, 102);\n    t13 = (peek(V, 102) + peek(V, 89));\n    poke(V, t13, 103);\n    t14 = (peek(V, 103) + peek(V, 89));\n    poke(V, t14, 104);\n    t15 = (peek(V, 104) + peek(V, 89));\n    poke(V, t15, 105);\n    t16 = (peek(V, 105) + peek(V, 89));\n    poke(V, t16, 106);\n    t17 = (peek(V, 106) + 4);\n    poke(V, t17, 107);\n    t18 = (peek(V, 107) + 4);\n    poke(V, t18, 108);\n    t19 = (peek(V, 108) + 4);\n    poke(V, t19, 109);\n    t20 = (peek(V, 109) + 4);\n    poke(V, t20, 110);\n    t21 = (peek(V, 110) + 4);\n    poke(V, t21, 111);\n    t22 = (peek(V, 111) + 4);\n    poke(V, t22, 112);\n    t23 = (peek(V, 112) + 4);\n    poke(V, t23, 113);\n    t24 = (peek(V, 113) + 4);\n    poke(V, t24, 114);\n    t25 = (peek(V, 114) + 4);\n    poke(V, t25, 115);\n    t26 = (peek(V, 115) + 4);\n    poke(V, t26, 116);\n    t27 = (peek(V, 116) + 4);\n    poke(V, t27, 117);\n    t28 = (peek(V, 117) + 4);\n    poke(V, t28, 118);\n    t29 = (peek(V, 118) + 4);\n    poke(V, t29, 119);\n    t30 = (peek(V, 119) + 4);\n    poke(V, t30, 120);\n    t31 = (peek(V, 120) + 4);\n    poke(V, t31, 121);\n    t32 = (peek(V, 121) + 64);\n    poke(V, t32, 122);\n    t33 = trunc(peek(V, 106) + 0.00001);\n    t34 = peek(V, 90);\n    poke(M, t34, t33);\n    t35 = trunc(peek(V, 107) + 0.00001);\n    t36 = peek(V, 91);\n    poke(M, t36, t35);\n    t37 = trunc(peek(V, 106) + 1 + 0.00001);\n    t38 = peek(V, 92);\n    poke(M, t38, t37);\n    t39 = trunc(peek(V, 107) + 1 + 0.00001);\n    t40 = peek(V, 93);\n    poke(M, t40, t39);\n    t41 = trunc(peek(V, 106) + 2 + 0.00001);\n    t42 = peek(V, 94);\n    poke(M, t42, t41);\n    t43 = trunc(peek(V, 107) + 2 + 0.00001);\n    t44 = peek(V, 95);\n    poke(M, t44, t43);\n    t45 = trunc(peek(V, 106) + 3 + 0.00001);\n    t46 = peek(V, 96);\n    poke(M, t46, t45);\n    t47 = trunc(peek(V, 107) + 3 + 0.00001);\n    t48 = peek(V, 97);\n    poke(M, t48, t47);\n    poke(V, 16773632, 123);\n    poke(V, 16774190, 124);\n    poke(V, 13747712, 125);\n    poke(V, 11120570, 126);\n    poke(V, 12633807, 127);\n    poke(V, 9410210, 128);\n    poke(V, 2303790, 129);\n    poke(V, 1711395, 130);\n    poke(V, 2764599, 131);\n    poke(V, 3817546, 132);\n    poke(V, 1316636, 133);\n    poke(V, 14541287, 134);\n    poke(V, 9081244, 135);\n    poke(V, 7173505, 136);\n    poke(V, 1119257, 137);\n    poke(V, 1843238, 138);\n    poke(V, 6581111, 139);\n    poke(V, 13781055, 140);\n    t49 = peek(V, 123);\n    poke(V, t49, 141);\n    poke(V, 11581120, 142);\n    poke(V, 16752278, 143);\n    poke(V, 100, 144);\n    poke(V, 0, 145);\n    poke(V, 1, 146);\n    poke(V, 1, 147);\n    poke(V, 1, 148);\n    poke(V, 1, 64);\n  }\n  // a moved slider runs @slider\n  moved = 0;\n  if (slider1 != peek(V, 65)) {\n    poke(V, slider1, 65);\n    poke(V, slider1, 0);\n    moved = 1;\n  }\n  if (slider2 != peek(V, 66)) {\n    poke(V, slider2, 66);\n    poke(V, slider2, 1);\n    moved = 1;\n  }\n  if (slider3 != peek(V, 67)) {\n    poke(V, slider3, 67);\n    poke(V, slider3, 2);\n    moved = 1;\n  }\n  if (slider4 != peek(V, 68)) {\n    poke(V, slider4, 68);\n    poke(V, slider4, 3);\n    moved = 1;\n  }\n  if (slider5 != peek(V, 69)) {\n    poke(V, slider5, 69);\n    poke(V, slider5, 4);\n    moved = 1;\n  }\n  if (slider6 != peek(V, 70)) {\n    poke(V, slider6, 70);\n    poke(V, slider6, 5);\n    moved = 1;\n  }\n  if (slider7 != peek(V, 71)) {\n    poke(V, slider7, 71);\n    poke(V, slider7, 6);\n    moved = 1;\n  }\n  if (slider8 != peek(V, 72)) {\n    poke(V, slider8, 72);\n    poke(V, slider8, 7);\n    moved = 1;\n  }\n  if (slider9 != peek(V, 73)) {\n    poke(V, slider9, 73);\n    poke(V, slider9, 8);\n    moved = 1;\n  }\n  if (slider10 != peek(V, 74)) {\n    poke(V, slider10, 74);\n    poke(V, slider10, 9);\n    moved = 1;\n  }\n  if (slider11 != peek(V, 75)) {\n    poke(V, slider11, 75);\n    poke(V, slider11, 10);\n    moved = 1;\n  }\n  if (slider12 != peek(V, 76)) {\n    poke(V, slider12, 76);\n    poke(V, slider12, 11);\n    moved = 1;\n  }\n  if (moved != 0) {\n    poke(V, 1, 148);\n  }\n  // @block, every 32 samples\n  if (peek(V, 149) <= 0) {\n    poke(V, 32, 149);\n    poke(V, w_ui_trig, 150);\n    poke(V, w_ui_trig_src, 151);\n    poke(V, w_ui_stop, 152);\n    poke(V, tempo, 81);\n    poke(V, play_state, 153);\n    poke(V, beat_position, 154);\n    poke(V, beat_position * 60 / max(1, tempo), 155);\n    poke(V, ts_num, 82);\n    poke(V, ts_denom, 83);\n    if ((abs(((0 - peek(V, 156)) > 0.5 ? 1 : 0)) >= 0.00001)) {\n      t50 = f_housekeeping(V, M, mq);\n    }\n    if ((abs((abs(peek(V, 150) - peek(V, 308)) < 0.00001 ? 0 : 1)) >= 0.00001)) {\n      t51 = peek(V, 150);\n      poke(V, t51, 308);\n      t52 = f_start_voice(V, M, mq, peek(V, 151), 1, 0);\n    }\n    if ((abs((abs(peek(V, 152) - peek(V, 312)) < 0.00001 ? 0 : 1)) >= 0.00001)) {\n      t53 = peek(V, 152);\n      poke(V, t53, 312);\n      t54 = peek(V, 105);\n      t55 = min(trunc(peek(V, 89)), 8388608);\n      for (t56 = 0; t56 < t55; t56 += 1) {\n        poke(M, 0, trunc(t54 + t56 + 0.00001));\n      }\n    }\n    t57 = 0;\n    while (t57 < 1048576) {\n      t58 = 0;\n      if (peek(V, 313) < peek(mq, 0)) {\n        t59 = 1 + 3 * eel_mod(peek(V, 313), 256);\n        t60 = peek(mq, t59);\n        t61 = peek(mq, t59 + 1);\n        t62 = peek(mq, t59 + 2);\n        poke(V, peek(V, 313) + 1, 313);\n        poke(V, 0, 314);\n        poke(V, t60, 315);\n        poke(V, t61, 316);\n        poke(V, t62, 317);\n        t58 = t60;\n      }\n      if (!(abs(t58) >= 0.00001)) {\n        break;\n      }\n      if ((abs((((abs((abs(eel_band(peek(V, 315), 240) - 144) < 0.00001 ? 1 : 0)) >= 0.00001) && (abs((peek(V, 317) > 0 ? 1 : 0)) >= 0.00001)) ? 1 : 0)) >= 0.00001)) {\n        t63 = f_start_voice(V, M, mq, ((abs((abs(peek(V, 7) - 0) < 0.00001 ? 1 : 0)) >= 0.00001) ? (2 + peek(V, 6)) : (peek(V, 7) - 1)), (peek(V, 317) / 127), peek(V, 314));\n      }\n      t57 += 1;\n    }\n    t64 = f_db2g(V, M, mq, peek(V, 8));\n    poke(V, t64, 318);\n  }\n  poke(V, peek(V, 149) - 1, 149);\n  // @sample\n  poke(V, in1, 319);\n  poke(V, in2, 320);\n  t65 = ((abs(peek(V, 9)) >= 0.00001) ? peek(V, 319) : 0);\n  poke(V, t65, 321);\n  t66 = ((abs(peek(V, 9)) >= 0.00001) ? peek(V, 320) : 0);\n  poke(V, t66, 322);\n  poke(V, 0, 323);\n  t67 = min(1048576, trunc(peek(V, 89)));\n  for (t68 = 0; t68 < t67; t68 += 1) {\n    if ((abs(peek(M, trunc(peek(V, 105) + peek(V, 323) + 0.00001))) >= 0.00001)) {\n      t69 = peek(M, trunc(peek(V, 103) + peek(V, 323) + 0.00001));\n      poke(V, t69, 324);\n      if ((abs((peek(V, 324) >= 0 ? 1 : 0)) >= 0.00001)) {\n        t70 = peek(M, trunc(peek(V, 102) + peek(V, 323) + 0.00001));\n        poke(V, t70, 325);\n        if ((abs((peek(V, 324) < peek(M, trunc(peek(V, 108) + peek(V, 325) + 0.00001)) ? 1 : 0)) >= 0.00001)) {\n          t71 = peek(M, trunc(peek(V, 106) + peek(V, 325) + 0.00001));\n          poke(V, t71, 326);\n          t72 = peek(M, trunc(peek(V, 107) + peek(V, 325) + 0.00001));\n          poke(V, t72, 327);\n          t73 = ((peek(M, trunc(peek(V, 326) + peek(V, 324) + 0.00001)) * peek(M, trunc(peek(V, 104) + peek(V, 323) + 0.00001))) * peek(V, 318));\n          t74 = (peek(V, 321) + t73);\n          poke(V, t74, 321);\n          t75 = ((peek(M, trunc(peek(V, 327) + peek(V, 324) + 0.00001)) * peek(M, trunc(peek(V, 104) + peek(V, 323) + 0.00001))) * peek(V, 318));\n          t76 = (peek(V, 322) + t75);\n          poke(V, t76, 322);\n        }\n        else {\n          t77 = trunc(peek(V, 105) + peek(V, 323) + 0.00001);\n          poke(M, 0, t77);\n        }\n      }\n      t78 = trunc(peek(V, 103) + peek(V, 323) + 0.00001);\n      t79 = (peek(V, 324) + 1);\n      poke(M, t79, t78);\n    }\n    t80 = (peek(V, 323) + 1);\n    poke(V, t80, 323);\n  }\n  t81 = peek(V, 321);\n  poke(V, t81, 319);\n  t82 = peek(V, 322);\n  poke(V, t82, 320);\n  t83 = peek(M, trunc(peek(V, 105) + peek(V, 311) + 0.00001));\n  poke(V, t83, 328);\n  t84 = peek(M, trunc(peek(V, 102) + peek(V, 311) + 0.00001));\n  poke(V, t84, 329);\n  t85 = peek(M, trunc(peek(V, 103) + peek(V, 311) + 0.00001));\n  poke(V, t85, 330);\nout1 = peek(V, 319);\nout2 = peek(V, 320);\n",
         "fontface": 0,
         "fontname": "<Monospaced>",
         "fontsize": 12.0
        }
       },
       {
        "box": {
         "id": "obj-4",
         "maxclass": "newobj",
         "numinlets": 1,
         "numoutlets": 0,
         "patching_rect": [
          20.0,
          520.0,
          40.0,
          22.0
         ],
         "text": "out 1"
        }
       },
       {
        "box": {
         "id": "obj-5",
         "maxclass": "newobj",
         "numinlets": 1,
         "numoutlets": 0,
         "patching_rect": [
          140.0,
          520.0,
          40.0,
          22.0
         ],
         "text": "out 2"
        }
       }
      ],
      "lines": [
       {
        "patchline": {
         "source": [
          "obj-1",
          0
         ],
         "destination": [
          "obj-3",
          0
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "obj-2",
          0
         ],
         "destination": [
          "obj-3",
          1
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "obj-3",
          0
         ],
         "destination": [
          "obj-4",
          0
         ]
        }
       },
       {
        "patchline": {
         "source": [
          "obj-3",
          1
         ],
         "destination": [
          "obj-5",
          0
         ]
        }
       }
      ]
     }
    }
   },
   {
    "box": {
     "id": "obj-14",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 0,
     "patching_rect": [
      20.0,
      360.0,
      70.0,
      22.0
     ],
     "text": "plugout~"
    }
   },
   {
    "box": {
     "id": "obj-15",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 2,
     "patching_rect": [
      220.0,
      260.0,
      60.0,
      22.0
     ],
     "outlettype": [
      "signal",
      "signal"
     ],
     "text": "plugin~"
    }
   },
   {
    "box": {
     "id": "obj-16",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 2,
     "patching_rect": [
      420.0,
      300.0,
      160.0,
      22.0
     ],
     "outlettype": [
      "",
      ""
     ],
     "text": "buffer~ ---mq @samps 1024"
    }
   },
   {
    "box": {
     "id": "obj-17",
     "maxclass": "message",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      420.0,
      260.0,
      200.0,
      22.0
     ],
     "outlettype": [
      ""
     ],
     "text": "mqname ---mq"
    }
   },
   {
    "box": {
     "id": "obj-18",
     "maxclass": "message",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      220.0,
      220.0,
      100.0,
      22.0
     ],
     "outlettype": [
      ""
     ],
     "text": "mq ---mq"
    }
   },
   {
    "box": {
     "id": "obj-19",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 2,
     "patching_rect": [
      620.0,
      300.0,
      200.0,
      22.0
     ],
     "outlettype": [
      "",
      ""
     ],
     "text": "buffer~ ---mem @samps 8388608"
    }
   },
   {
    "box": {
     "id": "obj-20",
     "maxclass": "message",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      620.0,
      260.0,
      140.0,
      22.0
     ],
     "outlettype": [
      ""
     ],
     "text": "memname ---mem"
    }
   },
   {
    "box": {
     "id": "obj-21",
     "maxclass": "message",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      220.0,
      180.0,
      100.0,
      22.0
     ],
     "outlettype": [
      ""
     ],
     "text": "M ---mem"
    }
   },
   {
    "box": {
     "id": "obj-22",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 3,
     "patching_rect": [
      820.0,
      200.0,
      120.0,
      22.0
     ],
     "outlettype": [
      "",
      "",
      ""
     ],
     "text": "route A B"
    }
   },
   {
    "box": {
     "id": "obj-23",
     "maxclass": "live.drop",
     "numinlets": 1,
     "numoutlets": 2,
     "patching_rect": [
      820.0,
      20.0,
      120.0,
      40.0
     ],
     "outlettype": [
      "",
      ""
     ],
     "parameter_enable": 0,
     "presentation": 1,
     "presentation_rect": [
      8.0,
      108.0,
      118.0,
      52.0
     ]
    }
   },
   {
    "box": {
     "id": "obj-24",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      820.0,
      0.0,
      120.0,
      20.0
     ],
     "text": "Sample A",
     "presentation": 1,
     "presentation_rect": [
      8.0,
      90.0,
      118.0,
      18.0
     ],
     "textcolor": [
      0.867,
      0.882,
      0.906,
      1.0
     ],
     "fontsize": 10.0
    }
   },
   {
    "box": {
     "id": "obj-25",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      820.0,
      70.0,
      110.0,
      22.0
     ],
     "outlettype": [
      ""
     ],
     "text": "prepend drop A"
    }
   },
   {
    "box": {
     "id": "obj-26",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 2,
     "patching_rect": [
      820.0,
      260.0,
      120.0,
      22.0
     ],
     "outlettype": [
      "",
      ""
     ],
     "text": "buffer~ ---srcA"
    }
   },
   {
    "box": {
     "id": "obj-27",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      820.0,
      300.0,
      30.0,
      22.0
     ],
     "outlettype": [
      "bang"
     ],
     "text": "t b"
    }
   },
   {
    "box": {
     "id": "obj-28",
     "maxclass": "message",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      820.0,
      340.0,
      110.0,
      22.0
     ],
     "outlettype": [
      ""
     ],
     "text": "loaded A"
    }
   },
   {
    "box": {
     "id": "obj-29",
     "maxclass": "message",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      820.0,
      380.0,
      140.0,
      22.0
     ],
     "outlettype": [
      ""
     ],
     "text": "srcname A ---srcA"
    }
   },
   {
    "box": {
     "id": "obj-30",
     "maxclass": "live.drop",
     "numinlets": 1,
     "numoutlets": 2,
     "patching_rect": [
      960.0,
      20.0,
      120.0,
      40.0
     ],
     "outlettype": [
      "",
      ""
     ],
     "parameter_enable": 0,
     "presentation": 1,
     "presentation_rect": [
      134.0,
      108.0,
      118.0,
      52.0
     ]
    }
   },
   {
    "box": {
     "id": "obj-31",
     "maxclass": "comment",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      960.0,
      0.0,
      120.0,
      20.0
     ],
     "text": "Sample B",
     "presentation": 1,
     "presentation_rect": [
      134.0,
      90.0,
      118.0,
      18.0
     ],
     "textcolor": [
      0.867,
      0.882,
      0.906,
      1.0
     ],
     "fontsize": 10.0
    }
   },
   {
    "box": {
     "id": "obj-32",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      960.0,
      70.0,
      110.0,
      22.0
     ],
     "outlettype": [
      ""
     ],
     "text": "prepend drop B"
    }
   },
   {
    "box": {
     "id": "obj-33",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 2,
     "patching_rect": [
      960.0,
      260.0,
      120.0,
      22.0
     ],
     "outlettype": [
      "",
      ""
     ],
     "text": "buffer~ ---srcB"
    }
   },
   {
    "box": {
     "id": "obj-34",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      960.0,
      300.0,
      30.0,
      22.0
     ],
     "outlettype": [
      "bang"
     ],
     "text": "t b"
    }
   },
   {
    "box": {
     "id": "obj-35",
     "maxclass": "message",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      960.0,
      340.0,
      110.0,
      22.0
     ],
     "outlettype": [
      ""
     ],
     "text": "loaded B"
    }
   },
   {
    "box": {
     "id": "obj-36",
     "maxclass": "message",
     "numinlets": 1,
     "numoutlets": 1,
     "patching_rect": [
      960.0,
      380.0,
      140.0,
      22.0
     ],
     "outlettype": [
      ""
     ],
     "text": "srcname B ---srcB"
    }
   }
  ],
  "lines": [
   {
    "patchline": {
     "source": [
      "obj-1",
      0
     ],
     "destination": [
      "obj-3",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-2",
      0
     ],
     "destination": [
      "obj-3",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-3",
      0
     ],
     "destination": [
      "obj-4",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-3",
      1
     ],
     "destination": [
      "obj-5",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-5",
      0
     ],
     "destination": [
      "obj-6",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-6",
      0
     ],
     "destination": [
      "obj-3",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-3",
      2
     ],
     "destination": [
      "obj-7",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-8",
      0
     ],
     "destination": [
      "obj-9",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-9",
      0
     ],
     "destination": [
      "obj-10",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-9",
      1
     ],
     "destination": [
      "obj-10",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-10",
      0
     ],
     "destination": [
      "obj-11",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-11",
      0
     ],
     "destination": [
      "obj-12",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-12",
      0
     ],
     "destination": [
      "obj-3",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-13",
      0
     ],
     "destination": [
      "obj-14",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-13",
      1
     ],
     "destination": [
      "obj-14",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-15",
      0
     ],
     "destination": [
      "obj-13",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-15",
      1
     ],
     "destination": [
      "obj-13",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-3",
      3
     ],
     "destination": [
      "obj-13",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-2",
      0
     ],
     "destination": [
      "obj-17",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-17",
      0
     ],
     "destination": [
      "obj-3",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-2",
      0
     ],
     "destination": [
      "obj-18",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-18",
      0
     ],
     "destination": [
      "obj-13",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-2",
      0
     ],
     "destination": [
      "obj-20",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-20",
      0
     ],
     "destination": [
      "obj-3",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-2",
      0
     ],
     "destination": [
      "obj-21",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-21",
      0
     ],
     "destination": [
      "obj-13",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-3",
      4
     ],
     "destination": [
      "obj-22",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-23",
      0
     ],
     "destination": [
      "obj-25",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-25",
      0
     ],
     "destination": [
      "obj-3",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-22",
      0
     ],
     "destination": [
      "obj-26",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-26",
      1
     ],
     "destination": [
      "obj-27",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-27",
      0
     ],
     "destination": [
      "obj-28",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-28",
      0
     ],
     "destination": [
      "obj-3",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-2",
      0
     ],
     "destination": [
      "obj-29",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-29",
      0
     ],
     "destination": [
      "obj-3",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-30",
      0
     ],
     "destination": [
      "obj-32",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-32",
      0
     ],
     "destination": [
      "obj-3",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-22",
      1
     ],
     "destination": [
      "obj-33",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-33",
      1
     ],
     "destination": [
      "obj-34",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-34",
      0
     ],
     "destination": [
      "obj-35",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-35",
      0
     ],
     "destination": [
      "obj-3",
      1
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-2",
      0
     ],
     "destination": [
      "obj-36",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-36",
      0
     ],
     "destination": [
      "obj-3",
      1
     ]
    }
   }
  ],
  "parameters": {
   "obj-5": [
    "state",
    "state",
    0
   ],
   "inherited_shortname": 1
  },
  "dependency_cache": [
   {
    "name": "TransientShuffler.js",
    "bootpath": ".",
    "type": "TEXT",
    "implicit": 1
   }
  ],
  "autosave": 0,
  "devicewidth": 260.0,
  "description": "",
  "digest": "",
  "tags": "",
  "style": "",
  "latency": 0,
  "is_mpe": 0
 }
}
