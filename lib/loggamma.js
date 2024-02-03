var ieee754gamma = (function() {
    "use strict";
  
    var double_int = new DataView(new ArrayBuffer(8));
    var lgamma_sign = 1;
  
    /*
       This functions are more or less verbatim ports of code writen by SunPro
       which has been published with the following license:
    */
    /*
     * ====================================================
     * Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
     *
     * Developed at SunPro, a Sun Microsystems, Inc. business.
     * Permission to use, copy, modify, and distribute this
     * software is freely granted, provided that this notice
     * is preserved.
     * ====================================================
     */
  
    /*
        I decided to implement the trigonometric functions, too, the
        implementation of Math.sin() lacked precision in several
        Javascript-interpreters. That might have changed in the
        meanwhile but I cannot guarantee it and do not want to fix
        other people's bugs, too.
    */
    var ksin = function(x, y, iy) {
      var half = 5.00000000000000000000e-01; /* 0x3FE00000, 0x00000000 */
      var S1 = -1.66666666666666324348e-01; /* 0xBFC55555, 0x55555549 */
      var S2 = 8.33333333332248946124e-03; /* 0x3F811111, 0x1110F8A6 */
      var S3 = -1.98412698298579493134e-04; /* 0xBF2A01A0, 0x19C161D5 */
      var S4 = 2.75573137070700676789e-06; /* 0x3EC71DE3, 0x57B1FE7D */
      var S5 = -2.50507602534068634195e-08; /* 0xBE5AE5E6, 0x8A2B9CEB */
      var S6 = 1.58969099521155010221e-10; /* 0x3DE5D93A, 0x5ACFD57C */
  
      var z, r, v;
      var ix = 0 | 0;
  
      double_int.setFloat64(0, x);
      ix = double_int.getInt32(0); /* get high word */
      ix &= 0x7fffffff;
      if (ix < 0x3e400000) { /* |x| < 2**-27 */
        if ((x | 0) == 0) {
          return x;
        } /* generate inexact */
      }
      z = x * x;
      v = z * x;
      r = S2 + z * (S3 + z * (S4 + z * (S5 + z * S6)));
      if (iy === 0) {
        return x + v * (S1 + z * r);
      } else {
        return x - ((z * (half * y - v * r) - y) - v * S1);
      }
    };
  
    var kcos = function(x, y) {
      var one = 1.00000000000000000000e+00; /* 0x3FF00000, 0x00000000 */
      var C1 = 4.16666666666666019037e-02; /* 0x3FA55555, 0x5555554C */
      var C2 = -1.38888888888741095749e-03; /* 0xBF56C16C, 0x16C15177 */
      var C3 = 2.48015872894767294178e-05; /* 0x3EFA01A0, 0x19CB1590 */
      var C4 = -2.75573143513906633035e-07; /* 0xBE927E4F, 0x809C52AD */
      var C5 = 2.08757232129817482790e-09; /* 0x3E21EE9E, 0xBDB4B1C4 */
      var C6 = -1.13596475577881948265e-11; /* 0xBDA8FAE9, 0xBE8838D4 */
  
      var a, hz, z, r, qx;
      var ix = 0 | 0;
  
      double_int.setFloat64(0, x);
      ix = double_int.getInt32(0); /* get high word */
  
      ix &= 0x7fffffff; /* ix = |x|'s high word*/
      if (ix < 0x3e400000) { /* if x < 2**27 */
        if ((x | 0) == 0) {
          return one;
        } /* generate inexact */
      }
      z = x * x;
      r = z * (C1 + z * (C2 + z * (C3 + z * (C4 + z * (C5 + z * C6)))));
      if (ix < 0x3FD33333) { /* if |x| < 0.3 */
        return one - (0.5 * z - (z * r - x * y));
      } else {
        if (ix > 0x3fe90000) { /* x > 0.78125 */
          qx = 0.28125;
        } else {
          /* x/4 */
          double_int.setFloat64(0, qx);
          double_int.setUint32(0, ix - 0x00200000);
          double_int.setUint32(4, 0x0);
          qx = double_int.getFloat64(0);
        }
        hz = 0.5 * z - qx;
        a = one - qx;
        return a - (hz - (z * r - x * y));
      }
    };
  
    var sin_pi = function(x) {
      var y, z;
      var n = 0 | 0,
        ix = 0 | 0;
      var zero = 0.00000000000000000000e+00;
      var two52 = 4.50359962737049600000e+15; /* 0x43300000, 0x00000000 */
      var one = 1.00000000000000000000e+00; /* 0x3FF00000, 0x00000000 */
  
      double_int.setFloat64(0, x);
  
      ix = double_int.getInt32(0); /* get high word */
      ix &= 0x7fffffff;
      if (ix < 0x3fd00000) {
        return ksin(Math.PI * x, zero, 0);
      }
      y = -x; /* x is assumed to be negative */
  
      /*
       * argument reduction, make sure inexact flag not raised if input
       * is an integer
       */
      z = Math.floor(y);
      if (z != y) { /* inexact anyway */
        y *= 0.5;
        y = 2.0 * (y - Math.floor(y)); /* y = |x| mod 2.0 */
        n = (y * 4.0) | 0;
      } else {
        if (ix >= 0x43400000) {
          y = zero;
          n = 0; /* y must be even */
        } else {
          if (ix < 0x43300000) {
            z = y + two52;
          } /* exact */
          n = double_int.getInt32(4);
          n &= 1;
          y = n;
          n <<= 2;
        }
      }
      switch (n) {
        case 0:
          y = ksin(Math.PI * y, zero, 0);
          break;
        case 1:
        case 2:
          y = kcos(Math.PI * (0.5 - y), zero);
          break;
        case 3:
        case 4:
          y = ksin(Math.PI * (one - y), zero, 0);
          break;
        case 5:
        case 6:
          y = -kcos(Math.PI * (y - 1.5), zero);
          break;
        default:
          y = ksin(Math.PI * (y - 2.0), zero, 0);
          break;
      }
      return -y;
    };
  
    var lgamma_ieee_754 = function(x) {
      var half = 5.00000000000000000000e-01; /* 0x3FE00000, 0x00000000 */
      var one = 1.00000000000000000000e+00; /* 0x3FF00000, 0x00000000 */
      var pi = 3.14159265358979311600e+00; /* 0x400921FB, 0x54442D18 */
      var a0 = 7.72156649015328655494e-02; /* 0x3FB3C467, 0xE37DB0C8 */
      var a1 = 3.22467033424113591611e-01; /* 0x3FD4A34C, 0xC4A60FAD */
      var a2 = 6.73523010531292681824e-02; /* 0x3FB13E00, 0x1A5562A7 */
      var a3 = 2.05808084325167332806e-02; /* 0x3F951322, 0xAC92547B */
      var a4 = 7.38555086081402883957e-03; /* 0x3F7E404F, 0xB68FEFE8 */
      var a5 = 2.89051383673415629091e-03; /* 0x3F67ADD8, 0xCCB7926B */
      var a6 = 1.19270763183362067845e-03; /* 0x3F538A94, 0x116F3F5D */
      var a7 = 5.10069792153511336608e-04; /* 0x3F40B6C6, 0x89B99C00 */
      var a8 = 2.20862790713908385557e-04; /* 0x3F2CF2EC, 0xED10E54D */
      var a9 = 1.08011567247583939954e-04; /* 0x3F1C5088, 0x987DFB07 */
      var a10 = 2.52144565451257326939e-05; /* 0x3EFA7074, 0x428CFA52 */
      var a11 = 4.48640949618915160150e-05; /* 0x3F07858E, 0x90A45837 */
      var tc = 1.46163214496836224576e+00; /* 0x3FF762D8, 0x6356BE3F */
      var tf = -1.21486290535849611461e-01; /* 0xBFBF19B9, 0xBCC38A42 */
      /* tt = -(tail of tf) */
      var tt = -3.63867699703950536541e-18; /* 0xBC50C7CA, 0xA48A971F */
      var t0 = 4.83836122723810047042e-01; /* 0x3FDEF72B, 0xC8EE38A2 */
      var t1 = -1.47587722994593911752e-01; /* 0xBFC2E427, 0x8DC6C509 */
      var t2 = 6.46249402391333854778e-02; /* 0x3FB08B42, 0x94D5419B */
      var t3 = -3.27885410759859649565e-02; /* 0xBFA0C9A8, 0xDF35B713 */
      var t4 = 1.79706750811820387126e-02; /* 0x3F9266E7, 0x970AF9EC */
      var t5 = -1.03142241298341437450e-02; /* 0xBF851F9F, 0xBA91EC6A */
      var t6 = 6.10053870246291332635e-03; /* 0x3F78FCE0, 0xE370E344 */
      var t7 = -3.68452016781138256760e-03; /* 0xBF6E2EFF, 0xB3E914D7 */
      var t8 = 2.25964780900612472250e-03; /* 0x3F6282D3, 0x2E15C915 */
      var t9 = -1.40346469989232843813e-03; /* 0xBF56FE8E, 0xBF2D1AF1 */
      var t10 = 8.81081882437654011382e-04; /* 0x3F4CDF0C, 0xEF61A8E9 */
      var t11 = -5.38595305356740546715e-04; /* 0xBF41A610, 0x9C73E0EC */
      var t12 = 3.15632070903625950361e-04; /* 0x3F34AF6D, 0x6C0EBBF7 */
      var t13 = -3.12754168375120860518e-04; /* 0xBF347F24, 0xECC38C38 */
      var t14 = 3.35529192635519073543e-04; /* 0x3F35FD3E, 0xE8C2D3F4 */
      var u0 = -7.72156649015328655494e-02; /* 0xBFB3C467, 0xE37DB0C8 */
      var u1 = 6.32827064025093366517e-01; /* 0x3FE4401E, 0x8B005DFF */
      var u2 = 1.45492250137234768737e+00; /* 0x3FF7475C, 0xD119BD6F */
      var u3 = 9.77717527963372745603e-01; /* 0x3FEF4976, 0x44EA8450 */
      var u4 = 2.28963728064692451092e-01; /* 0x3FCD4EAE, 0xF6010924 */
      var u5 = 1.33810918536787660377e-02; /* 0x3F8B678B, 0xBF2BAB09 */
      var v1 = 2.45597793713041134822e+00; /* 0x4003A5D7, 0xC2BD619C */
      var v2 = 2.12848976379893395361e+00; /* 0x40010725, 0xA42B18F5 */
      var v3 = 7.69285150456672783825e-01; /* 0x3FE89DFB, 0xE45050AF */
      var v4 = 1.04222645593369134254e-01; /* 0x3FBAAE55, 0xD6537C88 */
      var v5 = 3.21709242282423911810e-03; /* 0x3F6A5ABB, 0x57D0CF61 */
      var s0 = -7.72156649015328655494e-02; /* 0xBFB3C467, 0xE37DB0C8 */
      var s1 = 2.14982415960608852501e-01; /* 0x3FCB848B, 0x36E20878 */
      var s2 = 3.25778796408930981787e-01; /* 0x3FD4D98F, 0x4F139F59 */
      var s3 = 1.46350472652464452805e-01; /* 0x3FC2BB9C, 0xBEE5F2F7 */
      var s4 = 2.66422703033638609560e-02; /* 0x3F9B481C, 0x7E939961 */
      var s5 = 1.84028451407337715652e-03; /* 0x3F5E26B6, 0x7368F239 */
      var s6 = 3.19475326584100867617e-05; /* 0x3F00BFEC, 0xDD17E945 */
      var r1 = 1.39200533467621045958e+00; /* 0x3FF645A7, 0x62C4AB74 */
      var r2 = 7.21935547567138069525e-01; /* 0x3FE71A18, 0x93D3DCDC */
      var r3 = 1.71933865632803078993e-01; /* 0x3FC601ED, 0xCCFBDF27 */
      var r4 = 1.86459191715652901344e-02; /* 0x3F9317EA, 0x742ED475 */
      var r5 = 7.77942496381893596434e-04; /* 0x3F497DDA, 0xCA41A95B */
      var r6 = 7.32668430744625636189e-06; /* 0x3EDEBAF7, 0xA5B38140 */
      var w0 = 4.18938533204672725052e-01; /* 0x3FDACFE3, 0x90C97D69 */
      var w1 = 8.33333333333329678849e-02; /* 0x3FB55555, 0x5555553B */
      var w2 = -2.77777777728775536470e-03; /* 0xBF66C16C, 0x16B02E5C */
      var w3 = 7.93650558643019558500e-04; /* 0x3F4A019F, 0x98CF38B6 */
      var w4 = -5.95187557450339963135e-04; /* 0xBF4380CB, 0x8C0FE741 */
      var w5 = 8.36339918996282139126e-04; /* 0x3F4B67BA, 0x4CDAD5D1 */
      var w6 = -1.63092934096575273989e-03; /* 0xBF5AB89D, 0x0B9E43E4 */
      var zero = 0.00000000000000000000e+00;
  
  
      var t, y, z, nadj = 0,
        p, p1, p2, p3, q, r, w;
  
  
      var i = 0 | 0,
        hx = 0 | 0,
        lx = 0 | 0,
        ix = 0 | 0;
  
  
      double_int.setFloat64(0, x);
  
      hx = double_int.getInt32(0); /* high word */
      lx = double_int.getInt32(4); /* low word */
  
      /* purge off +-inf, NaN, +-0, and negative arguments */
      lgamma_sign = 1;
      ix = hx & 0x7fffffff;
      if (ix >= 0x7ff00000) {
        return x * x;
      }
      if ((ix | lx) == 0) {
        if (hx & 0x80000000) {
          lgamma_sign = -1;
        }
        return one / zero;
      }
      if (ix < 0x3b900000) { /* |x|<2**-70, return -log(|x|) */
        if (hx < 0) {
          lgamma_sign = -1;
          return -Math.log(-x);
        } else {
          return -Math.log(x);
        }
      }
      if (hx < 0) {
        if (ix >= 0x43300000) { /* |x|>=2**52, must be -integer */
          return one / zero;
        }
        t = sin_pi(x);
        if (t == zero) {
          return one / zero;
        } /* -integer */
        nadj = Math.log(pi / Math.abs(t * x));
        if (t < zero) {
          lgamma_sign = -1;
        }
        x = -x;
      }
      /* purge off 1 and 2 */
      if ((((ix - 0x3ff00000) | lx) == 0) || (((ix - 0x40000000) | lx) == 0)) {
        r = 0;
      }
      /* for x < 2.0 */
      else if (ix < 0x40000000) {
        if (ix <= 0x3feccccc) { /* lgamma(x) = lgamma(x+1)-log(x) */
          r = -Math.log(x);
          if (ix >= 0x3FE76944) {
            y = one - x;
            i = 0;
          } else if (ix >= 0x3FCDA661) {
            y = x - (tc - one);
            i = 1;
          } else {
            y = x;
            i = 2;
          }
        } else {
          r = zero;
          if (ix >= 0x3FFBB4C3) {
            y = 2.0 - x;
            i = 0;
          } /* [1.7316,2] */
          else if (ix >= 0x3FF3B4C4) {
            y = x - tc;
            i = 1;
          } /* [1.23,1.73] */
          else {
            y = x - one;
            i = 2;
          }
        }
        switch (i) {
          case 0:
            z = y * y;
            p1 = a0 + z * (a2 + z * (a4 + z * (a6 + z * (a8 + z * a10))));
            p2 = z * (a1 + z * (a3 + z * (a5 + z * (a7 + z * (a9 + z * a11)))));
            p = y * p1 + p2;
            r += (p - 0.5 * y);
            break;
          case 1:
            z = y * y;
            w = z * y;
            p1 = t0 + w * (t3 + w * (t6 + w * (t9 + w * t12))); /* parallel comp */
            p2 = t1 + w * (t4 + w * (t7 + w * (t10 + w * t13)));
            p3 = t2 + w * (t5 + w * (t8 + w * (t11 + w * t14)));
            p = z * p1 - (tt - w * (p2 + y * p3));
            r += (tf + p);
            break;
          case 2:
            p1 = y * (u0 + y * (u1 + y * (u2 + y * (u3 + y * (u4 + y * u5)))));
            p2 = one + y * (v1 + y * (v2 + y * (v3 + y * (v4 + y * v5))));
            r += (-0.5 * y + p1 / p2);
        }
      } else if (ix < 0x40200000) { /* x < 8.0 */
        i = x | 0;
        t = zero;
        y = x - i;
        p = y * (s0 + y * (s1 + y * (s2 + y * (s3 + y * (s4 + y * (s5 + y *
          s6))))));
        q = one + y * (r1 + y * (r2 + y * (r3 + y * (r4 + y * (r5 + y * r6)))));
        r = half * y + p / q;
        z = one; /* lgamma(1+s) = log(s) + lgamma(s) */
        switch (i) {
          case 7:
            z *= (y + 6.0); /* FALLTHRU */
          case 6:
            z *= (y + 5.0); /* FALLTHRU */
          case 5:
            z *= (y + 4.0); /* FALLTHRU */
          case 4:
            z *= (y + 3.0); /* FALLTHRU */
          case 3:
            z *= (y + 2.0); /* FALLTHRU */
            r += Math.log(z);
            break;
        }
        /* 8.0 <= x < 2**58 */
      } else if (ix < 0x43900000) {
        t = Math.log(x);
        z = one / x;
        y = z * z;
        w = w0 + z * (w1 + y * (w2 + y * (w3 + y * (w4 + y * (w5 + y * w6)))));
        r = (x - half) * (t - one) + w;
      } else {
        /* 2**58 <= x <= inf */
        r = x * (Math.log(x) - one);
      }
      if (hx < 0) {
        r = nadj - r;
      }
      return r;
    };
  
    var lngamma = function(x) {
      return lgamma_ieee_754(x);
    };
  
    var gamma = function(x) {
      return Math.exp(lgamma_ieee_754(x));
    };
  
    return {
      "lngamma": lngamma,
      "gamma": gamma
    };
  
  })();
  
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ieee754gamma;
  } else {
    if (typeof define === 'function' && define.amd) {
      define([], function() {
        return ieee754gamma;
      });
    } else {
      window.ieee754gamma = ieee754gamma;
    }
  }