# -*- coding: utf-8 -*-
"""
Created on Fri Oct  6 00:56:38 2017
@author: Dhruva
"""
import sys
import json
import numpy as np

    
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

def main():        
    contents = sys.stdin.readlines()
    j = json.loads(contents[0])
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
    beats = []
    for b in j["beats"]:
        beats.append(b["start"])
        

    x = [s.start for s in segments]
    
    y = [s.timbre[1]-s.timbre[2]-s.timbre[4] for s in segments]
    y_tblur = blur(y, 5)
    y_std_timb = stddev(x, y_tblur, 1)
    mean_timb = np.mean(y_std_timb)
    y_std_timb = [elem/mean_timb for elem in y_std_timb]
            
    y = [((0.5)**(-s.max_vol/6))*100 for s in segments]
    y_vblur = blur(y, 5)
    y_std_vol = stddev(x, y_vblur, .75)
    mean_vol = np.mean(y_std_vol)
    y_std_vol = [elem/mean_vol for elem in y_std_vol]
    
    prod = [y_std_timb[i] * y_std_vol[i] for i in range(len(y_std_timb))]
    
    change_regions = []
    i = 0
    while i < len(prod):
        offset = 0
        region = []
        while(i+offset < len(prod) and prod[i+offset] > 2):
            region.append(i+offset)                
            offset += 1
        if(len(region) > 0):
            change_regions.append(region)
        i += offset
        i += 1
    criticals = []
    for region in change_regions:
        ind = 0
        for i in region:
            if(prod[i] > prod[ind]):
                ind = i
        val = prod[ind]
        time = x[ind]
        if(prod[ind] > 4):
            criticals.append((time, val))
    crit_ind = 0
    crit = criticals[0][0]
    avgs = []
    i = 0
    while(i < len(y_tblur)):
        offset = 0
        avg = 0
        count = 0
        while(x[i+offset]<crit and i+offset<len(y_tblur)):
            avg += y_tblur[i+offset]
            count += 1
            offset += 1
        crit_ind += 1
        crit = criticals[crit_ind][0] \
                if crit_ind < len(criticals) else x[-1]
        i += offset + 1
        avgs.append(avg/count)
    rng = np.ptp(avgs)
    down = True
    actions = {}
    excite_start = None
    for i in range(len(avgs)-1):
        cur = avgs[i]
        nxt = avgs[i+1]
        if(down and nxt-cur > rng/8):
            actions[criticals[i][0]] = "excite"
            excite_start = criticals[i][0]
            down = False
        elif(not down and (cur-nxt > rng/8)):
            for b in beats:
                if(excite_start < b < criticals[i][0]):
                    actions[b] = "pulse"
            excite_start = None
            actions[criticals[i][0]] = "relax"
            down = True
    if not down:
        for b in beats:
            if(excite_start < b):
                actions[b] = "pulse"
    s=""
    for k in actions.keys():
        s += str.format("{},{};", round(k, 2), actions[k])
    s = s[:-1]
    print(s)
    
if __name__ == "__main__":
    main()