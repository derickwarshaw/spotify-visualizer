# -*- coding: utf-8 -*-
"""
Created on Sun Oct  8 00:01:40 2017

@author: Dhruva
"""
import sys
import json
import numpy as np
import matplotlib.pyplot as plot

    
class Segment:
    def __init__(self, st, dur, conf, mv, att, mvs, timb):
        self.start = st
        self.duration = dur
        self.confidence = conf
        self.max_vol = mv
        self.attack = att
        self.start_vol = mvs
        self.timbre = timb
            

def within(seg, beat):
    return seg.start_time + seg.duration/2 < beat

def blur(vals, rad):
    if(rad == 0 or 2*rad +1 > len(vals)):
        return vals
    ind = 0;
    result = []
    while (ind < len(vals)):
        avg = 0
        count = 0
        for i in range(2*rad + 1):
            if(0 <= ind-rad+i < len(vals)):
                avg += vals[ind-rad+i]
                count += 1
        avg /= count
        result.append(avg)
        ind += 1
    return result

def median(vals, rad):
    if(rad == 0 or 2*rad +1 > len(vals)):
        return vals
    ind = 0;
    result = []
    while (ind < len(vals)):
        neighbors = []
        for i in range(2*rad + 1):
            if(0 <= ind-rad+i < len(vals)):
                neighbors.append(vals[ind-rad+i])
        neighbors = np.sort(neighbors)
        result.append(neighbors[len(neighbors)//2])
        ind += 1
    return result

def stddev(starts, vals, rad):
    if(rad == 0 or 2*rad +1 > len(vals)):
        return vals
    ind = 0;
    back_ind = 0
    result = []
    while (ind < len(vals)):
        while(starts[ind] - starts[back_ind+1] > rad):
            back_ind += 1
        neighbors = []
        for i in range(back_ind, 2*ind-back_ind+1):
            if(0 <= i < len(vals)):
                neighbors.append(vals[i])
        st_dev = np.std(neighbors)
        result.append(st_dev)
        ind += 1
    return result

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
        if(starts[back_ind] > prev_time):
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
        
# =============================================================================
#         contents = sys.stdin.readlines()
# =============================================================================
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
        
        y = [s.timbre[1]-s.timbre[2]-s.timbre[4] for s in segments]
        y_blur = blur(y, 5)
        y_std_timb = stddev(x, y_blur, 1)
        mean_timb_std = np.mean(y_std_timb)
        plot.plot(x, y_std_timb, 'g--')
        plot.axhline(mean_timb_std, color="green")
        
#        step = smooth(x, y_blur)
#        x_step = [p[0] for p in step]
#        y_step = [p[1] for p in step]
#        plot.plot(x_step, y_step, 'k')
        
        y = [((0.5)**(-s.max_vol/6))*100 for s in segments]
        y_blur = blur(y, 5)
        y_std_vol = stddev(x, y_blur, .75)
        mean_vol_std = np.mean(y_std_vol)
        plot.plot(x, y_std_vol, 'r--')
        plot.axhline(mean_vol_std, color="red")
        change_regions = []
        i = 0
        while i < len(y_std_vol):
            offset = 0
            region = []
            while(y_std_vol[i+offset] > mean_vol_std):
                region.append(i+offset)                
                offset += 1
            if(len(region) > 0):
                change_regions.append(region)
            i += offset
            i += 1
        criticals = []
        for region in change_regions:
            time = x[y_std_vol.index(np.amax([y_std_vol[i] for i in region]))]
            criticals.append(time)
        s=""
        for t in criticals:
            s += str.format("{},{};", round(t, 2), "AAAA")
        s = s[:-1]
        print(s)
        
#        step = smooth(x, y_blur)
#        x_step = [p[0] for p in step]
#        y_step = [p[1] for p in step]
#        plot.plot(x_step, y_step, 'k')
# =============================================================================
#         actions = {}
#         for i in range(1, len(step)):
#             dy = step[i][1] - step[i-1][1]
#             if(dy > 0):
#                 actions[step[i][0]] = "excite"
#             if (dy < 0):
#                 dx = step[i][0] - step[i-1][0]
#                 actions[step[i][0] + dx/2] = "relax"
#         s = ""
#         for key in actions.keys():
#             s += str.format("{},{};", round(key, 2), actions[key])
#         s = s[:-1]
#         print(s)
# =============================================================================
    
    
if __name__ == "__main__":
    main()