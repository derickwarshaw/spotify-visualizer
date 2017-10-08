# -*- coding: utf-8 -*-
"""
Created on Fri Oct  6 00:56:38 2017

@author: Dhruva
"""
import sys
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
    ind = 0;
    while (ind < len(vals)):
        avg = 0
        count = 0
        for i in range(2*rad + 1):
            if(0 <= ind-rad+i < len(vals)):
                avg += vals[ind-rad+i]
                count += 1
        avg /= count
        vals[ind] = avg
        ind += 1
    return vals

def smooth(starts, vals):
    slope_threshold = 4
    flat_threshold = 2
    result = []
    window = 3
    result.append((0, vals[0]))
    back_ind = 0
    cur_incline = 0
    for ind in range(len(starts)):
        prev_time = result[len(result)-1][0]
        while(starts[ind] - starts[back_ind+1] > window):
            back_ind += 1
        if(starts[back_ind] > prev_time + window):
            dy = vals[ind] - vals[back_ind]
            dx = starts[ind] - starts[back_ind+1]
            slope = dy/dx
            if (cur_incline == 0 and abs(slope) > slope_threshold):
                cur_incline = slope
                prev_val = result[len(result)-1][1]
                result.append((starts[back_ind], prev_val))
                # maybe change back
            elif (cur_incline != 0 and abs(slope) < flat_threshold):
                cur_incline = 0
                result.append((starts[back_ind], vals[back_ind]))
            elif (cur_incline != 0 and abs(slope) > slope_threshold
                      and cur_incline * slope < 0):
                cur_incline = slope
                result.append((starts[back_ind], vals[back_ind]))
    return result

        
def main():
    filename = "sample_data.json"
    with open(filename, "r") as my_file:
        contents = my_file.read()
        
    #    contents = sys.stdin.readLines()
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
        plot.axhline(0, color="black")
        x = [s.start for s in segments]
        plot.xticks(np.arange(min(x), max(x)+1, 5))
        y0 = [s.timbre[0] for s in segments]
        plot.plot(x, y0, 'k,')
        s1 = blur([s.timbre[1] for s in segments], 15)
        s2 = blur([s.timbre[2] for s in segments], 15)
        s4 = blur([s.timbre[4] for s in segments], 15)
  #     y = [s1[i]-s2[i]-s4[i] + y0[i] for i in range(len(s1))]
        y = [s1[i]-s2[i]-s4[i] for i in range(len(segments))]
        plot.plot(x, y, 'k--')
        y = blur([((0.5)**(-s.max_vol/6))*100 for s in segments], 5)
        plot.plot(x, y, 'r--')
        step = smooth(x, y)
        x = [p[0] for p in step]
        y = [p[1] for p in step]
        plot.plot(x, y, 'k')
        actions = {}
        for i in range(1, len(step)):
            dy = step[i][1] - step[i-1][1]
            if(dy > 0):
                actions[step[i][0]] = "excite"
            if (dy < 0):
                dx = step[i][0] - step[i-1][0]
                actions[step[i][0] + dx/2] = "relax"
        s = ""
        for key in actions.keys():
            s += str.format("{},{};", round(key, 2), actions[key])
        s = s[:-1]
        print(s)
    
    
if __name__ == "__main__":
    main()