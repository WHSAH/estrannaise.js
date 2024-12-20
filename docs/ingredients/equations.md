```
     dB(t)/dt = -k1 * B(t)
    dEE(t)/dt = k1 * B(t) - k2 * EE(t)
    dE2(t)/dt = k2 * EE(t) - k3 * E2(t)
```


```
                
    f(E2) = baseline +
                                   [  exp(-k1(t - ti))     exp(-k2(t - ti))     exp(-k3(t - ti))  ]
    D0 * k1 * k2 * sum_i H(t - ti) [ ------------------ - ------------------ + ------------------ ]
                                   [ (k1 - k2)(k1 - k3)   (k1 - k2)(k2 - k3)   (k1 - k3)(k2 - k3) ]
                
```



baseline + D0 * k1 * k2 * sum(t < ti ? 0.0 : (exp(-k1 * (t - ti)) / (k1 - k2) / (k1 - k3) - exp(-k2 * (t - ti)) / (k1 - k2) / (k2 - k3) + exp(-k3 * (t - ti)) / (k1 - k3) / (k2 - k3)) for ti in tis)



oh there it is, found it again between two sofa cushions. There's a second transformation that leaves the `E2(t)` curve invariant. We have `k1 <-> k2`, but you can also interchange `k1 <-> k3` provided that you change `d' = d k1/k3` as well. Let's called those two transformations `T1[.]` and `T2[.]`. This means there are 6 equivalent curves with different parameters: the original one, the one under `T1`, the one under `T2`, the one where you apply `T2` then `T1`, which we can call `T3 = T1*T2`, and the one where you apply `T1` and then `T2`, which we can call `T4 = T2*T1`. Then there is the one where you apply `T1` after `T4`, which incidentally is also equal to applying `T2` after `T3`, and we can call that one `T5 = T1*T2*T1 = T2*T1*T2`. Those 6 transformations leave the curve invariant: 
```
id[E2] = E2(t, d, k1, k2, k3),
T1[E2] = E2(t, d, k2, k1, k3), 
T2[E2] = E2(t, d k1/k3, k3, k2, k1),
T3[E2] = E2(t, d k1/k3, k2, k3, k1),
T4[E2] = E2(t, d k2/k3, k3, k1, k2),
T5[E2] = E2(t, d k2/k3, k1, k3, k2).
```
Making liberal use of the identity `T5 = T1*T2*T1 = T2*T1*T2` and the fact that `T1` and `T2` are involutions we can construct the following group multiplication/Cayley table
```
   | id  T1  T2  T3  T4  T5
---------------------------
id | id  T1  T2  T3  T4  T5
T1 | T1  id  T3  T2  T5  T4
T2 | T2  T4  id  T5  T1  T3
T3 | T3  T5  T1  T4  id  T2
T4 | T4  T2  T5  id  T3  T1
T5 | T5  T3  T4  T1  T2  id
```
This is nothing but the symmetry group of the equilateral triangle, also know as D3, the dihedral group of degree 3 and order 6.


ESTROGEN 3 SYMMETRIES
SIMULTANEOUS 3-CORNER
**TRANSFEM EQUILATERAL TRIANGLE**
IN ONLY 120º ROTATION



2-compartment model

For a dose `d`, diffusion rate of e2 into the blood `k1`, and `k3` the elimination rate of e2, the 2-compartment model 
```
 S'(t) = -k1 S(t) + sum_i di Dirac(t - ti)
E2'(t) =  k1 S(t) - k3 E2(t)
```
with `S(0) = E2(0) = 0`. `S(t)` is the estradiol content in the sublingual/buccal pill/patch. This gives the e2 curve for a single-dose given at `t=0`
```
              k1
E2sd(t) = d ------- (exp(-k3 t) - exp(-k1 t)) Heaviside(t)
            k1 - k3  
```
and for multiple doses `di` given at times `ti`
```
E2md(t) = sum_i E2sd(dose di at t - ti)
            k1
        = ------- sum_i di Heaviside(t - ti) (exp(-k3(t - ti)) - exp(-k1(t - ti)))
          k1 - k3
```
The steady-state solution for equal doses `d` at interval `T` is
```
           d k1   [  exp(-k3 t + k3 T floor(t/T))   exp(-k1 t + k1 T floor(t/T) ]
E2ss(t) = ------- [ ----------------------------- - --------------------------- ]
          k1 - k3 [        1 - exp(-k3 T)                 1 - exp(-k1 T)        ]
```