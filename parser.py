# -*- coding: utf-8 -*-
"""
Created on Fri Oct  6 00:56:38 2017

@author: Dhruva
"""
import json
import numpy as np
import matplotlib.pyplot as plot

    
class Segment:
    def __init__(self, st, dur, conf, mv, mvd, mvs, timb):
        self.start = st
        self.duration = dur
        self.confidence = conf
        self.max_vol = mv
        self.mav_vol_dur = mvd
        self.max_vol_start = mvs
        self.timbre = timb
        #self.calc_spectrum()

    def calc_spectrum(self):
        n = 25 #samples per second
        num_bands = 10
        self.spectrum = np.zeros((num_bands, round(self.duration*n)),
                                 dtype=float)
        for band in range(num_bands):
            for sample in range(self.spectrum.shape[1]):
                time_frac = sample / (self.duration*n)
                band_frac = band / num_bands
                for i in range(len(self.timbre)):
                    comp = self.timbre[i] * self.get_timbre(i, time_frac,
                                                               band_frac)
                    self.spectrum[band, sample] += comp                

    def get_timbre(self, i, x, y):
        if i==0:
            return 1
        elif i==1:
            return x
        elif i==2:
            return y
        elif i==3:
            return x*y
        elif i==4:
            return x**2
        elif i==5:
            return x**3
        elif i==6:
            return y**2
        elif i==7:
            return y**3
        elif i==8:
            return 1
        elif i==9:
            return 1
        elif i==10:
            return 1
        elif i==11:
            return 1
        else:
            return 1
            

def within(seg, beat):
    return seg.start_time + seg.duration/2 < beat

def blur(vals, rad):
    if(rad == 0 or 2*rad +1 > len(vals)):
        return vals
    ind = rad;
    while (ind+rad+1 < len(vals)):
        avg = 0
        for i in range(2*rad + 1):
            avg += vals[ind-rad+i]
        avg /= (2*rad+1)
        vals[ind] = avg
        ind += 1
    return vals

def derivative(vals, rad):
    if(rad == 0 or rad +1 > len(vals)):
        return vals
    ind = 0
    while (ind+rad+1 < len(vals)):
        avg = 0
        for i in range(rad):
            avg += (vals[ind+i+1] - vals[ind])/(i+1)
        avg /= rad
        vals[ind] = avg
        ind += 1
    return vals

def main():
    filename = "sample_data.json"
    with open(filename, "r") as my_file:
        contents = my_file.read()
        j = json.loads(contents)
        segments = []
        for s in j["segments"]:
            segments.append(Segment(
                    s["start"],
                    s["duration"],
                    s["confidence"],
                    s["loudness_max"],
                    s["loudness_max_time"],
                    s["loudness_start"],
                    s["timbre"]))
        plot.figure(figsize=(16,6))
        x = [s.start for s in segments]
        plot.xticks(np.arange(min(x), max(x)+1, 5))
        y0 = [s.timbre[0] for s in segments]
        plot.plot(x, y0, 'k--')
        y = [0]*len(x)
        plot.plot(x, y, 'b-')
        s1 = blur([s.timbre[1] for s in segments], 15)
        s2 = blur([s.timbre[2] for s in segments], 15)
        s4 = blur([s.timbre[4] for s in segments], 15)
  #      plot.plot(x, s1, 'r--')
  #      plot.plot(x, s2, 'b--')
  #      plot.plot(x, s4, 'g--')
 #       y = [-s2[i] + y0[i] for i in range(len(segments))]
  #      plot.plot(x, y, 'k')
  #     y = [s1[i]-s2[i]-s4[i] + y0[i] for i in range(len(s1))]
        y = [s1[i]-s2[i]-s4[i] for i in range(len(s1))]
        plot.plot(x, y, 'k')
        y = [s.max_vol for s in segments]
        plot.plot(x, y, 'r')
        y = blur([((0.5)**(-s.max_vol/6))*100 for s in segments], 5)
        plot.plot(x, y, 'r')
        

# =============================================================================
#         for s in segments:
#             if 32 < s.start_time < 32.1:
#                 print(s.timbre)
#                 print(round(s.start_time, 3), round(s.max_vol, 2))
#                 print(s.spectrum)
#         beats = []
#         for b in j["beats"]:
#             beats.append(b["start"] + b["duration"])
#         ind = 0
#         for i in range(len(beats)):
#             beat_segs = []
#             while(ind < len(segments) and within(segments[ind], beats[i])):
#                 beat_segs.append(segments[ind])
#                 ind += 1 
#             avg_vol = 0
#             for seg in beat_segs:
#                 avg_vol += seg.max_vol
#             if len(beat_segs) is not 0:
#                 avg_vol /= len(beat_segs)
#             #print(round(beats[i],2), "\t", avg_vol)
# =============================================================================
    
    
if __name__ == "__main__":
    main()