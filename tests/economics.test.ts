import{describe,it,expect}from'vitest';
import{calculate,defaultInputs,capacityModel}from'../src/lib/economics';
describe('economic unit consistency',()=>{
 it('reproduces the worked base example',()=>{const r=calculate(defaultInputs);expect(r.unit).toBeCloseTo(.00049);expect(r.inferenceSaving).toBeCloseTo(29.4);expect(r.hours).toBeCloseTo(333.3333);expect(r.realized).toBeCloseTo(5000);expect(r.monthlyNet).toBeCloseTo(3829.4);expect(r.flow[11].cumulative).toBeCloseTo(23408.7);expect(r.payback).toBe(6);});
 it('keeps non-paying cases visible and handles zero investment',()=>{const r=calculate({...defaultInputs,volume:0});expect(r.roi).toBeLessThan(0);expect(r.payback).toBeNull();expect(r.breakEvenMinutes).toBeNull();expect(calculate({...defaultInputs,investment:0}).roi).toBeNull();});
 it('rejects impossible rates and nonfinite input',()=>{expect(()=>calculate({...defaultInputs,realization:2})).toThrow();expect(()=>calculate({...defaultInputs,volume:NaN})).toThrow();});
 it('does not admit shadow work when mandatory capacity is exhausted',()=>{const r=capacityModel(10000,.1,2,5,.5);expect(r.admittedShadow).toBe(0);expect(r.backlog).toBe(976);});
});
