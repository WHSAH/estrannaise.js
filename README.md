# estrannaise.js
estrannaise.js is a small playground for estradiol pharmacokinetics. It can simulate estradiol blood levels under arbitrary dosing regimes and schedules. In the near future it will allow users to infer model parameters from outside sources, including their personal blood levels.

Under the hood, estrannaise.js uses pharmacokinetic compartments models together with MCMC inference using either a flat Gaussian model or our very own homebrewed hierarchical Bayesian amodel called Emix.